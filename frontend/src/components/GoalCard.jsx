import './GoalCard.css'

const GoalCard = ({ goal, formatCurrency, onUpdate, onDelete }) => {
  const percentage =
    goal.target > 0 ? Math.min(Math.round((goal.saved / goal.target) * 100), 100) : 0

  return (
    <div className="goal-card">
      <div className="goal-card__header">
        <div>
          <p className="goal-card__label">Goal</p>
          <h4 className="goal-card__title">{goal.name}</h4>
        </div>
        <span className="goal-card__percentage">{percentage}%</span>
      </div>
      <div className="goal-card__progress">
        <div style={{ width: `${percentage}%` }} />
      </div>
      <p className="goal-card__meta">
        {formatCurrency(goal.saved)} / {formatCurrency(goal.target)}
      </p>
      <div className="goal-card__actions">
        <input
          type="number"
          min="0"
          step="0.01"
          value={goal.saved}
          onChange={(event) => onUpdate(goal.id, Number(event.target.value))}
        />
        <button type="button" className="goal-card__delete" onClick={() => onDelete(goal.id)}>
          Remove
        </button>
      </div>
    </div>
  )
}

export default GoalCard
