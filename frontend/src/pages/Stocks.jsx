import { useMemo, useState } from 'react'
import { CandlestickChart, Wallet, TrendingUp, PiggyBank } from 'lucide-react'
import { useFinance } from '@context/FinanceContext.jsx'
import StockForm from '@components/forms/StockForm.jsx'
import InvestmentCard from '@components/InvestmentCard.jsx'
import StatCard from '@components/StatCard.jsx'

const formatCurrency = (value = 0) => `₹ ${Number(value).toLocaleString()}`

const Stocks = () => {
  const { investments = [], actions } = useFinance()
  const [editing, setEditing] = useState(null)

  const stocks = useMemo(
    () => investments.filter((investment) => investment.metadata?.assetType === 'stock'),
    [investments],
  )

  const summary = useMemo(() => {
    const totalInvested = stocks.reduce((sum, stock) => sum + (stock.amountInvested ?? 0), 0)
    const currentValue = stocks.reduce((sum, stock) => sum + (stock.currentValue ?? 0), 0)
    const totalGain = currentValue - totalInvested
    const gainPercent = totalInvested ? (totalGain / totalInvested) * 100 : 0
    return { totalInvested, currentValue, totalGain, gainPercent, count: stocks.length }
  }, [stocks])

  const handleSubmit = async (payload) => {
    if (editing?._id) {
      await actions.updateInvestment(editing._id, payload)
    } else {
      await actions.addInvestment(payload)
    }
    setEditing(null)
  }

  const handleDelete = async (id) => {
    if (!id) return
    const confirmed = window.confirm('Remove this stock entry?')
    if (!confirmed) return
    await actions.deleteInvestment(id)
    if (editing?._id === id) {
      setEditing(null)
    }
  }

  const statCards = [
    {
      label: 'Invested in stocks',
      value: formatCurrency(summary.totalInvested),
      description: 'Total principal allocated',
      icon: Wallet,
    },
    {
      label: 'Current market value',
      value: formatCurrency(summary.currentValue),
      description: 'Mark to market holdings',
      icon: CandlestickChart,
      accent: 'from-sky-500 to-indigo-500',
    },
    {
      label: 'Unrealised P&L',
      value: formatCurrency(summary.totalGain),
      description: `${summary.gainPercent.toFixed(2)}% overall`,
      icon: TrendingUp,
      accent: summary.totalGain >= 0 ? 'from-emerald-500 to-lime-400' : 'from-rose-500 to-orange-500',
    },
    {
      label: 'Active positions',
      value: summary.count,
      description: 'Tracked across brokers',
      icon: PiggyBank,
    },
  ]

  return (
    <div className="space-y-6 pb-16">
      <div className="grid md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h2 className="text-2xl font-display">Stocks & equity</h2>
            <p className="text-sm text-slate-500">
              Track direct equity investments alongside your mutual funds.
            </p>
          </div>
          <StockForm
            onSubmit={handleSubmit}
            defaultValues={editing ?? undefined}
            onCancel={() => setEditing(null)}
          />
        </div>
        <div className="lg:col-span-2 space-y-4">
          {stocks.length === 0 ? (
            <div className="glass-card p-6 text-center text-slate-500">
              No stocks tracked yet. Add your first position from the form to get started.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {stocks.map((stock) => (
                <InvestmentCard
                  key={stock._id}
                  investment={stock}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Stocks
