import { useEffect, useMemo, useState } from 'react'
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
  const [selectedIncome, setSelectedIncome] = useState(() => new Set())

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

  const handleToggleIncomeSelection = (id) => {
    setSelectedIncome((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleAllIncome = () => {
    if (filteredIncome.length === 0) return
    setSelectedIncome((prev) => {
      const next = new Set(prev)
      const allIds = filteredIncome.map((entry) => entry._id)
      const hasAll = allIds.every((id) => next.has(id))
      if (hasAll) {
        allIds.forEach((id) => next.delete(id))
      } else {
        allIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const handleBulkIncomeDelete = async () => {
    const ids = Array.from(selectedIncome)
    if (ids.length === 0) return
    const confirmation = window.confirm(`Delete ${ids.length} selected income entr${ids.length === 1 ? 'y' : 'ies'}?`)
    if (!confirmation) return
    await actions.deleteIncomeBulk(ids)
    setSelectedIncome(new Set())
    if (editing && ids.includes(editing._id)) {
      setEditing(null)
    }
  }

  useEffect(() => {
    setSelectedIncome((prev) => {
      const allowedIds = new Set(filteredIncome.map((entry) => entry._id))
      const hasRemoved = [...prev].some((id) => !allowedIds.has(id))
      if (!hasRemoved) return prev
      const next = new Set([...prev].filter((id) => allowedIds.has(id)))
      return next
    })
  }, [filteredIncome])

  const selectedCount = selectedIncome.size
  const showSelectionBar = filteredIncome.length > 0

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
                    onClick={handleToggleAllIncome}
                  >
                    {selectedCount === filteredIncome.length && filteredIncome.length > 0
                      ? 'Clear selection'
                      : 'Select all'}
                  </button>
                  <button
                    type="button"
                    className="income-table__delete-btn btn-secondary text-xs"
                    disabled={selectedCount === 0}
                    onClick={handleBulkIncomeDelete}
                  >
                    Delete selected
                  </button>
                </div>
              </div>
            )}
            <IncomeTable
              incomes={filteredIncome}
              onEdit={setEditing}
              onDelete={handleDelete}
              selectedIds={selectedIncome}
              onToggleSelect={handleToggleIncomeSelection}
              onToggleSelectAll={handleToggleAllIncome}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Income
