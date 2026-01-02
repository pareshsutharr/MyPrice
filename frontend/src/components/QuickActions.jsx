import { Link } from 'react-router-dom'

const QuickActions = ({ onAddIncome }) => (
  <div className="grid grid-cols-2 gap-3">
    <Link to="/expenses" className="btn-primary text-center">
      Add Expense
    </Link>
    <button
      type="button"
      className="btn-secondary text-center"
      onClick={onAddIncome}
    >
      Add Income
    </button>
  </div>
)

export default QuickActions
