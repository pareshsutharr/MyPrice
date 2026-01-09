import './QuickActions.css'

const QuickActions = ({ onAddExpense, onAddIncome }) => (
  <div className="quick-actions">
    <button type="button" className="quick-actions__button btn-secondary" onClick={onAddExpense}>
      Add Expense
    </button>
    <button type="button" className="quick-actions__button btn-secondary" onClick={onAddIncome}>
      Add Income
    </button>
  </div>
)

export default QuickActions
