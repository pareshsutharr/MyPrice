import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    if (!user) return res.status(401).json({ message: 'Invalid user session' })
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
