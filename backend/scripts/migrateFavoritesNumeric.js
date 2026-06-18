// One-shot migration: converts favorite lat/lon from String to Number.
// Usage: node scripts/migrateFavoritesNumeric.js
import 'dotenv/config'
import mongoose from 'mongoose'

await mongoose.connect(process.env.DB_URL)

const users = mongoose.connection.collection('users')
const cursor = users.find({ $or: [{ 'favorites.lat': { $type: 'string' } }, { 'favorites.lon': { $type: 'string' } }] })

let migrated = 0
for await (const user of cursor) {
  const favorites = user.favorites.map(f => ({ ...f, lat: Number(f.lat), lon: Number(f.lon) }))
  await users.updateOne({ _id: user._id }, { $set: { favorites } })
  migrated++
}

console.log(`Migrated users: ${migrated}`)
await mongoose.disconnect()
