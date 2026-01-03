import { useState } from 'react'
import { CATEGORY_MAP } from '@shared/constants.js'
import { useSettings } from '@context/SettingsContext.jsx'
import { useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import './ExpenseForm.css'

const getInitialState = () => ({
  amount: '',
  category: CATEGORY_MAP[0]?.id ?? 'food',
  customCategory: '',
  date: new Date().toISOString().split('T')[0],
  note: '',
})

const ExpenseForm = ({ onSubmit, defaultValues }) => {
  const [form, setForm] = useState(() => ({ ...getInitialState(), ...(defaultValues ?? {}) }))
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { dateFormat } = useSettings()
  const currencySymbol = useCurrencySymbol()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => {
      if (name === 'category') {
        return {
          ...prev,
          category: value,
          customCategory: value === 'others' ? prev.customCategory : '',
        }
      }
      return { ...prev, [name]: value }
    })
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
    if (form.category === 'others' && !form.customCategory.trim()) {
      setFormError('Enter a custom category name.')
      return
    }
    const { customCategory, ...rest } = form
    const category =
      form.category === 'others' && customCategory.trim() ? customCategory.trim() : form.category
    setSubmitting(true)
    try {
      await onSubmit({
        ...rest,
        category,
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
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="expense-form__field">
        <label>{`Amount (${currencySymbol})`}</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          inputMode="decimal"
          step="0.01"
          min="0"
          required
        />
      </div>
      <div className="expense-form__field">
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORY_MAP.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.label}
            </option>
          ))}
        </select>
      </div>
      {form.category === 'others' && (
        <div className="expense-form__field">
          <label>Custom category</label>
          <input
            type="text"
            name="customCategory"
            value={form.customCategory}
            onChange={handleChange}
            placeholder="Enter category name"
          />
        </div>
      )}
      <div className="expense-form__field">
        <label>{`Date (${dateFormat})`}</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          placeholder={dateFormat}
          title={`Use ${dateFormat} format`}
        />
      </div>
      <div className="expense-form__field">
        <label>Note</label>
        <textarea name="note" value={form.note} onChange={handleChange} rows={3} />
      </div>
      {formError && <p className="expense-form__error">{formError}</p>}
      <button type="submit" className="expense-form__submit btn-primary" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Expense'}
      </button>
    </form>
  )
}

export default ExpenseForm
