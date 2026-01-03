import { Link } from 'react-router-dom'
import './FloatingActionButton.css'

const FloatingActionButton = ({ to = '/expenses', label = 'Add Expense' }) => (
  <Link
    to={to}
    className="floating-action-button"
  >
    {label}
  </Link>
)

export default FloatingActionButton
