const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

const IncomeTable = ({ incomes = [], onEdit, onDelete }) => (
  <div className="glass-card overflow-auto">
    <table className="w-full text-left">
      <thead className="text-sm uppercase text-slate-500">
        <tr>
          <th className="px-4 py-3">Date</th>
          <th className="px-4 py-3">Category</th>
          <th className="px-4 py-3">Note</th>
          <th className="px-4 py-3 text-right">Amount</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {incomes.map((entry) => (
          <tr key={entry._id} className="border-t border-borderLight text-sm">
            <td className="px-4 py-3">{formatDate(entry.date)}</td>
            <td className="px-4 py-3 capitalize">{entry.category}</td>
            <td className="px-4 py-3">{entry.note || '—'}</td>
            <td className="px-4 py-3 text-right font-semibold text-emerald-600">
              ₹ {Number(entry.amount ?? 0).toLocaleString()}
            </td>
            <td className="px-4 py-3 text-right space-x-2">
              {onEdit && (
                <button
                  type="button"
                  className="btn-secondary !py-1 !px-3 text-xs"
                  onClick={() => onEdit(entry)}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="btn-secondary !py-1 !px-3 text-xs border border-red-200 text-red-500 hover:bg-red-50"
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
      <p className="text-center py-8 text-slate-500 text-sm">No income recorded yet.</p>
    )}
  </div>
)

export default IncomeTable
