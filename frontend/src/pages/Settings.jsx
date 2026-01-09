import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const DIGILOCKER_FEATURES = [
  {
    title: 'Instant onboarding',
    detail: 'Prefill KYC, PAN, and address proof directly from Digilocker verified docs.',
  },
  {
    title: 'Smart document vault',
    detail: 'Maintain a live repository of MF statements, insurance policies, and Form 26AS.',
  },
  {
    title: 'Auto classification',
    detail: 'Parse linked bank/passbook statements to auto-create income and expense entries.',
  },
  {
    title: 'Investment sync',
    detail: 'Ingest CAS files to keep Mutual Funds and Stocks dashboards always up to date.',
  },
  {
    title: 'Compliance radar',
    detail: 'Alert users before KYC lapses or document expiries using Digilocker metadata.',
  },
  {
    title: 'Secure sharing',
    detail: 'Grant advisors and lenders scoped access via Digilocker’s consented share links.',
  },
]

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
    integrations,
    updateDigilockerConfig,
  } = useSettings()
  const [newCategory, setNewCategory] = useState({ label: '', color: '#4f9cff', icon: '✨' })
  const [copiedEnv, setCopiedEnv] = useState(false)
  const isDarkMode = theme === 'dark'
  const isAdvancedMode = mode === 'advanced'
  const navigate = useNavigate()
  const digilocker = integrations?.digilocker ?? {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    environment: 'sandbox',
  }

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

  const handleDigilockerChange = (field) => (event) => {
    updateDigilockerConfig({ [field]: event.target.value })
  }

  const envPreview = [
    `VITE_DIGILOCKER_CLIENT_ID=${digilocker.clientId || '<your-client-id>'}`,
    `VITE_DIGILOCKER_CLIENT_SECRET=${digilocker.clientSecret || '<your-client-secret>'}`,
    `VITE_DIGILOCKER_REDIRECT_URI=${digilocker.redirectUri || 'https://yourapp.com/oauth/digilocker'}`,
    `VITE_DIGILOCKER_ENV=${digilocker.environment || 'sandbox'}`,
  ].join('\n')

  const handleCopyEnv = async () => {
    try {
      await navigator.clipboard.writeText(envPreview)
      setCopiedEnv(true)
      setTimeout(() => setCopiedEnv(false), 2000)
    } catch (error) {
      console.warn('Unable to copy env preview', error)
    }
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-display">Dashboard customization</h2>
            <p className="text-sm text-slate-500">
              Reorder tiles and control which cards appear on your dashboard.
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => navigate('/?customize=1')}>
            Customize tiles
          </button>
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

      <section className="glass-card p-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-display">Digilocker integration</h2>
          <p className="text-sm text-slate-500">
            Connect verified financial artefacts to unlock automation across onboarding, spending,
            and wealth tracking. Values are stored locally until backend sync is enabled.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {DIGILOCKER_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="border border-borderLight rounded-2xl p-4 bg-surfaceMuted/70 text-sm text-slate-600"
            >
              <p className="font-semibold text-slate-900">{feature.title}</p>
              <p>{feature.detail}</p>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Credentials
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Client ID"
                value={digilocker.clientId}
                onChange={handleDigilockerChange('clientId')}
                className="rounded-xl bg-white/80 border border-borderLight px-3 py-2"
              />
              <input
                type="password"
                placeholder="Client secret"
                value={digilocker.clientSecret}
                onChange={handleDigilockerChange('clientSecret')}
                className="rounded-xl bg-white/80 border border-borderLight px-3 py-2"
              />
              <input
                type="text"
                placeholder="Redirect URI"
                value={digilocker.redirectUri}
                onChange={handleDigilockerChange('redirectUri')}
                className="rounded-xl bg-white/80 border border-borderLight px-3 py-2"
              />
              <select
                value={digilocker.environment}
                onChange={handleDigilockerChange('environment')}
                className="rounded-xl bg-white/80 border border-borderLight px-3 py-2"
              >
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </div>
            <p className="text-xs text-slate-500">
              These values remain in your browser and will sync to the backend once Digilocker OAuth
              is wired in.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              .env helper
            </p>
            <textarea
              readOnly
              value={envPreview}
              className="w-full h-40 rounded-2xl bg-surfaceMuted border border-borderLight font-mono text-xs p-3"
            />
            <div className="flex items-center gap-3">
              <button type="button" className="btn-secondary" onClick={handleCopyEnv}>
                {copiedEnv ? 'Copied!' : 'Copy env snippet'}
              </button>
              <span className="text-xs text-slate-500">
                Add these to your <code>.env</code> / Render environment panel.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Settings
