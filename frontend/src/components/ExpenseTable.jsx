const ExpenseTable = ({ expenses = [], onEdit, onDelete }) => (
  <div className="glass-card overflow-auto">
    <table className="w-full text-left">
      <thead className="text-sm uppercase text-slate-500">
        <tr>
          <th className="px-4 py-3">Date</th>
          <th className="px-4 py-3">Category</th>
          <th className="px-4 py-3">Note</th>
          <th className="px-4 py-3">Amount</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense._id} className="border-t border-borderLight text-sm">
            <td className="px-4 py-3">
              {new Date(expense.date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              })}
            </td>
            <td className="px-4 py-3 capitalize">{expense.category}</td>
            <td className="px-4 py-3">{expense.note || '—'}</td>
            <td className="px-4 py-3 font-semibold text-slate-900">
              ₹ {expense.amount?.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-right space-x-2">
              {onEdit && (
                <button className="btn-secondary !py-1 !px-3 text-xs" onClick={() => onEdit(expense)}>
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="btn-secondary !py-1 !px-3 text-xs border border-red-200 text-red-500 hover:bg-red-50"
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
      <p className="text-center py-8 text-slate-500 text-sm">No expenses for the selected period.</p>
    )}
  </div>
)

export default ExpenseTable
