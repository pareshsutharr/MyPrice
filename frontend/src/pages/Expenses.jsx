import { useMemo, useState } from 'react'
import { useFinance } from '@context/FinanceContext.jsx'
import ExpenseForm from '@components/forms/ExpenseForm.jsx'
import ExpenseTable from '@components/ExpenseTable.jsx'
import FilterToolbar from '@components/FilterToolbar.jsx'

const defaultFilters = { q: '', startDate: '', endDate: '' }

const Expenses = () => {
  const { expenses, actions } = useFinance()
  const [filters, setFilters] = useState(defaultFilters)

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const matchesSearch =
        !filters.q ||
        expense.note?.toLowerCase().includes(filters.q.toLowerCase()) ||
        expense.category?.toLowerCase().includes(filters.q.toLowerCase())
      const matchesStart =
        !filters.startDate || expenseDate >= new Date(filters.startDate)
      const matchesEnd = !filters.endDate || expenseDate <= new Date(filters.endDate)
      return matchesSearch && matchesStart && matchesEnd
    })
  }, [expenses, filters])

  return (
    <div className="space-y-6 pb-16">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-display">Add Expense</h2>
          <ExpenseForm onSubmit={actions.addExpense} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-display">Expense History</h2>
          <FilterToolbar filters={filters} onChange={setFilters} />
          <ExpenseTable expenses={filteredExpenses} onDelete={actions.deleteExpense} />
        </div>
      </div>
    </div>
  )
}

export default Expenses
