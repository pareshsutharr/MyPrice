import { useState } from 'react'
import { DATE_FORMATS, useSettings } from '@context/SettingsContext.jsx'

const DATE_FORMAT_OPTIONS = DATE_FORMATS.map((format) => ({
  value: format,
  label:
    format === 'DD/MM/YYYY'
      ? 'DD/MM/YYYY (31/01/2026)'
      : format === 'MM/DD/YYYY'
        ? 'MM/DD/YYYY (01/31/2026)'
        : 'YYYY-MM-DD (2026-01-31)',
}))

const Settings = () => {
  const {
    currency,
    categories,
    dateFormat,
    theme,
    setCurrency,
    addCategory,
    removeCategory,
    setDateFormat,
    setTheme,
    mode,
    setMode,
  } = useSettings()
  const [newCategory, setNewCategory] = useState({ label: '', color: '#4f9cff', icon: '✨' })
  const isDarkMode = theme === 'dark'
  const isAdvancedMode = mode === 'advanced'

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value)
  }

  const handleAddCategory = () => {
    if (!newCategory.label.trim()) return
    const label = newCategory.label.trim()
    addCategory({
      ...newCategory,
      label,
      id: label.toLowerCase().replace(/\s+/g, '-') || `cat-${categories.length}`,
    })
    setNewCategory({ label: '', color: '#4f9cff', icon: '✨' })
  }

  const handleRemove = (id) => {
    removeCategory(id)
  }

  const handleDateFormatChange = (event) => {
    setDateFormat(event.target.value)
  }

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? 'light' : 'dark')
  }

  const handleModeSelect = (targetMode) => {
    setMode(targetMode)
  }

  return (
    <div className="page-stack">
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-display">Appearance</h2>
            <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={handleThemeToggle}>
            {isDarkMode ? 'Use light mode' : 'Use dark mode'}
          </button>
        </div>
      </section>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-display">Experience mode</h2>
            <p className="text-sm text-slate-500">
              Toggle between the lightweight Basic view or Advanced analytics workspace.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-full border text-sm ${!isAdvancedMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-surfaceMuted text-slate-500 border-borderLight'}`}
              onClick={() => handleModeSelect('basic')}
            >
              Basic
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full border text-sm ${isAdvancedMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-surfaceMuted text-slate-500 border-borderLight'}`}
              onClick={() => handleModeSelect('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-600">
          <div className={`p-4 rounded-2xl border ${!isAdvancedMode ? 'border-slate-900 bg-white/70' : 'border-borderLight bg-surfaceMuted/70'}`}>
            <p className="font-semibold text-slate-900">Basic mode</p>
            <p>Focuses on balances, quick actions, and reminders for a minimal everyday view.</p>
          </div>
          <div className={`p-4 rounded-2xl border ${isAdvancedMode ? 'border-slate-900 bg-white/70 dark:bg-surfaceMuted/70' : 'border-borderLight bg-surfaceMuted/70'}`}>
            <p className="font-semibold text-slate-900">Advanced mode</p>
            <p>Enables detailed charts, DIY customization, and every analytics panel in the app.</p>
          </div>
        </div>
      </section>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-display">Currency</h2>
        <input
          type="text"
          maxLength={3}
          value={currency}
          onChange={handleCurrencyChange}
          className="w-32 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2 text-center text-xl"
        />
      </section>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-display">Date format</h2>
        <p className="text-sm text-slate-500">
          Choose how dates should appear everywhere in the dashboard.
        </p>
        <select
          className="w-full md:w-72 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          value={dateFormat}
          onChange={handleDateFormatChange}
        >
          {DATE_FORMAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </section>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-display">Categories</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-surfaceMuted px-4 py-3 rounded-xl border border-borderLight"
            >
              <span>
                {category.icon} {category.label}
              </span>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() => handleRemove(category.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Label"
            value={newCategory.label}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, label: event.target.value }))}
            className="rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          />
          <input
            type="text"
            placeholder="Icon"
            value={newCategory.icon}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, icon: event.target.value }))}
            className="rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          />
          <input
            type="color"
            value={newCategory.color}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, color: event.target.value }))}
            className="rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          />
        </div>
        <button type="button" className="btn-primary" onClick={handleAddCategory}>
          Add Category
        </button>
      </section>
    </div>
  )
}

export default Settings
