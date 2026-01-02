import { useEffect, useState } from 'react'

const formatCurrency = (value = 0) => `₹ ${Number(value).toLocaleString('en-IN')}`

const EmiPaymentModal = ({ loan, onClose, onConfirm }) => {
  const [amount, setAmount] = useState(loan?.monthlyEmi ?? 0)
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setAmount(loan?.monthlyEmi ?? 0)
    setNote('')
    setFormError('')
  }, [loan])

  if (!loan) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Enter a valid EMI amount.')
      return
    }
    setSubmitting(true)
    try {
      await onConfirm({ amount: numericAmount, note })
      onClose()
    } catch (error) {
      setFormError(error?.response?.data?.message ?? 'Failed to record EMI payment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Pay EMI</p>
            <h3 className="text-xl font-display text-slate-900">{loan.lender}</h3>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Monthly EMI:{' '}
          <span className="font-semibold text-slate-900">
            {formatCurrency(loan.monthlyEmi ?? 0)}
          </span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-500">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-500">Note (optional)</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
              rows={3}
              placeholder="Paid from savings account..."
            />
          </div>
          {formError && <p className="text-sm text-rose-500">{formError}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Recording payment…' : 'Confirm payment'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EmiPaymentModal
