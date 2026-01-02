import { useEffect, useState } from 'react'
import { CATEGORY_MAP, DEFAULT_CURRENCY } from '@shared/constants.js'

const Settings = () => {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [categories, setCategories] = useState(CATEGORY_MAP)
  const [newCategory, setNewCategory] = useState({ label: '', color: '#4f9cff', icon: '✨' })

  useEffect(() => {
    const stored = localStorage.getItem('myprice-settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      setCurrency(parsed.currency ?? DEFAULT_CURRENCY)
      setCategories(parsed.categories ?? CATEGORY_MAP)
    }
  }, [])

  const persist = (nextState) => {
    localStorage.setItem('myprice-settings', JSON.stringify(nextState))
  }

  const handleCurrencyChange = (event) => {
    const next = event.target.value
    setCurrency(next)
    persist({ currency: next, categories })
  }

  const handleAddCategory = () => {
    const nextCategories = [
      ...categories,
      { ...newCategory, id: newCategory.label.toLowerCase() || `cat-${categories.length}` },
    ]
    setCategories(nextCategories)
    persist({ currency, categories: nextCategories })
    setNewCategory({ label: '', color: '#4f9cff', icon: '✨' })
  }

  const handleRemove = (id) => {
    const nextCategories = categories.filter((category) => category.id !== id)
    setCategories(nextCategories)
    persist({ currency, categories: nextCategories })
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-display">Currency</h2>
        <input
          type="text"
          maxLength={3}
          value={currency}
          onChange={handleCurrencyChange}
          className="w-32 rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2 text-center text-xl"
        />
      </section>

      <section className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-display">Categories</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-surfaceMuted px-4 py-3 rounded-xl border border-borderLight"
            >
              <span>
                {category.icon} {category.label}
              </span>
              <button
                type="button"
                className="text-xs text-red-500"
                onClick={() => handleRemove(category.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Label"
            value={newCategory.label}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, label: event.target.value }))}
            className="rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          />
          <input
            type="text"
            placeholder="Icon"
            value={newCategory.icon}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, icon: event.target.value }))}
            className="rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          />
          <input
            type="color"
            value={newCategory.color}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, color: event.target.value }))}
            className="rounded-xl bg-surfaceMuted border border-borderLight px-3 py-2"
          />
        </div>
        <button type="button" className="btn-primary" onClick={handleAddCategory}>
          Add Category
        </button>
      </section>
    </div>
  )
}

export default Settings
