import { useEffect, useMemo, useState } from 'react'
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
  const [showMobileForm, setShowMobileForm] = useState(false)
  const [selectedExpenses, setSelectedExpenses] = useState(() => new Set())

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
    if (showMobileForm) {
      setShowMobileForm(false)
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

  const handleToggleExpenseSelection = (id) => {
    setSelectedExpenses((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleAllExpenses = () => {
    if (filteredExpenses.length === 0) return
    setSelectedExpenses((prev) => {
      const next = new Set(prev)
      const allIds = filteredExpenses.map((expense) => expense._id)
      const hasAll = allIds.every((id) => next.has(id))
      if (hasAll) {
        allIds.forEach((id) => next.delete(id))
      } else {
        allIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedExpenses)
    if (ids.length === 0) return
    const confirmation = window.confirm(`Delete ${ids.length} selected expense${ids.length === 1 ? '' : 's'}?`)
    if (!confirmation) return
    await actions.deleteExpensesBulk(ids)
    setSelectedExpenses(new Set())
    if (editing && ids.includes(editing._id)) {
      setEditing(null)
    }
  }

  useEffect(() => {
    setSelectedExpenses((prev) => {
      const allowedIds = new Set(filteredExpenses.map((expense) => expense._id))
      const hasRemoved = [...prev].some((id) => !allowedIds.has(id))
      if (!hasRemoved) return prev
      const next = new Set([...prev].filter((id) => allowedIds.has(id)))
      return next
    })
  }, [filteredExpenses])

  const selectedCount = selectedExpenses.size
  const showSelectionBar = filteredExpenses.length > 0

  useEffect(() => {
    if (!editing) return
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setShowMobileForm(true)
    }
  }, [editing])

  return (
    <div className="page-stack">
      <div className="page-grid page-grid--sidebar">
        <div className="hidden lg:block">
          <div className="page-section space-y-4">
            <h2 className="text-2xl font-display">
              {editing ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <div className={`expense-form__shell ${editing ? 'expense-form__shell--editing' : ''}`}>
              <ExpenseForm
                onSubmit={handleSubmit}
                defaultValues={editing ?? undefined}
                onCancel={() => setEditing(null)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="page-section space-y-4">
            <h2 className="text-2xl font-display">Expense History</h2>
            <FilterToolbar filters={filters} onChange={setFilters} />
            {showSelectionBar && (
              <div className="flex items-center justify-between flex-wrap gap-3 rounded-xl border border-borderLight bg-surfaceMuted px-4 py-2 text-sm">
                <span className="text-slate-600">
                  {selectedCount > 0
                    ? `${selectedCount} selected`
                    : 'Select entries to enable bulk actions'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={handleToggleAllExpenses}
                  >
                    {selectedCount === filteredExpenses.length && filteredExpenses.length > 0
                      ? 'Clear selection'
                      : 'Select all'}
                  </button>
                  <button
                    type="button"
                    className="expense-table__delete-btn btn-secondary text-xs"
                    disabled={selectedCount === 0}
                    onClick={handleBulkDelete}
                  >
                    Delete selected
                  </button>
                </div>
              </div>
            )}
            <ExpenseTable
              expenses={filteredExpenses}
              onEdit={setEditing}
              onDelete={handleDelete}
              selectedIds={selectedExpenses}
              onToggleSelect={handleToggleExpenseSelection}
              onToggleSelectAll={handleToggleAllExpenses}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="lg:hidden fixed bottom-20 right-4 bg-gradient-to-r from-accentBlue to-accentPurple text-white px-5 py-3 rounded-full shadow-glow text-sm font-semibold"
        onClick={() => {
          setEditing(null)
          setShowMobileForm(true)
        }}
      >
        + Add Expense
      </button>
      {showMobileForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-[var(--app-card-bg)] border border-borderLight rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display">
                {editing ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button
                type="button"
                className="text-sm text-slate-500"
                onClick={() => {
                  setShowMobileForm(false)
                  setEditing(null)
                }}
              >
                Close
              </button>
            </div>
            <ExpenseForm
              onSubmit={handleSubmit}
              defaultValues={editing ?? undefined}
              onCancel={() => {
                setEditing(null)
                setShowMobileForm(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
