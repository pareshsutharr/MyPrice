import { expenseSeed, incomeSeed, investmentSeed, loanSeed } from '@shared/data/seedData.js'
import { CATEGORY_MAP } from '@shared/constants.js'

const withClientId = (collection, prefix) =>
  collection.map((item, index) => ({
    ...item,
    date: new Date(item.date).toISOString(),
    _id: `${prefix}-${index}`,
  }))

export const mockExpenses = withClientId(expenseSeed, 'expense')
export const mockIncome = withClientId(incomeSeed, 'income')

export const mockLoans = loanSeed.map((item, index) => {
  const startDate = new Date(item.startDate).toISOString()
  const monthsElapsed =
    (new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  const emiPaid = Math.min(Math.round(monthsElapsed), item.durationMonths)
  const progress = {
    emiPaid,
    completion: (emiPaid / item.durationMonths) * 100,
    remaining:
      item.principal + (item.principal * item.interestRate) / 100 - item.monthlyEmi * emiPaid,
  }
  return {
    ...item,
    startDate,
    _id: `loan-${index}`,
    status: item.status ?? (emiPaid >= item.durationMonths ? 'completed' : 'active'),
    progress: {
      ...progress,
      remaining: Math.max(progress.remaining, 0),
    },
  }
})

export const mockInvestments = investmentSeed.map((item, index) => {
  const amountInvested = item.amountInvested ?? 0
  const currentValue = item.currentValue ?? amountInvested
  const gain = currentValue - amountInvested
  const brokers =
    item.brokers?.length > 0 ? item.brokers : [item.broker ?? item.platform ?? 'Manual']
  return {
    ...item,
    _id: `investment-${index}`,
    lastUpdated: new Date(item.lastStatementDate ?? Date.now()).toISOString(),
    gain,
    gainPercent: amountInvested ? (gain / amountInvested) * 100 : 0,
    brokers,
  }
})

const sum = (list, selector = (itm) => itm.amount) => list.reduce((acc, itm) => acc + selector(itm), 0)
const totalCredit = sum(incomeSeed)
const totalDebit = sum(expenseSeed)
const emiPending = loanSeed
  .filter((loan) => new Date(loan.startDate).getTime() <= Date.now())
  .reduce((acc, loan) => acc + loan.monthlyEmi, 0)

const totalInvested = sum(investmentSeed, (entry) => entry.amountInvested)
const totalCurrentValue = sum(investmentSeed, (entry) => entry.currentValue)
const totalInvestmentGain = totalCurrentValue - totalInvested

const monthFilter = (date) => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(date) >= monthStart
}

const thisMonthCredit = sum(incomeSeed.filter((entry) => monthFilter(entry.date)))
const thisMonthDebit = sum(expenseSeed.filter((entry) => monthFilter(entry.date)))

const buildMonthly = (collection) => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, idx) => {
    const pivot = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
    const label = pivot.toLocaleDateString('en-IN', { month: 'short' })
    const total = collection
      .filter((entry) => {
        const date = new Date(entry.date)
        return date.getMonth() === pivot.getMonth() && date.getFullYear() === pivot.getFullYear()
      })
      .reduce((sum, ent) => sum + ent.amount, 0)
    return { label, total }
  })
}

const categoryDistribution = CATEGORY_MAP.map((category) => ({
  category: category.label,
  value: expenseSeed
    .filter((expense) => expense.category === category.id)
    .reduce((sum, exp) => sum + exp.amount, 0),
  color: category.color,
})).filter((entry) => entry.value > 0)

export const mockStats = {
  totals: {
    totalCredit,
    totalDebit,
    emiPending,
    balance: totalCredit - totalDebit - emiPending,
  },
  thisMonth: {
    credit: thisMonthCredit,
    debit: thisMonthDebit,
    savings: thisMonthCredit - thisMonthDebit - emiPending,
  },
  spendingTrend: buildMonthly(expenseSeed),
  monthlyExpenses: buildMonthly(expenseSeed),
  categoryDistribution,
  incomeSplit: {
    needs: sum(incomeSeed, (entry) => entry.split?.needs ?? entry.amount * 0.5),
    wants: sum(incomeSeed, (entry) => entry.split?.wants ?? entry.amount * 0.3),
    savings: sum(incomeSeed, (entry) => entry.split?.savings ?? entry.amount * 0.2),
  },
  reminders: loanSeed
    .filter((loan) => !loan.completed)
    .map((loan) => ({
      lender: loan.lender,
      monthlyEmi: loan.monthlyEmi,
      dueOn: new Date().toISOString(),
      emiNumber: 1,
      totalMonths: loan.durationMonths,
    })),
  investments: {
    totalInvested,
    currentValue: totalCurrentValue,
    totalGain: totalInvestmentGain,
    gainPercent: totalInvested ? (totalInvestmentGain / totalInvested) * 100 : 0,
    topHoldings: mockInvestments
      .map((item) => ({
        id: item._id,
        schemeName: item.schemeName,
        platform: item.platform,
        broker: item.broker,
        amountInvested: item.amountInvested,
        currentValue: item.currentValue,
        gain: item.gain,
        gainPercent: item.gainPercent,
      }))
      .sort((a, b) => b.gain - a.gain)
      .slice(0, 5),
    byBroker: Object.values(
      investmentSeed.reduce((acc, holding) => {
        const brokerList =
          holding.brokers?.length > 0
            ? holding.brokers
            : [holding.broker ?? holding.platform ?? 'Manual']
        brokerList.forEach((brokerName) => {
          const broker = brokerName || 'Manual'
          if (!acc[broker]) {
            acc[broker] = { broker, totalInvested: 0, currentValue: 0, totalGain: 0, holdings: 0 }
          }
          acc[broker].totalInvested += holding.amountInvested ?? 0
          acc[broker].currentValue += holding.currentValue ?? 0
          acc[broker].totalGain = acc[broker].currentValue - acc[broker].totalInvested
          acc[broker].holdings += 1
        })
        return acc
      }, {}),
    ),
  },
}

export const mockHistory = [
  ...mockIncome.map((entry) => ({
    id: entry._id,
    type: 'income',
    amount: entry.amount,
    date: entry.date,
    note: entry.note,
  })),
  ...mockExpenses.map((entry) => ({
    id: entry._id,
    type: 'expense',
    amount: entry.amount,
    date: entry.date,
    note: entry.note,
  })),
]
