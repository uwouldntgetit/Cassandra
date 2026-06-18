import { jest } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'

// L'API esterna OSRM è mockata via global.fetch.
beforeAll(() => { global.fetch = jest.fn() })

describe('GET /api/v1/routing', () => {
  test('400 se mancano le coordinate', async () => {
    const res = await request(app).get('/api/v1/routing')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test('400 se le coordinate non sono numeri validi', async () => {
    const res = await request(app)
      .get('/api/v1/routing?fromLat=abc&fromLon=11.1&toLat=46.0&toLon=11.2')
    expect(res.status).toBe(400)
  })

  test('200 con distanza, durata e geometria da OSRM', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [{
          distance: 3210.7,
          duration: 540.2,
          geometry: { type: 'LineString', coordinates: [[11.1162, 46.0723], [11.1498, 46.0660]] }
        }]
      })
    })

    const res = await request(app)
      .get('/api/v1/routing?fromLat=46.0723&fromLon=11.1162&toLat=46.0660&toLon=11.1498')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.distance).toBe(3211)
    expect(res.body.duration).toBe(540)
    expect(res.body.geometry.coordinates).toHaveLength(2)
  })

  test('404 se OSRM non trova un percorso', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ code: 'NoRoute', routes: [] })
    })

    const res = await request(app)
      .get('/api/v1/routing?fromLat=46.0&fromLon=11.1&toLat=47.0&toLon=12.2')
    expect(res.status).toBe(404)
  })

  test('503 se OSRM non è raggiungibile', async () => {
    global.fetch.mockRejectedValue(new Error('network down'))

    const res = await request(app)
      .get('/api/v1/routing?fromLat=46.0723&fromLon=11.1162&toLat=46.0660&toLon=11.1498')
    expect(res.status).toBe(503)
  })
})

// RF7: con più alternative e un contatore persistente, richieste ripetute
// sullo stesso tragitto devono distribuirsi sui diversi percorsi.
describe('GET /api/v1/routing — bilanciamento percorsi (RF7)', () => {
  let mongod

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongoose.connect(mongod.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
  })

  const twoAlternatives = {
    ok: true,
    json: async () => ({
      code: 'Ok',
      routes: [
        { distance: 3000, duration: 500, geometry: { type: 'LineString', coordinates: [[11.10, 46.07], [11.12, 46.06], [11.15, 46.06]] } },
        { distance: 3400, duration: 560, geometry: { type: 'LineString', coordinates: [[11.10, 46.07], [11.13, 46.08], [11.15, 46.06]] } }
      ]
    })
  }

  test('alterna tra i percorsi su richieste ripetute per non sovraffollare', async () => {
    global.fetch.mockResolvedValue(twoAlternatives)
    const url = '/api/v1/routing?fromLat=46.07&fromLon=11.10&toLat=46.06&toLon=11.15'

    const first  = await request(app).get(url)
    const second = await request(app).get(url)
    const third  = await request(app).get(url)

    // 1ª: il più veloce (500s). 2ª: l'alternativo (560s), perché il primo è già
    // stato suggerito. 3ª: torna al primo, di nuovo il meno suggerito.
    expect(first.body.duration).toBe(500)
    expect(first.body.alternatives).toBe(2)
    expect(second.body.duration).toBe(560)
    expect(third.body.duration).toBe(500)
  })
})
