import { useDateFormatter } from '@hooks/useDateFormatter.js'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './ExpenseTable.css'

const EMPTY_PLACEHOLDER = '--'

const ExpenseTable = ({ expenses = [], onEdit, onDelete }) => {
  const formatDate = useDateFormatter()
  const formatCurrency = useCurrencyFormatter()

  return (
    <div className="expense-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Note</th>
            <th>Amount</th>
            <th className="expense-table__th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id}>
              <td>{formatDate(expense.date, { fallback: EMPTY_PLACEHOLDER })}</td>
              <td className="expense-table__category">{expense.category}</td>
              <td>{expense.note || EMPTY_PLACEHOLDER}</td>
              <td className="expense-table__amount">{formatCurrency(expense.amount)}</td>
              <td className="expense-table__actions">
                {onEdit && (
                  <button className="expense-table__action-btn btn-secondary" onClick={() => onEdit(expense)}>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    className="expense-table__delete-btn btn-secondary"
                    onClick={() => onDelete(expense._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {expenses.length === 0 && (
        <p className="expense-table__empty">No expenses for the selected period.</p>
      )}
    </div>
  )
}

export default ExpenseTable
