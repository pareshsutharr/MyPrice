import { useState } from 'react'
import { CATEGORY_MAP } from '@shared/constants.js'

const getInitialState = () => ({
  amount: '',
  category: CATEGORY_MAP[0].id,
  date: new Date().toISOString().split('T')[0],
  note: '',
})

const ExpenseForm = ({ onSubmit, defaultValues = getInitialState() }) => {
  const [form, setForm] = useState(() => ({ ...getInitialState(), ...defaultValues }))
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter a valid amount greater than zero.')
      return
    }
    const date = form.date ? new Date(form.date) : new Date()
    if (Number.isNaN(date.getTime())) {
      setFormError('Select a valid date.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        ...form,
        amount,
        date: date.toISOString(),
      })
      setForm(getInitialState())
    } catch (error) {
      setFormError(error?.response?.data?.message ?? 'Unable to save expense right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
      <div>
        <label className="text-sm text-slate-500">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="text-sm text-slate-500">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2 capitalize"
        >
          {CATEGORY_MAP.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm text-slate-500">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
        />
      </div>
      <div>
        <label className="text-sm text-slate-500">Note</label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          rows={3}
        />
      </div>
      {formError && <p className="text-sm text-rose-500">{formError}</p>}
      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save Expense'}
      </button>
    </form>
  )
}

export default ExpenseForm
