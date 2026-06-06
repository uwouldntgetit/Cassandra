import mongoose from 'mongoose'

const sensorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['weather', 'traffic', 'lighting', 'crowd'], required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'warning'], default: 'online' },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('Sensor', sensorSchema)
