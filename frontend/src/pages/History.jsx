import { useFinance } from '@context/FinanceContext.jsx'
import { useDateFormatter } from '@hooks/useDateFormatter.js'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import clsx from 'clsx'

const typeMeta = {
  income: { label: 'Income', color: 'text-emerald-600 bg-emerald-50' },
  expense: { label: 'Expense', color: 'text-rose-600 bg-rose-50' },
  emi: { label: 'EMI Payment', color: 'text-indigo-600 bg-indigo-50' },
  'emi-reversal': { label: 'EMI Reverted', color: 'text-amber-600 bg-amber-50' },
}

const EMPTY_VALUE = '--'

const History = () => {
  const { history, loading } = useFinance()
  const formatDate = useDateFormatter()
  const formatCurrency = useCurrencyFormatter()

  const formatDateTime = (value) => {
    if (!value) return EMPTY_VALUE
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return EMPTY_VALUE
    const datePart = formatDate(parsed, { fallback: EMPTY_VALUE })
    const timePart = parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return `${datePart} · ${timePart}`
  }

  if (loading && history.length === 0) {
    return <p className="text-center text-slate-500">Loading history...</p>
  }

  if (history.length === 0) {
    return <p className="text-center text-slate-500">No transactions recorded yet.</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display">Transaction History</h2>
      <div className="glass-card divide-y divide-borderLight">
        {history.map((entry) => {
          const meta = typeMeta[entry.type] ?? { label: entry.type, color: 'text-slate-600 bg-slate-100' }
          const isCredit = entry.type === 'income'
          return (
            <div key={`${entry.type}-${entry.id}`} className="flex items-center justify-between p-4 gap-4">
              <div>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full uppercase tracking-wide', meta.color)}>
                  {meta.label}
                </span>
                <p className="text-sm text-slate-500 mt-1">{entry.note || entry.category || EMPTY_VALUE}</p>
                <p className="text-xs text-slate-400">{formatDateTime(entry.date)}</p>
              </div>
              <div className={clsx('text-lg font-semibold', isCredit ? 'text-emerald-600' : 'text-slate-900')}>
                {isCredit ? '+' : '-'} {formatCurrency(entry.amount)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default History
