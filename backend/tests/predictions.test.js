import { jest } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'
import CrowdHistory from '../app/models/crowdHistory.js'
import { TRENTO_ZONES } from '../app/zones.js'

let mongod

// With fetch always failing, predictions use the synthetic fallbacks:
// the model must still produce a complete forecast.
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  global.fetch = jest.fn().mockRejectedValue(new Error('network down'))
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

describe('GET /api/v1/predictions', () => {
  test('7 giorni di default con meteo sintetico e zone complete', async () => {
    const res = await request(app).get('/api/v1/predictions')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(7)

    const day = res.body[0]
    expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(day.weather.tempMax).toBeGreaterThanOrEqual(day.weather.tempMin)
    expect(day.crowd.zones).toHaveLength(TRENTO_ZONES.length)
    expect(day.crowd.peakZone).toBeDefined()
    expect(day.traffic.segments.features).toEqual([])
  })

  test('?days viene limitato tra 1 e 14', async () => {
    expect((await request(app).get('/api/v1/predictions?days=3')).body).toHaveLength(3)
    expect((await request(app).get('/api/v1/predictions?days=-5')).body).toHaveLength(1)
    expect((await request(app).get('/api/v1/predictions?days=99')).body).toHaveLength(14)
  })

  test('lo storico affollamento influenza la previsione', async () => {
    const zone = TRENTO_ZONES[0]
    const docs = []
    for (let i = 1; i <= 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      docs.push({ zone: zone.id, density: 4000, dayOfWeek: date.getDay(), date })
    }
    await CrowdHistory.insertMany(docs)

    const res = await request(app).get('/api/v1/predictions?days=1')
    expect(res.status).toBe(200)
    // Without history the base would be 2800; with history at 4000 and multipliers ≥ 1.0
    // the prediction can't drop below 4000
    const predicted = res.body[0].crowd.zones.find(z => z.id === zone.id)
    expect(predicted.predictedDensity).toBeGreaterThanOrEqual(4000)
  })
})
