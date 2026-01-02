const FilterToolbar = ({ filters, onChange }) => {
  const handleChange = (event) => {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <div className="glass-card p-4 grid md:grid-cols-4 gap-3 text-sm">
      <div>
        <label className="text-slate-500">Search</label>
        <input
          type="text"
          name="q"
          placeholder="Groceries, cab..."
          value={filters.q}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
        />
      </div>
      <div>
        <label className="text-slate-500">From</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
        />
      </div>
      <div>
        <label className="text-slate-500">To</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          className="w-full mt-1 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
        />
      </div>
      <div className="flex items-end">
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => onChange({ q: '', startDate: '', endDate: '' })}
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default FilterToolbar
