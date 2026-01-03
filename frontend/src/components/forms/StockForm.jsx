import { useEffect, useState } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'
import { useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import './StockForm.css'

const DEFAULT_PLATFORMS = ['Angel One', 'Groww', 'Zerodha', 'Upstox', 'ICICI Direct', 'Other']

const initialState = (defaults = {}) => {
  const quantity = defaults.units ?? defaults.metadata?.quantity ?? ''
  const avgPriceFromData =
    defaults.metadata?.avgBuyPrice ??
    (defaults.amountInvested && quantity ? (defaults.amountInvested / quantity).toFixed(2) : '')
  const currentPriceFromData =
    defaults.metadata?.currentPrice ??
    (defaults.currentValue && quantity ? (defaults.currentValue / quantity).toFixed(2) : '')

  return {
    stockName: defaults.schemeName ?? '',
    symbol: defaults.metadata?.symbol ?? '',
    broker: defaults.broker ?? defaults.platform ?? DEFAULT_PLATFORMS[0],
    platform: defaults.platform ?? defaults.broker ?? DEFAULT_PLATFORMS[0],
    quantity: quantity ?? '',
    avgBuyPrice: avgPriceFromData ?? '',
    currentPrice: currentPriceFromData ?? '',
    lastUpdated:
      defaults.lastUpdated && defaults.lastUpdated !== ''
        ? new Date(defaults.lastUpdated).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    notes: defaults.notes ?? '',
  }
}

const StockForm = ({ defaultValues, onSubmit, onCancel }) => {
  const [form, setForm] = useState(() => initialState(defaultValues))
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { dateFormat } = useSettings()
  const currencySymbol = useCurrencySymbol()

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
    const quantity = Number(form.quantity)
    const avgBuyPrice = Number(form.avgBuyPrice)
    const currentPrice = Number(form.currentPrice)

    if (!form.stockName.trim()) {
      setFormError('Enter the stock name.')
      return
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFormError('Quantity must be greater than zero.')
      return
    }
    if (!Number.isFinite(avgBuyPrice) || avgBuyPrice <= 0) {
      setFormError('Average buy price must be greater than zero.')
      return
    }
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      setFormError('Current price must be greater than zero.')
      return
    }
    const date = form.lastUpdated ? new Date(form.lastUpdated) : new Date()
    if (Number.isNaN(date.getTime())) {
      setFormError('Choose a valid date.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        schemeName: form.stockName.trim(),
        platform: form.platform,
        broker: form.broker || form.platform,
        units: quantity,
        amountInvested: quantity * avgBuyPrice,
        currentValue: quantity * currentPrice,
        lastUpdated: date.toISOString(),
        notes: form.notes?.trim(),
        metadata: {
          assetType: 'stock',
          symbol: form.symbol?.trim(),
          quantity,
          avgBuyPrice,
          currentPrice,
        },
      })
      setForm(initialState())
    } catch (error) {
      setFormError(error?.response?.data?.message ?? 'Unable to save this stock entry.')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = Boolean(defaultValues?._id)

  return (
    <form onSubmit={handleSubmit} className="stock-form">
      <div className="stock-form__field">
        <label>Stock name</label>
        <input
          type="text"
          name="stockName"
          value={form.stockName}
          onChange={handleChange}
          placeholder="e.g. Reliance Industries"
          required
        />
      </div>
      <div className="stock-form__field">
        <label>Ticker / symbol</label>
        <input type="text" name="symbol" value={form.symbol} onChange={handleChange} placeholder="RELIANCE" />
      </div>
      <div className="stock-form__grid">
        <div className="stock-form__field">
          <label>Broker</label>
          <input type="text" name="broker" value={form.broker} onChange={handleChange} placeholder="Angel One" />
        </div>
        <div className="stock-form__field">
          <label>Platform</label>
          <select name="platform" value={form.platform} onChange={handleChange}>
            {DEFAULT_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="stock-form__grid">
        <div className="stock-form__field">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            min="0"
            step="1"
            required
          />
        </div>
        <div className="stock-form__field">
          <label>{`Avg buy price (${currencySymbol})`}</label>
          <input
            type="number"
            name="avgBuyPrice"
            value={form.avgBuyPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
      <div className="stock-form__field">
        <label>{`Current price (${currencySymbol})`}</label>
        <input
          type="number"
          name="currentPrice"
          value={form.currentPrice}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />
      </div>
      <div className="stock-form__field">
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
      <div className="stock-form__field">
        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Brokerage, goal, etc." />
      </div>
      {formError && <p className="stock-form__error">{formError}</p>}
      <div className="stock-form__actions">
        {isEditing && (
          <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary flex-1" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing ? 'Update Stock' : 'Save Stock'}
        </button>
      </div>
    </form>
  )
}

export default StockForm
