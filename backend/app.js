import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger.js'

import authRouter          from './app/authentication.js'
import usersRouter         from './app/users.js'
import layersRouter        from './app/layers.js'
import predictionsRouter   from './app/predictions.js'
import notificationsRouter from './app/notifications.js'
import adminRouter         from './app/admin.js'
import tokenChecker        from './app/tokenChecker.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => res.redirect('/api-docs'))

// Rotte pubbliche
app.use('/api/v1/authentications', authRouter)
app.use('/api/v1/layers',          layersRouter)
app.use('/api/v1/predictions',     predictionsRouter)
app.use('/api/v1/notifications',   notificationsRouter)

// Rotte protette (JWT richiesto)
app.use('/api/v1/users', tokenChecker, usersRouter)
app.use('/api/v1/admin', tokenChecker, adminRouter)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// Error handler globale (riceve anche gli errori async via express-async-errors)
app.use((err, req, res, next) => {
  if (err.name === 'CastError')
    return res.status(400).json({ success: false, message: 'Invalid id format.' })
  if (err.code === 11000)
    return res.status(409).json({ success: false, message: 'Duplicate value.' })

  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, message: 'Internal server error.' })
})

export default app
