import clsx from 'clsx'
import { useCurrencySymbol } from '@hooks/useCurrencyFormatter.js'
import './StatCard.css'

const StatCard = ({ label, value, description, icon: Icon, accent = 'from-accentBlue to-accentPurple' }) => {
  const currencySymbol = useCurrencySymbol()

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <div className={clsx('stat-card__icon', accent)}>
          {Icon ? <Icon className="stat-card__icon-graphic" /> : <span className="stat-card__currency">{currencySymbol}</span>}
        </div>
        <div>
          <p className="stat-card__label">{label}</p>
          <p className="stat-card__value">{value}</p>
        </div>
      </div>
      {description && <p className="stat-card__description">{description}</p>}
    </div>
  )
}

export default StatCard
