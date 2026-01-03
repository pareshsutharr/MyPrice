import { useEffect, useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  CreditCard,
  LineChart,
  WalletCards,
  CandlestickChart,
  Layers3,
  Coins,
} from 'lucide-react'
import StatCard from '@components/StatCard.jsx'
import QuickActions from '@components/QuickActions.jsx'
import TrendAreaChart from '@components/charts/TrendAreaChart.jsx'
import ReminderCard from '@components/ReminderCard.jsx'
import IncomeForm from '@components/forms/IncomeForm.jsx'
import ExpenseForm from '@components/forms/ExpenseForm.jsx'
import CashFlowSparkline from '@components/charts/CashFlowSparkline.jsx'
import GoalCard from '@components/GoalCard.jsx'
import { useFinance } from '@context/FinanceContext.jsx'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import { CATEGORY_MAP } from '@shared/constants.js'
import './Dashboard.css'

const REMINDER_SESSION_KEY = 'moneyxp-reminder-seen'
const DASHBOARD_LAYOUT_KEY = 'moneyxp-dashboard-layout'
const GOALS_STORAGE_KEY = 'moneyxp-goals'
const DASHBOARD_TILES_VISIBILITY_KEY = 'moneyxp-dashboard-tiles'
const CUSTOM_TILES_KEY = 'moneyxp-custom-tiles'

const startOfWeek = (date) => {
  const base = new Date(date)
  const day = base.getDay() === 0 ? 7 : base.getDay()
  base.setHours(0, 0, 0, 0)
  base.setDate(base.getDate() - (day - 1))
  return base
}

const getDayKey = (value) => new Date(value).toISOString().split('T')[0]

const buildMonthlySeries = (entries = [], months = 6) => {
  const now = new Date()
  return Array.from({ length: months }, (_, idx) => {
    const pivot = new Date(now.getFullYear(), now.getMonth() - (months - 1 - idx), 1)
    const label = pivot.toLocaleDateString('en-IN', { month: 'short' })
    const total = entries.reduce((sum, entry) => {
      const date = new Date(entry.date)
      if (date.getMonth() === pivot.getMonth() && date.getFullYear() === pivot.getFullYear()) {
        return sum + Number(entry.amount ?? 0)
      }
      return sum
    }, 0)
    return { label, total }
  })
}

const buildWeeklySeries = (entries = [], weeks = 6) => {
  const currentWeekStart = startOfWeek(new Date())
  return Array.from({ length: weeks }, (_, idx) => {
    const start = new Date(currentWeekStart)
    start.setDate(start.getDate() - (weeks - 1 - idx) * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    const label = start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    const total = entries.reduce((sum, entry) => {
      const date = new Date(entry.date)
      if (date >= start && date < end) {
        return sum + Number(entry.amount ?? 0)
      }
      return sum
    }, 0)
    return { label, total }
  })
}

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

const readStoredCustomTiles = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CUSTOM_TILES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Unable to read custom tiles', error)
    return []
  }
}

const Dashboard = () => {
  const { stats, actions, loading, loans, investments, expenses, income } = useFinance()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showIncome, setShowIncome] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(() => searchParams.get('customize') === '1')
  const [draggingTile, setDraggingTile] = useState(null)
  const [trendView, setTrendView] = useState('monthly')
  const [trendType, setTrendType] = useState('expenses')
  const [goals, setGoals] = useState(readStoredGoals)
  const [goalForm, setGoalForm] = useState({ name: '', target: '', saved: '' })
  const [customTiles, setCustomTiles] = useState(readStoredCustomTiles)
  const [customTileForm, setCustomTileForm] = useState({ name: '', expression: '', description: '' })
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [tipIndex, setTipIndex] = useState(0)
  const formatCurrency = useCurrencyFormatter()

  const reminders = useMemo(() => stats?.reminders ?? [], [stats?.reminders])

  useEffect(() => {
    if (!reminders?.length) {
      setShowReminder(false)
      return
    }
    const hasShown = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(REMINDER_SESSION_KEY) === '1'
    if (!hasShown) {
      setShowReminder(true)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(REMINDER_SESSION_KEY, '1')
      }
    }
  }, [reminders])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
    } catch (error) {
      console.warn('Unable to persist goals', error)
    }
  }, [goals])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(CUSTOM_TILES_KEY, JSON.stringify(customTiles))
    } catch (error) {
      console.warn('Unable to persist custom tiles', error)
    }
  }, [customTiles])

  const totals = useMemo(
    () => stats?.totals ?? { totalCredit: 0, totalDebit: 0, emiPending: 0, balance: 0 },
    [stats?.totals],
  )
  const thisMonth = useMemo(
    () => stats?.thisMonth ?? { credit: 0, debit: 0, savings: 0 },
    [stats?.thisMonth],
  )
  const investmentSummary = useMemo(
    () => stats?.investments ?? { totalGain: 0, totalInvested: 0 },
    [stats?.investments],
  )
  const spendingTrendData = useMemo(
    () => stats?.spendingTrend ?? [],
    [stats?.spendingTrend],
  )
  const isDataReady = Boolean(stats)
  const activeLoans = loans?.active ?? []
  const completedLoans = loans?.completed ?? []
  const loanCount = activeLoans.length + completedLoans.length
  const investmentList = investments ?? []
  const stockHoldings = investmentList.filter((holding) => holding.metadata?.assetType === 'stock')
  const mutualFundHoldings = investmentList.filter((holding) => holding.metadata?.assetType !== 'stock')
  const stockCount = stockHoldings.length
  const mutualFundCount = mutualFundHoldings.length
  const totalSipAmount = mutualFundHoldings.reduce((sum, holding) => sum + (holding.amountInvested ?? 0), 0)
  const totalStockValue = stockHoldings.reduce((sum, holding) => sum + (holding.currentValue ?? 0), 0)
  const totalMutualValue = mutualFundHoldings.reduce((sum, holding) => sum + (holding.currentValue ?? 0), 0)
  const outstandingLoans = activeLoans.reduce(
    (sum, loan) => sum + Math.max(loan.progress?.remaining ?? 0, 0),
    0,
  )
  const cashBalance = totals?.balance ?? 0
  const netWorth = cashBalance + totalStockValue + totalMutualValue - outstandingLoans


  const baseCards = useMemo(
    () => [
      {
        id: 'total-balance',
        label: 'Total Balance',
        value: formatCurrency(totals?.balance ?? 0),
        description: 'Credit - Debit - EMI',
        icon: Wallet,
      },
      {
        id: 'month-credit',
        label: 'This Month Credit',
        value: formatCurrency(thisMonth?.credit ?? 0),
        icon: TrendingUp,
        accent: 'from-emerald-500 to-neonBlue',
      },
      {
        id: 'month-debit',
        label: 'This Month Debit',
        value: formatCurrency(thisMonth?.debit ?? 0),
        icon: CreditCard,
        accent: 'from-rose-500 to-neonPurple',
      },
      {
        id: 'savings',
        label: 'Savings Potential',
        value: formatCurrency(thisMonth?.savings ?? 0),
        icon: PiggyBank,
        accent: 'from-amber-400 to-pink-500',
      },
      {
        id: 'investment-gain',
        label: 'Investment Gains',
        value: formatCurrency(investmentSummary?.totalGain ?? 0),
        description: `Invested ${formatCurrency(investmentSummary?.totalInvested ?? 0)}`,
        icon: LineChart,
        accent:
          (investmentSummary?.totalGain ?? 0) >= 0 ? 'from-emerald-500 to-neonBlue' : 'from-rose-500 to-orange-500',
      },
      {
        id: 'loans',
        label: 'Loans tracked',
        value: String(loanCount),
        description: `${activeLoans.length} active`,
        icon: WalletCards,
      },
      {
        id: 'stocks',
        label: 'Stocks monitored',
        value: String(stockCount),
        description: `Market value ${formatCurrency(totalStockValue)}`,
        icon: CandlestickChart,
      },
      {
        id: 'mfs',
        label: 'MF SIPs',
        value: String(mutualFundCount),
        description: `Invested ${formatCurrency(totalSipAmount)}`,
        icon: Layers3,
      },
      {
        id: 'net-worth',
        label: 'Net worth',
        value: formatCurrency(netWorth),
        description: 'Cash + investments - EMIs',
        icon: Coins,
        accent: 'from-emerald-500 to-neonBlue',
      },
    ],
    [
      activeLoans.length,
      formatCurrency,
      investmentSummary?.totalGain,
      investmentSummary?.totalInvested,
      loanCount,
      mutualFundCount,
      netWorth,
      stockCount,
      thisMonth?.credit,
      thisMonth?.debit,
      thisMonth?.savings,
      totals?.balance,
      totalSipAmount,
      totalStockValue,
    ],
  )

  const metrics = useMemo(
    () => ({
      balance: totals.balance ?? 0,
      totalIncome: totals.totalCredit ?? 0,
      totalExpenses: totals.totalDebit ?? 0,
      emiPending: totals.emiPending ?? 0,
      monthCredit: thisMonth.credit ?? 0,
      monthDebit: thisMonth.debit ?? 0,
      monthSavings: thisMonth.savings ?? 0,
      investmentGain: investmentSummary.totalGain ?? 0,
      investmentInvested: investmentSummary.totalInvested ?? 0,
      loanCount,
      activeLoans: activeLoans.length,
      stockCount,
      mutualFundCount,
      netWorth,
      totalSipAmount,
      stockMarketValue: totalStockValue,
      mutualFundValue: totalMutualValue,
      outstandingLoans,
      cashBalance,
    }),
    [
      totals.balance,
      totals.totalCredit,
      totals.totalDebit,
      totals.emiPending,
      thisMonth.credit,
      thisMonth.debit,
      thisMonth.savings,
      investmentSummary.totalGain,
      investmentSummary.totalInvested,
      loanCount,
      activeLoans.length,
      stockCount,
      mutualFundCount,
      netWorth,
      totalSipAmount,
      totalStockValue,
      totalMutualValue,
      outstandingLoans,
      cashBalance,
    ],
  )

  const evaluateExpression = useCallback(
    (expression) => {
      if (!expression?.trim()) return Number.NaN
      try {
        const fn = new Function(
          'metrics',
          `"use strict"; const { ${Object.keys(metrics).join(', ')} } = metrics; return ${expression};`,
        )
        const result = fn(metrics)
        const numeric = Number(result)
        return Number.isFinite(numeric) ? numeric : Number.NaN
      } catch {
        return Number.NaN
      }
    },
    [metrics],
  )

  const customCardData = useMemo(
    () =>
      customTiles.map((tile) => {
        const evaluated = evaluateExpression(tile.expression)
        return {
          id: tile.id,
          label: tile.name,
          value: Number.isFinite(evaluated) ? formatCurrency(evaluated) : '--',
          description: tile.description || tile.expression,
          icon: Coins,
          accent: Number.isFinite(evaluated) && evaluated >= 0 ? 'from-emerald-500 to-neonBlue' : undefined,
        }
      }),
    [customTiles, evaluateExpression, formatCurrency],
  )

  const cardData = useMemo(() => [...baseCards, ...customCardData], [baseCards, customCardData])

  const defaultOrder = useMemo(() => cardData.map((card) => card.id), [cardData])

  const readStoredLayout = useCallback(() => {
    if (typeof window === 'undefined') return defaultOrder
    try {
      const raw = window.localStorage.getItem(DASHBOARD_LAYOUT_KEY)
      if (!raw) return defaultOrder
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return defaultOrder
      const filtered = parsed.filter((id) => defaultOrder.includes(id))
      return filtered.length ? filtered : defaultOrder
    } catch (error) {
      console.warn('Unable to read dashboard layout', error)
      return defaultOrder
    }
  }, [defaultOrder])

  const [tileOrder, setTileOrder] = useState(defaultOrder)
  const [visibleTiles, setVisibleTiles] = useState(defaultOrder)

  useEffect(() => {
    setTileOrder(readStoredLayout())
  }, [readStoredLayout])

  const persistLayout = useCallback((order) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(order))
    } catch (error) {
      console.warn('Unable to persist dashboard layout', error)
    }
  }, [])

  const readStoredVisibility = useCallback(() => {
    if (typeof window === 'undefined') return defaultOrder
    try {
      const raw = window.localStorage.getItem(DASHBOARD_TILES_VISIBILITY_KEY)
      if (!raw) return defaultOrder
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return defaultOrder
      const filtered = parsed.filter((id) => defaultOrder.includes(id))
      return filtered.length ? filtered : defaultOrder
    } catch (error) {
      console.warn('Unable to read tile visibility', error)
      return defaultOrder
    }
  }, [defaultOrder])

  useEffect(() => {
    setVisibleTiles(readStoredVisibility())
  }, [readStoredVisibility])

  const persistVisibility = useCallback((list) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(DASHBOARD_TILES_VISIBILITY_KEY, JSON.stringify(list))
    } catch (error) {
      console.warn('Unable to persist tile visibility', error)
    }
  }, [])

  useEffect(() => {
    setTileOrder((prev) => {
      const filtered = prev.filter((id) => defaultOrder.includes(id))
      const missing = defaultOrder.filter((id) => !filtered.includes(id))
      if (missing.length === 0 && filtered.length === prev.length) {
        return prev
      }
      const merged = [...filtered, ...missing]
      persistLayout(merged)
      return merged
    })
    setVisibleTiles((prev) => {
      const filtered = prev.filter((id) => defaultOrder.includes(id))
      const missing = defaultOrder.filter((id) => !filtered.includes(id))
      const merged = [...filtered, ...missing]
      persistVisibility(merged)
      return merged
    })
  }, [defaultOrder, persistLayout, persistVisibility])

  const orderedTiles = tileOrder
    .map((id) => cardData.find((card) => card.id === id))
    .filter((card) => card && visibleTiles.includes(card.id))

  const handleDragStart = (event, tileId) => {
    setDraggingTile(tileId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', tileId)
  }

  const handleDragOver = (event, targetId) => {
    if (!isCustomizing) return
    event.preventDefault()
    if (!draggingTile || draggingTile === targetId) return
    setTileOrder((prev) => {
      const dragIndex = prev.indexOf(draggingTile)
      const targetIndex = prev.indexOf(targetId)
      if (dragIndex === -1 || targetIndex === -1) return prev
      const updated = [...prev]
      updated.splice(dragIndex, 1)
      updated.splice(targetIndex, 0, draggingTile)
      persistLayout(updated)
      return updated
    })
  }

  const handleDragEnd = () => {
    setDraggingTile(null)
  }

  const handleDrop = (event) => {
    if (!isCustomizing) return
    event.preventDefault()
    setDraggingTile(null)
  }

  const monthlySeries = useMemo(
    () => ({
      expenses: buildMonthlySeries(expenses),
      income: buildMonthlySeries(income),
    }),
    [expenses, income],
  )

  const weeklySeries = useMemo(
    () => ({
      expenses: buildWeeklySeries(expenses),
      income: buildWeeklySeries(income),
    }),
    [expenses, income],
  )

  const trendData = useMemo(() => {
    const source = trendView === 'monthly' ? monthlySeries : weeklySeries
    const data = source[trendType]
    if (!data || data.length === 0) {
      return trendView === 'monthly' ? spendingTrendData : []
    }
    return data
  }, [monthlySeries, weeklySeries, trendType, trendView, spendingTrendData])

  const cashFlowInsight = useMemo(() => {
    const netEntries = [
      ...income.map((entry) => ({ date: entry.date, amount: Number(entry.amount ?? 0) })),
      ...expenses.map((entry) => ({ date: entry.date, amount: -Number(entry.amount ?? 0) })),
    ]
    const today = new Date()
    const start = startOfWeek(today)
    const previousStart = new Date(start)
    previousStart.setDate(previousStart.getDate() - 7)
    const twoWeeksStart = new Date(previousStart)
    twoWeeksStart.setDate(twoWeeksStart.getDate() - 7)

    const sumInRange = (rangeStart, rangeEnd) =>
      netEntries.reduce((sum, entry) => {
        const date = new Date(entry.date)
        if (date >= rangeStart && date < rangeEnd) {
          return sum + entry.amount
        }
        return sum
      }, 0)

    const thisWeekNet = sumInRange(start, new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000))
    const lastWeekNet = sumInRange(previousStart, start)

    const sparkline = []
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today)
      day.setDate(day.getDate() - i)
      const key = getDayKey(day)
      const label = day.toLocaleDateString('en-IN', { weekday: 'short' })
      const dailyNet = netEntries
        .filter((entry) => getDayKey(entry.date) === key)
        .reduce((sum, entry) => sum + entry.amount, 0)
      sparkline.push({ label, value: dailyNet })
    }

    return {
      sparkline,
      thisWeekNet,
      lastWeekNet,
      change: thisWeekNet - lastWeekNet,
    }
  }, [expenses, income])

  const monthStart = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }, [])

  const topCategories = useMemo(() => {
    const totalsByCategory = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date)
      if (date >= monthStart) {
        const key = expense.category ?? 'others'
        acc[key] = (acc[key] ?? 0) + Number(expense.amount ?? 0)
      }
      return acc
    }, {})
    const totalSpent = Object.values(totalsByCategory).reduce((sum, value) => sum + value, 0)
    return Object.entries(totalsByCategory)
      .map(([categoryId, total]) => {
        const categoryMeta = CATEGORY_MAP.find((category) => category.id === categoryId)
        return {
          id: categoryId,
          label: categoryMeta?.label ?? categoryId,
          total,
          percent: totalSpent ? total / totalSpent : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
  }, [expenses, monthStart])

  const computedAlerts = useMemo(() => {
    const list = []
    if (reminders?.length) {
      const reminder = reminders[0]
      list.push({
        id: `emi-${reminder.lender}`,
        message: `EMI for ${reminder.lender} is due soon.`,
      })
    }
    if ((thisMonth?.debit ?? 0) > (thisMonth?.credit ?? 0)) {
      const gap = (thisMonth?.debit ?? 0) - (thisMonth?.credit ?? 0)
      list.push({
        id: 'spend-gap',
        message: `Spending exceeds income by ${formatCurrency(gap)} this month.`,
      })
    }
    const topCategory = topCategories[0]
    if (topCategory && topCategory.percent >= 0.4) {
      list.push({
        id: `category-${topCategory.id}`,
        message: `${topCategory.label} is ${Math.round(topCategory.percent * 100)}% of this month's spend.`,
      })
    }
    if ((totals?.emiPending ?? 0) > 0) {
      list.push({
        id: 'emi-buffer',
        message: `Set aside ${formatCurrency(totals?.emiPending ?? 0)} for upcoming EMIs.`,
      })
    }
    return list
  }, [reminders, thisMonth, topCategories, totals, formatCurrency])

  const activeAlerts = computedAlerts.filter((alert) => !dismissedAlerts.includes(alert.id))

  const handleDismissAlert = (id) => {
    setDismissedAlerts((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const tips = useMemo(() => {
    const list = []
    if ((thisMonth?.savings ?? 0) > 0) {
      list.push(`Allocate ${formatCurrency(thisMonth.savings)} towards your goals to stay ahead.`)
    }
    if (loanCount > 0 && outstandingLoans > 0) {
      list.push(`Pre-paying ${formatCurrency(Math.min(outstandingLoans * 0.05, outstandingLoans))} could cut EMI interest.`)
    }
    if (mutualFundCount > 0) {
      list.push('Review your SIP mix monthly to keep allocations balanced.')
    }
    if (list.length === 0) {
      list.push('Log expenses daily to unlock meaningful insights on this dashboard.')
    }
    return list
  }, [formatCurrency, loanCount, mutualFundCount, outstandingLoans, thisMonth?.savings])

  useEffect(() => {
    if (tipIndex >= tips.length) {
      setTipIndex(0)
    }
  }, [tipIndex, tips.length])

  const currentTip = tips[tipIndex] ?? ''

  const handleGoalFormChange = (event) => {
    const { name, value } = event.target
    setGoalForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddGoal = (event) => {
    event.preventDefault()
    if (!goalForm.name.trim()) return
    const target = Math.max(Number(goalForm.target) || 0, 0)
    if (target === 0) return
    const saved = Math.min(Math.max(Number(goalForm.saved) || 0, 0), target)
    const newGoal = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: goalForm.name.trim(),
      target,
      saved,
    }
    setGoals((prev) => [...prev, newGoal])
    setGoalForm({ name: '', target: '', saved: '' })
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

  useEffect(() => {
    const shouldCustomize = searchParams.get('customize') === '1'
    setIsCustomizing(shouldCustomize)
  }, [searchParams])

  const handleCustomizeToggle = useCallback(
    (nextState) => {
      const desired = typeof nextState === 'boolean' ? nextState : !isCustomizing
      const nextParams = new URLSearchParams(searchParams)
      if (desired) {
        nextParams.set('customize', '1')
      } else {
        nextParams.delete('customize')
      }
      setSearchParams(nextParams, { replace: true })
      setIsCustomizing(desired)
    },
    [isCustomizing, searchParams, setSearchParams],
  )

  const handleCustomTileFormChange = (event) => {
    const { name, value } = event.target
    setCustomTileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCustomTile = (event) => {
    event.preventDefault()
    if (!customTileForm.name.trim() || !customTileForm.expression.trim()) return
    const newTile = {
      id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: customTileForm.name.trim(),
      expression: customTileForm.expression.trim(),
      description: customTileForm.description.trim(),
    }
    setCustomTiles((prev) => [...prev, newTile])
    setCustomTileForm({ name: '', expression: '', description: '' })
  }

  const handleRemoveCustomTile = (id) => {
    setCustomTiles((prev) => prev.filter((tile) => tile.id !== id))
    setTileOrder((prev) => prev.filter((tileId) => tileId !== id))
    setVisibleTiles((prev) => prev.filter((tileId) => tileId !== id))
  }

  const handleTileToggle = (tileId) => {
    setVisibleTiles((prev) => {
      let next
      if (prev.includes(tileId)) {
        next = prev.filter((id) => id !== tileId)
      } else {
        next = [...prev, tileId]
      }
      const valid = defaultOrder.filter((id) => next.includes(id))
      persistVisibility(valid)
      return valid
    })
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display text-slate-900">Your overview</h2>
          <p className="text-sm text-slate-500">
            {isCustomizing
              ? 'Drag tiles to rearrange and build your own view.'
              : 'Tap customize to switch to DIY layout mode.'}
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => handleCustomizeToggle()}>
          {isCustomizing ? 'Done' : 'Customize tiles'}
        </button>
      </div>

      {!isDataReady && (
        <div className="glass-card p-4 text-center text-sm text-slate-500">
          {loading ? 'Loading dashboard insights...' : 'Unable to load finance stats. Pull to refresh.'}
        </div>
      )}

      {isCustomizing && (
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm text-slate-500">Choose the tiles you want visible on your dashboard.</p>
          <div className="dashboard-tile-picker">
            {cardData.map((card) => {
              const isCustomTile = card.id.startsWith('custom-')
              return (
                <label key={`picker-${card.id}`} className="dashboard-tile-picker__item">
                  <input
                    type="checkbox"
                    checked={visibleTiles.includes(card.id)}
                    onChange={() => handleTileToggle(card.id)}
                  />
                  <span>{card.label}</span>
                  {isCustomTile && (
                    <button
                      type="button"
                      className="dashboard-tile-picker__remove"
                      onClick={(event) => {
                        event.stopPropagation()
                        event.preventDefault()
                        handleRemoveCustomTile(card.id)
                      }}
                    >
                      Remove
                    </button>
                  )}
                </label>
              )
            })}
          </div>
          <div className="custom-tile-builder space-y-3">
            <div>
              <p className="text-sm text-slate-500">Create a custom tile</p>
              <p className="text-xs text-slate-500">
                Use metrics like <code>balance</code>, <code>monthCredit</code>, <code>netWorth</code>,{' '}
                <code>outstandingLoans</code>, etc. Example: <code>balance - outstandingLoans</code>
              </p>
            </div>
            <form className="custom-tile-builder__form" onSubmit={handleAddCustomTile}>
              <input
                type="text"
                name="name"
                placeholder="Tile name"
                value={customTileForm.name}
                onChange={handleCustomTileFormChange}
                required
              />
              <input
                type="text"
                name="expression"
                placeholder="Formula e.g. balance - outstandingLoans"
                value={customTileForm.expression}
                onChange={handleCustomTileFormChange}
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Optional description"
                value={customTileForm.description}
                onChange={handleCustomTileFormChange}
              />
              <button type="submit" className="btn-primary">
                Add custom tile
              </button>
            </form>
            {customTiles.length > 0 && (
              <div className="custom-tile-list space-y-2">
                {customTiles.map((tile) => (
                  <div key={`custom-${tile.id}`} className="custom-tile-list__item">
                    <div>
                      <p className="font-medium text-slate-800">{tile.name}</p>
                      <p className="text-xs text-slate-500">{tile.expression}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveCustomTile(tile.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="available-metrics">
              {Object.keys(metrics).map((key) => (
                <span key={`metric-${key}`}>{key}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 dashboard-tiles ${isCustomizing ? 'dashboard-tiles--editing' : ''}`}>
        {orderedTiles.map((card) => (
          <div
            key={card.id}
            className={`dashboard-tiles__item ${isCustomizing ? 'dashboard-tiles__item--draggable' : ''} ${draggingTile === card.id ? 'dashboard-tiles__item--dragging' : ''}`}
            draggable={isCustomizing}
            onDragStart={(event) => handleDragStart(event, card.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => handleDragOver(event, card.id)}
            onDrop={handleDrop}
          >
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm text-slate-500">Cash-flow snapshot</p>
              <h3 className="text-2xl font-display text-slate-900">This vs last week</h3>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>{formatCurrency(cashFlowInsight.thisWeekNet)}</p>
              <p className={cashFlowInsight.change >= 0 ? 'text-slate-900' : 'text-slate-500'}>
                {cashFlowInsight.change >= 0 ? 'Up' : 'Down'} {formatCurrency(Math.abs(cashFlowInsight.change))}
              </p>
            </div>
          </div>
          <CashFlowSparkline data={cashFlowInsight.sparkline} />
        </div>
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Personalized tip</p>
              <h3 className="text-xl font-display text-slate-900">Stay on track</h3>
            </div>
            <button type="button" className="btn-secondary px-4 py-2" onClick={() => setTipIndex((prev) => (tips.length ? (prev + 1) % tips.length : 0))}>
              Next tip
            </button>
          </div>
          <p className="text-sm text-slate-600">{currentTip}</p>
        </div>
        <div className="glass-card p-5 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Top categories</p>
            <h3 className="text-xl font-display text-slate-900">This month</h3>
          </div>
          {topCategories.length === 0 ? (
            <p className="text-sm text-slate-500">Log expenses to see category highlights.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((category) => (
                <div key={category.id} className="top-categories__item">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">{category.label}</p>
                    <p className="text-sm text-slate-500">
                      {Math.round(category.percent * 100)}% · {formatCurrency(category.total)}
                    </p>
                  </div>
                  <div className="top-categories__bar">
                    <div style={{ width: `${Math.round(category.percent * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Interactive view</p>
              <h3 className="text-2xl font-display text-slate-900">Spending pulse</h3>
            </div>
            <div className="dashboard-toggle-group">
              {['monthly', 'weekly'].map((view) => (
                <button
                  key={view}
                  type="button"
                  className={`dashboard-toggle-button ${trendView === view ? 'dashboard-toggle-button--active' : ''}`}
                  onClick={() => setTrendView(view)}
                >
                  {view === 'monthly' ? 'Monthly' : 'Weekly'}
                </button>
              ))}
            </div>
            <div className="dashboard-toggle-group">
              {['expenses', 'income'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`dashboard-toggle-button ${trendType === type ? 'dashboard-toggle-button--active' : ''}`}
                  onClick={() => setTrendType(type)}
                >
                  {type === 'expenses' ? 'Expenses' : 'Income'}
                </button>
              ))}
            </div>
          </div>
          <TrendAreaChart data={trendData} />
        </div>
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div>
              <p className="text-sm text-slate-500">Quick actions</p>
              <h3 className="text-xl font-display text-slate-900">Capture activity</h3>
            </div>
            <QuickActions onAddExpense={() => setShowExpense(true)} onAddIncome={() => setShowIncome(true)} />
            {activeAlerts.length > 0 && (
              <div className="alerts-stack">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="alert-pill">
                    <span>{alert.message}</span>
                    <button type="button" onClick={() => handleDismissAlert(alert.id)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass-card p-5 space-y-3">
            <p className="text-sm text-slate-500">EMI reminders</p>
            {reminders?.length ? (
              reminders.slice(0, 3).map((reminder) => (
                <ReminderCard key={`${reminder.lender}-${reminder.emiNumber}`} reminder={reminder} />
              ))
            ) : (
              <p className="text-sm text-slate-500">No reminders for now.</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-slate-500">Goal progress</p>
            <h3 className="text-2xl font-display text-slate-900">Build towards milestones</h3>
          </div>
        </div>
        <form className="goal-builder" onSubmit={handleAddGoal}>
          <input
            type="text"
            name="name"
            placeholder="Goal name"
            value={goalForm.name}
            onChange={handleGoalFormChange}
            required
          />
          <input
            type="number"
            name="target"
            placeholder="Target amount"
            min="0"
            step="0.01"
            value={goalForm.target}
            onChange={handleGoalFormChange}
            required
          />
          <input
            type="number"
            name="saved"
            placeholder="Saved so far"
            min="0"
            step="0.01"
            value={goalForm.saved}
            onChange={handleGoalFormChange}
          />
          <button type="submit" className="btn-primary">
            Add goal
          </button>
        </form>
        {goals.length === 0 ? (
          <p className="text-sm text-slate-500">Add a goal to keep track of progress here.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
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
      </div>

      {showExpense && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="glass-card p-6 w-full max-w-md relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-slate-500"
              onClick={() => setShowExpense(false)}
            >
              x
            </button>
            <h3 className="text-xl font-display text-slate-900 mb-4">Record Expense</h3>
            <ExpenseForm onSubmit={(payload) => actions.addExpense(payload)} onCancel={() => setShowExpense(false)} />
          </div>
        </div>
      )}

      {showIncome && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="glass-card p-6 w-full max-w-md relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-slate-500"
              onClick={() => setShowIncome(false)}
            >
              x
            </button>
            <h3 className="text-xl font-display text-slate-900 mb-4">Record Income</h3>
            <IncomeForm onCancel={() => setShowIncome(false)} onSubmit={(payload) => actions.addIncome(payload)} />
          </div>
        </div>
      )}

      {showReminder && reminders?.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-6">
          <div className="glass-card p-6 w-full max-w-lg space-y-4 relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-slate-500"
              onClick={() => setShowReminder(false)}
            >
              x
            </button>
            <h3 className="text-2xl font-display text-slate-900">Upcoming EMIs</h3>
            <p className="text-sm text-slate-500">
              {`Stay on track! ${reminders?.length ?? 0} EMI${(reminders?.length ?? 0) > 1 ? 's' : ''} due this month.`}
            </p>
            <div className="space-y-3 max-h-72 overflow-auto pr-2">
              {reminders.map((reminder) => (
                <ReminderCard
                  key={`${reminder.lender}-${reminder.emiNumber}-modal`}
                  reminder={reminder}
                />
              ))}
            </div>
            <button type="button" className="btn-primary w-full" onClick={() => setShowReminder(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
