import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CATEGORY_MAP, DEFAULT_CURRENCY } from '@shared/constants.js'

const STORAGE_KEY = 'myprice-settings'
const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY'
const DEFAULT_THEME = 'light'

const sanitiseTheme = (theme) => (theme === 'dark' ? 'dark' : DEFAULT_THEME)

const cloneCategories = (source = CATEGORY_MAP) => {
  const list = Array.isArray(source) && source.length ? source : CATEGORY_MAP
  return list.map((category) => ({ ...category }))
}

const buildSettings = (overrides = {}) => ({
  currency: overrides.currency ?? DEFAULT_CURRENCY,
  categories: cloneCategories(overrides.categories),
  dateFormat: overrides.dateFormat ?? DEFAULT_DATE_FORMAT,
  theme: sanitiseTheme(overrides.theme),
})

const readStoredSettings = () => {
  if (typeof window === 'undefined') {
    return buildSettings()
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSettings()
    const parsed = JSON.parse(raw)
    return buildSettings(parsed)
  } catch (error) {
    console.warn('Unable to parse stored settings', error)
    return buildSettings()
  }
}

const SettingsContext = createContext({
  ...buildSettings(),
  setCurrency: () => {},
  setCategories: () => {},
  addCategory: () => {},
  removeCategory: () => {},
  setDateFormat: () => {},
  setTheme: () => {},
})

const persist = (nextState) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
  } catch (error) {
    console.warn('Unable to persist settings', error)
  }
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(readStoredSettings)

  const applyPatch = useCallback((updater) => {
    setSettings((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater
      persist(nextState)
      return nextState
    })
  }, [])

  const setCurrency = useCallback((currency) => {
    applyPatch((prev) => ({
      ...prev,
      currency: currency || DEFAULT_CURRENCY,
    }))
  }, [applyPatch])

  const setCategories = useCallback((categories) => {
    applyPatch((prev) => ({
      ...prev,
      categories: cloneCategories(categories),
    }))
  }, [applyPatch])

  const addCategory = useCallback((category) => {
    if (!category) return
    applyPatch((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }))
  }, [applyPatch])

  const removeCategory = useCallback((id) => {
    if (!id) return
    applyPatch((prev) => ({
      ...prev,
      categories: prev.categories.filter((category) => category.id !== id),
    }))
  }, [applyPatch])

  const setDateFormat = useCallback((dateFormat) => {
    applyPatch((prev) => ({
      ...prev,
      dateFormat: dateFormat || DEFAULT_DATE_FORMAT,
    }))
  }, [applyPatch])

  const setTheme = useCallback((theme) => {
    applyPatch((prev) => ({
      ...prev,
      theme: sanitiseTheme(theme),
    }))
  }, [applyPatch])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const theme = settings.theme ?? DEFAULT_THEME
    document.documentElement.dataset.theme = theme
  }, [settings.theme])

  const value = useMemo(
    () => ({
      currency: settings.currency,
      categories: settings.categories,
      dateFormat: settings.dateFormat,
      theme: settings.theme,
      setCurrency,
      setCategories,
      addCategory,
      removeCategory,
      setDateFormat,
      setTheme,
    }),
    [settings, setCurrency, setCategories, addCategory, removeCategory, setDateFormat, setTheme],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)

export const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
