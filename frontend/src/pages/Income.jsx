import { useMemo, useState } from 'react'
import { useFinance } from '@context/FinanceContext.jsx'
import IncomeForm from '@components/forms/IncomeForm.jsx'
import IncomeTable from '@components/IncomeTable.jsx'
import FilterToolbar from '@components/FilterToolbar.jsx'
import './Income.css'

const todayIso = () => new Date().toISOString().split('T')[0]
const defaultFilters = { q: '', startDate: '', endDate: todayIso() }

const Income = () => {
  const { income, actions } = useFinance()
  const [editing, setEditing] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)

  const filteredIncome = useMemo(() => {
    const query = filters.q?.trim().toLowerCase() ?? ''
    const hasQuery = Boolean(query)
    return income.filter((entry) => {
      const entryDate = new Date(entry.date)
      const matchesSearch =
        !hasQuery ||
        [
          entry.note,
          entry.category,
          entry.amount != null ? String(entry.amount) : '',
          entryDate.toLocaleDateString('en-GB'),
        ]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(query))
      const matchesStart = !filters.startDate || entryDate >= new Date(filters.startDate)
      const matchesEnd = !filters.endDate || entryDate <= new Date(filters.endDate)
      return matchesSearch && matchesStart && matchesEnd
    })
  }, [income, filters])

  const handleSubmit = async (payload) => {
    if (editing?._id) {
      await actions.updateIncome(editing._id, payload)
      setEditing(null)
    } else {
      await actions.addIncome(payload)
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    const confirmDelete = window.confirm('Remove this income entry?')
    if (!confirmDelete) return
    await actions.deleteIncome(id)
    if (editing?._id === id) {
      setEditing(null)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-grid page-grid--sidebar">
        <div>
          <div className="page-section space-y-4">
            <h2 className="text-2xl font-display">
              {editing ? 'Edit Income Entry' : 'Record Income'}
            </h2>
            <div className={`income-form__shell ${editing ? 'income-form__shell--editing' : ''}`}>
              <IncomeForm
                onSubmit={handleSubmit}
                defaultValues={editing ?? undefined}
                onCancel={() => setEditing(null)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="page-section space-y-4">
            <h2 className="text-2xl font-display">Income History</h2>
            <FilterToolbar filters={filters} onChange={setFilters} />
            <IncomeTable incomes={filteredIncome} onEdit={setEditing} onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Income
