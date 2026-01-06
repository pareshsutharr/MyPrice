import { useMemo, useState, useCallback } from 'react'
import { FileText, CalendarCheck2, AlarmClock, Download } from 'lucide-react'
import { useFinance } from '@context/FinanceContext.jsx'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './ItrFiling.css'

const computeFyEndDate = (referenceDate) => {
  const today = referenceDate ?? new Date()
  const year = today.getMonth() > 2 ? today.getFullYear() + 1 : today.getFullYear()
  return new Date(year, 2, 31)
}

const formatDate = (date) => date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

const ItrFiling = () => {
  const { income = [], expenses = [], stats } = useFinance()
  const formatCurrency = useCurrencyFormatter()
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const totals = stats?.totals ?? { totalCredit: 0, totalDebit: 0, emiPending: 0 }
  const totalIncome = useMemo(
    () => income.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0),
    [income],
  )
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0),
    [expenses],
  )
  const investmentAmount = stats?.investments?.totalInvested ?? 0
  const fyEndDate = useMemo(() => computeFyEndDate(new Date()), [])
  const reminderWindowStart = useMemo(() => {
    const base = new Date(fyEndDate)
    base.setDate(base.getDate() - 7)
    return base
  }, [fyEndDate])
  const now = new Date()
  const shouldRemind = now >= reminderWindowStart && now <= fyEndDate
  const countdownDays = Math.max(Math.ceil((fyEndDate - now) / (1000 * 60 * 60 * 24)), 0)
  const fyLabel = `${fyEndDate.getFullYear() - 1}-${fyEndDate.getFullYear()}`

  const deductionEstimate = Math.min(totalExpenses * 0.3 + investmentAmount, totalIncome)
  const taxableIncome = Math.max(totalIncome - deductionEstimate, 0)
  const taxEstimate = taxableIncome * 0.1

  const handleGenerateReport = useCallback(() => {
    setIsGenerating(true)
    setStatus('Analyzing entries and preparing report...')
    setTimeout(() => {
      setReport({
        generatedAt: new Date().toISOString(),
        financialYear: fyLabel,
        summary: [
          { label: 'Gross income', value: totalIncome },
          { label: 'Business & expense adjustments', value: -deductionEstimate },
          { label: 'Taxable income estimate', value: taxableIncome },
          { label: 'Projected tax outflow (10%)', value: taxEstimate },
          { label: 'Outstanding EMIs', value: totals.emiPending ?? 0 },
        ],
        notes: [
          'Cross-check salary slips and Form 26AS before filing.',
          'Verify deduction proofs (ELSS, PF, insurance) to maximize savings.',
          'Include capital gains from stocks/MFs if applicable.',
        ],
      })
      setIsGenerating(false)
      setStatus('ITR summary ready. Review the figures below.')
    }, 1200)
  }, [deductionEstimate, fyLabel, taxEstimate, taxableIncome, totalIncome, totals.emiPending])

  const handleDownloadReport = useCallback(() => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `itr-summary-${fyLabel}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [fyLabel, report])

  return (
    <div className="space-y-6 pb-16">
      <div className="glass-card p-6 space-y-3">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-slate-900 dark:text-white" />
          <div>
            <p className="text-sm text-slate-500">ITR assistant</p>
            <h1 className="text-2xl font-display text-slate-900">ITR Filing toolkit</h1>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Generate pre-filled summaries using your tracked income, expenses, and investments so you can file returns
          faster. Export everything, share with your CA, or keep it handy for the portal.
        </p>
        <div className="itr-reminder">
          <div>
            <CalendarCheck2 className="h-4 w-4" />
            <span>Next due date: {formatDate(fyEndDate)}</span>
          </div>
          <div className={`itr-reminder__badge ${shouldRemind ? 'itr-reminder__badge--active' : ''}`}>
            <AlarmClock className="h-4 w-4" />
            <span>
              {shouldRemind
                ? `Only ${countdownDays} day${countdownDays === 1 ? '' : 's'} left to file FY ${fyLabel} returns.`
                : 'We will remind you a week before the deadline.'}
            </span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Auto summary</p>
            <h2 className="text-xl font-display text-slate-900">Prepare ITR report</h2>
          </div>
          <button type="button" className="btn-secondary flex items-center gap-2" onClick={handleGenerateReport} disabled={isGenerating}>
            <FileText className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate summary'}
          </button>
        </div>
        <p className="text-sm text-slate-500">
          We aggregate your logged entries, highlight deductions, and estimate tax dues. Review the suggested numbers
          before filing on the official portal.
        </p>
        {status && (
          <p className="text-xs text-slate-500" aria-live="polite">
            {status}
          </p>
        )}
        {report && (
          <div className="itr-report space-y-4">
            <div className="itr-report__header">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Financial year</p>
                <p className="text-sm font-semibold text-slate-900">{report.financialYear}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Generated</p>
                <p className="text-sm text-slate-900">
                  {formatDate(new Date(report.generatedAt))}
                </p>
              </div>
            </div>
            <div className="itr-report__grid">
              {report.summary.map((item) => (
                <div key={item.label} className="itr-report__stat">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{item.label}</p>
                  <p className={`text-lg font-display ${item.value < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                    {item.value < 0 ? '-' : ''}
                    {formatCurrency(Math.abs(item.value))}
                  </p>
                </div>
              ))}
            </div>
            <div className="itr-report__notes">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Filing checklist</p>
              <ul>
                {report.notes.map((note, index) => (
                  <li key={`note-${index}`}>{note}</li>
                ))}
              </ul>
            </div>
            <button type="button" className="btn-primary flex items-center gap-2" onClick={handleDownloadReport}>
              <Download className="h-4 w-4" />
              Download JSON
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItrFiling
