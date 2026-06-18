import { Router } from 'express'
import adminChecker from './adminChecker.js'
import User from './models/user.js'
import Sensor from './models/sensor.js'
import SystemEvent from './models/systemEvent.js'

const router = Router()
router.use(adminChecker)

// GET /api/v1/admin/metrics — dashboard statistics
router.get('/metrics', async (req, res) => {
  const [totalSensors, activeSensors, activeAlerts, totalUsers] = await Promise.all([
    Sensor.countDocuments(),
    Sensor.countDocuments({ status: 'online' }),
    SystemEvent.countDocuments({ status: { $ne: 'Resolved' } }),
    User.countDocuments()
  ])

  const onlinePercentage = totalSensors > 0
    ? Math.round((activeSensors / totalSensors) * 100)
    : 0

  res.status(200).json({
    activeSensors,
    totalSensors,
    onlinePercentage,
    systemLoad: 34,        // mock value
    activeAlerts,
    totalUsers,
    apiRequests: '142k'    // mock value
  })
})

// GET /api/v1/admin/events — recent system events
router.get('/events', async (req, res) => {
  const events = await SystemEvent.find().sort({ createdAt: -1 }).limit(20).exec()
  res.status(200).json(events.map(e => ({
    self: '/api/v1/admin/events/' + e._id,
    id: e._id,
    type: e.type,
    message: e.message,
    status: e.status,
    time: e.createdAt
  })))
})

// PATCH /api/v1/admin/events/:id — update event status
router.patch('/events/:id', async (req, res) => {
  const { status } = req.body
  const allowed = ['Unresolved', 'Investigating', 'Resolved']
  if (!allowed.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status.' })

  const event = await SystemEvent.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).exec()

  if (!event)
    return res.status(404).json({ success: false, message: 'Event not found.' })

  res.status(200).json({ success: true, event })
})

// GET /api/v1/admin/sensors — sensor list
router.get('/sensors', async (req, res) => {
  const sensors = await Sensor.find().sort({ type: 1 }).exec()
  res.status(200).json(sensors.map(s => ({
    self: '/api/v1/admin/sensors/' + s._id,
    id: s._id,
    name: s.name,
    type: s.type,
    location: s.location,
    status: s.status,
    lastSeen: s.lastSeen
  })))
})

// GET /api/v1/admin/users — user list
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).exec()
  res.status(200).json(users.map(u => ({
    self: '/api/v1/users/' + u._id,
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  })))
})

export default router
