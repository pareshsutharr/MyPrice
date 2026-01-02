import { Expense } from '../models/Expense.js'
import { Income } from '../models/Income.js'
import { LoanPayment } from '../models/LoanPayment.js'

export const getHistory = async (req, res) => {
  try {
    const [expenses, income, payments] = await Promise.all([
      Expense.find({ user: req.user._id }),
      Income.find({ user: req.user._id }),
      LoanPayment.find({ user: req.user._id }).populate('loan'),
    ])

    const entries = [
      ...income.map((entry) => ({
        id: entry._id,
        type: 'income',
        amount: entry.amount,
        date: entry.date,
        note: entry.note || entry.category,
        category: entry.category,
      })),
      ...expenses.map((entry) => ({
        id: entry._id,
        type: 'expense',
        amount: entry.amount,
        date: entry.date,
        note: entry.note || entry.category,
        category: entry.category,
      })),
      ...payments.map((payment) => ({
        id: payment._id,
        type: payment.type ?? 'emi',
        amount: payment.amount,
        date: payment.date,
        note: payment.note || `EMI paid to ${payment.loan?.lender ?? 'loan'}`,
        category: payment.loan?.lender ?? 'EMI',
        loanId: payment.loan?._id ?? payment.loan,
      })),
    ]

    entries.sort((a, b) => new Date(b.date) - new Date(a.date))

    res.json(entries)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message })
  }
}
