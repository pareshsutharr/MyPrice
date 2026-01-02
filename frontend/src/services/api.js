import axios from 'axios'
import {
  mockExpenses,
  mockIncome,
  mockInvestments,
  mockLoans,
  mockStats,
  mockHistory,
} from '@data/mockData.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
})

const safeRequest = async (request, fallback = null) => {
  try {
    const response = await request()
    return response.data
  } catch (error) {
    if (error?.response) {
      throw error
    }
    console.warn('API unreachable, using fallback data', error?.message)
    return fallback
  }
}

export const api = {
  setAuthToken: (token) => {
    if (token) {
      client.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete client.defaults.headers.common.Authorization
    }
  },
  loginWithGoogle: (idToken) => client.post('/auth/google', { idToken }).then((res) => res.data),
  getStats: () => safeRequest(() => client.get('/stats'), mockStats),
  getExpenses: (params = {}) =>
    safeRequest(() => client.get('/expenses', { params }), mockExpenses),
  createExpense: (payload) => safeRequest(() => client.post('/expenses', payload), payload),
  updateExpense: (id, payload) =>
    safeRequest(() => client.put(`/expenses/${id}`, payload), payload),
  deleteExpense: (id) => safeRequest(() => client.delete(`/expenses/${id}`), { success: true }),

  getIncome: () => safeRequest(() => client.get('/income'), mockIncome),
  createIncome: (payload) => safeRequest(() => client.post('/income', payload), payload),

  getLoans: () =>
    safeRequest(() => client.get('/loans'), {
      active: mockLoans.filter((loan) => loan.status === 'active'),
      completed: mockLoans.filter((loan) => loan.status === 'completed'),
    }),
  createLoan: (payload) => safeRequest(() => client.post('/loans', payload), payload),
  updateLoan: (id, payload) => safeRequest(() => client.put(`/loans/${id}`, payload), payload),
  payLoan: (id, payload = {}) => safeRequest(() => client.post(`/loans/${id}/pay`, payload), payload),
  undoLoanPayment: (id, paymentId) =>
    safeRequest(() => client.delete(`/loans/${id}/pay/${paymentId}`), { id, paymentId }),

  getInvestments: () => safeRequest(() => client.get('/investments'), mockInvestments),
  createInvestment: (payload) =>
    safeRequest(() => client.post('/investments', payload), {
      ...payload,
      _id: `investment-fallback-${Date.now()}`,
      gain: (payload.currentValue ?? 0) - (payload.amountInvested ?? 0),
    }),
  updateInvestment: (id, payload) =>
    safeRequest(() => client.put(`/investments/${id}`, payload), payload),
  deleteInvestment: (id) => safeRequest(() => client.delete(`/investments/${id}`), { success: true }),
  importInvestments: async ({ broker, statementDate, file, onUploadProgress }) => {
    const formData = new FormData()
    formData.append('broker', broker)
    formData.append('statementDate', statementDate)
    formData.append('statement', file)
    const response = await client.post('/investments/import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    return response.data
  },
  getHistory: () => safeRequest(() => client.get('/history'), mockHistory),
}
