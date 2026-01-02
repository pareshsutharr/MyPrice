import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'node:path'
import { connectDB } from './config/db.js'
import expenseRoutes from './routes/expenseRoutes.js'
import incomeRoutes from './routes/incomeRoutes.js'
import loanRoutes from './routes/loanRoutes.js'
import investmentRoutes from './routes/investmentRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import historyRoutes from './routes/historyRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { authMiddleware } from './middleware/auth.js'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const app = express()
app.set('etag', false)

app.use(
  cors({
    origin: '*',
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (_req, res) => {
  res.json({ name: 'Finance Tracker API', status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use(authMiddleware)
app.use('/api/expenses', expenseRoutes)
app.use('/api/income', incomeRoutes)
app.use('/api/loans', loanRoutes)
app.use('/api/investments', investmentRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/history', historyRoutes)

const PORT = process.env.PORT || 4000

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
  })
}

start()
