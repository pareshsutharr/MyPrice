import { Expense } from '../models/Expense.js'
import { Income } from '../models/Income.js'
import { Loan } from '../models/Loan.js'
import { Investment } from '../models/Investment.js'
import { LoanPayment } from '../models/LoanPayment.js'
import { CATEGORY_MAP } from '../../../shared/constants.js'

const formatMonth = (date) =>
  date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })

const buildMonthlyBuckets = (documents, amountKey = 'amount', months = 6) => {
  const now = new Date()
  const buckets = []
  for (let i = months - 1; i >= 0; i -= 1) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${ref.getFullYear()}-${ref.getMonth()}`
    buckets.push({ key, label: formatMonth(ref), total: 0 })
  }

  documents.forEach((doc) => {
    const date = new Date(doc.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const bucket = buckets.find((b) => b.key === key)
    if (bucket) bucket.total += doc[amountKey]
  })

  return buckets.map(({ label, total }) => ({ label, total }))
}

export const getStats = async (req, res) => {
  try {
    const [expenses, income, loans, investments, payments] = await Promise.all([
      Expense.find({ user: req.user._id }),
      Income.find({ user: req.user._id }),
      Loan.find({ user: req.user._id }),
      Investment.find({ user: req.user._id }),
      LoanPayment.find({ user: req.user._id }),
    ])

    const totalCredit = income.reduce((sum, entry) => sum + entry.amount, 0)
    const totalEmiPaid = payments.reduce((sum, entry) => sum + entry.amount, 0)
    const totalDebit = expenses.reduce((sum, entry) => sum + entry.amount, 0) + totalEmiPaid
    const emiPending = loans
      .filter((loan) => loan.status === 'active')
      .reduce((sum, loan) => sum + loan.monthlyEmi, 0)

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthExpenses = expenses.filter((exp) => exp.date >= monthStart)
    const thisMonthIncome = income.filter((ent) => ent.date >= monthStart)
    const thisMonthEmi = payments.filter((payment) => payment.date >= monthStart)

    const savingsThisMonth =
      thisMonthIncome.reduce((sum, ent) => sum + ent.amount, 0) -
      thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) -
      thisMonthEmi.reduce((sum, pmt) => sum + pmt.amount, 0) -
      emiPending

    const categoryDistribution = CATEGORY_DISTRIBUTION(expenses)

    res.json({
      totals: {
        totalCredit,
        totalDebit,
        emiPending,
        balance: totalCredit - totalDebit - emiPending,
      },
      thisMonth: {
        credit: thisMonthIncome.reduce((sum, ent) => sum + ent.amount, 0),
        debit: thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        savings: savingsThisMonth,
      },
      spendingTrend: buildMonthlyBuckets([...expenses, ...payments], 'amount'),
      monthlyExpenses: buildMonthlyBuckets([...expenses, ...payments], 'amount'),
      categoryDistribution,
      incomeSplit: income.reduce(
        (acc, entry) => {
          acc.needs += entry.split?.needs ?? entry.amount * 0.5
          acc.wants += entry.split?.wants ?? entry.amount * 0.3
          acc.savings += entry.split?.savings ?? entry.amount * 0.2
          return acc
        },
        { needs: 0, wants: 0, savings: 0 },
      ),
      reminders: buildEmiReminders(loans),
      investments: summarizeInvestments(investments),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute stats', error: error.message })
  }
}

const CATEGORY_DISTRIBUTION = (expenses) => {
  const distribution = {}
  expenses.forEach((expense) => {
    distribution[expense.category] = (distribution[expense.category] ?? 0) + expense.amount
  })
  return Object.entries(distribution).map(([category, value]) => {
    const meta = CATEGORY_MAP.find((c) => c.id === category)
    return {
      category: meta?.label ?? category,
      value,
      color: meta?.color ?? '#4f9cff',
    }
  })
}

const buildEmiReminders = (loans) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return loans
    .filter((loan) => loan.status === 'active')
    .map((loan) => {
      const startDate = new Date(loan.startDate)
      const monthsPassed =
        (currentYear - startDate.getFullYear()) * 12 + (currentMonth - startDate.getMonth())
      const emiNumber = monthsPassed + 1
      return {
        lender: loan.lender,
        monthlyEmi: loan.monthlyEmi,
        dueOn: new Date(currentYear, currentMonth, startDate.getDate()),
        emiNumber,
        totalMonths: loan.durationMonths,
      }
    })
}

const summarizeInvestments = (investments) => {
  if (!investments?.length) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalGain: 0,
      gainPercent: 0,
      topHoldings: [],
      byBroker: [],
    }
  }

  const holdings = investments.map((investment) => {
    const gain = (investment.currentValue ?? 0) - (investment.amountInvested ?? 0)
    return {
      id: investment._id,
      schemeName: investment.schemeName,
      platform: investment.platform,
      broker: investment.broker,
      brokers: investment.brokers?.length
        ? investment.brokers
        : [investment.broker ?? investment.platform ?? 'Manual'],
      amountInvested: investment.amountInvested ?? 0,
      currentValue: investment.currentValue ?? 0,
      lastUpdated: investment.lastUpdated,
      gain,
      gainPercent:
        investment.amountInvested > 0 ? (gain / investment.amountInvested) * 100 : 0,
    }
  })

  const totalInvested = holdings.reduce((sum, holding) => sum + holding.amountInvested, 0)
  const currentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0)
  const totalGain = currentValue - totalInvested
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const byBroker = Object.values(
    holdings.reduce((acc, holding) => {
      const brokerList =
        holding.brokers?.length > 0 ? holding.brokers : [holding.broker ?? holding.platform ?? 'Manual']
      brokerList.forEach((brokerName) => {
        const broker = brokerName || 'Manual'
        if (!acc[broker]) {
          acc[broker] = { broker, totalInvested: 0, currentValue: 0, totalGain: 0, holdings: 0 }
        }
        acc[broker].totalInvested += holding.amountInvested
        acc[broker].currentValue += holding.currentValue
        acc[broker].totalGain = acc[broker].currentValue - acc[broker].totalInvested
        acc[broker].holdings += 1
      })
      return acc
    }, {}),
  )

  return {
    totalInvested,
    currentValue,
    totalGain,
    gainPercent,
    topHoldings: holdings.sort((a, b) => b.gain - a.gain).slice(0, 3),
    byBroker,
  }
}
