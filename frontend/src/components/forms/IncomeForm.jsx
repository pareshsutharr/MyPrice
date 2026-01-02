import { useEffect, useMemo, useState } from 'react'

const initialState = () => ({
  amount: '',
  category: 'salary',
  date: new Date().toISOString().split('T')[0],
  note: '',
})

const IncomeForm = ({ onSubmit, defaultValues, onCancel }) => {
  const [form, setForm] = useState(() => initialState())
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isEditing = useMemo(() => Boolean(defaultValues?._id), [defaultValues])

  useEffect(() => {
    if (defaultValues?._id) {
      setForm({
        amount: defaultValues.amount ?? '',
        category: defaultValues.category ?? 'salary',
        date: defaultValues.date ? new Date(defaultValues.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        note: defaultValues.note ?? '',
      })
    } else {
      setForm(initialState())
    }
  }, [defaultValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter a valid income amount.')
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
      if (isEditing) {
        onCancel?.()
      }
      setForm(initialState())
    } catch (error) {
      setFormError(error?.response?.data?.message ?? 'Unable to save income entry.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
          <option value="salary">Salary</option>
          <option value="freelance">Freelance</option>
          <option value="others">Others</option>
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
      <div className="flex gap-3">
        {isEditing && (
          <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary flex-1" disabled={submitting}>
          {submitting ? 'Saving…' : isEditing ? 'Update Income' : 'Save Income'}
        </button>
      </div>
    </form>
  )
}

export default IncomeForm
