import clsx from 'clsx'
import { useDateFormatter } from '@hooks/useDateFormatter.js'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './LoanCard.css'

const LoanCard = ({ loan, onPay, onUndo, undoing = false }) => {
  const formatDate = useDateFormatter()
  const formatCurrency = useCurrencyFormatter()
  const paymentDateValue =
    loan.latestPayment?.date ??
    loan.latestPayment?.createdAt ??
    loan.updatedAt ??
    loan.createdAt ??
    null
  const paymentDateLabel = paymentDateValue
    ? formatDate(paymentDateValue, { fallback: null })
    : null
  const otherCharges = Number(loan.otherCharges ?? 0)

  return (
    <div className="loan-card">
      <div className="loan-card__header">
        <div>
          <p className="loan-card__lender">{loan.lender}</p>
          <p className="loan-card__principal">{formatCurrency(loan.principal ?? 0)}</p>
        </div>
        <span
          className={clsx('loan-card__status', {
            'loan-card__status--active': loan.status === 'active',
            'loan-card__status--completed': loan.status !== 'active',
          })}
        >
          {loan.status}
        </span>
      </div>
      <div className="loan-card__emi">
        EMI {formatCurrency(loan.monthlyEmi ?? 0)} · {loan.progress?.emiPaid ?? 0}/
        {loan.durationMonths} paid
      </div>
      <p className="loan-card__interest">
        Interest paid {formatCurrency(Math.max(loan.progress?.interestPaid ?? 0, 0))}
      </p>
      <div className="loan-card__progress-bar">
        <div style={{ width: `${Math.min(loan.progress?.completion ?? 0, 100)}%` }} />
      </div>
      <p className="loan-card__remaining">
        Remaining approx {formatCurrency(Math.max(loan.progress?.remaining ?? 0, 0))}
      </p>
      {otherCharges > 0 && (
        <p className="loan-card__other-charges">
          Other charges {formatCurrency(otherCharges)}
        </p>
      )}
      {loan.latestPayment && (
        <div className="loan-card__payment-meta">
          <p>
            Last payment {formatCurrency(loan.latestPayment.amount ?? 0)} on{' '}
            {paymentDateLabel ?? '--'}
          </p>
          {onUndo && (
            <button
              type="button"
              className="loan-card__undo-btn"
              onClick={() => onUndo(loan)}
              disabled={undoing}
            >
              {undoing ? 'Reverting...' : 'Undo last payment'}
            </button>
          )}
        </div>
      )}
      {loan.status === 'active' && onPay && (
        <button type="button" className="loan-card__pay-btn btn-primary" onClick={() => onPay(loan)}>
          Pay EMI
        </button>
      )}
    </div>
  )
}

export default LoanCard
