// Reimposta la password di un utente sul DB puntato da DB_URL.
// Uso: node scripts/resetPassword.js <email> <nuova-password>
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const [email, newPassword] = process.argv.slice(2)
if (!email || !newPassword || newPassword.length < 6) {
  console.error('Uso: node scripts/resetPassword.js <email> <nuova-password (min 6 caratteri)>')
  process.exit(1)
}

await mongoose.connect(process.env.DB_URL)
const hashed = await bcrypt.hash(newPassword, 10)
const result = await mongoose.connection.collection('users')
  .updateOne({ email: email.toLowerCase().trim() }, { $set: { password: hashed } })

console.log(result.matchedCount ? `Password aggiornata per ${email}` : `Nessun utente con email ${email}`)
await mongoose.disconnect()
