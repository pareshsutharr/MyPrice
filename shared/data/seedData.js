import { CATEGORY_MAP, DEFAULT_CURRENCY, SAVINGS_RULE } from '../constants.js'

const toDate = (date) => new Date(date)

export const expenseSeed = [
  { amount: 420, category: 'food', date: toDate('2023-12-13'), note: 'Cafe lunch with team' },
  { amount: 250, category: 'travel', date: toDate('2023-12-13'), note: 'Metro top up' },
  { amount: 980, category: 'shopping', date: toDate('2023-12-14'), note: 'Grocery run' },
  { amount: 1500, category: 'emi', date: toDate('2023-12-14'), note: 'MPokket repayment' },
  { amount: 260, category: 'food', date: toDate('2023-12-15'), note: 'Evening snacks' },
  { amount: 560, category: 'travel', date: toDate('2023-12-15'), note: 'Cab to client office' },
  { amount: 1999, category: 'shopping', date: toDate('2023-12-16'), note: 'New headphones' },
  { amount: 750, category: 'others', date: toDate('2023-12-16'), note: 'Gym fees' },
  { amount: 320, category: 'food', date: toDate('2023-12-17'), note: 'Quick brunch' },
  { amount: 1400, category: 'emi', date: toDate('2023-12-17'), note: 'True Balance EMI' },
  { amount: 899, category: 'shopping', date: toDate('2023-12-18'), note: 'Festival decor' },
  { amount: 480, category: 'others', date: toDate('2023-12-18'), note: 'Petrol refill' },
]

export const incomeSeed = [
  {
    amount: 60000,
    category: 'salary',
    date: toDate('2023-12-01'),
    note: 'Monthly salary',
    split: {
      needs: 60000 * SAVINGS_RULE.needs,
      wants: 60000 * SAVINGS_RULE.wants,
      savings: 60000 * SAVINGS_RULE.savings,
    },
  },
  {
    amount: 15000,
    category: 'freelance',
    date: toDate('2023-12-10'),
    note: 'UI contract',
    split: {
      needs: 15000 * SAVINGS_RULE.needs,
      wants: 15000 * SAVINGS_RULE.wants,
      savings: 15000 * SAVINGS_RULE.savings,
    },
  },
]

const mpokketLoans = [
  {
    lender: 'MPokket',
    principal: 8000,
    interestRate: 17,
    monthlyEmi: 1450,
    durationMonths: 6,
    startDate: toDate('2023-08-01'),
    status: 'completed',
  },
  {
    lender: 'MPokket',
    principal: 10000,
    interestRate: 19,
    monthlyEmi: 1850,
    durationMonths: 6,
    startDate: toDate('2023-09-15'),
    status: 'completed',
  },
  {
    lender: 'MPokket',
    principal: 6000,
    interestRate: 18,
    monthlyEmi: 1120,
    durationMonths: 5,
    startDate: toDate('2023-10-10'),
    status: 'active',
  },
  {
    lender: 'MPokket',
    principal: 9000,
    interestRate: 20,
    monthlyEmi: 1720,
    durationMonths: 6,
    startDate: toDate('2023-11-05'),
    status: 'active',
  },
  {
    lender: 'MPokket',
    principal: 12000,
    interestRate: 21,
    monthlyEmi: 2150,
    durationMonths: 8,
    startDate: toDate('2023-11-20'),
    status: 'active',
  },
]

export const loanSeed = [
  ...mpokketLoans,
  {
    lender: 'FDPL',
    principal: 35000,
    interestRate: 15,
    monthlyEmi: 3200,
    durationMonths: 12,
    startDate: toDate('2023-07-01'),
    status: 'active',
  },
  {
    lender: 'Phone Loan',
    principal: 28000,
    interestRate: 14,
    monthlyEmi: 2500,
    durationMonths: 12,
    startDate: toDate('2023-06-20'),
    status: 'active',
  },
  {
    lender: 'True Balance',
    principal: 18000,
    interestRate: 16,
    monthlyEmi: 1650,
    durationMonths: 10,
    startDate: toDate('2023-05-15'),
    status: 'completed',
  },
  {
    lender: 'Personal Lending - Divesh',
    principal: 22000,
    interestRate: 10,
    monthlyEmi: 2000,
    durationMonths: 11,
    startDate: toDate('2023-09-12'),
    status: 'active',
  },
]

export const settingsSeed = {
  currency: DEFAULT_CURRENCY,
  categories: CATEGORY_MAP,
}

const angelOneStatementDate = toDate('2025-12-31')
const growwStatementDate = toDate('2026-01-01')

const buildInvestmentKey = ({ schemeName, folioNumber, isin }) => {
  const normalize = (value) => (value ? String(value).trim().toLowerCase() : '')
  const scheme = normalize(schemeName)
  const folio = normalize(folioNumber)
  const identifier = normalize(isin)
  const fallback = scheme || identifier || folio
  if (!fallback) return null
  return [scheme || fallback, folio || identifier, identifier].filter(Boolean).join('__')
}

const mergeHoldings = (preferred, fallback) => {
  const brokers = new Set([
    ...(fallback?.brokers ?? []),
    fallback?.broker ?? fallback?.platform,
    ...(preferred?.brokers ?? []),
    preferred?.broker ?? preferred?.platform,
  ])
  return {
    ...fallback,
    ...preferred,
    brokers: Array.from(brokers).filter(Boolean),
  }
}

const angelOneHoldings = [
  {
    schemeName: 'Bandhan Small Cap Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 2999.85,
    currentValue: 3031.39,
    units: 59.578,
    isin: 'INF194KB1AL4',
    category: 'Equity',
    subCategory: 'Small Cap Fund',
    folioNumber: '7270855/19',
    averageNav: 50.352,
    nav: 50.881,
    lastStatementDate: angelOneStatementDate,
    notes: 'Auto-imported from Angel One statement',
  },
  {
    schemeName: 'SBI PSU Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 4499.81,
    currentValue: 4690.5,
    units: 125.089,
    isin: 'INF200K01UY4',
    category: 'Equity',
    subCategory: 'Sectoral / Thematic',
    folioNumber: '46575332',
    averageNav: 35.973,
    nav: 37.497,
    lastStatementDate: angelOneStatementDate,
  },
  {
    schemeName: 'Nippon India Small Cap Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 499.89,
    currentValue: 493.55,
    units: 2.639,
    isin: 'INF204K01K15',
    category: 'Equity',
    subCategory: 'Small Cap Fund',
    folioNumber: '488438718884',
    averageNav: 189.423,
    nav: 187.021,
    lastStatementDate: angelOneStatementDate,
  },
  {
    schemeName: 'Nippon India Large Cap Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 2099.93,
    currentValue: 2128.23,
    units: 20.203,
    isin: 'INF204K01XI3',
    category: 'Equity',
    subCategory: 'Large Cap Fund',
    folioNumber: '488438718884',
    averageNav: 103.941,
    nav: 105.342,
    lastStatementDate: angelOneStatementDate,
  },
  {
    schemeName: 'Invesco India Smallcap Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 499.99,
    currentValue: 507.63,
    units: 10.912,
    isin: 'INF205K013T3',
    category: 'Equity',
    subCategory: 'Small Cap Fund',
    folioNumber: '31039822491',
    averageNav: 45.82,
    nav: 46.52,
    lastStatementDate: angelOneStatementDate,
  },
  {
    schemeName: 'JioBlackRock Nifty Smallcap 250 Index Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 1999.9,
    currentValue: 2018.42,
    units: 204.484,
    isin: 'INF22M001051',
    category: 'Other',
    subCategory: 'Index Fund',
    folioNumber: '1333947',
    averageNav: 9.78,
    nav: 9.871,
    lastStatementDate: angelOneStatementDate,
  },
  {
    schemeName: 'Motilal Oswal Large and Midcap Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 3999.79,
    currentValue: 3968.91,
    units: 108.688,
    isin: 'INF247L01999',
    category: 'Equity',
    subCategory: 'Large & Mid Cap Fund',
    folioNumber: '910142250792',
    averageNav: 36.801,
    nav: 36.517,
    lastStatementDate: angelOneStatementDate,
  },
  {
    schemeName: 'Parag Parikh Flexi Cap Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 4999.75,
    currentValue: 5066.9,
    units: 53.24,
    isin: 'INF879O01027',
    category: 'Equity',
    subCategory: 'Flexi Cap Fund',
    folioNumber: '18286795',
    averageNav: 93.91,
    nav: 95.171,
    lastStatementDate: angelOneStatementDate,
  },
  {
    schemeName: 'Sundaram Mid Cap Fund',
    platform: 'Angel One',
    broker: 'Angel One',
    source: 'Angel One 2025-12-31',
    amountInvested: 3000.11,
    currentValue: 3075.72,
    units: 1.954,
    isin: 'INF903J01MJ3',
    category: 'Equity',
    subCategory: 'Mid Cap Fund',
    folioNumber: '61016220581',
    averageNav: 1535.368,
    nav: 1574.066,
    lastStatementDate: angelOneStatementDate,
  },
]

const growwHoldings = [
  {
    schemeName: 'Parag Parikh Flexi Cap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 4999.75,
    currentValue: 5066.9,
    units: 53.24,
    category: 'Equity',
    subCategory: 'Flexi Cap',
    folioNumber: '18286795',
    xirr: 9.33,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Invesco India Largecap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 3999.79,
    currentValue: 3977.94,
    units: 46.493,
    category: 'Equity',
    subCategory: 'Large Cap',
    folioNumber: '31038685123',
    xirr: -3.84,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Motilal Oswal Large and Midcap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 3999.79,
    currentValue: 3968.91,
    units: 108.688,
    category: 'Equity',
    subCategory: 'Large & MidCap',
    folioNumber: '910142250792',
    xirr: -5.07,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Bandhan Small Cap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 2999.85,
    currentValue: 3031.39,
    units: 59.578,
    category: 'Equity',
    subCategory: 'Small Cap',
    folioNumber: '7270855',
    xirr: 7.24,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'SBI PSU Direct Plan Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 4499.81,
    currentValue: 4690.5,
    units: 125.089,
    category: 'Equity',
    subCategory: 'Thematic',
    folioNumber: '46575332',
    xirr: 40.32,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Nippon India Growth Mid Cap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 1998.98,
    currentValue: 1974.06,
    units: 0.425,
    category: 'Equity',
    subCategory: 'Mid Cap',
    folioNumber: '477398019511',
    xirr: -7.47,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Nippon India Small Cap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 499.89,
    currentValue: 493.55,
    units: 2.639,
    category: 'Equity',
    subCategory: 'Small Cap',
    folioNumber: '488438718884',
    xirr: -5.46,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Quant Flexi Cap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 4999.77,
    currentValue: 5017.22,
    units: 45.362,
    category: 'Equity',
    subCategory: 'Flexi Cap',
    folioNumber: '510101237775',
    xirr: 2.52,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Navi Nifty 50 Index Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 10,
    currentValue: 14.6,
    units: 0.853,
    category: 'Equity',
    subCategory: 'Large Cap',
    folioNumber: '9775248929',
    xirr: 15.47,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'JioBlackRock Nifty Smallcap 250 Index Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 1999.9,
    currentValue: 2018.42,
    units: 204.484,
    category: 'Equity',
    subCategory: 'Small Cap',
    folioNumber: '1333947',
    xirr: 6.36,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'ICICI Prudential Equity & Debt Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 4999.96,
    currentValue: 5042.41,
    units: 11.026,
    category: 'Hybrid',
    subCategory: 'Aggressive Hybrid',
    folioNumber: '27183843',
    xirr: 5.37,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Nippon India Large Cap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 2099.93,
    currentValue: 2128.23,
    units: 20.203,
    category: 'Equity',
    subCategory: 'Large Cap',
    folioNumber: '488438718884',
    xirr: 12.35,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Sundaram Mid Cap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 3000.11,
    currentValue: 3075.72,
    units: 1.954,
    category: 'Equity',
    subCategory: 'Mid Cap',
    folioNumber: '61016220581',
    xirr: 18.06,
    lastStatementDate: growwStatementDate,
  },
  {
    schemeName: 'Invesco India Smallcap Fund Direct Growth',
    platform: 'Groww',
    broker: 'Groww',
    source: 'Groww 2026-01-01',
    amountInvested: 499.99,
    currentValue: 507.63,
    units: 10.912,
    category: 'Equity',
    subCategory: 'Small Cap',
    folioNumber: '31039822491',
    lastStatementDate: growwStatementDate,
  },
]

const dedupeHoldings = (holdings) => {
  const map = new Map()
  holdings.forEach((holding) => {
    const key =
      holding.uniqueKey ??
      buildInvestmentKey({
        schemeName: holding.schemeName,
        folioNumber: holding.folioNumber,
        isin: holding.isin,
      })
    if (!key) {
      map.set(`${holding.schemeName}-${Math.random()}`, holding)
      return
    }
    if (!map.has(key)) {
      map.set(key, { ...holding, brokers: [holding.broker ?? holding.platform ?? 'Manual'] })
    } else {
      const existing = map.get(key)
      const newer =
        (holding.lastStatementDate && existing.lastStatementDate
          ? new Date(holding.lastStatementDate) > new Date(existing.lastStatementDate)
          : Boolean(holding.lastStatementDate)) || !existing.lastStatementDate
      const merged = mergeHoldings(newer ? holding : existing, newer ? existing : holding)
      map.set(key, merged)
    }
  })
  return Array.from(map.values())
}

export const investmentSeed = dedupeHoldings([...angelOneHoldings, ...growwHoldings])
