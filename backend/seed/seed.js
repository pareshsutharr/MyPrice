import dotenv from 'dotenv'
import path from 'node:path'
import { connectDB } from '../src/config/db.js'
import { Expense } from '../src/models/Expense.js'
import { Income } from '../src/models/Income.js'
import { Loan } from '../src/models/Loan.js'
import { Investment } from '../src/models/Investment.js'
import { User } from '../src/models/User.js'
import { expenseSeed, incomeSeed, loanSeed, investmentSeed } from '../../shared/data/seedData.js'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const ensureSeeded = async (Model, data, label) => {
  const count = await Model.countDocuments()
  if (count === 0) {
    await Model.insertMany(data)
    console.log(`Seeded ${data.length} ${label}`)
  } else {
    console.log(`${label} already present (${count}) - skipping seed`)
  }
}

const seedUser = async () => {
  const email = process.env.SEED_USER_EMAIL
  if (!email) {
    console.log('SEED_USER_EMAIL not provided - skipping seed')
    return null
  }
  const googleId = process.env.SEED_GOOGLE_ID || `seed-${email}`
  const name = process.env.SEED_USER_NAME || 'Seed User'
  const user = await User.findOneAndUpdate(
    { email },
    { email, googleId, name },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  return user
}

const run = async () => {
  try {
    await connectDB()
    const user = await seedUser()
    if (!user) {
      process.exit(0)
      return
    }
    const userId = user._id
    const withUser = (collection) => collection.map((item) => ({ ...item, user: userId }))
    await ensureSeeded(Expense, withUser(expenseSeed), 'expenses')
    await ensureSeeded(Income, withUser(incomeSeed), 'income entries')
    await ensureSeeded(Loan, withUser(loanSeed), 'loans')
    await ensureSeeded(Investment, withUser(investmentSeed), 'investments')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed', error)
    process.exit(1)
  }
}

run()
