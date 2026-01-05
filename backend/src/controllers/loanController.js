import { Loan } from '../models/Loan.js'
import { LoanPayment } from '../models/LoanPayment.js'
import { validateDate, validateNumber, validateString } from '../utils/validation.js'

const LOAN_COMPLETION_EPSILON = 0.01

const sanitizePayment = (payment) => {
  if (!payment) return null
  return {
    _id: payment._id,
    amount: payment.amount,
    date: payment.date,
    note: payment.note,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  }
}

const withProgress = (loan, latestPayment) => {
  if (!loan) return null
  const doc = loan.toObject()
  return { ...doc, progress: loan.progress(), latestPayment: sanitizePayment(latestPayment) }
}

const validateLoanPayload = (payload = {}, { partial = false } = {}) => {
  const data = {}
  if (partial) {
    if ('lender' in payload) data.lender = validateString(payload.lender, 'Lender')
    if ('principal' in payload)
      data.principal = validateNumber(payload.principal, 'Principal', { min: 0 })
    if ('interestRate' in payload)
      data.interestRate = validateNumber(payload.interestRate, 'Interest rate', { min: 0 })
    if ('monthlyEmi' in payload)
      data.monthlyEmi = validateNumber(payload.monthlyEmi, 'Monthly EMI', { min: 0.01 })
    if ('durationMonths' in payload)
      data.durationMonths = Math.floor(
        validateNumber(payload.durationMonths, 'Duration (months)', { min: 1 }),
      )
    if ('startDate' in payload) data.startDate = validateDate(payload.startDate, 'Start date')
    if ('notes' in payload) data.notes = payload.notes
    return data
  }

  return {
    lender: validateString(payload.lender, 'Lender'),
    principal: validateNumber(payload.principal, 'Principal', { min: 0 }),
    interestRate: validateNumber(payload.interestRate, 'Interest rate', { min: 0 }),
    monthlyEmi: validateNumber(payload.monthlyEmi, 'Monthly EMI', { min: 0.01 }),
    durationMonths: Math.floor(
      validateNumber(payload.durationMonths, 'Duration (months)', { min: 1 }),
    ),
    startDate: validateDate(payload.startDate, 'Start date'),
    notes: payload.notes,
  }
}

const getLoanOutstanding = (loan) => {
  const scheduled = (loan.monthlyEmi ?? 0) * (loan.durationMonths ?? 0)
  const paid = loan.amountPaid ?? 0
  return Math.max(scheduled - paid, 0)
}

const determineStatus = (loan) => {
  const remaining = getLoanOutstanding(loan)
  loan.status = remaining <= LOAN_COMPLETION_EPSILON ? 'completed' : 'active'
}

export const getLoans = async (req, res) => {
  try {
    const [loans, payments] = await Promise.all([
      Loan.find({ user: req.user._id }).sort({ startDate: -1 }),
      LoanPayment.find({ user: req.user._id }).sort({ createdAt: -1 }),
    ])
    const latestPaymentByLoan = payments.reduce((map, payment) => {
      const loanId = payment.loan?.toString()
      if (!loanId || map.has(loanId)) return map
      map.set(loanId, payment)
      return map
    }, new Map())
    const formatted = loans.map((loan) => withProgress(loan, latestPaymentByLoan.get(loan._id.toString())))
    res.json({
      active: formatted.filter((loan) => loan.status === 'active'),
      completed: formatted.filter((loan) => loan.status === 'completed'),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loans', error: error.message })
  }
}

export const createLoan = async (req, res) => {
  try {
    const payload = validateLoanPayload(req.body)
    const loan = await Loan.create({ ...payload, user: req.user._id })
    res.status(201).json(withProgress(loan))
  } catch (error) {
    res.status(400).json({ message: 'Failed to create loan', error: error.message })
  }
}

export const updateLoan = async (req, res) => {
  try {
    const payload = validateLoanPayload(req.body, { partial: true })
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      payload,
      {
        new: true,
        runValidators: true,
      },
    )
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' })
    }
    res.json(withProgress(loan))
  } catch (error) {
    res.status(400).json({ message: 'Failed to update loan', error: error.message })
  }
}

export const deleteLoan = async (req, res) => {
  try {
    const loan = await Loan.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' })
    }
    await LoanPayment.deleteMany({ loan: loan._id, user: req.user._id })
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete loan', error: error.message })
  }
}

export const payLoanEmi = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id })
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' })
    }
    if (loan.status === 'completed') {
      return res.status(400).json({ message: 'Loan already completed' })
    }
    const requestedAmount =
      req.body?.amount !== undefined
        ? validateNumber(req.body.amount, 'EMI amount', { min: 0.01 })
        : loan.monthlyEmi
    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid EMI amount' })
    }

    const outstanding = getLoanOutstanding(loan)
    if (outstanding <= 0) {
      return res.status(400).json({ message: 'Loan already settled' })
    }
    if (requestedAmount - outstanding > LOAN_COMPLETION_EPSILON) {
      return res
        .status(400)
        .json({ message: `Payment exceeds outstanding balance of ₹${outstanding.toFixed(2)}` })
    }
    const amount = Math.min(requestedAmount, outstanding)

    const payment = await LoanPayment.create({
      loan: loan._id,
      user: req.user._id,
      amount,
      note: req.body?.note,
    })

    loan.amountPaid += amount
    determineStatus(loan)
    await loan.save()

    res.status(201).json({ loan: withProgress(loan, payment), payment })
  } catch (error) {
    res.status(400).json({ message: 'Failed to record EMI payment', error: error.message })
  }
}

export const undoLoanPayment = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id })
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' })
    }
    const payment = await LoanPayment.findOne({
      _id: req.params.paymentId,
      loan: loan._id,
      user: req.user._id,
    }).sort({ createdAt: -1 })
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    const latestPayment = await LoanPayment.findOne({ loan: loan._id, user: req.user._id }).sort({
      createdAt: -1,
    })
    if (!latestPayment || latestPayment._id.toString() !== payment._id.toString()) {
      return res
        .status(400)
        .json({ message: 'Only the most recent payment can be rolled back to keep history clean' })
    }

    await LoanPayment.deleteOne({ _id: payment._id })
    loan.amountPaid = Math.max((loan.amountPaid ?? 0) - payment.amount, 0)
    determineStatus(loan)
    await loan.save()

    const refreshedLatestPayment = await LoanPayment.findOne({
      loan: loan._id,
      user: req.user._id,
    }).sort({ createdAt: -1 })

    res.json({
      loan: withProgress(loan, refreshedLatestPayment),
      revertedPayment: sanitizePayment(payment),
    })
  } catch (error) {
    res.status(400).json({ message: 'Failed to roll back EMI payment', error: error.message })
  }
}
