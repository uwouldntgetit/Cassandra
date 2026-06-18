import { jest } from '@jest/globals'
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
