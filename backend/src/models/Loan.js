import mongoose from 'mongoose'

const LoanSchema = new mongoose.Schema(
  {
    lender: { type: String, required: true, trim: true },
    principal: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, required: true, min: 0 },
    monthlyEmi: { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    notes: String,
    amountPaid: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    currency: { type: String, default: '₹' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

LoanSchema.methods.progress = function progress() {
  const monthsElapsed =
    (new Date().getTime() - new Date(this.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  const emiPaidByTime = Math.min(Math.max(Math.round(monthsElapsed), 0), this.durationMonths)
  const emiPaidByPayments = Math.min(
    Math.floor((this.amountPaid ?? 0) / this.monthlyEmi),
    this.durationMonths,
  )
  const emiPaid = Math.max(emiPaidByTime, emiPaidByPayments)
  const totalPaidViaEmi = emiPaid * (this.monthlyEmi ?? 0)
  const interestPaid = totalPaidViaEmi - Math.max(this.principal - this.amountPaid, 0)
  const totalPayable = this.principal + (this.principal * (this.interestRate ?? 0)) / 100
  const remaining = Math.max(totalPayable - totalPaidViaEmi, 0)
  return {
    emiPaid,
    totalPaidViaEmi,
    interestPaid: Math.max(interestPaid, 0),
    remaining,
    completion: this.durationMonths ? (emiPaid / this.durationMonths) * 100 : 0,
    totalPayable,
  }
}

export const Loan = mongoose.model('Loan', LoanSchema)
