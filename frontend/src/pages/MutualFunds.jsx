import { useMemo, useState } from 'react'
import { Wallet, TrendingUp, PiggyBank, Layers3 } from 'lucide-react'
import InvestmentForm from '@components/forms/InvestmentForm.jsx'
import InvestmentCard from '@components/InvestmentCard.jsx'
import StatementUploader from '@components/StatementUploader.jsx'
import StatCard from '@components/StatCard.jsx'
import { useFinance } from '@context/FinanceContext.jsx'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'

const MutualFunds = () => {
  const { investments = [], actions } = useFinance()
  const [editing, setEditing] = useState(null)
  const [selectedBroker, setSelectedBroker] = useState('all')
  const formatCurrency = useCurrencyFormatter()

  const mutualFunds = useMemo(
    () => investments.filter((investment) => investment.metadata?.assetType !== 'stock'),
    [investments],
  )

  const summary = useMemo(() => {
    const totalInvested = mutualFunds.reduce((sum, item) => sum + (item.amountInvested ?? 0), 0)
    const currentValue = mutualFunds.reduce((sum, item) => sum + (item.currentValue ?? 0), 0)
    const totalGain = currentValue - totalInvested
    const gainPercent = totalInvested ? (totalGain / totalInvested) * 100 : 0
    const brokerMap = mutualFunds.reduce((map, holding) => {
      const brokerList =
        holding.brokers?.length > 0
          ? holding.brokers
          : [holding.broker ?? holding.platform ?? 'Manual']
      brokerList.forEach((brokerName) => {
        if (!map[brokerName]) {
          map[brokerName] = {
            broker: brokerName,
            totalInvested: 0,
            currentValue: 0,
            holdings: 0,
          }
        }
        map[brokerName].totalInvested += holding.amountInvested ?? 0
        map[brokerName].currentValue += holding.currentValue ?? 0
        map[brokerName].holdings += 1
        map[brokerName].totalGain = map[brokerName].currentValue - map[brokerName].totalInvested
      })
      return map
    }, {})
    const byBroker = Object.values(brokerMap)
    const topHoldings = [...mutualFunds]
      .sort((a, b) => (b.gain ?? b.currentValue - b.amountInvested) - (a.gain ?? a.currentValue - a.amountInvested))
      .slice(0, 5)
    return { totalInvested, currentValue, totalGain, gainPercent, topHoldings, byBroker }
  }, [mutualFunds])

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
    const confirmed = window.confirm('Remove this investment entry?')
    if (!confirmed) return
    await actions.deleteInvestment(id)
    if (editing?._id === id) {
      setEditing(null)
    }
  }

  const summaryCards = [
    {
      label: 'Invested Capital',
      value: formatCurrency(summary.totalInvested),
      description: 'Total SIP amount contributed',
      icon: Wallet,
    },
    {
      label: 'Current Value',
      value: formatCurrency(summary.currentValue),
      description: 'Latest NAV snapshots',
      icon: TrendingUp,
      accent: 'from-sky-500 to-emerald-500',
    },
    {
      label: 'Net Gain',
      value: formatCurrency(summary.totalGain),
      description: `${summary.gainPercent.toFixed(2)}% overall`,
      icon: PiggyBank,
      accent: summary.totalGain >= 0 ? 'from-emerald-500 to-neonBlue' : 'from-rose-500 to-orange-500',
    },
    {
      label: 'Active Brokers',
      value: summary.byBroker?.length ?? 0,
      description: 'Angel One / Groww / others',
      icon: Layers3,
    },
  ]

  const brokers = summary.byBroker ?? []
  const filteredInvestments =
    selectedBroker === 'all'
      ? mutualFunds
      : mutualFunds.filter((investment) => {
          const brokerList =
            investment.brokers?.length > 0
              ? investment.brokers
              : [investment.broker ?? investment.platform ?? 'Manual']
          return brokerList.includes(selectedBroker)
        })

  return (
    <div className="space-y-6 pb-16">
      <div className="grid md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h2 className="text-2xl font-display">Mutual fund desk</h2>
            <p className="text-sm text-slate-500">
              Log Groww / Angel One schemes manually to keep tabs on gains.
            </p>
          </div>
          <InvestmentForm
            onSubmit={handleSubmit}
            defaultValues={editing ?? undefined}
            onCancel={() => setEditing(null)}
          />
          <StatementUploader
            onImport={async (payload) => {
              const result = await actions.importInvestments(payload)
              setSelectedBroker('all')
              return result
            }}
          />
        </div>
        <div className="lg:col-span-3 space-y-6">
          {brokers.length > 0 && (
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-xl font-display">Broker breakdown</h3>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedBroker === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-surfaceMuted text-slate-600'
                    }`}
                    onClick={() => setSelectedBroker('all')}
                  >
                    All
                  </button>
                  {brokers.map((brokerEntry) => (
                    <button
                      key={brokerEntry.broker}
                      type="button"
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedBroker === brokerEntry.broker
                          ? 'bg-slate-900 text-white'
                          : 'bg-surfaceMuted text-slate-600'
                      }`}
                      onClick={() => setSelectedBroker(brokerEntry.broker)}
                    >
                      {brokerEntry.broker}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {brokers.map((brokerEntry) => (
                  <div
                    key={`${brokerEntry.broker}-card`}
                    className="border border-borderLight rounded-xl p-3 text-sm text-slate-500"
                  >
                    <p className="text-slate-900 font-medium">{brokerEntry.broker}</p>
                    <p>Invested: {formatCurrency(brokerEntry.totalInvested)}</p>
                    <p>Current: {formatCurrency(brokerEntry.currentValue)}</p>
                    <p
                      className={
                        brokerEntry.totalGain >= 0 ? 'text-emerald-600' : 'text-rose-500'
                      }
                    >
                      Gain: {formatCurrency(brokerEntry.totalGain)}
                    </p>
                    <p>{brokerEntry.holdings ?? 0} schemes</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.topHoldings?.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-xl font-display mb-3">Top schemes</h3>
              <div className="space-y-2 text-sm text-slate-600">
                {summary.topHoldings.map((holding) => (
                  <div
                    key={holding.id ?? holding.schemeName}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{holding.schemeName}</p>
                      <p className="text-xs text-slate-500">{holding.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Invested {formatCurrency(holding.amountInvested)}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          holding.gain >= 0 ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {holding.gain >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(holding.gain))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {filteredInvestments.map((investment) => (
              <InvestmentCard
                key={investment._id ?? investment.schemeName}
                investment={investment}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {filteredInvestments.length === 0 && (
            <p className="text-center py-8 text-slate-500 text-sm">
              No investments logged yet. Add your Groww/Angel One SIP to view gains here.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MutualFunds
