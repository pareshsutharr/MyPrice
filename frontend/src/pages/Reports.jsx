import ExpensesBarChart from '@components/charts/ExpensesBarChart.jsx'
import CategoryPieChart from '@components/charts/CategoryPieChart.jsx'
import StatCard from '@components/StatCard.jsx'
import { useFinance } from '@context/FinanceContext.jsx'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'

const Reports = () => {
  const { stats } = useFinance()
  const split = stats?.incomeSplit ?? {}
  const formatCurrency = useCurrencyFormatter()
  const cards = [
    {
      label: 'Needs (50%)',
      value: formatCurrency(Math.round(split.needs ?? 0)),
      description: 'Rent, groceries, EMI',
    },
    {
      label: 'Wants (30%)',
      value: formatCurrency(Math.round(split.wants ?? 0)),
      description: 'Lifestyle spends',
      accent: 'from-pink-500 to-orange-500',
    },
    {
      label: 'Savings (20%)',
      value: formatCurrency(Math.round(split.savings ?? 0)),
      description: 'Investments & buffer',
      accent: 'from-emerald-500 to-cyan-500',
    },
  ]

  return (
    <div className="page-stack">
      <div className="page-grid md:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <div className="page-grid lg:grid-cols-2">
        <div className="page-section min-w-0">
          <ExpensesBarChart data={stats?.monthlyExpenses ?? []} />
        </div>
        <div className="page-section min-w-0">
          <CategoryPieChart data={stats?.categoryDistribution ?? []} />
        </div>
      </div>
    </div>
  )
}

export default Reports
