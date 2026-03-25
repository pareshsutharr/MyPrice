import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ChevronDown, Download, FileSpreadsheet } from 'lucide-react'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './ItrFiling.css'

const TABS = ['Personal Info', 'Income Sources', 'Deductions', 'Summary']

const DEFAULT_STATE = {
  personal: {
    fullName: '',
    pan: '',
    assessmentYear: '2025-26',
    filingStatus: 'Individual',
    residentialStatus: 'Resident',
  },
  income: {
    grossSalary: '',
    basicSalary: '',
    hraReceived: '',
    standardDeduction: '50000',
    metroCity: true,
    businessProfit: '',
    shortTermCapitalGains: '',
    longTermCapitalGains: '',
    interestIncome: '',
    dividendIncome: '',
    otherIncome: '',
  },
  deductions: {
    ppf: '',
    elss: '',
    lic: '',
    epf: '',
    homeLoanPrincipal: '',
    healthInsurance: '',
    savingsInterest: '',
  },
}

const COLLAPSIBLE_DEFAULTS = {
  salary: true,
  business: false,
  gains: false,
  other: false,
}

const formatNumberInput = (value) => value.replace(/[^\d.]/g, '')

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const panIsValid = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test((pan ?? '').trim().toUpperCase())

const buildStorageKey = (assessmentYear) => `itr-${assessmentYear}`

const cloneDefaultState = () => JSON.parse(JSON.stringify(DEFAULT_STATE))

const loadState = (assessmentYear) => {
  if (typeof window === 'undefined') return cloneDefaultState()
  try {
    const raw = window.localStorage.getItem(buildStorageKey(assessmentYear))
    if (!raw) {
      const fallback = cloneDefaultState()
      fallback.personal.assessmentYear = assessmentYear
      return fallback
    }
    const parsed = JSON.parse(raw)
    return {
      ...cloneDefaultState(),
      ...parsed,
      personal: {
        ...cloneDefaultState().personal,
        ...(parsed.personal ?? {}),
        assessmentYear,
      },
      income: {
        ...cloneDefaultState().income,
        ...(parsed.income ?? {}),
      },
      deductions: {
        ...cloneDefaultState().deductions,
        ...(parsed.deductions ?? {}),
      },
    }
  } catch (error) {
    console.warn('Unable to load ITR draft', error)
    const fallback = cloneDefaultState()
    fallback.personal.assessmentYear = assessmentYear
    return fallback
  }
}

const computeNewRegimeTax = (taxableIncome) => {
  const slabs = [
    [300000, 0],
    [300000, 0.05],
    [300000, 0.1],
    [300000, 0.15],
    [300000, 0.2],
    [Infinity, 0.3],
  ]
  let remaining = Math.max(taxableIncome, 0)
  let tax = 0
  for (const [amount, rate] of slabs) {
    if (remaining <= 0) break
    const portion = Math.min(remaining, amount)
    tax += portion * rate
    remaining -= portion
  }
  return tax * 1.04
}

const computeOldRegimeTax = (taxableIncome) => {
  const slabs = [
    [250000, 0],
    [250000, 0.05],
    [500000, 0.2],
    [Infinity, 0.3],
  ]
  let remaining = Math.max(taxableIncome, 0)
  let tax = 0
  for (const [amount, rate] of slabs) {
    if (remaining <= 0) break
    const portion = Math.min(remaining, amount)
    tax += portion * rate
    remaining -= portion
  }
  return tax * 1.04
}

const ItrFiling = () => {
  const formatCurrency = useCurrencyFormatter()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [openSections, setOpenSections] = useState(COLLAPSIBLE_DEFAULTS)
  const [form, setForm] = useState(() => loadState(DEFAULT_STATE.personal.assessmentYear))

  const assessmentYear = form.personal.assessmentYear

  useEffect(() => {
    setForm(loadState(assessmentYear))
  }, [assessmentYear])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(buildStorageKey(form.personal.assessmentYear), JSON.stringify(form))
      } catch (error) {
        console.warn('Unable to persist ITR draft', error)
      }
    }, 500)
    return () => window.clearTimeout(timer)
  }, [form])

  const updateSection = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const incomeSummary = useMemo(() => {
    const grossSalary = toNumber(form.income.grossSalary)
    const standardDeduction = toNumber(form.income.standardDeduction)
    const businessProfit = toNumber(form.income.businessProfit)
    const shortTermCapitalGains = toNumber(form.income.shortTermCapitalGains)
    const longTermCapitalGains = toNumber(form.income.longTermCapitalGains)
    const interestIncome = toNumber(form.income.interestIncome)
    const dividendIncome = toNumber(form.income.dividendIncome)
    const otherIncome = toNumber(form.income.otherIncome)

    const salaryAfterStandardDeduction = Math.max(grossSalary - standardDeduction, 0)
    const grossTotalIncome =
      salaryAfterStandardDeduction +
      businessProfit +
      shortTermCapitalGains +
      longTermCapitalGains +
      interestIncome +
      dividendIncome +
      otherIncome

    return {
      grossSalary,
      standardDeduction,
      salaryAfterStandardDeduction,
      businessProfit,
      shortTermCapitalGains,
      longTermCapitalGains,
      interestIncome,
      dividendIncome,
      otherIncome,
      grossTotalIncome,
    }
  }, [form.income])

  const deductionSummary = useMemo(() => {
    const hraReceived = toNumber(form.income.hraReceived)
    const basicSalary = toNumber(form.income.basicSalary)
    const isMetro = Boolean(form.income.metroCity)
    const hraCapByCity = basicSalary * (isMetro ? 0.5 : 0.4)
    const hraOverTenPercent = Math.max(hraReceived - basicSalary * 0.1, 0)
    const hraExemption = Math.min(hraReceived, hraCapByCity, hraOverTenPercent)

    const deduction80C =
      toNumber(form.deductions.ppf) +
      toNumber(form.deductions.elss) +
      toNumber(form.deductions.lic) +
      toNumber(form.deductions.epf) +
      toNumber(form.deductions.homeLoanPrincipal)

    const capped80C = Math.min(deduction80C, 150000)
    const capped80D = Math.min(toNumber(form.deductions.healthInsurance), 25000)
    const capped80TTA = Math.min(toNumber(form.deductions.savingsInterest), 10000)
    const totalDeductions = capped80C + capped80D + capped80TTA + hraExemption

    return {
      hraExemption,
      capped80C,
      capped80D,
      capped80TTA,
      totalDeductions,
    }
  }, [form.deductions, form.income.basicSalary, form.income.hraReceived, form.income.metroCity])

  const summary = useMemo(() => {
    const taxableIncome = Math.max(incomeSummary.grossTotalIncome - deductionSummary.totalDeductions, 0)
    const newRegimeTax = computeNewRegimeTax(taxableIncome)
    const oldRegimeTaxableIncome = Math.max(incomeSummary.grossTotalIncome - deductionSummary.totalDeductions, 0)
    const oldRegimeTax = computeOldRegimeTax(oldRegimeTaxableIncome)
    return {
      grossIncome: incomeSummary.grossTotalIncome,
      totalDeductions: deductionSummary.totalDeductions,
      taxableIncome,
      newRegimeTax,
      oldRegimeTax,
    }
  }, [deductionSummary.totalDeductions, incomeSummary.grossTotalIncome])

  const personalInfoComplete = form.personal.fullName.trim() && panIsValid(form.personal.pan)

  return (
    <div className="page-stack itr-page">
      <section className="page-section itr-shell">
        <div className="itr-header">
          <div>
            <p className="itr-kicker">ITR Filing</p>
            <h1 className="text-2xl font-display">Income tax estimation workspace</h1>
            <p className="text-sm text-slate-500">
              Build a year-specific draft, compare regimes, and print a clean summary for review with your CA.
            </p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Download PDF Summary
          </button>
        </div>

        <div className="itr-tabs" role="tablist" aria-label="ITR filing sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`itr-tab ${activeTab === tab ? 'itr-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Personal Info' && (
          <section className="itr-panel">
            <div className="itr-grid">
              <label className="itr-field">
                <span>Full Name</span>
                <input
                  id="itr-full-name"
                  value={form.personal.fullName}
                  onChange={(event) => updateSection('personal', 'fullName', event.target.value)}
                />
              </label>
              <label className="itr-field">
                <span>PAN</span>
                <input
                  id="itr-pan"
                  value={form.personal.pan}
                  onChange={(event) => updateSection('personal', 'pan', event.target.value.toUpperCase())}
                />
                {form.personal.pan && !panIsValid(form.personal.pan) && (
                  <small className="itr-field__error">PAN must match AAAAA9999A format.</small>
                )}
              </label>
              <label className="itr-field">
                <span>Assessment Year</span>
                <select
                  id="itr-year"
                  value={form.personal.assessmentYear}
                  onChange={(event) => updateSection('personal', 'assessmentYear', event.target.value)}
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                </select>
              </label>
              <label className="itr-field">
                <span>Filing Status</span>
                <select
                  id="itr-filing-status"
                  value={form.personal.filingStatus}
                  onChange={(event) => updateSection('personal', 'filingStatus', event.target.value)}
                >
                  <option value="Individual">Individual</option>
                  <option value="HUF">HUF</option>
                  <option value="Firm">Firm</option>
                </select>
              </label>
              <label className="itr-field">
                <span>Residential Status</span>
                <select
                  id="itr-residential-status"
                  value={form.personal.residentialStatus}
                  onChange={(event) => updateSection('personal', 'residentialStatus', event.target.value)}
                >
                  <option value="Resident">Resident</option>
                  <option value="NRI">NRI</option>
                </select>
              </label>
            </div>
          </section>
        )}

        {activeTab === 'Income Sources' && (
          <section className="itr-panel">
            {[
              ['salary', 'Salary'],
              ['business', 'Business/Profession'],
              ['gains', 'Capital Gains'],
              ['other', 'Other Sources'],
            ].map(([key, title]) => (
              <section key={key} className="itr-collapsible">
                <button
                  type="button"
                  className="itr-collapsible__trigger"
                  onClick={() => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))}
                >
                  <span>{title}</span>
                  <ChevronDown className={`h-4 w-4 ${openSections[key] ? 'itr-rotate' : ''}`} />
                </button>

                {openSections[key] && key === 'salary' && (
                  <div className="itr-grid">
                    <label className="itr-field">
                      <span>Gross Salary</span>
                      <input
                        value={form.income.grossSalary}
                        onChange={(event) => updateSection('income', 'grossSalary', formatNumberInput(event.target.value))}
                      />
                    </label>
                    <label className="itr-field">
                      <span>Basic Salary</span>
                      <input
                        value={form.income.basicSalary}
                        onChange={(event) => updateSection('income', 'basicSalary', formatNumberInput(event.target.value))}
                      />
                    </label>
                    <label className="itr-field">
                      <span>HRA Received</span>
                      <input
                        value={form.income.hraReceived}
                        onChange={(event) => updateSection('income', 'hraReceived', formatNumberInput(event.target.value))}
                      />
                    </label>
                    <label className="itr-field">
                      <span>Standard Deduction</span>
                      <input
                        value={form.income.standardDeduction}
                        onChange={(event) =>
                          updateSection('income', 'standardDeduction', formatNumberInput(event.target.value))
                        }
                      />
                    </label>
                    <label className="itr-field itr-field--checkbox">
                      <input
                        type="checkbox"
                        checked={form.income.metroCity}
                        onChange={(event) => updateSection('income', 'metroCity', event.target.checked)}
                      />
                      <span>Metro city for HRA exemption</span>
                    </label>
                  </div>
                )}

                {openSections[key] && key === 'business' && (
                  <div className="itr-grid">
                    <label className="itr-field">
                      <span>Net Profit</span>
                      <input
                        value={form.income.businessProfit}
                        onChange={(event) =>
                          updateSection('income', 'businessProfit', formatNumberInput(event.target.value))
                        }
                      />
                    </label>
                  </div>
                )}

                {openSections[key] && key === 'gains' && (
                  <div className="itr-grid">
                    <label className="itr-field">
                      <span>Short-term Capital Gains (15%)</span>
                      <input
                        value={form.income.shortTermCapitalGains}
                        onChange={(event) =>
                          updateSection('income', 'shortTermCapitalGains', formatNumberInput(event.target.value))
                        }
                      />
                    </label>
                    <label className="itr-field">
                      <span>Long-term Capital Gains (10% above 1L)</span>
                      <input
                        value={form.income.longTermCapitalGains}
                        onChange={(event) =>
                          updateSection('income', 'longTermCapitalGains', formatNumberInput(event.target.value))
                        }
                      />
                    </label>
                  </div>
                )}

                {openSections[key] && key === 'other' && (
                  <div className="itr-grid">
                    <label className="itr-field">
                      <span>Interest Income</span>
                      <input
                        value={form.income.interestIncome}
                        onChange={(event) =>
                          updateSection('income', 'interestIncome', formatNumberInput(event.target.value))
                        }
                      />
                    </label>
                    <label className="itr-field">
                      <span>Dividend Income</span>
                      <input
                        value={form.income.dividendIncome}
                        onChange={(event) =>
                          updateSection('income', 'dividendIncome', formatNumberInput(event.target.value))
                        }
                      />
                    </label>
                    <label className="itr-field">
                      <span>Other</span>
                      <input
                        value={form.income.otherIncome}
                        onChange={(event) => updateSection('income', 'otherIncome', formatNumberInput(event.target.value))}
                      />
                    </label>
                  </div>
                )}
              </section>
            ))}

            <div className="itr-summary-strip">
              <span>Gross Total Income</span>
              <strong>{formatCurrency(incomeSummary.grossTotalIncome)}</strong>
            </div>
          </section>
        )}

        {activeTab === 'Deductions' && (
          <section className="itr-panel">
            <div className="itr-grid">
              <label className="itr-field">
                <span>80C · PPF</span>
                <input value={form.deductions.ppf} onChange={(event) => updateSection('deductions', 'ppf', formatNumberInput(event.target.value))} />
              </label>
              <label className="itr-field">
                <span>80C · ELSS</span>
                <input value={form.deductions.elss} onChange={(event) => updateSection('deductions', 'elss', formatNumberInput(event.target.value))} />
              </label>
              <label className="itr-field">
                <span>80C · LIC</span>
                <input value={form.deductions.lic} onChange={(event) => updateSection('deductions', 'lic', formatNumberInput(event.target.value))} />
              </label>
              <label className="itr-field">
                <span>80C · EPF</span>
                <input value={form.deductions.epf} onChange={(event) => updateSection('deductions', 'epf', formatNumberInput(event.target.value))} />
              </label>
              <label className="itr-field">
                <span>80C · Home Loan Principal</span>
                <input
                  value={form.deductions.homeLoanPrincipal}
                  onChange={(event) => updateSection('deductions', 'homeLoanPrincipal', formatNumberInput(event.target.value))}
                />
              </label>
              <label className="itr-field">
                <span>80D · Health Insurance Premiums</span>
                <input
                  value={form.deductions.healthInsurance}
                  onChange={(event) => updateSection('deductions', 'healthInsurance', formatNumberInput(event.target.value))}
                />
              </label>
              <label className="itr-field">
                <span>80TTA · Savings Account Interest</span>
                <input
                  value={form.deductions.savingsInterest}
                  onChange={(event) => updateSection('deductions', 'savingsInterest', formatNumberInput(event.target.value))}
                />
              </label>
            </div>

            <div className="itr-deduction-grid">
              <div className="itr-deduction-card">
                <span>80C eligible</span>
                <strong>{formatCurrency(deductionSummary.capped80C)}</strong>
              </div>
              <div className="itr-deduction-card">
                <span>80D eligible</span>
                <strong>{formatCurrency(deductionSummary.capped80D)}</strong>
              </div>
              <div className="itr-deduction-card">
                <span>80TTA eligible</span>
                <strong>{formatCurrency(deductionSummary.capped80TTA)}</strong>
              </div>
              <div className="itr-deduction-card">
                <span>HRA exemption</span>
                <strong>{formatCurrency(deductionSummary.hraExemption)}</strong>
              </div>
            </div>

            <div className="itr-summary-strip">
              <span>Total Deductions</span>
              <strong>{formatCurrency(deductionSummary.totalDeductions)}</strong>
            </div>
          </section>
        )}

        {activeTab === 'Summary' && (
          <section className="itr-panel itr-print-surface">
            <div className="itr-warning" role="alert">
              <AlertTriangle className="h-5 w-5" />
              <p>
                This tool is for estimation only. It is not a tax filing service. Please consult a Chartered
                Accountant for actual filing.
              </p>
            </div>

            <div className="itr-report-grid">
              <div className="itr-report-card">
                <span>Gross Income</span>
                <strong>{formatCurrency(summary.grossIncome)}</strong>
              </div>
              <div className="itr-report-card">
                <span>Total Deductions</span>
                <strong>{formatCurrency(summary.totalDeductions)}</strong>
              </div>
              <div className="itr-report-card">
                <span>Taxable Income</span>
                <strong>{formatCurrency(summary.taxableIncome)}</strong>
              </div>
              <div className="itr-report-card">
                <span>Personal Info Status</span>
                <strong>{personalInfoComplete ? 'Ready' : 'Needs PAN / name'}</strong>
              </div>
            </div>

            <div className="itr-comparison">
              <div className="itr-comparison__header">
                <div>
                  <p className="itr-kicker">Regime Comparison</p>
                  <h3 className="text-xl font-display">Old vs new regime estimate</h3>
                </div>
                <div className="itr-comparison__badge">
                  <FileSpreadsheet className="h-4 w-4" />
                  AY {form.personal.assessmentYear}
                </div>
              </div>

              <table className="itr-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Old Regime</th>
                    <th>New Regime</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gross Income</td>
                    <td>{formatCurrency(summary.grossIncome)}</td>
                    <td>{formatCurrency(summary.grossIncome)}</td>
                  </tr>
                  <tr>
                    <td>Total Deductions</td>
                    <td>{formatCurrency(summary.totalDeductions)}</td>
                    <td>{formatCurrency(summary.totalDeductions)}</td>
                  </tr>
                  <tr>
                    <td>Taxable Income</td>
                    <td>{formatCurrency(summary.taxableIncome)}</td>
                    <td>{formatCurrency(summary.taxableIncome)}</td>
                  </tr>
                  <tr>
                    <td>Estimated Tax + 4% cess</td>
                    <td>{formatCurrency(summary.oldRegimeTax)}</td>
                    <td>{formatCurrency(summary.newRegimeTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </div>
  )
}

export default ItrFiling
