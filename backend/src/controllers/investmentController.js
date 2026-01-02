import { Investment } from '../models/Investment.js'
import { StatementImport } from '../models/StatementImport.js'
import { buildInvestmentKey } from '../utils/investmentKey.js'
import { parseInvestmentStatement } from '../utils/statementParser.js'

const prepareInvestmentPayload = (payload = {}) => {
  if (!payload.schemeName) {
    throw new Error('Scheme name is required')
  }
  const broker = payload.broker || payload.platform || 'Manual'
  const normalized = {
    ...payload,
    broker,
    platform: payload.platform || broker,
  }
  normalized.schemeName = normalized.schemeName?.trim()
  if (normalized.folioNumber) normalized.folioNumber = normalized.folioNumber.trim()
  if (normalized.isin) normalized.isin = normalized.isin.trim()
  normalized.uniqueKey =
    payload.uniqueKey ??
    buildInvestmentKey({
      schemeName: normalized.schemeName,
      folioNumber: normalized.folioNumber,
      isin: normalized.isin,
    })
  normalized.brokers = Array.from(new Set([...(payload.brokers ?? []), broker])).filter(Boolean)
  return normalized
}

const buildQuery = (payload) => {
  const base = {
    schemeName: payload.schemeName,
    folioNumber: payload.folioNumber ?? null,
  }
  if (payload.uniqueKey) {
    return {
      $or: [{ uniqueKey: payload.uniqueKey }, { uniqueKey: { $exists: false }, ...base }],
    }
  }
  return base
}

const dedupeInvestments = (documents) => {
  const map = new Map()
  documents.forEach((doc) => {
    const key =
      doc.uniqueKey ??
      buildInvestmentKey({
        schemeName: doc.schemeName,
        folioNumber: doc.folioNumber,
        isin: doc.isin,
      }) ??
      doc._id?.toString()
    if (!map.has(key)) {
      map.set(key, doc)
      return
    }
    const existing = map.get(key)
    const existingTime = new Date(existing.lastStatementDate || existing.updatedAt || 0).getTime()
    const currentTime = new Date(doc.lastStatementDate || doc.updatedAt || 0).getTime()
    const primary = currentTime >= existingTime ? doc : existing
    const secondary = currentTime >= existingTime ? existing : doc
    const brokers = new Set(
      [
        ...(primary.brokers ?? []),
        primary.broker,
        ...(secondary.brokers ?? []),
        secondary.broker,
      ].filter(Boolean),
    )
    primary.brokers = Array.from(brokers)
    primary.broker = primary.broker || secondary.broker
    map.set(key, primary)
  })
  return Array.from(map.values())
}

const formatInvestment = (investment) => {
  if (!investment) return null
  const doc = investment.toObject({ virtuals: true })
  const gain = doc.gain ?? doc.currentValue - doc.amountInvested
  return {
    ...doc,
    broker: doc.broker ?? doc.platform ?? 'Manual',
    brokers: (doc.brokers?.length ? doc.brokers : [doc.broker ?? doc.platform ?? 'Manual']).filter(
      Boolean,
    ),
    gain,
    gainPercent:
      doc.gainPercent ?? (doc.amountInvested ? (gain / doc.amountInvested) * 100 : 0),
  }
}

export const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).sort({ updatedAt: -1 })
    const deduped = dedupeInvestments(investments)
    res.json(deduped.map(formatInvestment))
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch investments', error: error.message })
  }
}

const handleInvestmentImport = async ({
  holdings,
  broker,
  statementDate,
  source,
  rawFileName,
  summary,
  userId,
}) => {
  const sanitizedDate = statementDate ? new Date(statementDate) : new Date()
  const successes = []
  const errors = []

  for (const holding of holdings) {
    try {
      const payload = prepareInvestmentPayload({
        schemeName: holding.schemeName?.trim() ?? holding['Scheme Name'],
        platform: holding.platform ?? holding.source ?? broker,
        broker: holding.broker ?? broker,
        source: holding.source ?? source ?? 'upload',
        amountInvested: Number(holding.amountInvested ?? holding.investedValue ?? 0),
        currentValue: Number(holding.currentValue ?? holding.valueAsOn ?? 0),
        units:
          holding.units !== undefined && holding.units !== null && holding.units !== ''
            ? Number(holding.units)
            : Number(holding.Units ?? holding.quantity ?? 0) || undefined,
        isin: holding.isin ?? holding.ISIN,
        category: holding.category ?? holding.Category,
        subCategory: holding.subCategory ?? holding['Sub Category'],
        folioNumber: holding.folioNumber ?? holding['Folio No'] ?? holding.folio,
        averageNav: holding.averageNav ?? holding['Average NAV'],
        nav: holding.nav ?? holding['NAV as on'] ?? holding['NAV'],
        xirr: holding.xirr ?? holding.XIRR,
        lastStatementDate: sanitizedDate,
        lastUpdated: new Date(),
        notes: holding.notes,
        metadata: holding.metadata ?? {},
        currency: holding.currency ?? '₹',
        user: userId,
      })
      if (!payload.schemeName) {
        throw new Error('Missing scheme name')
      }
      if (!payload.uniqueKey) {
        throw new Error(`Unable to determine unique key for ${payload.schemeName}`)
      }
      const { brokers, ...rest } = payload
      const upserted = await Investment.findOneAndUpdate(
        { ...buildQuery(payload), user: userId },
        { $set: rest, $addToSet: { brokers: { $each: brokers } } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      successes.push(upserted)
    } catch (error) {
      errors.push({
        schemeName: holding.schemeName ?? holding['Scheme Name'] ?? 'Unknown',
        message: error.message,
      })
    }
  }

  const summaryPayload = {
    broker,
    statementDate: sanitizedDate,
    source: source ?? 'upload',
    rawFileName,
    summary: summary ?? {},
    holdingsCount: holdings.length,
    records: holdings.map((holding) => ({
      schemeName: holding.schemeName ?? holding['Scheme Name'],
      folioNumber: holding.folioNumber ?? holding['Folio No'],
      isin: holding.isin ?? holding.ISIN,
      category: holding.category ?? holding.Category,
      subCategory: holding.subCategory ?? holding['Sub Category'],
      investedValue: Number(holding.amountInvested ?? holding.investedValue ?? 0),
      currentValue: Number(holding.currentValue ?? holding.valueAsOn ?? 0),
      units:
        holding.units !== undefined && holding.units !== null && holding.units !== ''
          ? Number(holding.units)
          : Number(holding.Units ?? holding.quantity ?? 0) || undefined,
    })),
    user: userId,
  }

  const importLog = await StatementImport.create(summaryPayload)

  return {
    importLog,
    successes,
    errors,
  }
}

export const createInvestment = async (req, res) => {
  try {
    const payload = prepareInvestmentPayload(req.body)
    if (!payload.uniqueKey) {
      throw new Error('Provide at least a scheme name and folio or ISIN for deduplication')
    }
    const { brokers, ...updateData } = payload
    const investment = await Investment.findOneAndUpdate(
      { ...buildQuery(payload), user: req.user._id },
      { $set: { ...updateData, user: req.user._id }, $addToSet: { brokers: { $each: brokers } } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
    res.status(201).json(formatInvestment(investment))
  } catch (error) {
    res.status(400).json({ message: 'Failed to create investment', error: error.message })
  }
}

export const updateInvestment = async (req, res) => {
  try {
    const payload = prepareInvestmentPayload(req.body)
    if (!payload.uniqueKey) {
      throw new Error('Unable to derive unique key')
    }
    const { brokers, ...updateData } = payload
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { ...updateData, user: req.user._id }, $addToSet: { brokers: { $each: brokers } } },
      {
        new: true,
        runValidators: true,
      },
    )
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' })
    }
    res.json(formatInvestment(investment))
  } catch (error) {
    res.status(400).json({ message: 'Failed to update investment', error: error.message })
  }
}

export const deleteInvestment = async (req, res) => {
  try {
    const deleted = await Investment.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!deleted) return res.status(404).json({ message: 'Investment not found' })
    res.status(204).end()
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete investment', error: error.message })
  }
}

export const importInvestmentStatement = async (req, res) => {
  const { broker, statementDate, holdings, source, summary, rawFileName } = req.body
  if (!broker || !statementDate || !Array.isArray(holdings) || holdings.length === 0) {
    return res.status(400).json({ message: 'Missing broker/statementDate/holdings' })
  }

  try {
    const result = await handleInvestmentImport({
      holdings,
      broker,
      statementDate,
      source,
      rawFileName,
      summary,
      userId: req.user._id,
    })

    res.status(201).json({
      import: result.importLog,
      holdings: result.successes.map((item) => (item.toObject ? formatInvestment(item) : item)),
      errors: result.errors,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to import statement', error: error.message })
  }
}

export const importInvestmentStatementFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Upload a CSV or XLSX file exported from your broker' })
  }
  const broker = req.body?.broker || 'Manual'
  const statementDate = req.body?.statementDate || new Date().toISOString()

  try {
    const { holdings, summary } = parseInvestmentStatement(req.file.buffer)
    const result = await handleInvestmentImport({
      holdings,
      broker,
      statementDate,
      source: 'file-upload',
      rawFileName: req.file.originalname,
      summary,
      userId: req.user._id,
    })

    if (!result.successes.length) {
      return res.status(400).json({
        message: 'Unable to import any holdings from the uploaded statement.',
        errors: result.errors,
      })
    }

    res.status(201).json({
      import: result.importLog,
      holdings: result.successes.map((item) => (item.toObject ? formatInvestment(item) : item)),
      errors: result.errors,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
