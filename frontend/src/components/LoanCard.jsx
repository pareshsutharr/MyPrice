const formatCurrency = (value = 0) => `₹ ${Number(value).toLocaleString('en-IN')}`

const LoanCard = ({ loan, onPay, onUndo, undoing = false }) => {
  const paymentDateValue =
    loan.latestPayment?.date ??
    loan.latestPayment?.createdAt ??
    loan.updatedAt ??
    loan.createdAt ??
    null
  const paymentDateLabel = paymentDateValue
    ? new Date(paymentDateValue).toLocaleDateString('en-IN', { dateStyle: 'medium' })
    : null

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{loan.lender}</p>
          <p className="text-xl font-display text-slate-900">
            {formatCurrency(loan.principal ?? 0)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            loan.status === 'active'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          {loan.status}
        </span>
      </div>
      <div className="text-sm text-slate-500">
        EMI {formatCurrency(loan.monthlyEmi ?? 0)} · {loan.progress?.emiPaid ?? 0}/
        {loan.durationMonths} paid
      </div>
      <p className="text-sm text-slate-500">
        Interest paid {formatCurrency(Math.max(loan.progress?.interestPaid ?? 0, 0))}
      </p>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-accentBlue to-accentPurple h-2 rounded-full"
          style={{ width: `${Math.min(loan.progress?.completion ?? 0, 100)}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Remaining approx {formatCurrency(Math.max(loan.progress?.remaining ?? 0, 0))}
      </p>
      {loan.latestPayment && (
        <div className="rounded-2xl bg-slate-50 p-3 space-y-1 text-sm">
          <p className="text-slate-600">
            Last payment {formatCurrency(loan.latestPayment.amount ?? 0)} on{' '}
            {paymentDateLabel ?? '—'}
          </p>
          {onUndo && (
            <button
              type="button"
              className="text-xs text-rose-500 hover:underline disabled:opacity-50"
              onClick={() => onUndo(loan)}
              disabled={undoing}
            >
              {undoing ? 'Reverting…' : 'Undo last payment'}
            </button>
          )}
        </div>
      )}
      {loan.status === 'active' && onPay && (
        <button type="button" className="btn-primary w-full" onClick={() => onPay(loan)}>
          Pay EMI
        </button>
      )}
    </div>
  )
}

export default LoanCard
