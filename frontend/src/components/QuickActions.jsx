import { Link } from 'react-router-dom'
import './QuickActions.css'

const QuickActions = ({ onAddIncome }) => (
  <div className="quick-actions">
    <Link to="/expenses" className="quick-actions__link btn-primary">
      Add Expense
    </Link>
    <button type="button" className="quick-actions__button btn-secondary" onClick={onAddIncome}>
      Add Income
    </button>
  </div>
)

export default QuickActions
