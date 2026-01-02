import { useEffect, useState } from 'react'

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
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
      <div>
        <label className="text-sm text-slate-500">Stock name</label>
        <input
          type="text"
          name="stockName"
          value={form.stockName}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          placeholder="e.g. Reliance Industries"
          required
        />
      </div>
      <div>
        <label className="text-sm text-slate-500">Ticker / symbol</label>
        <input
          type="text"
          name="symbol"
          value={form.symbol}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          placeholder="RELIANCE"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-500">Broker</label>
          <input
            type="text"
            name="broker"
            value={form.broker}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            placeholder="Angel One"
          />
        </div>
        <div>
          <label className="text-sm text-slate-500">Platform</label>
          <select
            name="platform"
            value={form.platform}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          >
            {DEFAULT_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-500">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            min="0"
            step="1"
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-500">Avg buy price (₹)</label>
          <input
            type="number"
            name="avgBuyPrice"
            value={form.avgBuyPrice}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-500">Current price (₹)</label>
        <input
          type="number"
          name="currentPrice"
          value={form.currentPrice}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="text-sm text-slate-500">Last updated on</label>
        <input
          type="date"
          name="lastUpdated"
          value={form.lastUpdated}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          required
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
          placeholder="Brokerage, goal, etc."
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
          {submitting ? 'Saving…' : isEditing ? 'Update Stock' : 'Save Stock'}
        </button>
      </div>
    </form>
  )
}

export default StockForm
