import { useCallback } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'

const DEFAULT_SYMBOL = '₹'
const DEFAULT_LOCALE = 'en-IN'

export const formatCurrencyValue = (value = 0, { currency = DEFAULT_SYMBOL, locale = DEFAULT_LOCALE } = {}) => {
  const numericValue = Number(value ?? 0)
  const safeNumber = Number.isFinite(numericValue) ? numericValue : 0
  const formatted = safeNumber.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currency} ${formatted}`.trim()
}

export const useCurrencySymbol = () => {
  const { currency } = useSettings()
  return currency || DEFAULT_SYMBOL
}

export const useCurrencyFormatter = ({ locale = DEFAULT_LOCALE } = {}) => {
  const symbol = useCurrencySymbol()

  return useCallback(
    (value = 0, options = {}) => {
      const finalSymbol = options.currency ?? symbol ?? DEFAULT_SYMBOL
      const finalLocale = options.locale ?? locale
      const showSymbol = options.showSymbol ?? true
      const formattedNumber = formatCurrencyValue(value, {
        currency: finalSymbol,
        locale: finalLocale,
      })
      if (showSymbol) {
        return formattedNumber
      }
      // strip symbol + space
      return formattedNumber.replace(`${finalSymbol} `, '')
    },
    [symbol, locale],
  )
}
