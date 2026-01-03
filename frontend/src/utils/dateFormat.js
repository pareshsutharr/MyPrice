const DEFAULT_FORMAT = 'DD/MM/YYYY'

const FORMAT_PARTS = {
  'DD/MM/YYYY': ['DD', 'MM', 'YYYY'],
  'MM/DD/YYYY': ['MM', 'DD', 'YYYY'],
  'YYYY-MM-DD': ['YYYY', 'MM', 'DD'],
}

const getSeparator = (format = DEFAULT_FORMAT) => (format.includes('/') ? '/' : '-')

export const autoFormatDateInput = (value = '', format = DEFAULT_FORMAT) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8)
  const parts = FORMAT_PARTS[format] ?? FORMAT_PARTS[DEFAULT_FORMAT]
  let cursor = 0
  const formattedParts = parts
    .map((part) => {
      const length = part.length
      const result = digitsOnly.slice(cursor, cursor + length)
      cursor += length
      return result
    })
    .filter(Boolean)
  return formattedParts.join(getSeparator(format))
}

const escapeRegex = (value = '') => value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

export const parseDateInput = (value = '', format = DEFAULT_FORMAT) => {
  if (!value) return null
  const parts = FORMAT_PARTS[format] ?? FORMAT_PARTS[DEFAULT_FORMAT]
  const escapedFormat = escapeRegex(format)
  const regexPattern = parts.reduce(
    (pattern, token) => pattern.replace(token, `(\\d{${token.length}})`),
    escapedFormat,
  )
  const regex = new RegExp(`^${regexPattern}$`)
  const match = regex.exec(value.trim())
  if (!match) return null

  let day
  let month
  let year
  parts.forEach((token, index) => {
    const numeric = Number(match[index + 1])
    if (Number.isNaN(numeric)) return
    if (token === 'DD') day = numeric
    if (token === 'MM') month = numeric
    if (token === 'YYYY') year = numeric
  })
  if (![day, month, year].every((part) => Number.isInteger(part))) return null

  const date = new Date(year, (month ?? 1) - 1, day ?? 1)
  if (Number.isNaN(date.getTime())) return null
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    return null
  }
  return date
}
