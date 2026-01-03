import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORY_MAP } from '@shared/constants.js'
import { useSettings } from '@context/SettingsContext.jsx'
import { useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import { formatDateValue } from '@hooks/useDateFormatter.js'
import { autoFormatDateInput, parseDateInput } from '@utils/dateFormat.js'
import './ExpenseForm.css'

const CATEGORY_IDS = CATEGORY_MAP.map((category) => category.id)

const getInitialState = () => ({
  amount: '',
  category: CATEGORY_MAP[0]?.id ?? 'food',
  customCategory: '',
  date: new Date().toISOString().split('T')[0],
  note: '',
})

const buildFormState = (defaults = {}) => {
  const base = getInitialState()
  const isoDate = defaults.date ? new Date(defaults.date).toISOString().split('T')[0] : base.date
  const incomingCategory = defaults.category ?? base.category
  const isCustomCategory = incomingCategory && !CATEGORY_IDS.includes(incomingCategory)

  return {
    ...base,
    ...defaults,
    date: isoDate,
    category: isCustomCategory ? 'others' : incomingCategory,
    customCategory: isCustomCategory ? incomingCategory : '',
  }
}

const ExpenseForm = ({ onSubmit, defaultValues, onCancel }) => {
  const { dateFormat } = useSettings()
  const initialForm = useMemo(() => buildFormState(defaultValues), [defaultValues])
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dateInput, setDateInput] = useState(() => formatDateValue(initialForm.date, dateFormat) || '')
  const currencySymbol = useCurrencySymbol()
  const isEditing = useMemo(() => Boolean(defaultValues?._id), [defaultValues])
  const calendarInputRef = useRef(null)

  useEffect(() => {
    const nextFormState = buildFormState(defaultValues)
    setForm(nextFormState)
    setDateInput(formatDateValue(nextFormState.date, dateFormat) || '')
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
        const formattedValue = autoFormatDateInput(value, dateFormat)
        setDateInput(formattedValue)
        const parsed = parseDateInput(formattedValue, dateFormat)
        return { ...prev, date: parsed ? parsed.toISOString().split('T')[0] : '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleCalendarChange = (event) => {
    const nextValue = event.target.value
    setForm((prev) => ({ ...prev, date: nextValue }))
    setDateInput(formatDateValue(nextValue, dateFormat) || '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter a valid amount greater than zero.')
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
    const { customCategory, ...rest } = form
    const category =
      form.category === 'others' && customCategory.trim() ? customCategory.trim() : form.category
    setSubmitting(true)
    try {
      await onSubmit({
        ...rest,
        category,
        amount,
        date: parsedDate.toISOString(),
      })
      const resetState = getInitialState()
      setForm(resetState)
      setDateInput(formatDateValue(resetState.date, dateFormat) || '')
      if (isEditing) {
        onCancel?.()
      }
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
        <div className="filter-toolbar__field expense-form__date-row">
          <input
            type="text"
            name="date"
            value={dateInput}
            onChange={handleChange}
            placeholder={dateFormat}
            inputMode="numeric"
            title={`Use ${dateFormat} format`}
            className="expense-form__date-input"
          />
          <button
            type="button"
            className="expense-form__calendar-btn"
            onClick={() => {
              const input = calendarInputRef.current
              if (!input) return
              if (typeof input.showPicker === 'function') {
                input.showPicker()
              } else {
                input.focus()
              }
            }}
            aria-label="Choose date"
          >
            📅
          </button>
          <input
            type="date"
            value={form.date}
            onChange={handleCalendarChange}
            className="expense-form__calendar-input"
            ref={calendarInputRef}
          />
        </div>
      </div>
      <div className="expense-form__field">
        <label>Note</label>
        <textarea name="note" value={form.note} onChange={handleChange} rows={3} />
      </div>
      {formError && <p className="expense-form__error">{formError}</p>}
      <div className="expense-form__actions">
        {isEditing && (
          <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="expense-form__submit btn-primary flex-1" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing ? 'Update Expense' : 'Save Expense'}
        </button>
      </div>
    </form>
  )
}

export default ExpenseForm
