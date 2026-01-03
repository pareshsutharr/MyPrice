import { useDateFormatter } from '@hooks/useDateFormatter.js'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './IncomeTable.css'

const EMPTY_PLACEHOLDER = '--'

const IncomeTable = ({ incomes = [], onEdit, onDelete }) => {
  const formatDate = useDateFormatter()
  const formatCurrency = useCurrencyFormatter()

  return (
    <div className="income-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Note</th>
            <th className="income-table__th-amount">Amount</th>
            <th className="income-table__th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((entry) => (
            <tr key={entry._id}>
              <td>{formatDate(entry.date, { fallback: EMPTY_PLACEHOLDER })}</td>
              <td className="income-table__category">{entry.category}</td>
              <td>{entry.note || EMPTY_PLACEHOLDER}</td>
              <td className="income-table__amount">{formatCurrency(entry.amount)}</td>
              <td className="income-table__actions">
                {onEdit && (
                  <button
                    type="button"
                    className="income-table__action-btn btn-secondary"
                    onClick={() => onEdit(entry)}
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="income-table__delete-btn btn-secondary"
                    onClick={() => onDelete(entry._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {incomes.length === 0 && (
        <p className="income-table__empty">No income recorded yet.</p>
      )}
    </div>
  )
}

export default IncomeTable
