import { useEffect, useState } from 'react'

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

  useEffect(() => {
    setForm(initialState(defaultValues))
  }, [defaultValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit({
      schemeName: form.schemeName.trim(),
      platform: form.platform,
      broker: form.broker || form.platform,
      amountInvested: Number(form.amountInvested),
      currentValue: Number(form.currentValue),
      lastUpdated: new Date(form.lastUpdated).toISOString(),
      notes: form.notes.trim(),
    })
    setForm(initialState())
  }

  const isEditing = Boolean(defaultValues?._id)

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
      <div>
        <label className="text-sm text-slate-500">Scheme name</label>
        <input
          type="text"
          name="schemeName"
          value={form.schemeName}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          placeholder="e.g. Axis Bluechip Fund"
          required
        />
      </div>
      <div>
        <label className="text-sm text-slate-500">Broker</label>
        <input
          type="text"
          name="broker"
          value={form.broker}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          placeholder="Angel One / Groww"
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
          {platforms.map((platform) => (
            <option value={platform} key={platform}>
              {platform}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-500">Amount invested</label>
          <input
            type="number"
            name="amountInvested"
            value={form.amountInvested}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            min="0"
            step="100"
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-500">Current value</label>
          <input
            type="number"
            name="currentValue"
            value={form.currentValue}
            onChange={handleChange}
            className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
            min="0"
            step="100"
            required
          />
        </div>
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
          placeholder="SIP amount, goal, etc."
        />
      </div>
      <div className="flex gap-3">
        {isEditing && (
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary flex-1">
          {isEditing ? 'Update Investment' : 'Save Investment'}
        </button>
      </div>
    </form>
  )
}

export default InvestmentForm
