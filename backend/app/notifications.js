import express from 'express'
import SystemEvent from './models/systemEvent.js'

const router = express.Router()

// GET /api/v1/notifications - eventi di sistema recenti (pubblico)
router.get('/', async (req, res) => {
  try {
    const events = await SystemEvent.find({ public: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    res.json(events.map(e => ({
      _id: e._id,
      type: e.type,
      message: e.message,
      status: e.status,
      createdAt: e.createdAt
    })))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
