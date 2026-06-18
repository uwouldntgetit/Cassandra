// Resets a user's password on the DB pointed to by DB_URL.
// Usage: node scripts/resetPassword.js <email> <new-password>
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const [email, newPassword] = process.argv.slice(2)
if (!email || !newPassword || newPassword.length < 6) {
  console.error('Usage: node scripts/resetPassword.js <email> <new-password (min 6 chars)>')
  process.exit(1)
}

await mongoose.connect(process.env.DB_URL)
const hashed = await bcrypt.hash(newPassword, 10)
const result = await mongoose.connection.collection('users')
  .updateOne({ email: email.toLowerCase().trim() }, { $set: { password: hashed } })

console.log(result.matchedCount ? `Password updated for ${email}` : `No user with email ${email}`)
await mongoose.disconnect()
