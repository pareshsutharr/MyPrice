import { useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'
import { formatDateValue } from '@hooks/useDateFormatter.js'
import { autoFormatDateInput, parseDateInput } from '@utils/dateFormat.js'
import './FilterToolbar.css'

const FilterToolbar = ({ filters, onChange }) => {
  const getTodayIso = () => new Date().toISOString().split('T')[0]
  const { dateFormat } = useSettings()
  const [dateInputs, setDateInputs] = useState({ startDate: '', endDate: '' })
  const datePickerRefs = useRef({ startDate: null, endDate: null })

  const formattedDates = useMemo(
    () => ({
      startDate: filters.startDate ? formatDateValue(filters.startDate, dateFormat) : '',
      endDate: filters.endDate ? formatDateValue(filters.endDate, dateFormat) : '',
    }),
    [filters.startDate, filters.endDate, dateFormat],
  )

  useEffect(() => {
    setDateInputs(formattedDates)
  }, [formattedDates])

  const handleTextChange = (event) => {
    const { name, value } = event.target
    if (name === 'q') {
      onChange({ ...filters, q: value })
    }
  }

  const handleDateInput = (name, value) => {
    const formatted = autoFormatDateInput(value, dateFormat)
    setDateInputs((prev) => ({ ...prev, [name]: formatted }))
    const parsed = parseDateInput(formatted, dateFormat)
    onChange({
      ...filters,
      [name]: parsed ? parsed.toISOString().split('T')[0] : '',
    })
  }

  const handleCalendarClick = (name) => {
    const node = datePickerRefs.current[name]
    if (!node) return
    if (typeof node.showPicker === 'function') {
      node.showPicker()
    } else {
      node.focus()
    }
  }

  const handleClear = () => {
    const today = getTodayIso()
    onChange({ q: '', startDate: '', endDate: today })
    setDateInputs({
      startDate: '',
      endDate: formatDateValue(today, dateFormat),
    })
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
          onChange={handleTextChange}
        />
      </div>
      <div className="filter-toolbar__field">
        <label>{`From (${dateFormat})`}</label>
        <div className="filter-toolbar__date-row">
          <input
            type="text"
            name="startDate"
            value={dateInputs.startDate}
            onChange={(event) => handleDateInput('startDate', event.target.value)}
            placeholder={dateFormat}
            inputMode="numeric"
            className="filter-toolbar__date-input"
          />
          <button
            type="button"
            className="filter-toolbar__calendar-btn"
            onClick={() => handleCalendarClick('startDate')}
            aria-label="Select start date"
          >
            📅
          </button>
          <input
            type="date"
            className="filter-toolbar__calendar-input"
            value={filters.startDate}
            onChange={(event) => handleDateInput('startDate', event.target.value)}
            ref={(node) => {
              datePickerRefs.current.startDate = node
            }}
          />
        </div>
      </div>
      <div className="filter-toolbar__field">
        <label>{`To (${dateFormat})`}</label>
        <div className="filter-toolbar__date-row">
          <input
            type="text"
            name="endDate"
            value={dateInputs.endDate}
            onChange={(event) => handleDateInput('endDate', event.target.value)}
            placeholder={dateFormat}
            inputMode="numeric"
            className="filter-toolbar__date-input"
          />
          <button
            type="button"
            className="filter-toolbar__calendar-btn"
            onClick={() => handleCalendarClick('endDate')}
            aria-label="Select end date"
          >
            📅
          </button>
          <input
            type="date"
            className="filter-toolbar__calendar-input"
            value={filters.endDate}
            onChange={(event) => handleDateInput('endDate', event.target.value)}
            ref={(node) => {
              datePickerRefs.current.endDate = node
            }}
          />
        </div>
      </div>
      <div className="filter-toolbar__actions">
        <button type="button" className="filter-toolbar__button btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  )
}

export default FilterToolbar
