import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, PiggyBank, CreditCard, LineChart } from 'lucide-react'
import StatCard from '@components/StatCard.jsx'
import QuickActions from '@components/QuickActions.jsx'
import TrendAreaChart from '@components/charts/TrendAreaChart.jsx'
import ReminderCard from '@components/ReminderCard.jsx'
import IncomeForm from '@components/forms/IncomeForm.jsx'
import { useFinance } from '@context/FinanceContext.jsx'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'

const Dashboard = () => {
  const { stats, actions, loading } = useFinance()
  const [showIncome, setShowIncome] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const formatCurrency = useCurrencyFormatter()

  const reminders = stats?.reminders

  useEffect(() => {
    setShowReminder(Boolean(reminders?.length))
  }, [reminders])

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-center text-slate-500">
          {loading ? 'Loading dashboard...' : 'Unable to load finance stats. Pull to refresh.'}
        </p>
      </div>
    )
  }

  const { totals, thisMonth, spendingTrend, investments: investmentSummary } = stats
  const cardData = [
    {
      label: 'Total Balance',
      value: formatCurrency(totals?.balance ?? 0),
      description: 'Credit - Debit - EMI',
      icon: Wallet,
    },
    {
      label: 'This Month Credit',
      value: formatCurrency(thisMonth?.credit ?? 0),
      icon: TrendingUp,
      accent: 'from-emerald-500 to-neonBlue',
    },
    {
      label: 'This Month Debit',
      value: formatCurrency(thisMonth?.debit ?? 0),
      icon: CreditCard,
      accent: 'from-rose-500 to-neonPurple',
    },
    {
      label: 'Savings Potential',
      value: formatCurrency(thisMonth?.savings ?? 0),
      icon: PiggyBank,
      accent: 'from-amber-400 to-pink-500',
    },
    {
      label: 'Investment Gains',
      value: formatCurrency(investmentSummary?.totalGain ?? 0),
      description: `Invested ${formatCurrency(investmentSummary?.totalInvested ?? 0)}`,
      icon: LineChart,
      accent:
        (investmentSummary?.totalGain ?? 0) >= 0 ? 'from-emerald-500 to-neonBlue' : 'from-rose-500 to-orange-500',
    },
  ]

  return (
    <div className="space-y-6 pb-16">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cardData.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="min-w-0">
          <TrendAreaChart data={spendingTrend} />
        </div>
        <div className="glass-card p-5 space-y-4 min-w-0">
          <div>
            <p className="text-sm text-slate-500">Quick Actions</p>
            <h3 className="text-2xl font-display text-slate-900">Spend smarter</h3>
          </div>
          <QuickActions onAddIncome={() => setShowIncome(true)} />
          <div className="text-sm text-slate-500">
            EMI pending: {formatCurrency(totals?.emiPending ?? 0)}
          </div>
        </div>
        <div className="space-y-3 min-w-0">
          <p className="text-sm text-slate-500">EMI reminders</p>
          {reminders?.slice(0, 3).map((reminder) => (
            <ReminderCard key={`${reminder.lender}-${reminder.emiNumber}`} reminder={reminder} />
          ))}
        </div>
      </div>

      {showIncome && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="glass-card p-6 w-full max-w-md relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-slate-500"
              onClick={() => setShowIncome(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-display text-slate-900 mb-4">Record Income</h3>
            <IncomeForm onClose={() => setShowIncome(false)} onSubmit={(payload) => actions.addIncome(payload)} />
          </div>
        </div>
      )}

      {showReminder && reminders?.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-6">
          <div className="glass-card p-6 w-full max-w-lg space-y-4 relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-slate-500"
              onClick={() => setShowReminder(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-display text-slate-900">Upcoming EMIs</h3>
            <p className="text-sm text-slate-500">
              {`Stay on track! ${reminders?.length ?? 0} EMI${(reminders?.length ?? 0) > 1 ? 's' : ''} due this month.`}
            </p>
            <div className="space-y-3 max-h-72 overflow-auto pr-2">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={`${reminder.lender}-${reminder.emiNumber}-modal`}
                  reminder={reminder}
                />
              ))}
            </div>
            <button type="button" className="btn-primary w-full" onClick={() => setShowReminder(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
