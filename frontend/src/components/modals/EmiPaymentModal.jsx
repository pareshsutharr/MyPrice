import { useEffect, useState } from 'react'
import { useCurrencyFormatter, useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import './EmiPaymentModal.css'

const EmiPaymentModal = ({ loan, onClose, onConfirm }) => {
  const [amount, setAmount] = useState(loan?.monthlyEmi ?? 0)
  const [note, setNote] = useState('')
  const [otherCharges, setOtherCharges] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formatCurrency = useCurrencyFormatter()
  const currencySymbol = useCurrencySymbol()

  useEffect(() => {
    setAmount(loan?.monthlyEmi ?? 0)
    setNote('')
    setOtherCharges('')
    setFormError('')
  }, [loan])

  if (!loan) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const numericAmount = Number(amount)
    const additionalCharges = otherCharges ? Number(otherCharges) : 0
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Enter a valid EMI amount.')
      return
    }
    if (!Number.isFinite(additionalCharges) || additionalCharges < 0) {
      setFormError('Other charges must be zero or more.')
      return
    }
    setSubmitting(true)
    try {
      await onConfirm({ amount: numericAmount, note, otherCharges: additionalCharges })
      onClose()
    } catch (error) {
      setFormError(error?.response?.data?.message ?? 'Failed to record EMI payment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="emi-payment-modal">
      <div className="emi-payment-modal__card">
        <div className="emi-payment-modal__header">
          <div>
            <p>Pay EMI</p>
            <h3>{loan.lender}</h3>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="emi-payment-modal__summary">
          Monthly EMI <span>{formatCurrency(loan.monthlyEmi ?? 0)}</span>
        </p>
        <form onSubmit={handleSubmit} className="emi-payment-modal__form">
          <div className="emi-payment-modal__field">
            <label>{`Amount (${currencySymbol})`}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="emi-payment-modal__field">
            <label>{`Other charges (${currencySymbol})`}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={otherCharges}
              onChange={(event) => setOtherCharges(event.target.value)}
            />
          </div>
          <div className="emi-payment-modal__field">
            <label>Note (optional)</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Paid from savings account..."
            />
          </div>
          {formError && <p className="emi-payment-modal__error">{formError}</p>}
          <button type="submit" className="emi-payment-modal__submit btn-primary" disabled={submitting}>
            {submitting ? 'Recording payment...' : 'Confirm payment'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EmiPaymentModal
