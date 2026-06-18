import { jest } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'
import Reading from '../app/models/reading.js'
import SystemEvent from '../app/models/systemEvent.js'

let mongod

// External APIs (Open-Meteo, Overpass, OSRM) are mocked via global.fetch.
// Fallback tests must run before the "live" ones: live responses are
// cached at module level.
beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  global.fetch = jest.fn()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({})
  }
})

describe('GET /api/v1/layers/weather', () => {
  test('404 se Open-Meteo è giù e non c\'è seed nel DB', async () => {
    global.fetch.mockRejectedValue(new Error('network down'))
    const res = await request(app).get('/api/v1/layers/weather')
    expect(res.status).toBe(404)
  })

  test('fallback sul seed nel DB se Open-Meteo è giù', async () => {
    global.fetch.mockRejectedValue(new Error('network down'))
    await Reading.create({ type: 'weather', data: { temperature: 12, humidity: 60 } })

    const res = await request(app).get('/api/v1/layers/weather')
    expect(res.status).toBe(200)
    expect(res.body.temperature).toBe(12)
  })

  test('dati live da Open-Meteo', async () => {
    global.fetch.mockImplementation(url =>
      Promise.resolve({
        ok: true,
        json: async () => String(url).includes('air-quality')
          ? { current: { european_aqi: 30 } }
          : {
              current: { temperature_2m: 20.4, relative_humidity_2m: 55, wind_speed_10m: 12.3, weather_code: 0 },
              hourly:  { temperature_2m: Array(24).fill(20) }
            }
      })
    )

    const res = await request(app).get('/api/v1/layers/weather')
    expect(res.status).toBe(200)
    expect(res.body.temperature).toBe(20)
    expect(res.body.humidity).toBe(55)
    expect(res.body.aqi).toBe(30)
    expect(res.body.status).toBe('Good')
    expect(res.body.markers).toHaveLength(5)
    expect(res.body.trend.length).toBe(res.body.trendLabels.length)
  })
})

describe('GET /api/v1/layers/traffic', () => {
  test('404 se Overpass/OSRM sono giù e non c\'è seed nel DB', async () => {
    global.fetch.mockRejectedValue(new Error('network down'))
    const res = await request(app).get('/api/v1/layers/traffic')
    expect(res.status).toBe(404)
  })

  test('fallback sul seed nel DB se Overpass/OSRM sono giù', async () => {
    global.fetch.mockRejectedValue(new Error('network down'))
    await Reading.create({ type: 'traffic', data: { delay: 10, status: 'Light' } })

    const res = await request(app).get('/api/v1/layers/traffic')
    expect(res.status).toBe(200)
    expect(res.body.delay).toBe(10)
  })

  test('strade live da Overpass', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [
          { type: 'way', tags: { name: 'Via Test', highway: 'trunk' },
            geometry: [{ lat: 46.06, lon: 11.12 }, { lat: 46.07, lon: 11.13 }] },
          { type: 'way', tags: { name: 'Via Prova', highway: 'primary' },
            geometry: [{ lat: 46.05, lon: 11.11 }, { lat: 46.06, lon: 11.12 }] }
        ]
      })
    })

    const res = await request(app).get('/api/v1/layers/traffic')
    expect(res.status).toBe(200)
    expect(res.body.segments.features).toHaveLength(2)
    expect(['Light', 'Moderate', 'Heavy']).toContain(res.body.status)
    expect(res.body.avgSpeed).toBeGreaterThan(0)
  })
})

describe('GET /api/v1/layers/crowd e /lighting', () => {
  test('404 senza seed nel DB', async () => {
    expect((await request(app).get('/api/v1/layers/crowd')).status).toBe(404)
    expect((await request(app).get('/api/v1/layers/lighting')).status).toBe(404)
  })

  test('restituiscono i dati del seed', async () => {
    await Reading.create({ type: 'crowd',    data: { density: 1200 } })
    await Reading.create({ type: 'lighting', data: { coverage: 95 } })

    const crowd = await request(app).get('/api/v1/layers/crowd')
    expect(crowd.status).toBe(200)
    expect(crowd.body.density).toBe(1200)

    const lighting = await request(app).get('/api/v1/layers/lighting')
    expect(lighting.status).toBe(200)
    expect(lighting.body.coverage).toBe(95)
  })
})

describe('GET /api/v1/notifications', () => {
  test('restituisce solo gli eventi pubblici', async () => {
    await SystemEvent.create({ type: 'warning', message: 'Visibile',     public: true })
    await SystemEvent.create({ type: 'error',   message: 'Solo admin',   public: false })

    const res = await request(app).get('/api/v1/notifications')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].message).toBe('Visibile')
  })
})
