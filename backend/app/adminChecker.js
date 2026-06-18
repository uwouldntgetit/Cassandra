// Middleware: must run AFTER tokenChecker. Rejects non-admin users.
const adminChecker = (req, res, next) => {
  if (req.loggedUser?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access required.' })
  next()
}

export default adminChecker
