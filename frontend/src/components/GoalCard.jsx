import { useState } from 'react'
import './GoalCard.css'

const GoalCard = ({ goal, formatCurrency, onUpdate, onDelete }) => {
  const [addAmount, setAddAmount] = useState('')
  const percentage =
    goal.target > 0 ? Math.min(Math.round((goal.saved / goal.target) * 100), 100) : 0

  const handleAddAmount = (event) => {
    event.preventDefault()
    const amount = Number(addAmount)
    if (!Number.isFinite(amount) || amount <= 0) return
    onUpdate(goal.id, goal.saved + amount)
    setAddAmount('')
  }

  return (
    <div className="goal-card">
      <div className="goal-card__ring" style={{ '--goal-progress': `${percentage}%` }}>
        <div className="goal-card__ring-core">
          <p className="goal-card__ring-label">{goal.name}</p>
          <span className="goal-card__ring-value">{percentage}%</span>
        </div>
      </div>
      <p className="goal-card__meta">
        {formatCurrency(goal.saved)} / {formatCurrency(goal.target)}
      </p>
      <div className="goal-card__actions">
        <form className="goal-card__add-form" onSubmit={handleAddAmount}>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Add amount"
            value={addAmount}
            onChange={(event) => setAddAmount(event.target.value)}
          />
          <button type="submit" className="goal-card__add">
            Add
          </button>
        </form>
        <button type="button" className="goal-card__delete" onClick={() => onDelete(goal.id)}>
          Remove
        </button>
      </div>
    </div>
  )
}

export default GoalCard
