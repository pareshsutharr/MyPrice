import { useEffect, useMemo, useState } from 'react'
import { Building2, Landmark, PencilLine, ShieldCheck, Trash2 } from 'lucide-react'
import './Banks.css'

const BANKS_STORAGE_KEY = 'myprice-banks'
const BANKS_BANNER_KEY = 'myprice-banks-banner-dismissed'

const INDIAN_BANKS = [
  'SBI',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC First Bank',
  'Federal Bank',
  'South Indian Bank',
  'RBL Bank',
  'Bandhan Bank',
  'UCO Bank',
  'Bank of India',
  'Indian Bank',
  'Central Bank of India',
]

const DEFAULT_FORM = {
  bankName: '',
  nickname: '',
  accountType: 'Savings',
  last4: '',
}

const readBanks = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BANKS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Unable to read banks from localStorage', error)
    return []
  }
}

const maskAccountNumber = (last4) => `•••• ${last4}`

const slugifyBankName = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const buildLogoPath = (bankName) => `/bank-logos/${slugifyBankName(bankName)}.svg`

const SearchableBankSelect = ({ value, onChange }) => {
  const [query, setQuery] = useState(value)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const filteredBanks = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return INDIAN_BANKS
    return INDIAN_BANKS.filter((bank) => bank.toLowerCase().includes(normalized))
  }, [query])

  return (
    <div className="banks-search">
      <input
        id="bankName"
        name="bankName"
        type="text"
        autoComplete="off"
        placeholder="Search bank name"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          onChange(event.target.value)
        }}
      />
      <div className="banks-search__list" role="listbox" aria-label="Supported Indian banks">
        {filteredBanks.map((bank) => (
          <button
            key={bank}
            type="button"
            className={`banks-search__option ${value === bank ? 'banks-search__option--active' : ''}`}
            onClick={() => {
              setQuery(bank)
              onChange(bank)
            }}
          >
            {bank}
          </button>
        ))}
      </div>
    </div>
  )
}

const BankLogo = ({ bankName }) => {
  const [src, setSrc] = useState(() => buildLogoPath(bankName))

  useEffect(() => {
    setSrc(buildLogoPath(bankName))
  }, [bankName])

  return (
    <img
      src={src}
      alt={`${bankName} logo`}
      className="bank-card__logo"
      onError={() => setSrc('/bank-logos/generic-bank.svg')}
    />
  )
}

const Banks = () => {
  const [banks, setBanks] = useState(readBanks)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [editingId, setEditingId] = useState(null)
  const [editingNickname, setEditingNickname] = useState('')
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem(BANKS_BANNER_KEY) !== 'true'
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(BANKS_STORAGE_KEY, JSON.stringify(banks))
    } catch (error) {
      console.warn('Unable to store banks', error)
    }
  }, [banks])

  const dismissBanner = () => {
    setShowBanner(false)
    window.localStorage.setItem(BANKS_BANNER_KEY, 'true')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedBankName = form.bankName.trim()
    const trimmedNickname = form.nickname.trim()
    const last4 = form.last4.replace(/\D/g, '').slice(-4)

    if (!trimmedBankName || !trimmedNickname || last4.length !== 4) return

    setBanks((prev) => [
      {
        id: crypto.randomUUID(),
        bankName: trimmedBankName,
        nickname: trimmedNickname,
        accountType: form.accountType,
        last4,
      },
      ...prev,
    ])
    setForm(DEFAULT_FORM)
  }

  const startEditing = (bank) => {
    setEditingId(bank.id)
    setEditingNickname(bank.nickname)
  }

  const saveNickname = (bankId) => {
    const trimmed = editingNickname.trim()
    if (!trimmed) return
    setBanks((prev) =>
      prev.map((bank) => (bank.id === bankId ? { ...bank, nickname: trimmed } : bank)),
    )
    setEditingId(null)
    setEditingNickname('')
  }

  const removeBank = (bankId, nickname) => {
    const confirmed = window.confirm(`Remove ${nickname} from linked accounts?`)
    if (!confirmed) return
    setBanks((prev) => prev.filter((bank) => bank.id !== bankId))
  }

  return (
    <div className="page-stack banks-page">
      {showBanner && (
        <div className="banks-banner" role="status">
          <div className="banks-banner__copy">
            <ShieldCheck className="h-5 w-5" />
            <p>Account data is stored locally on this device. Live bank sync coming soon.</p>
          </div>
          <button type="button" className="banks-banner__dismiss" onClick={dismissBanner}>
            Dismiss
          </button>
        </div>
      )}

      <div className="page-grid page-grid--sidebar">
        <section className="page-section banks-form-card">
          <div className="banks-section__header">
            <div className="banks-section__eyebrow">Add Account</div>
            <h1 className="text-2xl font-display">Save your linked accounts</h1>
            <p className="text-sm text-slate-500">
              Keep a lightweight record of your bank accounts on this device for faster money tracking later.
            </p>
          </div>

          <form className="banks-form" onSubmit={handleSubmit}>
            <div className="banks-field">
              <label htmlFor="bankName">
                Bank Name <span className="banks-required">*</span>
              </label>
              <SearchableBankSelect
                value={form.bankName}
                onChange={(value) => setForm((prev) => ({ ...prev, bankName: value }))}
              />
            </div>

            <div className="banks-field">
              <label htmlFor="nickname">
                Account Nickname <span className="banks-required">*</span>
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="Personal salary account"
                value={form.nickname}
                onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
              />
            </div>

            <div className="banks-field">
              <label htmlFor="accountType">
                Account Type <span className="banks-required">*</span>
              </label>
              <select
                id="accountType"
                name="accountType"
                value={form.accountType}
                onChange={(event) => setForm((prev) => ({ ...prev, accountType: event.target.value }))}
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            <div className="banks-field">
              <label htmlFor="last4">
                Last 4 digits <span className="banks-required">*</span>
              </label>
              <input
                id="last4"
                name="last4"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={form.last4}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, last4: event.target.value.replace(/\D/g, '').slice(0, 4) }))
                }
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={!form.bankName.trim() || !form.nickname.trim() || form.last4.length !== 4}
            >
              Save account
            </button>
          </form>
        </section>

        <section className="page-section banks-list-card">
          <div className="banks-section__header banks-section__header--row">
            <div>
              <div className="banks-section__eyebrow">Linked Accounts</div>
              <h2 className="text-2xl font-display">Your saved banks</h2>
            </div>
            <div className="banks-count">{banks.length} linked</div>
          </div>

          {banks.length === 0 ? (
            <div className="banks-empty">
              <Landmark className="h-10 w-10" />
              <h3>No linked accounts yet</h3>
              <p>Add your first bank on the left to keep account references on this device.</p>
            </div>
          ) : (
            <div className="banks-list">
              {banks.map((bank) => (
                <article key={bank.id} className="bank-card">
                  <div className="bank-card__main">
                    <div className="bank-card__identity">
                      <BankLogo bankName={bank.bankName} />
                      <div>
                        <p className="bank-card__bank-name">{bank.bankName}</p>
                        {editingId === bank.id ? (
                          <div className="bank-card__edit-row">
                            <input
                              type="text"
                              value={editingNickname}
                              autoFocus
                              onChange={(event) => setEditingNickname(event.target.value)}
                              onBlur={() => saveNickname(bank.id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  saveNickname(bank.id)
                                }
                                if (event.key === 'Escape') {
                                  setEditingId(null)
                                  setEditingNickname('')
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <p className="bank-card__nickname">{bank.nickname}</p>
                        )}
                      </div>
                    </div>

                    <div className="bank-card__meta">
                      <span className="bank-card__badge">{bank.accountType}</span>
                      <span className="bank-card__number">{maskAccountNumber(bank.last4)}</span>
                    </div>
                  </div>

                  <div className="bank-card__actions">
                    <button type="button" className="btn-secondary" onClick={() => startEditing(bank)}>
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-secondary bank-card__remove"
                      onClick={() => removeBank(bank.id, bank.nickname)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Banks
