import { useMemo } from 'react'
import {
  PiggyBank,
  Wallet,
  LineChart,
  Files,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import { useFinance } from '@context/FinanceContext.jsx'
import StatCard from '@components/StatCard.jsx'

const formatCurrency = (value = 0) => `₹ ${Number(value).toLocaleString()}`

const NetWorth = () => {
  const { stats, investments = [], loans, history } = useFinance()

  const { totals = {} } = stats ?? {}
  const cashBalance = totals.balance ?? 0
  const totalIncome = totals.totalCredit ?? 0
  const totalExpenses = totals.totalDebit ?? 0

  const { mutualFundValue, stockValue, investmentsInvested } = useMemo(() => {
    const isStock = (investment) => investment.metadata?.assetType === 'stock'
    return investments.reduce(
      (acc, investment) => {
        const currentValue = investment.currentValue ?? 0
        const investedValue = investment.amountInvested ?? 0
        acc.investmentsInvested += investedValue
        if (isStock(investment)) {
          acc.stockValue += currentValue
        } else {
          acc.mutualFundValue += currentValue
        }
        return acc
      },
      { mutualFundValue: 0, stockValue: 0, investmentsInvested: 0 },
    )
  }, [investments])

  const outstandingLoans = useMemo(() => {
    const activeLoans = loans?.active ?? []
    return activeLoans.reduce(
      (sum, loan) => sum + Math.max(loan.progress?.remaining ?? 0, 0),
      0,
    )
  }, [loans])

  const netWorth = cashBalance + mutualFundValue + stockValue - outstandingLoans

  const cards = [
    {
      label: 'Net worth',
      value: formatCurrency(netWorth),
      description: 'Cash + investments − liabilities',
      icon: PiggyBank,
    },
    {
      label: 'Cash & bank',
      value: formatCurrency(cashBalance),
      description: 'Based on your dashboard balance',
      icon: Wallet,
      accent: 'from-sky-500 to-indigo-500',
    },
    {
      label: 'Investments market value',
      value: formatCurrency(mutualFundValue + stockValue),
      description: `Mutual funds ₹${Number(mutualFundValue).toLocaleString()} · stocks ₹${Number(
        stockValue,
      ).toLocaleString()}`,
      icon: LineChart,
      accent: 'from-emerald-500 to-lime-400',
    },
    {
      label: 'Outstanding loans',
      value: formatCurrency(outstandingLoans),
      description: 'Active EMIs yet to be cleared',
      icon: Files,
      accent: 'from-rose-500 to-orange-500',
    },
  ]

  const allocation = [
    { label: 'Mutual funds', value: mutualFundValue, positive: true },
    { label: 'Direct stocks', value: stockValue, positive: true },
    { label: 'Cash / savings', value: cashBalance, positive: true },
    { label: 'Loan balances', value: outstandingLoans, positive: false },
  ]

  const recentActivity = history?.slice(0, 5) ?? []

  return (
    <div className="space-y-6 pb-16">
      <div className="grid md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <h3 className="text-xl font-display text-slate-900">Asset allocation snapshot</h3>
          <div className="space-y-3 text-sm">
            {allocation.map((entry) => (
              <div
                key={entry.label}
                className="flex items-center justify-between border border-borderLight rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {entry.positive ? (
                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                  )}
                  <p className="font-medium text-slate-700">{entry.label}</p>
                </div>
                <p className={`font-semibold ${entry.positive ? 'text-slate-900' : 'text-rose-500'}`}>
                  {entry.positive ? '+' : '-'} {formatCurrency(Math.abs(entry.value))}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xl font-display text-slate-900">Income vs spend</h3>
          <div className="text-sm text-slate-500">
            <p>Total income recorded</p>
            <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="text-sm text-slate-500">
            <p>Total spend + EMI</p>
            <p className="text-2xl font-semibold text-rose-500">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="text-sm text-slate-500">
            <p>Invested capital</p>
            <p className="text-xl font-semibold text-slate-900">
              {formatCurrency(investmentsInvested)}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display text-slate-900">Recent activity</h3>
          <p className="text-sm text-slate-500">Latest updates across all modules</p>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions captured yet.</p>
        ) : (
          <div className="divide-y divide-borderLight">
            {recentActivity.map((entry) => (
              <div key={`${entry.type}-${entry.id}`} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">
                    {entry.note || entry.category || entry.type}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.date).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <span
                  className={`font-semibold text-sm ${
                    entry.type === 'income'
                      ? 'text-emerald-600'
                      : entry.type === 'emi'
                        ? 'text-indigo-600'
                        : 'text-rose-500'
                  }`}
                >
                  {entry.type === 'income' ? '+' : '-'} {formatCurrency(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NetWorth
