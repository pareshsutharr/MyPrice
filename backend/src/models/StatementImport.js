import mongoose from 'mongoose'

const StatementImportSchema = new mongoose.Schema(
  {
    broker: { type: String, required: true, trim: true },
    statementDate: { type: Date, required: true },
    source: { type: String, default: 'upload' },
    rawFileName: { type: String },
    summary: {
      clientId: String,
      clientName: String,
      pan: String,
      totalInvested: Number,
      currentValue: Number,
      totalGain: Number,
      gainPercent: Number,
      xirr: Number,
      meta: mongoose.Schema.Types.Mixed,
    },
    holdingsCount: { type: Number, default: 0 },
    records: [
      {
        schemeName: String,
        folioNumber: String,
        isin: String,
        category: String,
        subCategory: String,
        investedValue: Number,
        currentValue: Number,
        units: Number,
      },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export const StatementImport = mongoose.model('StatementImport', StatementImportSchema)
