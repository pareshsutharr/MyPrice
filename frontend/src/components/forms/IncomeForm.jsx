import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'
import { useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import './IncomeForm.css'

const initialState = () => ({
  amount: '',
  category: 'salary',
  customCategory: '',
  date: new Date().toISOString().split('T')[0],
  note: '',
})

const BUILTIN_CATEGORIES = ['salary', 'freelance', 'others']

const IncomeForm = ({ onSubmit, defaultValues, onCancel }) => {
  const [form, setForm] = useState(() => initialState())
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { dateFormat } = useSettings()
  const currencySymbol = useCurrencySymbol()

  const isEditing = useMemo(() => Boolean(defaultValues?._id), [defaultValues])

  useEffect(() => {
    if (defaultValues?._id) {
      const baseDate = defaultValues.date
        ? new Date(defaultValues.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      const incomingCategory = defaultValues.category ?? 'salary'
      const isKnownCategory = BUILTIN_CATEGORIES.includes(incomingCategory)
      setForm({
        amount: defaultValues.amount ?? '',
        category: isKnownCategory ? incomingCategory : 'others',
        customCategory: isKnownCategory && incomingCategory !== 'others' ? '' : incomingCategory ?? '',
        date: baseDate,
        note: defaultValues.note ?? '',
      })
    } else {
      setForm(initialState())
    }
  }, [defaultValues])

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
      setFormError('Enter a valid income amount.')
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
    const payloadCategory =
      form.category === 'others' && form.customCategory.trim()
        ? form.customCategory.trim()
        : form.category
    setSubmitting(true)
    try {
      await onSubmit({
        amount,
        category: payloadCategory,
        date: date.toISOString(),
        note: form.note,
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
    <form onSubmit={handleSubmit} className="income-form">
      <div className="income-form__field">
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
      <div className="income-form__field">
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="salary">Salary</option>
          <option value="freelance">Freelance</option>
          <option value="others">Others</option>
        </select>
      </div>
      {form.category === 'others' && (
        <div className="income-form__field">
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
      <div className="income-form__field">
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
      <div className="income-form__field">
        <label>Note</label>
        <textarea name="note" value={form.note} onChange={handleChange} rows={3} />
      </div>
      {formError && <p className="income-form__error">{formError}</p>}
      <div className="income-form__actions">
        {isEditing && (
          <button type="button" className="income-form__cancel btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="income-form__submit btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing ? 'Update Income' : 'Save Income'}
        </button>
      </div>
    </form>
  )
}

export default IncomeForm
