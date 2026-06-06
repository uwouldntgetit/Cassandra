import mongoose from 'mongoose'

const crowdHistorySchema = new mongoose.Schema({
  zone:      { type: String, required: true, index: true },
  zoneName:  String,
  zoneLat:   Number,
  zoneLon:   Number,
  density:   { type: Number, required: true },
  dayOfWeek: { type: Number, required: true }, // 0=Dom, 1=Lun, ..., 6=Sab
  isHoliday: { type: Boolean, default: false },
  date:      { type: Date, required: true, index: true }
})

export default mongoose.model('CrowdHistory', crowdHistorySchema)
