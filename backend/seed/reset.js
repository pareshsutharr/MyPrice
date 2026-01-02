import dotenv from 'dotenv'
import path from 'node:path'
import { connectDB } from '../src/config/db.js'
import { Expense } from '../src/models/Expense.js'
import { Income } from '../src/models/Income.js'
import { Loan } from '../src/models/Loan.js'
import { Investment } from '../src/models/Investment.js'
import { StatementImport } from '../src/models/StatementImport.js'
import { User } from '../src/models/User.js'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const purgeCollection = async (Model, label) => {
  const result = await Model.deleteMany({})
  console.log(`Cleared ${label} (${result.deletedCount ?? 0})`)
}

const run = async () => {
  try {
    await connectDB()
    await purgeCollection(User, 'users')
    await purgeCollection(Expense, 'expenses')
    await purgeCollection(Income, 'income entries')
    await purgeCollection(Loan, 'loans')
    await purgeCollection(Investment, 'investments')
    await purgeCollection(StatementImport, 'statement imports')
    process.exit(0)
  } catch (error) {
    console.error('Reset failed', error)
    process.exit(1)
  }
}

run()
