import mongoose from 'mongoose'
import { buildInvestmentKey } from '../utils/investmentKey.js'

const InvestmentSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true },
    uniqueKey: { type: String, trim: true, index: true },
    platform: { type: String, required: true, trim: true, default: 'Manual' },
    broker: { type: String, required: true, trim: true, default: 'Manual' },
    brokers: { type: [String], default: [] },
    source: { type: String, trim: true },
    amountInvested: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, required: true, min: 0 },
    units: { type: Number, min: 0 },
    isin: { type: String, trim: true },
    category: { type: String, trim: true },
    subCategory: { type: String, trim: true },
    folioNumber: { type: String, trim: true },
    averageNav: { type: Number, min: 0 },
    nav: { type: Number, min: 0 },
    xirr: { type: Number },
    lastStatementDate: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    currency: { type: String, default: '₹' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

InvestmentSchema.virtual('gain').get(function getGain() {
  return (this.currentValue ?? 0) - (this.amountInvested ?? 0)
})

InvestmentSchema.virtual('gainPercent').get(function getGainPercent() {
  if (!this.amountInvested) return 0
  return (((this.currentValue ?? 0) - this.amountInvested) / this.amountInvested) * 100
})

InvestmentSchema.set('toJSON', { virtuals: true })
InvestmentSchema.set('toObject', { virtuals: true })

InvestmentSchema.pre('save', function setKeyAndBrokers(next) {
  if (!this.uniqueKey) {
    this.uniqueKey = buildInvestmentKey({
      schemeName: this.schemeName,
      folioNumber: this.folioNumber,
      isin: this.isin,
    })
  }
  if (!this.brokers?.length) {
    this.brokers = [this.broker].filter(Boolean)
  } else if (this.broker && !this.brokers.includes(this.broker)) {
    this.brokers.push(this.broker)
  }
  next()
})

export const Investment = mongoose.model('Investment', InvestmentSchema)
