import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
})

const safeRequest = async (request) => {
  try {
    const response = await request()
    return response.data
  } catch (error) {
    throw error
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
  devLogin: (payload) => client.post('/auth/dev-login', payload).then((res) => res.data),
  getStats: () => safeRequest(() => client.get('/stats')),
  getExpenses: (params = {}) => safeRequest(() => client.get('/expenses', { params })),
  createExpense: (payload) => safeRequest(() => client.post('/expenses', payload)),
  updateExpense: (id, payload) => safeRequest(() => client.put(`/expenses/${id}`, payload)),
  deleteExpense: (id) => safeRequest(() => client.delete(`/expenses/${id}`)),

  getIncome: () => safeRequest(() => client.get('/income')),
  createIncome: (payload) => safeRequest(() => client.post('/income', payload)),
  updateIncome: (id, payload) => safeRequest(() => client.put(`/income/${id}`, payload)),
  deleteIncome: (id) => safeRequest(() => client.delete(`/income/${id}`)),

  getLoans: () => safeRequest(() => client.get('/loans')),
  createLoan: (payload) => safeRequest(() => client.post('/loans', payload)),
  updateLoan: (id, payload) => safeRequest(() => client.put(`/loans/${id}`, payload)),
  deleteLoan: (id) => safeRequest(() => client.delete(`/loans/${id}`)),
  payLoan: (id, payload = {}) => safeRequest(() => client.post(`/loans/${id}/pay`, payload)),
  undoLoanPayment: (id, paymentId) =>
    safeRequest(() => client.delete(`/loans/${id}/pay/${paymentId}`)),

  getInvestments: () => safeRequest(() => client.get('/investments')),
  createInvestment: (payload) => safeRequest(() => client.post('/investments', payload)),
  updateInvestment: (id, payload) => safeRequest(() => client.put(`/investments/${id}`, payload)),
  deleteInvestment: (id) => safeRequest(() => client.delete(`/investments/${id}`)),
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
  getHistory: () => safeRequest(() => client.get('/history')),
}
