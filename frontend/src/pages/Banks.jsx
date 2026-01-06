import { useEffect, useMemo, useState, useCallback } from 'react'
import { Building2, CreditCard, PiggyBank, Star, Trash2, Wallet } from 'lucide-react'
import { useFinance } from '@context/FinanceContext.jsx'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './Banks.css'

const BANKS_STORAGE_KEY = 'moneyxp-banks'

const defaultBank = {
  id: '',
  name: '',
  accountNumber: '',
  type: 'Savings',
  balance: '',
}

const readBanks = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BANKS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Unable to read banks', error)
    return []
  }
}

const Banks = () => {
  const { income = [], expenses = [] } = useFinance()
  const [banks, setBanks] = useState(readBanks)
  const [form, setForm] = useState(defaultBank)
  const [selectedBankId, setSelectedBankId] = useState(() => readBanks()[0]?.id ?? null)
  const formatCurrency = useCurrencyFormatter()

  useEffect(() => {
    try {
      window.localStorage.setItem(BANKS_STORAGE_KEY, JSON.stringify(banks))
    } catch (error) {
      console.warn('Unable to store banks', error)
    }
  }, [banks])

  useEffect(() => {
    if (!selectedBankId && banks.length) {
      setSelectedBankId(banks[0].id)
    }
  }, [banks, selectedBankId])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddBank = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.accountNumber.trim()) return
    const newBank = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: form.name.trim(),
      accountNumber: form.accountNumber.trim(),
      type: form.type,
      balance: Number(form.balance) || 0,
      isPrimary: banks.length === 0,
    }
    setBanks((prev) => [...prev, newBank])
    setForm(defaultBank)
    if (banks.length === 0) {
      setSelectedBankId(newBank.id)
    }
  }

  const handleDeleteBank = useCallback((id) => {
    setBanks((prev) => prev.filter((bank) => bank.id !== id))
    setSelectedBankId((prev) => (prev === id ? null : prev))
  }, [])

  const handleMakePrimary = useCallback((id) => {
    setBanks((prev) =>
      prev.map((bank) => ({
        ...bank,
        isPrimary: bank.id === id,
      })),
    )
  }, [])

  const selectedBank = banks.find((bank) => bank.id === selectedBankId) ?? null

  const accountSummary = useMemo(() => {
    const totalBalance = banks.reduce((sum, bank) => sum + (Number(bank.balance) || 0), 0)
    const primaryBank = banks.find((bank) => bank.isPrimary)
    return {
      bankCount: banks.length,
      totalBalance,
      primaryBankName: primaryBank?.name ?? 'Not set',
    }
  }, [banks])

  const statementEntries = useMemo(() => {
    if (!selectedBank) return []
    const normalized = selectedBank.name.toLowerCase()
    const expensesEntries = expenses
      .filter((entry) => entry?.bankName?.toLowerCase?.() === normalized)
      .map((entry) => ({
        id: `expense-${entry.id}`,
        type: 'Expense',
        date: entry.date,
        note: entry.note ?? entry.category ?? 'Expense',
        amount: -Number(entry.amount ?? 0),
      }))
    const incomeEntries = income
      .filter((entry) => entry?.bankName?.toLowerCase?.() === normalized)
      .map((entry) => ({
        id: `income-${entry.id}`,
        type: 'Income',
        date: entry.date,
        note: entry.note ?? entry.category ?? 'Income',
        amount: Number(entry.amount ?? 0),
      }))
    return [...incomeEntries, ...expensesEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [income, expenses, selectedBank])

  return (
    <div className="space-y-6 pb-16">
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-slate-900 dark:text-white" />
          <div>
            <p className="text-sm text-slate-500">Linked accounts</p>
            <h1 className="text-2xl font-display text-slate-900">Manage your banks</h1>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Capture your savings, current, and credit accounts to auto-fill payment methods in income/expense forms.
          Mark a primary bank to use it as the default source every time you log a transaction.
        </p>
        <div className="bank-summary">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Linked banks</p>
            <p className="text-2xl font-display text-slate-900">{accountSummary.bankCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Combined balance</p>
            <p className="text-2xl font-display text-slate-900">{formatCurrency(accountSummary.totalBalance)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Default payment method</p>
            <p className="text-sm font-medium text-slate-900">{accountSummary.primaryBankName}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-slate-900" />
            <h2 className="text-xl font-display text-slate-900">Add bank</h2>
          </div>
          <form className="bank-form" onSubmit={handleAddBank}>
            <input
              type="text"
              name="name"
              placeholder="Bank name"
              value={form.name}
              onChange={handleFormChange}
              required
            />
            <input
              type="text"
              name="accountNumber"
              placeholder="Account number"
              value={form.accountNumber}
              onChange={handleFormChange}
              required
            />
            <select name="type" value={form.type} onChange={handleFormChange}>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Credit Card">Credit Card</option>
            </select>
            <input
              type="number"
              name="balance"
              placeholder="Current balance"
              value={form.balance}
              onChange={handleFormChange}
              min="0"
              step="0.01"
            />
            <button type="submit" className="btn-primary">
              Link bank
            </button>
          </form>
          <p className="text-xs text-slate-500">
            Once added, the bank will surface inside income & expense forms as a selectable payment method.
          </p>
        </div>
        <div className="glass-card p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-slate-900" />
              <h2 className="text-xl font-display text-slate-900">Your banks</h2>
            </div>
          </div>
          {banks.length === 0 ? (
            <p className="text-sm text-slate-500">Link your first bank to start tracking balances here.</p>
          ) : (
            <div className="bank-cards">
              {banks.map((bank) => (
                <div key={bank.id} className="bank-card">
                  <div>
                    <p className="text-lg font-display text-slate-900">{bank.name}</p>
                    <p className="text-sm text-slate-500">{bank.accountNumber}</p>
                  </div>
                  <div className="bank-card__meta">
                    <span>{bank.type}</span>
                    <p className="font-medium text-slate-900">{formatCurrency(bank.balance)}</p>
                  </div>
                  <div className="bank-card__actions">
                    <button
                      type="button"
                      className={`bank-card__primary ${bank.isPrimary ? 'bank-card__primary--active' : ''}`}
                      onClick={() => handleMakePrimary(bank.id)}
                    >
                      <Star className="h-4 w-4" />
                      {bank.isPrimary ? 'Primary' : 'Set primary'}
                    </button>
                    <button type="button" className="bank-card__remove" onClick={() => handleDeleteBank(bank.id)}>
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                    <button
                      type="button"
                      className={`bank-card__statement ${selectedBankId === bank.id ? 'bank-card__statement--active' : ''}`}
                      onClick={() => setSelectedBankId(bank.id)}
                    >
                      Statements
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBank && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Linked statements</p>
              <h2 className="text-xl font-display text-slate-900">{selectedBank.name} activity</h2>
            </div>
            <div className="text-xs text-slate-500">
              Showing entries tagged with "{selectedBank.name}" inside income & expense logs.
            </div>
          </div>
          {statementEntries.length === 0 ? (
            <p className="text-sm text-slate-500">
              We could not find any transactions tagged with this bank yet. When you add expenses/income, choose this bank as
              the payment source to build statements automatically.
            </p>
          ) : (
            <div className="bank-statement">
              <div className="bank-statement__row bank-statement__row--head">
                <span>Date</span>
                <span>Type</span>
                <span>Note</span>
                <span className="text-right">Amount</span>
              </div>
              {statementEntries.map((entry) => (
                <div key={entry.id} className="bank-statement__row">
                  <span>{new Date(entry.date).toLocaleDateString('en-IN')}</span>
                  <span>{entry.type}</span>
                  <span>{entry.note}</span>
                  <span className={`text-right ${entry.amount < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {entry.amount < 0 ? '-' : '+'}
                    {formatCurrency(Math.abs(entry.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Banks
