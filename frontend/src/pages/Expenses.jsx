import { useMemo, useState } from 'react'
import { useFinance } from '@context/FinanceContext.jsx'
import ExpenseForm from '@components/forms/ExpenseForm.jsx'
import ExpenseTable from '@components/ExpenseTable.jsx'
import FilterToolbar from '@components/FilterToolbar.jsx'
import './Expenses.css'

const todayIso = () => new Date().toISOString().split('T')[0]
const defaultFilters = { q: '', startDate: '', endDate: todayIso() }

const Expenses = () => {
  const { expenses, actions } = useFinance()
  const [filters, setFilters] = useState(defaultFilters)
  const [editing, setEditing] = useState(null)

  const filteredExpenses = useMemo(() => {
    const query = filters.q?.trim().toLowerCase() ?? ''
    const hasQuery = Boolean(query)
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const matchesSearch =
        !hasQuery ||
        [
          expense.note,
          expense.category,
          expense.amount != null ? String(expense.amount) : '',
          expenseDate.toLocaleDateString('en-GB'),
        ]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(query))
      const matchesStart = !filters.startDate || expenseDate >= new Date(filters.startDate)
      const matchesEnd = !filters.endDate || expenseDate <= new Date(filters.endDate)
      return matchesSearch && matchesStart && matchesEnd
    })
  }, [expenses, filters])

  const handleSubmit = async (payload) => {
    if (editing?._id) {
      await actions.updateExpense(editing._id, payload)
      setEditing(null)
    } else {
      await actions.addExpense(payload)
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    const confirmDelete = window.confirm('Delete this expense entry?')
    if (!confirmDelete) return
    await actions.deleteExpense(id)
    if (editing?._id === id) {
      setEditing(null)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-display">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
          <div className={`expense-form__shell ${editing ? 'expense-form__shell--editing' : ''}`}>
            <ExpenseForm
              onSubmit={handleSubmit}
              defaultValues={editing ?? undefined}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-display">Expense History</h2>
          <FilterToolbar filters={filters} onChange={setFilters} />
          <ExpenseTable expenses={filteredExpenses} onEdit={setEditing} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

export default Expenses
