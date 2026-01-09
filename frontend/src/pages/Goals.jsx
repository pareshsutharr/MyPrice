import { useEffect, useMemo, useState } from 'react'
import GoalCard from '@components/GoalCard.jsx'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './Dashboard.css'
import './Goals.css'

const GOALS_STORAGE_KEY = 'moneyxp-goals'

const readStoredGoals = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GOALS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Unable to read goals', error)
    return []
  }
}

const Goals = () => {
  const [goals, setGoals] = useState(readStoredGoals)
  const [plannerInput, setPlannerInput] = useState({
    goalName: '',
    time: '',
    timeUnit: 'months',
    total: '',
    monthly: '',
  })
  const formatCurrency = useCurrencyFormatter()
  const goalsSummary = useMemo(() => {
    const totalTarget = goals.reduce((sum, goal) => sum + (Number(goal.target) || 0), 0)
    const totalSaved = goals.reduce((sum, goal) => sum + (Number(goal.saved) || 0), 0)
    const progress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0
    return {
      count: goals.length,
      totalTarget,
      totalSaved,
      progress,
    }
  }, [goals])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
    } catch (error) {
      console.warn('Unable to persist goals', error)
    }
  }, [goals])

  const handleAddGoal = (event) => {
    event.preventDefault()
    const name = plannerInput.goalName.trim()
    if (!name) return
    const target = parsePositiveNumber(plannerInput.total)
    if (!target) return
    const newGoal = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      target,
      saved: 0,
    }
    setGoals((prev) => [...prev, newGoal])
    setPlannerInput((prev) => ({ ...prev, goalName: '' }))
  }

  const handleGoalUpdate = (id, nextSaved) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, saved: Math.min(Math.max(Number(nextSaved) || 0, 0), goal.target) }
          : goal,
      ),
    )
  }

  const handleGoalDelete = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id))
  }

  const handlePlannerInputChange = (event) => {
    const { name, value } = event.target
    setPlannerInput((prev) => ({ ...prev, [name]: value }))
  }

  const parsePositiveNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }

  const roundMoney = (value) => Math.round(value)
  const formatMoney = (value) => formatCurrency(roundMoney(value))

  const timeValue = parsePositiveNumber(plannerInput.time)
  const totalValue = parsePositiveNumber(plannerInput.total)
  const monthlyValue = parsePositiveNumber(plannerInput.monthly)
  const timeInMonths = timeValue ? timeValue * (plannerInput.timeUnit === 'years' ? 12 : 1) : null
  const providedCount = [timeInMonths, totalValue, monthlyValue].filter((value) => value != null).length
  const shouldCalculate = providedCount === 2

  let computedMonthly = null
  let computedTotal = null
  let computedMonths = null
  let plannerMessage = ''

  if (providedCount < 2) {
    plannerMessage = 'Add one more value to calculate the rest.'
  } else if (providedCount > 2) {
    plannerMessage = 'Please enter only two values so I can calculate the third.'
  } else if (timeInMonths && totalValue) {
    computedMonthly = totalValue / timeInMonths
  } else if (timeInMonths && monthlyValue) {
    computedTotal = monthlyValue * timeInMonths
  } else if (totalValue && monthlyValue) {
    computedMonths = totalValue / monthlyValue
  }

  const displayMonthly =
    computedMonthly != null ? roundMoney(computedMonthly) : monthlyValue != null ? roundMoney(monthlyValue) : null
  const displayTotal =
    computedTotal != null ? roundMoney(computedTotal) : totalValue != null ? roundMoney(totalValue) : null
  const displayMonths =
    computedMonths != null ? Math.ceil(computedMonths) : timeInMonths != null ? Math.round(timeInMonths) : null

  const formatTime = (months) => {
    if (!months) return ''
    const roundedMonths = Math.max(1, Math.round(months))
    if (roundedMonths >= 12) {
      const years = Math.round((roundedMonths / 12) * 10) / 10
      return `${roundedMonths} months (${years} years)`
    }
    return `${roundedMonths} months`
  }

  const inputSummary = [
    plannerInput.goalName.trim() ? `Goal name: ${plannerInput.goalName.trim()}` : null,
    monthlyValue != null ? `Monthly savings: ${formatMoney(monthlyValue)}` : null,
    totalValue != null ? `Total goal amount: ${formatMoney(totalValue)}` : null,
    timeValue != null ? `Time duration: ${timeValue} ${plannerInput.timeUnit}` : null,
  ].filter(Boolean)

  const planSummary = [
    displayMonthly != null ? `Monthly savings: ${formatMoney(displayMonthly)}` : null,
    displayTotal != null ? `Total goal amount: ${formatMoney(displayTotal)}` : null,
    displayMonths != null ? `Time required: ${formatTime(displayMonths)}` : null,
  ].filter(Boolean)

  return (
    <div className="page-stack goals-page">
      <div className="page-section goals-header">
        <div className="goals-header__title">
          <p className="text-sm text-slate-500">Goals hub</p>
          <h1 className="text-3xl font-display text-slate-900">Goal savings planner</h1>
          <p className="text-sm text-slate-500">Plan targets, stay on track, and celebrate each milestone.</p>
        </div>
        <div className="goals-header__stats">
          <div className="goals-stat">
            <p className="goals-stat__label">Goals tracked</p>
            <p className="goals-stat__value">{goalsSummary.count}</p>
          </div>
          <div className="goals-stat">
            <p className="goals-stat__label">Total target</p>
            <p className="goals-stat__value">{formatCurrency(goalsSummary.totalTarget)}</p>
          </div>
          <div className="goals-stat">
            <p className="goals-stat__label">Saved so far</p>
            <p className="goals-stat__value">{formatCurrency(goalsSummary.totalSaved)}</p>
            <p className="goals-stat__meta">{goalsSummary.progress}% funded</p>
          </div>
        </div>
      </div>
      <div className="goals-layout">
        <section className="glass-card goals-panel">
          <div className="goals-panel__header">
            <div>
              <p className="text-sm text-slate-500">Smart planner</p>
              <h2 className="text-2xl font-display text-slate-900">Goal savings calculator</h2>
            </div>
            <p className="text-sm text-slate-500">Enter any two values to calculate the third.</p>
          </div>
          <form className="goal-planner__form" onSubmit={handleAddGoal}>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-400">Goal name</label>
              <input
                type="text"
                name="goalName"
                placeholder="Goal name"
                value={plannerInput.goalName}
                onChange={handlePlannerInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-400">Monthly savings</label>
              <input
                type="number"
                name="monthly"
                min="0"
                step="1"
                placeholder="5000"
                value={plannerInput.monthly}
                onChange={handlePlannerInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-400">Total goal amount</label>
              <input
                type="number"
                name="total"
                min="0"
                step="1"
                placeholder="300000"
                value={plannerInput.total}
                onChange={handlePlannerInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-400">Time duration</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="number"
                  name="time"
                  min="0"
                  step="0.1"
                  placeholder="12"
                  value={plannerInput.time}
                  onChange={handlePlannerInputChange}
                />
                <select name="timeUnit" value={plannerInput.timeUnit} onChange={handlePlannerInputChange}>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary goal-planner__submit">
              Add goal
            </button>
          </form>
          <div className="goals-results">
            <div className="goals-results__card">
              <p className="text-sm text-slate-500">Your inputs</p>
              {inputSummary.length ? (
                <p className="text-sm text-slate-600">{inputSummary.join(' | ')}</p>
              ) : (
                <p className="text-sm text-slate-600">Enter at least one value to begin.</p>
              )}
            </div>
            <div className="goals-results__card">
              <p className="text-sm text-slate-500">Plan</p>
              {plannerMessage ? (
                <p className="text-sm text-slate-600">{plannerMessage}</p>
              ) : (
                <div className="text-sm text-slate-600 space-y-1">
                  {planSummary.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
          {shouldCalculate && (
            <p className="goals-motivation text-sm text-slate-500">
              Stay consistent - small monthly savings build big goals over time.
            </p>
          )}
        </section>
        <section className="glass-card goals-panel goals-panel--list">
          <div className="goals-panel__header">
            <div>
              <p className="text-sm text-slate-500">Track progress</p>
              <h2 className="text-2xl font-display text-slate-900">Your goals</h2>
            </div>
            <p className="text-sm text-slate-500">Update saved amount inside each goal card.</p>
          </div>
          {goals.length > 0 && (
            <div className="goals-grid">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  formatCurrency={formatCurrency}
                  onUpdate={handleGoalUpdate}
                  onDelete={handleGoalDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Goals
