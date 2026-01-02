const formatCurrency = (value = 0) => `₹ ${Number(value).toLocaleString()}`

const formatDate = (dateValue) => {
  if (!dateValue) return '—'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const InvestmentCard = ({ investment, onEdit, onDelete }) => {
  const gain = (investment.gain ?? investment.currentValue - investment.amountInvested) || 0
  const gainPercent =
    investment.gainPercent ??
    (investment.amountInvested ? (gain / investment.amountInvested) * 100 : 0)
  const gainPositive = gain >= 0
  const brokerBadges =
    investment.brokers?.length > 0
      ? investment.brokers
      : [investment.broker ?? investment.platform ?? 'Manual']

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {brokerBadges.join(' · ')}
          </p>
          <h3 className="text-lg font-display text-slate-900">{investment.schemeName}</h3>
        </div>
        <div className={`text-right font-semibold ${gainPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {gainPositive ? '▲' : '▼'} {formatCurrency(Math.abs(gain))}
          <span className="block text-xs text-slate-500">{gainPercent.toFixed(2)}%</span>
        </div>
      </div>
      <div className="text-sm text-slate-500 space-y-1">
        <p>
          Invested:{' '}
          <span className="font-medium text-slate-900">
            {formatCurrency(investment.amountInvested ?? 0)}
          </span>
        </p>
        <p>
          Current:{' '}
          <span className="font-medium text-slate-900">
            {formatCurrency(investment.currentValue ?? 0)}
          </span>
        </p>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Updated {formatDate(investment.lastUpdated)}</span>
        <div className="space-x-2">
          {onEdit && (
            <button type="button" className="btn-secondary !py-1 !px-3 text-xs" onClick={() => onEdit(investment)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn-secondary !py-1 !px-3 text-xs border border-red-200 text-red-500 hover:bg-red-50"
              onClick={() => onDelete(investment._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {investment.notes && (
        <p className="text-xs text-slate-500">{investment.notes}</p>
      )}
    </div>
  )
}

export default InvestmentCard
