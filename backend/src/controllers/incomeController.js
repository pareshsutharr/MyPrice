import { Income } from '../models/Income.js'
import { validateDate, validateNumber, validateString } from '../utils/validation.js'

const buildPayload = (body) => {
  const payload = {}
  if (body.amount !== undefined) {
    payload.amount = validateNumber(body.amount, 'Amount', { min: 0.01 })
  }
  if (body.category !== undefined) {
    payload.category = validateString(body.category, 'Category')
  }
  if (body.date !== undefined) {
    payload.date = validateDate(body.date, 'Date')
  }
  if (body.note !== undefined) {
    payload.note = body.note
  }
  if (body.currency !== undefined) {
    payload.currency = body.currency
  }
  if (!payload.split && payload.amount) {
    payload.split = {
      needs: payload.amount * 0.5,
      wants: payload.amount * 0.3,
      savings: payload.amount * 0.2,
    }
  }
  return payload
}

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

export const updateIncome = async (req, res) => {
  try {
    const payload = buildPayload(req.body)
    const updated = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      payload,
      {
        new: true,
        runValidators: true,
      },
    )
    if (!updated) {
      return res.status(404).json({ message: 'Income entry not found' })
    }
    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Failed to update income', error: error.message })
  }
}

export const deleteIncome = async (req, res) => {
  try {
    const deleted = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!deleted) {
      return res.status(404).json({ message: 'Income entry not found' })
    }
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete income', error: error.message })
  }
}
