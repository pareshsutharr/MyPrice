import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: String,
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', UserSchema)
