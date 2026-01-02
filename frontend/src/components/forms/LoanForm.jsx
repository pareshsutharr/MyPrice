import { useState } from 'react'

const getInitialLoanState = () => ({
    lender: '',
    principal: '',
    interestRate: '',
    monthlyEmi: '',
    durationMonths: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
})

const LoanForm = ({ onSubmit }) => {
  const [form, setForm] = useState(getInitialLoanState)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
      <div>
        <label className="text-sm text-slate-500">Lender</label>
        <input
          type="text"
          name="lender"
          value={form.lender}
          onChange={handleChange}
          required
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-500">Principal</label>
          <input
            type="number"
            name="principal"
            value={form.principal}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-500">Interest %</label>
          <input
            type="number"
            name="interestRate"
            value={form.interestRate}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-500">Monthly EMI</label>
          <input
            type="number"
            name="monthlyEmi"
            value={form.monthlyEmi}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-500">Duration (months)</label>
          <input
            type="number"
            name="durationMonths"
            value={form.durationMonths}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            required
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-500">Start date</label>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
        />
      </div>
      <div>
        <label className="text-sm text-slate-500">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          rows={3}
        />
      </div>
      {formError && <p className="text-sm text-rose-500">{formError}</p>}
      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save Loan'}
      </button>
    </form>
  )
}

export default LoanForm
