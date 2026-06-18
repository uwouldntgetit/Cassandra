import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import User from './models/user.js'

const router = Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.SUPER_SECRET,
    { expiresIn: 86400 }
  )
}

function userResponse(user, token) {
  return {
    success: true,
    token,
    id:    user._id,
    email: user.email,
    name:  user.name,
    role:  user.role,
    self:  '/api/v1/users/' + user._id
  }
}

// True only if every value is a non-empty string (blocks Mongo operators in the body)
function areStrings(...values) {
  return values.every(v => typeof v === 'string' && v.length > 0)
}

// POST /api/v1/authentications — email/password login
// Returns a generic 401 for both unknown email and wrong password,
// so registered emails can't be enumerated.
router.post('', async (req, res) => {
  const { email, password } = req.body
  if (!areStrings(email, password))
    return res.status(400).json({ success: false, message: 'Email and password required.' })

  const user = await User.findOne({ email }).exec()
  if (!user)
    return res.status(401).json({ success: false, message: 'Invalid credentials.' })

  if (!user.password)
    return res.status(400).json({ success: false, message: 'This account uses Google Sign-In.' })

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch)
    return res.status(401).json({ success: false, message: 'Invalid credentials.' })

  res.json(userResponse(user, signToken(user)))
})

// POST /api/v1/authentications/google — Google Sign-In
router.post('/google', async (req, res) => {
  const { credential } = req.body
  if (!credential)
    return res.status(400).json({ success: false, message: 'No Google credential provided.' })

  if (!process.env.GOOGLE_CLIENT_ID)
    return res.status(503).json({ success: false, message: 'Google Auth not configured on server.' })

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const { sub: googleId, email, name } = ticket.getPayload()

    // Find or create the user
    let user = await User.findOne({ email }).exec()
    if (!user) {
      user = await User.create({ name: name || email.split('@')[0], email, googleId, role: 'user' })
    } else if (!user.googleId) {
      user.googleId = googleId
      await user.save()
    }

    res.json(userResponse(user, signToken(user)))
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid Google token.' })
  }
})

// POST /api/v1/authentications/register — email/password registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!areStrings(name, email, password))
    return res.status(400).json({ success: false, message: 'Name, email and password required.' })
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' })

  const existing = await User.findOne({ email }).exec()
  if (existing)
    return res.status(409).json({ success: false, message: 'Email already registered.' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashed })

  res.status(201).location('/api/v1/users/' + user._id).json({
    success: true,
    message: 'User created.',
    self:    '/api/v1/users/' + user._id
  })
})

export default router
