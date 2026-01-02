import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })

export const googleLogin = async (req, res) => {
  const { idToken } = req.body
  if (!idToken) {
    return res.status(400).json({ message: 'Missing Google ID token' })
  }

  try {
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    const { sub, email, name, picture } = payload
    if (!email) {
      return res.status(400).json({ message: 'Google account missing email scope' })
    }

    const updates = {
      googleId: sub,
      email,
      name: name ?? email,
      avatar: picture,
      lastLogin: new Date(),
    }

    const user = await User.findOneAndUpdate({ googleId: sub }, updates, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    })

    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    res.status(401).json({ message: 'Unable to verify Google token', error: error.message })
  }
}
