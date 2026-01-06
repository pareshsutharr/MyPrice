import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CATEGORY_MAP, DEFAULT_CURRENCY } from '@shared/constants.js'

const STORAGE_KEY = 'myprice-settings'
const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY'
const DEFAULT_THEME = 'dark'
const DEFAULT_MODE = 'advanced'

const sanitiseTheme = (theme) => (theme === 'light' ? 'light' : 'dark')
const sanitiseMode = (mode) => (mode === 'basic' ? 'basic' : 'advanced')

const DEFAULT_INTEGRATIONS = {
  digilocker: {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    environment: 'sandbox',
  },
}

const cloneCategories = (source = CATEGORY_MAP) => {
  const list = Array.isArray(source) && source.length ? source : CATEGORY_MAP
  return list.map((category) => ({ ...category }))
}

const cloneIntegrations = (source = DEFAULT_INTEGRATIONS) => ({
  digilocker: {
    clientId: source?.digilocker?.clientId ?? '',
    clientSecret: source?.digilocker?.clientSecret ?? '',
    redirectUri: source?.digilocker?.redirectUri ?? '',
    environment: source?.digilocker?.environment === 'production' ? 'production' : 'sandbox',
  },
})

const buildSettings = (overrides = {}) => ({
  currency: overrides.currency ?? DEFAULT_CURRENCY,
  categories: cloneCategories(overrides.categories),
  dateFormat: overrides.dateFormat ?? DEFAULT_DATE_FORMAT,
  theme: sanitiseTheme(overrides.theme),
  mode: sanitiseMode(overrides.mode),
  integrations: cloneIntegrations(overrides.integrations),
})

const detectPreferredTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_THEME
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const readStoredSettings = () => {
  if (typeof window === 'undefined') {
    return { state: buildSettings(), hasStored: false }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { state: buildSettings(), hasStored: false }
    const parsed = JSON.parse(raw)
    return { state: buildSettings(parsed), hasStored: true }
  } catch (error) {
    console.warn('Unable to parse stored settings', error)
    return { state: buildSettings(), hasStored: false }
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
  setMode: () => {},
  updateDigilockerConfig: () => {},
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
  const [settings, setSettings] = useState(() => {
    const { state, hasStored } = readStoredSettings()
    if (hasStored) return state
    return {
      ...state,
      theme: detectPreferredTheme(),
    }
  })

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

  const setMode = useCallback((mode) => {
    applyPatch((prev) => ({
      ...prev,
      mode: sanitiseMode(mode),
    }))
  }, [applyPatch])

  const updateDigilockerConfig = useCallback((patch = {}) => {
    applyPatch((prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        digilocker: {
          ...prev.integrations?.digilocker,
          ...patch,
        },
      },
    }))
  }, [applyPatch])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const theme = settings.theme ?? DEFAULT_THEME
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.mode = settings.mode ?? DEFAULT_MODE
  }, [settings.mode, settings.theme])

  const value = useMemo(
    () => ({
      currency: settings.currency,
      categories: settings.categories,
      dateFormat: settings.dateFormat,
      theme: settings.theme,
      mode: settings.mode,
      setCurrency,
      setCategories,
      addCategory,
      removeCategory,
      setDateFormat,
      setTheme,
      setMode,
      integrations: settings.integrations,
      updateDigilockerConfig,
    }),
    [
      settings,
      setCurrency,
      setCategories,
      addCategory,
      removeCategory,
      setDateFormat,
      setTheme,
      setMode,
      updateDigilockerConfig,
    ],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => useContext(SettingsContext)

export const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
