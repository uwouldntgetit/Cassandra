import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'
import User from '../app/models/user.js'

let mongod
let adminToken

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())

  await request(app)
    .post('/api/v1/authentications/register')
    .send({ name: 'Admin', email: 'admin@test.it', password: 'password123' })
  await User.updateOne({ email: 'admin@test.it' }, { role: 'admin' })

  const res = await request(app)
    .post('/api/v1/authentications')
    .send({ email: 'admin@test.it', password: 'password123' })
  adminToken = res.body.token
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

describe('Error handling globale', () => {
  test('id malformato restituisce 400 invece di crashare', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/events/id-non-valido')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('Autorizzazione admin', () => {
  test('utente non admin riceve 403 sulle rotte admin', async () => {
    await request(app)
      .post('/api/v1/authentications/register')
      .send({ name: 'Utente', email: 'utente@test.it', password: 'password123' })
    const login = await request(app)
      .post('/api/v1/authentications')
      .send({ email: 'utente@test.it', password: 'password123' })

    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${login.body.token}`)
    expect(res.status).toBe(403)
  })

  test('admin accede alle metriche', async () => {
    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.totalUsers).toBeDefined()
  })
})

describe('Validazione input login', () => {
  test('rifiuta operatori Mongo al posto delle credenziali', async () => {
    const res = await request(app)
      .post('/api/v1/authentications')
      .send({ email: { $gt: '' }, password: { $gt: '' } })
    expect(res.status).toBe(400)
  })
})

describe('Normalizzazione email', () => {
  test('registrazione con maiuscole e login in minuscolo', async () => {
    await request(app)
      .post('/api/v1/authentications/register')
      .send({ name: 'Mario', email: '  Mario@Test.it ', password: 'password123' })

    const res = await request(app)
      .post('/api/v1/authentications')
      .send({ email: 'mario@test.it', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.email).toBe('mario@test.it')
  })

  test('login con maiuscole trova l\'account in minuscolo', async () => {
    const res = await request(app)
      .post('/api/v1/authentications')
      .send({ email: 'MARIO@TEST.IT', password: 'password123' })
    expect(res.status).toBe(200)
  })

  test('email duplicata con case diverso viene rifiutata', async () => {
    const res = await request(app)
      .post('/api/v1/authentications/register')
      .send({ name: 'Mario 2', email: 'MaRiO@tEsT.iT', password: 'password123' })
    expect(res.status).toBe(409)
  })
})
