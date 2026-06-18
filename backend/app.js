import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger.js'

import authRouter          from './app/authentication.js'
import usersRouter         from './app/users.js'
import layersRouter        from './app/layers.js'
import routingRouter       from './app/routing.js'
import predictionsRouter   from './app/predictions.js'
import notificationsRouter from './app/notifications.js'
import adminRouter         from './app/admin.js'
import tokenChecker        from './app/tokenChecker.js'

const app = express()
app.set('trust proxy', 1) // behind Render's proxy: client IP arrives via X-Forwarded-For

// CORS_ORIGIN (comma-separated list) restricts origins; if unset, all are allowed
app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN.split(',') } : {}))
app.use(helmet({ contentSecurityPolicy: false })) // CSP disabled for Swagger UI
app.use(express.json())

// Rate limit on auth routes to slow brute force (disabled in tests)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many attempts, try again later.' }
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => res.redirect('/api-docs'))

// Public routes
app.use('/api/v1/authentications', authLimiter, authRouter)
app.use('/api/v1/layers',          layersRouter)
app.use('/api/v1/routing',         routingRouter)
app.use('/api/v1/predictions',     predictionsRouter)
app.use('/api/v1/notifications',   notificationsRouter)

// Protected routes (JWT required)
app.use('/api/v1/users', tokenChecker, usersRouter)
app.use('/api/v1/admin', tokenChecker, adminRouter)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// Global error handler (also catches async errors via express-async-errors)
app.use((err, req, res, next) => {
  if (err.name === 'CastError')
    return res.status(400).json({ success: false, message: 'Invalid id format.' })
  if (err.code === 11000)
    return res.status(409).json({ success: false, message: 'Duplicate value.' })

  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error.' })
})

export default app
