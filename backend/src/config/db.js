import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI in environment')
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('Mongo connection error', error)
    process.exit(1)
  }
}
