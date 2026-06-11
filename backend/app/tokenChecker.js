import jwt from 'jsonwebtoken'

// Middleware: verifica il JWT dall'header Authorization (Bearer).
// Se valido, aggiunge req.loggedUser con i dati dell'utente.
const tokenChecker = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token)
    return res.status(401).json({ success: false, message: 'No token provided.' })

  jwt.verify(token, process.env.SUPER_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ success: false, message: 'Token not valid.' })
    req.loggedUser = decoded
    next()
  })
}

export default tokenChecker
