import { Link } from 'react-router-dom'

const FloatingActionButton = ({ to = '/expenses', label = 'Add Expense' }) => (
  <Link
    to={to}
    className="lg:hidden fixed bottom-20 right-6 bg-accentDark text-white rounded-full shadow-glow px-5 py-3 font-semibold z-40"
  >
    {label}
  </Link>
)

export default FloatingActionButton
