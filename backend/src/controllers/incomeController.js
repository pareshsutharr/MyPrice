import { Income } from '../models/Income.js'
import { validateDate, validateNumber, validateString } from '../utils/validation.js'

export const getIncome = async (req, res) => {
  try {
    const income = await Income.find({ user: req.user._id }).sort({ date: -1 })
    res.json(income)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch income', error: error.message })
  }
}

export const createIncome = async (req, res) => {
  try {
    const payload = {
      amount: validateNumber(req.body.amount, 'Amount', { min: 0.01 }),
      category: validateString(req.body.category, 'Category'),
      date: validateDate(req.body.date, 'Date'),
      note: req.body.note,
      currency: req.body.currency,
    }
    if (!payload.split && payload.amount) {
      payload.split = {
        needs: payload.amount * 0.5,
        wants: payload.amount * 0.3,
        savings: payload.amount * 0.2,
      }
    }
    const income = await Income.create({ ...payload, user: req.user._id })
    res.status(201).json(income)
  } catch (error) {
    res.status(400).json({ message: 'Failed to create income', error: error.message })
  }
}
