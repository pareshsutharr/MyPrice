import './FilterToolbar.css'

const FilterToolbar = ({ filters, onChange }) => {
  const handleChange = (event) => {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  return (
    <div className="filter-toolbar">
      <div className="filter-toolbar__field">
        <label>Search</label>
        <input
          type="text"
          name="q"
          placeholder="Groceries, cab..."
          value={filters.q}
          onChange={handleChange}
        />
      </div>
      <div className="filter-toolbar__field">
        <label>From</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
        />
      </div>
      <div className="filter-toolbar__field">
        <label>To</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
        />
      </div>
      <div className="filter-toolbar__actions">
        <button
          type="button"
          className="filter-toolbar__button btn-secondary"
          onClick={() => onChange({ q: '', startDate: '', endDate: '' })}
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default FilterToolbar
