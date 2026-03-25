import mongoose from 'mongoose'

const DocumentItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentItem',
      default: null,
      index: true,
    },
    kind: { type: String, enum: ['folder', 'file'], required: true },
    name: { type: String, required: true, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number, default: 0 },
    isImage: { type: Boolean, default: false },
    content: { type: Buffer },
  },
  { timestamps: true },
)

DocumentItemSchema.index({ user: 1, parent: 1, name: 1 })

export const DocumentItem = mongoose.model('DocumentItem', DocumentItemSchema)
