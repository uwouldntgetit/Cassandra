import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
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

describe('POST /api/v1/authentications/register', () => {
  test('registra un nuovo utente', async () => {
    const res = await request(app)
      .post('/api/v1/authentications/register')
      .send({ name: 'Mario Rossi', email: 'mario@test.it', password: 'pass123' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  test('rifiuta email duplicata', async () => {
    await request(app)
      .post('/api/v1/authentications/register')
      .send({ name: 'Mario', email: 'dup@test.it', password: 'pass123' })
    const res = await request(app)
      .post('/api/v1/authentications/register')
      .send({ name: 'Mario 2', email: 'dup@test.it', password: 'pass456' })
    expect(res.status).toBe(409)
  })

  test('rifiuta password troppo corta', async () => {
    const res = await request(app)
      .post('/api/v1/authentications/register')
      .send({ name: 'Mario', email: 'mario2@test.it', password: '123' })
    expect(res.status).toBe(400)
  })

  test('rifiuta campi mancanti', async () => {
    const res = await request(app)
      .post('/api/v1/authentications/register')
      .send({ email: 'mario3@test.it' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/authentications', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/v1/authentications/register')
      .send({ name: 'Luigi', email: 'luigi@test.it', password: 'password123' })
  })

  test('login con credenziali corrette', async () => {
    const res = await request(app)
      .post('/api/v1/authentications')
      .send({ email: 'luigi@test.it', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.email).toBe('luigi@test.it')
    expect(res.body.role).toBe('user')
  })

  test('rifiuta password errata', async () => {
    const res = await request(app)
      .post('/api/v1/authentications')
      .send({ email: 'luigi@test.it', password: 'sbagliata' })
    expect(res.status).toBe(401)
  })

  test('rifiuta email inesistente', async () => {
    const res = await request(app)
      .post('/api/v1/authentications')
      .send({ email: 'nessuno@test.it', password: 'pass123' })
    expect(res.status).toBe(401)
  })

  test('rifiuta credenziali mancanti', async () => {
    const res = await request(app)
      .post('/api/v1/authentications')
      .send({ email: 'luigi@test.it' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/authentications/google', () => {
  test('rifiuta richiesta senza credential', async () => {
    const res = await request(app)
      .post('/api/v1/authentications/google')
      .send({})
    expect(res.status).toBe(400)
  })

  test('rifiuta token Google non valido', async () => {
    const res = await request(app)
      .post('/api/v1/authentications/google')
      .send({ credential: 'token_non_valido' })
    expect(res.status).toBe(401)
  })
})
