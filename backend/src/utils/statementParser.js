import XLSX from 'xlsx'

const normalizeKey = (value) => value?.toLowerCase?.() ?? ''

const pick = (row, keys) => {
  for (const key of keys) {
    const directMatch = Object.keys(row).find((candidate) => normalizeKey(candidate) === normalizeKey(key))
    if (directMatch && row[directMatch] !== undefined && row[directMatch] !== null) {
      const val = row[directMatch]
      if (val !== '') return val
    }
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key]
    }
  }
  return undefined
}

const toNumber = (raw) => {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (typeof raw === 'number') return Number(raw)
  const cleaned = String(raw)
    .replace(/₹|,/g, '')
    .replace(/%/g, '')
    .trim()
  if (cleaned === '') return undefined
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? undefined : parsed
}

const skipRow = (schemeName = '') => {
  const normalized = schemeName.trim().toLowerCase()
  if (!normalized) return true
  return ['total investments', 'total', 'holding summary', 'summary', 'personal details'].some((phrase) =>
    normalized.includes(phrase),
  )
}

export const parseInvestmentStatement = (buffer) => {
  if (!buffer || !buffer.length) {
    throw new Error('Empty file received. Please upload a CSV/XLSX exported from your broker.')
  }

  let workbook
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', raw: false, cellDates: true })
  } catch (error) {
    throw new Error('Unable to read the statement. Ensure it is a valid CSV/XLSX file.')
  }
  const primarySheet = workbook.SheetNames[0]
  const sheet = workbook.Sheets[primarySheet]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  const holdings = []
  rows.forEach((row) => {
    const schemeName = pick(row, ['Scheme Name', 'Fund Name', 'schemeName'])
    if (skipRow(schemeName)) {
      return
    }

    const investedValue =
      toNumber(pick(row, ['Invested Value', 'Investment Value', 'Amount Invested', 'Investment Amount'])) ??
      0
    const currentValue =
      toNumber(
        pick(row, [
          'Current Value',
          'Current Portfolio Value',
          'Value as on',
          'Value as on 31/12/2025',
          'Value',
        ]),
      ) ?? investedValue
    const units = toNumber(pick(row, ['Units', 'Unit']))
    const folioNumber = pick(row, ['Folio No.', 'Folio No', 'Folio'])
    const isin = pick(row, ['ISIN', 'Isin'])
    const category = pick(row, ['Category'])
    const subCategory = pick(row, ['Sub-category', 'Sub Category'])
    const platform = pick(row, ['Source', 'Broker', 'Platform'])
    const xirr = toNumber(pick(row, ['XIRR', 'Returns %', 'Profit/Loss %']))
    const nav = toNumber(pick(row, ['NAV', 'Nav', 'NAV as on 31/12/2025', 'NAV as on']))

    holdings.push({
      schemeName: schemeName?.toString()?.trim(),
      amountInvested: investedValue,
      currentValue,
      units,
      folioNumber: folioNumber?.toString()?.trim(),
      isin: isin?.toString()?.trim(),
      category: category?.toString()?.trim(),
      subCategory: subCategory?.toString()?.trim(),
      platform: platform?.toString()?.trim(),
      xirr,
      nav,
      source: platform?.toString()?.trim(),
    })
  })

  const filteredHoldings = holdings.filter((holding) => holding.schemeName)

  if (!filteredHoldings.length) {
    throw new Error('No holdings detected in the uploaded file. Please verify the format.')
  }

  const totalInvested = filteredHoldings.reduce((sum, holding) => sum + (holding.amountInvested ?? 0), 0)
  const currentValue = filteredHoldings.reduce((sum, holding) => sum + (holding.currentValue ?? 0), 0)
  const totalGain = currentValue - totalInvested

  return {
    holdings: filteredHoldings,
    summary: {
      totalInvested,
      currentValue,
      totalGain,
    },
  }
}
