import { useState } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'
import { useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import './LoanForm.css'

const getInitialLoanState = () => ({
  lender: '',
  principal: '',
  interestRate: '',
  monthlyEmi: '',
  durationMonths: '',
  otherCharges: '',
  startDate: new Date().toISOString().split('T')[0],
  notes: '',
})

const LoanForm = ({ onSubmit }) => {
  const [form, setForm] = useState(getInitialLoanState)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { dateFormat } = useSettings()
  const currencySymbol = useCurrencySymbol()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const principal = Number(form.principal)
    const interestRate = Number(form.interestRate)
    const monthlyEmi = Number(form.monthlyEmi)
    const durationMonths = Number(form.durationMonths)
    const otherCharges = form.otherCharges ? Number(form.otherCharges) : 0
    if (!Number.isFinite(principal) || principal < 0) {
      setFormError('Principal must be a valid number.')
      return
    }
    if (!Number.isFinite(interestRate) || interestRate < 0) {
      setFormError('Enter a valid interest rate.')
      return
    }
    if (!Number.isFinite(monthlyEmi) || monthlyEmi <= 0) {
      setFormError('Monthly EMI must be greater than zero.')
      return
    }
    if (!Number.isFinite(durationMonths) || durationMonths < 1) {
      setFormError('Duration must be at least 1 month.')
      return
    }
    if (!Number.isFinite(otherCharges) || otherCharges < 0) {
      setFormError('Other charges must be zero or more.')
      return
    }
    const startDate = form.startDate ? new Date(form.startDate) : new Date()
    if (Number.isNaN(startDate.getTime())) {
      setFormError('Choose a valid start date.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        ...form,
        principal,
        interestRate,
        monthlyEmi,
        otherCharges,
        durationMonths,
        startDate: startDate.toISOString(),
      })
      setForm(getInitialLoanState())
    } catch (error) {
      setFormError(error?.response?.data?.message ?? 'Unable to save loan details right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="loan-form">
      <div className="loan-form__field">
        <label>Lender</label>
        <input type="text" name="lender" value={form.lender} onChange={handleChange} required />
      </div>
      <div className="loan-form__grid">
        <div className="loan-form__field">
          <label>{`Principal (${currencySymbol})`}</label>
          <input
            type="number"
            name="principal"
            value={form.principal}
            onChange={handleChange}
            inputMode="decimal"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="loan-form__field">
          <label>Interest %</label>
          <input
            type="number"
            name="interestRate"
            value={form.interestRate}
            onChange={handleChange}
            inputMode="decimal"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>
      <div className="loan-form__grid">
        <div className="loan-form__field">
          <label>{`Monthly EMI (${currencySymbol})`}</label>
          <input
            type="number"
            name="monthlyEmi"
            value={form.monthlyEmi}
            onChange={handleChange}
            inputMode="decimal"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="loan-form__field">
          <label>Duration (months)</label>
          <input
            type="number"
            name="durationMonths"
            value={form.durationMonths}
            onChange={handleChange}
            min="1"
            step="1"
            required
          />
        </div>
      </div>
      <div className="loan-form__field">
        <label>{`Other charges (${currencySymbol})`}</label>
        <input
          type="number"
          name="otherCharges"
          value={form.otherCharges}
          onChange={handleChange}
          min="0"
          step="0.01"
          inputMode="decimal"
        />
      </div>
      <div className="loan-form__field">
        <label>{`Start date (${dateFormat})`}</label>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          placeholder={dateFormat}
          title={`Use ${dateFormat} format`}
        />
      </div>
      <div className="loan-form__field">
        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />
      </div>
      {formError && <p className="loan-form__error">{formError}</p>}
      <button type="submit" className="loan-form__submit btn-primary" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Loan'}
      </button>
    </form>
  )
}

export default LoanForm
