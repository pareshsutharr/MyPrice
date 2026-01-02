const asNumber = (value) => {
  if (value === null || value === undefined || value === '') return NaN
  const number = Number(value)
  return Number.isFinite(number) ? number : NaN
}

export const validateString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`)
  }
  return value.trim()
}

export const validateNumber = (value, field, { min, max } = {}) => {
  const number = asNumber(value)
  if (Number.isNaN(number)) {
    throw new Error(`${field} must be a valid number`)
  }
  if (min !== undefined && number < min) {
    throw new Error(`${field} must be at least ${min}`)
  }
  if (max !== undefined && number > max) {
    throw new Error(`${field} must be less than or equal to ${max}`)
  }
  return number
}

export const validateDate = (value, field) => {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid date`)
  }
  return date
}

export const buildErrorResponse = (res, status, message, error) =>
  res.status(status).json({
    message,
    error: error?.message,
  })
