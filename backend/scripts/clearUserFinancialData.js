import path from 'node:path'
import dotenv from 'dotenv'
import { connectDB } from '../src/config/db.js'
import { User } from '../src/models/User.js'
import { Expense } from '../src/models/Expense.js'
import { Income } from '../src/models/Income.js'
import { Loan } from '../src/models/Loan.js'
import { LoanPayment } from '../src/models/LoanPayment.js'

const TARGET_NAME = process.argv[2] ?? process.env.TARGET_USER_NAME ?? 'Paresh Suthar'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const run = async () => {
  await connectDB()
  const user = await User.findOne({
    name: TARGET_NAME,
  })

  if (!user) {
    console.error(`No user found with name "${TARGET_NAME}"`)
    process.exit(1)
  }

  const filter = { user: user._id }

  const [expensesResult, incomeResult, loansResult, loanPaymentsResult] = await Promise.all([
    Expense.deleteMany(filter),
    Income.deleteMany(filter),
    Loan.deleteMany(filter),
    LoanPayment.deleteMany(filter),
  ])

  console.log(
    `Cleared data for ${TARGET_NAME}: ${expensesResult.deletedCount} expenses, ${incomeResult.deletedCount} income entries, ${loansResult.deletedCount} loans, ${loanPaymentsResult.deletedCount} loan payments`,
  )
  process.exit(0)
}

run().catch((error) => {
  console.error('Failed to clear user data', error)
  process.exit(1)
})
