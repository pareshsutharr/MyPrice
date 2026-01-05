import { useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'
import { useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import { autoFormatDateInput, parseDateInput } from '@utils/dateFormat.js'
import { formatDateValue } from '@hooks/useDateFormatter.js'
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
  const [dateInput, setDateInput] = useState('')
  const calendarInputRef = useRef(null)

  const isEditing = useMemo(() => Boolean(defaultValues?._id), [defaultValues])

  useEffect(() => {
    if (defaultValues?._id) {
      const baseDate = defaultValues.date
        ? new Date(defaultValues.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      const incomingCategory = defaultValues.category ?? 'salary'
      const isKnownCategory = BUILTIN_CATEGORIES.includes(incomingCategory)
      const nextFormState = {
        amount: defaultValues.amount ?? '',
        category: isKnownCategory ? incomingCategory : 'others',
        customCategory: isKnownCategory && incomingCategory !== 'others' ? '' : incomingCategory ?? '',
        date: baseDate,
        note: defaultValues.note ?? '',
      }
      setForm(nextFormState)
      setDateInput(formatDateValue(nextFormState.date, dateFormat) || '')
    } else {
      const reset = initialState()
      setForm(reset)
      setDateInput(formatDateValue(reset.date, dateFormat) || '')
    }
  }, [defaultValues, dateFormat])

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
      if (name === 'date') {
        const formatted = autoFormatDateInput(value, dateFormat)
        setDateInput(formatted)
        const parsed = parseDateInput(formatted, dateFormat)
        return { ...prev, date: parsed ? parsed.toISOString().split('T')[0] : '' }
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
    const parsedDate = form.date ? new Date(form.date) : parseDateInput(dateInput, dateFormat)
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      setFormError(`Enter a valid date in ${dateFormat}.`)
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
        date: parsedDate.toISOString(),
        note: form.note,
      })
      if (isEditing) {
        onCancel?.()
      }
      const reset = initialState()
      setForm(reset)
      setDateInput(formatDateValue(reset.date, dateFormat) || '')
    } catch (error) {
      setFormError(error?.response?.data?.message ?? 'Unable to save income entry.')
    } finally {
      setSubmitting(false)
    }
  }

  const triggerCalendar = () => {
    const node = calendarInputRef.current
    if (!node) return
    if (typeof node.showPicker === 'function') {
      node.showPicker()
    } else {
      node.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="income-form">
      <div className="form-grid form-grid--two">
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
          <div className="income-form__field form-grid__full">
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
        <div className="income-form__field form-grid__full">
          <label>{`Date (${dateFormat})`}</label>
          <div className="income-form__date-row">
            <input
              type="text"
              name="date"
              value={dateInput}
              onChange={handleChange}
              placeholder={dateFormat}
              inputMode="numeric"
              className="income-form__date-input"
            />
            <button type="button" className="income-form__calendar-btn" onClick={triggerCalendar} aria-label="Choose date">
              📅
            </button>
            <input
              type="date"
              ref={calendarInputRef}
              className="income-form__calendar-input"
              value={form.date}
              onChange={(event) => handleChange({ target: { name: 'date', value: event.target.value } })}
            />
          </div>
        </div>
        <div className="income-form__field form-grid__full">
          <label>Note</label>
          <textarea name="note" value={form.note} onChange={handleChange} rows={3} />
        </div>
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
