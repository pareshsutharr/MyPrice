import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'
import { useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import './InvestmentForm.css'

const platforms = ['Groww', 'Angel One', 'Kuvera', 'Paytm Money', 'Other']

const initialState = (defaults = {}) => ({
  schemeName: defaults.schemeName ?? '',
  platform: defaults.platform ?? platforms[0],
  broker: defaults.broker ?? defaults.platform ?? platforms[0],
  amountInvested: defaults.amountInvested ?? '',
  currentValue: defaults.currentValue ?? '',
  lastUpdated:
    defaults.lastUpdated && defaults.lastUpdated !== ''
      ? new Date(defaults.lastUpdated).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  notes: defaults.notes ?? '',
})

const InvestmentForm = ({ onSubmit, defaultValues, onCancel }) => {
  const [form, setForm] = useState(() => initialState(defaultValues))
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { dateFormat } = useSettings()
  const currencySymbol = useCurrencySymbol()
  const isEditing = useMemo(() => Boolean(defaultValues?._id), [defaultValues])

  useEffect(() => {
    setForm(initialState(defaultValues))
  }, [defaultValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const amountInvested = Number(form.amountInvested)
    const currentValue = Number(form.currentValue)
    const lastUpdated = form.lastUpdated ? new Date(form.lastUpdated) : new Date()

    if (!form.schemeName.trim()) {
      setFormError('Enter the scheme name.')
      return
    }
    if (!Number.isFinite(amountInvested) || amountInvested < 0) {
      setFormError('Amount invested must be zero or more.')
      return
    }
    if (!Number.isFinite(currentValue) || currentValue < 0) {
      setFormError('Current value must be zero or more.')
      return
    }
    if (Number.isNaN(lastUpdated.getTime())) {
      setFormError('Choose a valid last updated date.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        schemeName: form.schemeName.trim(),
        platform: form.platform,
        broker: form.broker || form.platform,
        amountInvested,
        currentValue,
        lastUpdated: lastUpdated.toISOString(),
        notes: form.notes.trim(),
      })
      if (isEditing) {
        onCancel?.()
      } else {
        setForm(initialState())
      }
    } catch (error) {
      setFormError(error?.response?.data?.message ?? 'Unable to save this investment right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="investment-form">
      <div className="form-grid form-grid--two">
        <div className="investment-form__field form-grid__full">
          <label>Scheme name</label>
          <input
            type="text"
            name="schemeName"
            value={form.schemeName}
            onChange={handleChange}
            placeholder="e.g. Axis Bluechip Fund"
            required
          />
        </div>
        <div className="investment-form__field">
          <label>Broker</label>
          <input
            type="text"
            name="broker"
            value={form.broker}
            onChange={handleChange}
            placeholder="Angel One / Groww"
          />
        </div>
        <div className="investment-form__field">
          <label>Platform</label>
          <select name="platform" value={form.platform} onChange={handleChange}>
            {platforms.map((platform) => (
              <option value={platform} key={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>
        <div className="investment-form__field">
          <label>{`Amount invested (${currencySymbol})`}</label>
          <input
            type="number"
            name="amountInvested"
            value={form.amountInvested}
            onChange={handleChange}
            min="0"
            step="0.01"
            inputMode="decimal"
            required
          />
        </div>
        <div className="investment-form__field">
          <label>{`Current value (${currencySymbol})`}</label>
          <input
            type="number"
            name="currentValue"
            value={form.currentValue}
            onChange={handleChange}
            min="0"
            step="0.01"
            inputMode="decimal"
            required
          />
        </div>
        <div className="investment-form__field form-grid__full">
          <label>{`Last updated on (${dateFormat})`}</label>
          <input
            type="date"
            name="lastUpdated"
            value={form.lastUpdated}
            onChange={handleChange}
            required
            placeholder={dateFormat}
            title={`Use ${dateFormat} format`}
          />
        </div>
        <div className="investment-form__field form-grid__full">
          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="SIP amount, goal, etc."
          />
        </div>
      </div>
      {formError && <p className="investment-form__error">{formError}</p>}
      <div className="investment-form__actions">
        {isEditing && (
          <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary flex-1" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing ? 'Update Investment' : 'Save Investment'}
        </button>
      </div>
    </form>
  )
}

export default InvestmentForm
