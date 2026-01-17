import { useDateFormatter } from '@hooks/useDateFormatter.js'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'
import './IncomeTable.css'

const EMPTY_PLACEHOLDER = '--'

const toSelectionSet = (value) => {
  if (!value) return new Set()
  if (typeof value.has === 'function') return value
  return new Set(value)
}

const IncomeTable = ({
  incomes = [],
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
  const allSelected =
    enableSelection && incomes.length > 0 && incomes.every((entry) => selection.has(entry._id))

  return (
    <div className="income-table">
      <table>
        <thead>
          <tr>
            {enableSelection && (
              <th className="income-table__th-checkbox">
                <input
                  type="checkbox"
                  aria-label="Select all income rows"
                  checked={allSelected}
                  onChange={() => onToggleSelectAll?.()}
                />
              </th>
            )}
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
              {enableSelection && (
                <td className="income-table__checkbox">
                  <input
                    type="checkbox"
                    aria-label={`Select income entry dated ${formatDate(entry.date, { fallback: EMPTY_PLACEHOLDER })}`}
                    checked={selection.has(entry._id)}
                    onChange={() => onToggleSelect?.(entry._id)}
                  />
                </td>
              )}
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
