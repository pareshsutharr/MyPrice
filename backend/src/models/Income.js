import mongoose from 'mongoose'

const IncomeSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    split: {
      needs: Number,
      wants: Number,
      savings: Number,
    },
    currency: { type: String, default: '₹' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export const Income = mongoose.model('Income', IncomeSchema)
