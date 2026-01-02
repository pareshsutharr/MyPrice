import mongoose from 'mongoose'

const LoanPaymentSchema = new mongoose.Schema(
  {
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    type: { type: String, default: 'emi' },
  },
  { timestamps: true },
)

export const LoanPayment = mongoose.model('LoanPayment', LoanPaymentSchema)
