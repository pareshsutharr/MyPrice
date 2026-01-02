import { useState } from 'react'
import LoanForm from '@components/forms/LoanForm.jsx'
import LoanCard from '@components/LoanCard.jsx'
import EmiPaymentModal from '@components/modals/EmiPaymentModal.jsx'
import { useFinance } from '@context/FinanceContext.jsx'

const Loans = () => {
  const { loans, actions } = useFinance()
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [undoingLoanId, setUndoingLoanId] = useState(null)
  const [pageError, setPageError] = useState('')

  const handlePayClick = (loan) => {
    setSelectedLoan(loan)
    setPageError('')
  }

  const handleConfirmPayment = async (payload) => {
    if (!selectedLoan) return
    setPageError('')
    try {
      await actions.payLoan(selectedLoan._id, payload)
    } catch (error) {
      setPageError(error?.response?.data?.message ?? 'Unable to record this payment.')
      throw error
    }
  }

  const handleUndo = async (loan) => {
    if (!loan?.latestPayment || undoingLoanId) return
    const confirmUndo = window.confirm(
      'Undo the last EMI payment? This will add the amount back to the pending balance.',
    )
    if (!confirmUndo) return
    setUndoingLoanId(loan._id)
    setPageError('')
    try {
      await actions.undoLoanPayment(loan._id, loan.latestPayment._id)
    } catch (error) {
      setPageError(error?.response?.data?.message ?? 'Unable to roll back the payment.')
    } finally {
      setUndoingLoanId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-display">Add Loan / EMI</h2>
          <LoanForm onSubmit={actions.addLoan} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <section>
            <h3 className="text-xl font-display mb-3">Active Loans</h3>
            {pageError && (
              <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-3">
                {pageError}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {loans.active?.map((loan) => (
                <LoanCard
                  key={loan._id ?? loan.lender}
                  loan={loan}
                  onPay={handlePayClick}
                  onUndo={handleUndo}
                  undoing={undoingLoanId === loan._id}
                />
              ))}
            </div>
            {loans.active?.length === 0 && (
              <p className="text-slate-500 text-sm">No active loans recorded.</p>
            )}
          </section>
          <section>
            <h3 className="text-xl font-display mb-3">Completed</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {loans.completed?.map((loan) => (
                <LoanCard key={loan._id ?? `${loan.lender}-done`} loan={loan} />
              ))}
            </div>
            {loans.completed?.length === 0 && (
              <p className="text-slate-500 text-sm">No completed loans yet.</p>
            )}
          </section>
        </div>
      </div>
      {selectedLoan && (
        <EmiPaymentModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  )
}

export default Loans
