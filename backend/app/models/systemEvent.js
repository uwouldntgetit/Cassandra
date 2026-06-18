import mongoose from 'mongoose'

const systemEventSchema = new mongoose.Schema({
  type:    { type: String, enum: ['error', 'warning', 'success'], required: true },
  message: { type: String, required: true },
  status:  { type: String, enum: ['Unresolved', 'Investigating', 'Resolved'], default: 'Unresolved' },
  public:  { type: Boolean, default: false }  // true = visible to users, false = admin only
}, { timestamps: true })

export default mongoose.model('SystemEvent', systemEventSchema)
