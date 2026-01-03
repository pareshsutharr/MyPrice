import { useCallback } from 'react'
import { useSettings } from '@context/SettingsContext.jsx'

const DEFAULT_FORMAT = 'DD/MM/YYYY'

const pad = (value) => String(value).padStart(2, '0')

export const formatDateValue = (value, format = DEFAULT_FORMAT) => {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const tokens = {
    DD: pad(date.getDate()),
    MM: pad(date.getMonth() + 1),
    YYYY: String(date.getFullYear()),
  }

  return format.replace(/DD/g, tokens.DD).replace(/MM/g, tokens.MM).replace(/YYYY/g, tokens.YYYY)
}

export const useDateFormatter = () => {
  const { dateFormat = DEFAULT_FORMAT } = useSettings()

  return useCallback(
    (value, { fallback = '--', format } = {}) => {
      const formatted = formatDateValue(value, format ?? dateFormat)
      return formatted || fallback
    },
    [dateFormat],
  )
}
