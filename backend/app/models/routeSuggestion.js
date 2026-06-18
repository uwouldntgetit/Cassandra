import mongoose from 'mongoose'

// RF7: tracks how many times each physical route has been suggested, so the
// router can favor the least-crowded alternative. Persisted (RNF6) so the
// distribution survives restarts.
const routeSuggestionSchema = new mongoose.Schema({
  signature:       { type: String, required: true, unique: true },
  count:           { type: Number, default: 0 },
  lastSuggestedAt: { type: Date,   default: Date.now }
})

export default mongoose.model('RouteSuggestion', routeSuggestionSchema)
