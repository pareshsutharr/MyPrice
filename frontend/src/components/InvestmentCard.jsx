import clsx from 'clsx'
import { useDateFormatter } from '@hooks/useDateFormatter.js'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './InvestmentCard.css'

const FALLBACK_TEXT = '--'

const InvestmentCard = ({ investment, onEdit, onDelete }) => {
  const formatDate = useDateFormatter()
  const formatCurrency = useCurrencyFormatter()
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
    <div className="investment-card">
      <div className="investment-card__header">
        <div>
          <p className="investment-card__brokers">{brokerBadges.join(' · ')}</p>
          <h3 className="investment-card__title">{investment.schemeName}</h3>
        </div>
        <div
          className={clsx('investment-card__gain', {
            'investment-card__gain--positive': gainPositive,
            'investment-card__gain--negative': !gainPositive,
          })}
        >
          {gainPositive ? '+' : '-'} {formatCurrency(Math.abs(gain))}
          <span className="investment-card__gain-percent">{gainPercent.toFixed(2)}%</span>
        </div>
      </div>
      <div className="investment-card__metrics">
        <p>
          Invested <span>{formatCurrency(investment.amountInvested ?? 0)}</span>
        </p>
        <p>
          Current <span>{formatCurrency(investment.currentValue ?? 0)}</span>
        </p>
      </div>
      <div className="investment-card__footer">
        <span>Updated {formatDate(investment.lastUpdated, { fallback: FALLBACK_TEXT })}</span>
        <div className="investment-card__actions">
          {onEdit && (
            <button type="button" className="investment-card__action-btn btn-secondary" onClick={() => onEdit(investment)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="investment-card__delete-btn btn-secondary"
              onClick={() => onDelete(investment._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {investment.notes && <p className="investment-card__notes">{investment.notes}</p>}
    </div>
  )
}

export default InvestmentCard
