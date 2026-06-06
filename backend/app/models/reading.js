import mongoose from 'mongoose'

// Stores the latest data snapshot for each layer type.
// The frontend reads from here to display real data on the map.
const readingSchema = new mongoose.Schema({
  type: { type: String, enum: ['weather', 'traffic', 'crowd', 'lighting'], required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model('Reading', readingSchema)
