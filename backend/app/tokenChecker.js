import jwt from 'jsonwebtoken'

// Middleware: verifies the JWT from the Authorization (Bearer) header.
// On success, attaches the decoded user to req.loggedUser.
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
