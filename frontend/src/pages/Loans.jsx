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

  const handleDelete = async (loan) => {
    const confirmDelete = window.confirm(
      `Delete ${loan.lender} loan? This will remove its EMI history.`,
    )
    if (!confirmDelete) return
    setPageError('')
    try {
      await actions.deleteLoan(loan._id)
    } catch (error) {
      setPageError(error?.response?.data?.message ?? 'Unable to delete this loan.')
    }
  }

  return (
    <div className="page-stack">
      <div className="page-grid page-grid--sidebar">
        <div>
          <div className="page-section space-y-4">
            <h2 className="text-2xl font-display">Add Loan / EMI</h2>
            <LoanForm onSubmit={actions.addLoan} />
          </div>
        </div>
        <div className="page-stack">
          <section className="page-section">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <h3 className="text-xl font-display">Active Loans</h3>
              {pageError && (
                <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                  {pageError}
                </p>
              )}
            </div>
            <div className="page-grid md:grid-cols-2">
              {loans.active?.map((loan) => (
                <LoanCard
                  key={loan._id ?? loan.lender}
                  loan={loan}
                  onPay={handlePayClick}
                  onUndo={handleUndo}
                  onDelete={handleDelete}
                  undoing={undoingLoanId === loan._id}
                />
              ))}
            </div>
            {loans.active?.length === 0 && (
              <p className="text-slate-500 text-sm">No active loans recorded.</p>
            )}
          </section>
          <section className="page-section">
            <h3 className="text-xl font-display mb-3">Completed</h3>
            <div className="page-grid md:grid-cols-2">
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
