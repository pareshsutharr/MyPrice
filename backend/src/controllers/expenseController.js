import { Expense } from '../models/Expense.js'
import { validateDate, validateNumber, validateString } from '../utils/validation.js'

const parseFilters = ({ startDate, endDate, q }, userId) => {
  const filter = { user: userId }
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = new Date(startDate)
    if (endDate) filter.date.$lte = new Date(endDate)
  }
  if (q) {
    filter.note = { $regex: q, $options: 'i' }
  }
  return filter
}

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find(parseFilters(req.query, req.user._id)).sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message })
  }
}

export const createExpense = async (req, res) => {
  try {
    const payload = {
      amount: validateNumber(req.body.amount, 'Amount', { min: 0.01 }),
      category: validateString(req.body.category, 'Category'),
      date: validateDate(req.body.date, 'Date'),
      note: req.body.note,
      currency: req.body.currency,
      type: req.body.type || 'expense',
      user: req.user._id,
    }
    const expense = await Expense.create(payload)
    res.status(201).json(expense)
  } catch (error) {
    res.status(400).json({ message: 'Failed to create expense', error: error.message })
  }
}

export const updateExpense = async (req, res) => {
  try {
    const payload = {}
    if (req.body.amount !== undefined) {
      payload.amount = validateNumber(req.body.amount, 'Amount', { min: 0.01 })
    }
    if (req.body.category !== undefined) {
      payload.category = validateString(req.body.category, 'Category')
    }
    if (req.body.date !== undefined) {
      payload.date = validateDate(req.body.date, 'Date')
    }
    if (req.body.note !== undefined) {
      payload.note = req.body.note
    }
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      payload,
      {
        new: true,
        runValidators: true,
      },
    )
    if (!updated) return res.status(404).json({ message: 'Expense not found' })
    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Failed to update expense', error: error.message })
  }
}

export const deleteExpense = async (req, res) => {
  try {
    const result = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!result) return res.status(404).json({ message: 'Expense not found' })
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete expense', error: error.message })
  }
}
