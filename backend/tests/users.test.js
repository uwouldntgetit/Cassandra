import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'

let mongod
let authToken

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())

  await request(app)
    .post('/api/v1/authentications/register')
    .send({ name: 'Test User', email: 'test@test.it', password: 'password123' })

  const res = await request(app)
    .post('/api/v1/authentications')
    .send({ email: 'test@test.it', password: 'password123' })

  authToken = res.body.token
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

describe('GET /api/v1/users/me', () => {
  test('restituisce il profilo con token valido', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.email).toBe('test@test.it')
    expect(res.body.role).toBe('user')
  })

  test('rifiuta richiesta senza token', async () => {
    const res = await request(app).get('/api/v1/users/me')
    expect(res.status).toBe(401)
  })

  test('rifiuta token non valido', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer token_invalido')
    expect(res.status).toBe(403)
  })
})

describe('Gestione preferiti', () => {
  const place = { name: 'Piazza Duomo', lat: '46.0679', lon: '11.1211' }
  let favoriteId

  test('GET /me/favorites inizialmente vuoto', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/favorites')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('POST /me/favorites aggiunge un luogo', async () => {
    const res = await request(app)
      .post('/api/v1/users/me/favorites')
      .set('Authorization', `Bearer ${authToken}`)
      .send(place)
    expect(res.status).toBe(201)
    expect(res.body.favorite.name).toBe('Piazza Duomo')
    favoriteId = res.body.favorite._id
  })

  test('POST /me/favorites salva i layer e filtra quelli non validi', async () => {
    const res = await request(app)
      .post('/api/v1/users/me/favorites')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Università', lat: 46.066, lon: 11.1498, layers: ['weather', 'hacked', 'crowd'], forecastDay: 2, timeSlot: 1 })
    expect(res.status).toBe(201)
    expect(res.body.favorite.layers).toEqual(['weather', 'crowd'])
    expect(res.body.favorite.forecastDay).toBe(2)
    expect(res.body.favorite.timeSlot).toBe(1)
  })

  test('POST /me/favorites rifiuta duplicato', async () => {
    const res = await request(app)
      .post('/api/v1/users/me/favorites')
      .set('Authorization', `Bearer ${authToken}`)
      .send(place)
    expect(res.status).toBe(409)
  })

  test('POST /me/favorites rifiuta campi mancanti', async () => {
    const res = await request(app)
      .post('/api/v1/users/me/favorites')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Solo nome' })
    expect(res.status).toBe(400)
  })

  test('DELETE /me/favorites/:id rimuove il luogo', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/me/favorites/${favoriteId}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(204)
  })

  test('DELETE /me/favorites/:id restituisce 404 per id inesistente', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await request(app)
      .delete(`/api/v1/users/me/favorites/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(404)
  })
})
