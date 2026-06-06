import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  display_name: { type: String, required: true },
  lat: { type: String, required: true },
  lon: { type: String, required: true }
}, { _id: true })

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, default: '' },   // empty for Google-only accounts
  googleId: { type: String, default: null },  // null for email/password accounts
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [favoriteSchema]
}, { timestamps: true })

export default mongoose.model('User', userSchema)
