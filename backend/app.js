import express from 'express'
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

// Rotte pubbliche
app.use('/api/v1/authentications', authRouter)
app.use('/api/v1/layers',          layersRouter)
app.use('/api/v1/predictions',     predictionsRouter)
app.use('/api/v1/notifications',   notificationsRouter)

// Rotte protette (JWT richiesto)
app.use(tokenChecker)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/admin', adminRouter)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

export default app
