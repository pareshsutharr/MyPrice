import { useDateFormatter } from '@hooks/useDateFormatter.js'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './ExpenseTable.css'

const EMPTY_PLACEHOLDER = '--'

const toSelectionSet = (value) => {
  if (!value) return new Set()
  if (typeof value.has === 'function') return value
  return new Set(value)
}

const ExpenseTable = ({
  expenses = [],
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const formatDate = useDateFormatter()
  const formatCurrency = useCurrencyFormatter()
  const selection = toSelectionSet(selectedIds)
  const enableSelection = typeof onToggleSelect === 'function'
  const allSelected = enableSelection
    ? expenses.length > 0 && expenses.every((expense) => selection.has(expense._id))
    : false

  return (
    <div className="expense-table">
      <table>
        <thead>
          <tr>
            {enableSelection && (
              <th className="expense-table__th-checkbox">
                <input
                  type="checkbox"
                  aria-label="Select all expenses"
                  checked={allSelected}
                  onChange={() => onToggleSelectAll?.()}
                />
              </th>
            )}
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
              {enableSelection && (
                <td className="expense-table__checkbox">
                  <input
                    type="checkbox"
                    aria-label={`Select expense from ${formatDate(expense.date, { fallback: EMPTY_PLACEHOLDER })}`}
                    checked={selection.has(expense._id)}
                    onChange={() => onToggleSelect?.(expense._id)}
                  />
                </td>
              )}
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
