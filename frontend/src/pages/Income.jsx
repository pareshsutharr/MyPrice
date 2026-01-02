import { useState } from 'react'
import { useFinance } from '@context/FinanceContext.jsx'
import IncomeForm from '@components/forms/IncomeForm.jsx'
import IncomeTable from '@components/IncomeTable.jsx'

const Income = () => {
  const { income, actions } = useFinance()
  const [editing, setEditing] = useState(null)

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
    <div className="space-y-6 pb-16">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-display">
            {editing ? 'Edit Income Entry' : 'Record Income'}
          </h2>
          <IncomeForm onSubmit={handleSubmit} defaultValues={editing ?? undefined} onCancel={() => setEditing(null)} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-display">Income History</h2>
          <IncomeTable incomes={income} onEdit={setEditing} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

export default Income
