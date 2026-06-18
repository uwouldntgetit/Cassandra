import { Router } from 'express'
import User from './models/user.js'

const router = Router()

// GET /api/v1/users/me — current user profile
router.get('/me', async (req, res) => {
  const user = await User.findById(req.loggedUser.id).select('-password').exec()
  if (!user)
    return res.status(404).json({ success: false, message: 'User not found.' })

  res.status(200).json({
    self: '/api/v1/users/' + user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    favorites: user.favorites
  })
})

// GET /api/v1/users/me/favorites — saved searches list
router.get('/me/favorites', async (req, res) => {
  const user = await User.findById(req.loggedUser.id).select('favorites').exec()
  if (!user)
    return res.status(404).json({ success: false, message: 'User not found.' })

  res.status(200).json(user.favorites)
})

const VALID_LAYERS = ['weather', 'traffic', 'lighting', 'crowd']

// POST /api/v1/users/me/favorites — saves a search (place + map state)
router.post('/me/favorites', async (req, res) => {
  const { name, display_name } = req.body
  const lat = Number(req.body.lat)
  const lon = Number(req.body.lon)
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon))
    return res.status(400).json({ success: false, message: 'name, lat and lon are required.' })

  // Search state: keep only known layers, clamp day/slot indices
  const layers      = Array.isArray(req.body.layers) ? req.body.layers.filter(l => VALID_LAYERS.includes(l)) : []
  const forecastDay = Math.min(Math.max(Number(req.body.forecastDay) || 0, 0), 6)
  const timeSlot    = Math.min(Math.max(Number(req.body.timeSlot)    || 0, 0), 3)

  const user = await User.findById(req.loggedUser.id).exec()
  if (!user)
    return res.status(404).json({ success: false, message: 'User not found.' })

  const alreadyExists = user.favorites.some(f => f.lat === lat && f.lon === lon)
  if (alreadyExists)
    return res.status(409).json({ success: false, message: 'Already in favorites.' })

  user.favorites.push({ name, display_name: display_name || name, lat, lon, layers, forecastDay, timeSlot })
  await user.save()

  const added = user.favorites[user.favorites.length - 1]
  res.status(201).json({ success: true, favorite: added })
})

// DELETE /api/v1/users/me/favorites/:id — removes a saved search
router.delete('/me/favorites/:id', async (req, res) => {
  const user = await User.findById(req.loggedUser.id).exec()
  if (!user)
    return res.status(404).json({ success: false, message: 'User not found.' })

  const before = user.favorites.length
  user.favorites = user.favorites.filter(f => f._id.toString() !== req.params.id)
  if (user.favorites.length === before)
    return res.status(404).json({ success: false, message: 'Favorite not found.' })

  await user.save()
  res.status(204).send()
})

export default router
