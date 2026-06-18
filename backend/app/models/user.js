import mongoose from 'mongoose'

// A saved search: place + map state (active layers, day and time slot)
const favoriteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  display_name: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  layers:      { type: [String], default: [] },  // e.g. ['weather', 'traffic']
  forecastDay: { type: Number,   default: 0 },   // 0 = today, 1-6 = future days
  timeSlot:    { type: Number,   default: 0 }    // 0-3 = morning/noon/evening/night
}, { _id: true })

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: '' },   // empty for Google-only accounts
  googleId: { type: String, default: null }, // null for email/password accounts
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [favoriteSchema]
}, { timestamps: true })

export default mongoose.model('User', userSchema)
