import { useDateFormatter } from '@hooks/useDateFormatter.js'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './ReminderCard.css'

const ReminderCard = ({ reminder }) => {
  const formatDate = useDateFormatter()
  const formatCurrency = useCurrencyFormatter()

  return (
    <div className="reminder-card">
      <div>
        <p className="reminder-card__label">EMI Reminder</p>
        <p className="reminder-card__title">{reminder.lender}</p>
        <p className="reminder-card__meta">
          Due on {formatDate(reminder.dueOn, { fallback: '--' })} · EMI {reminder.emiNumber}/
          {reminder.totalMonths}
        </p>
      </div>
      <p className="reminder-card__amount">{formatCurrency(reminder.monthlyEmi)}</p>
    </div>
  )
}

export default ReminderCard
