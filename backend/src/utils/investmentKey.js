const normalizeToken = (value) => (value ? String(value).trim().toLowerCase() : '')

export const buildInvestmentKey = ({ schemeName, folioNumber, isin }) => {
  const scheme = normalizeToken(schemeName)
  const folio = normalizeToken(folioNumber)
  const identifier = normalizeToken(isin)
  const fallback = scheme || identifier || folio
  if (!fallback) {
    return null
  }
  return [scheme || fallback, folio || identifier, identifier].filter(Boolean).join('__')
}
