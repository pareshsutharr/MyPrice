import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const DOCUMENTS_FALLBACK_BASE = import.meta.env.VITE_DOCUMENTS_FALLBACK_URL || 'http://localhost:4000/api'
export const CURRENT_API_BASE = API_BASE

const client = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
})

const documentsFallbackClient = axios.create({
  baseURL: DOCUMENTS_FALLBACK_BASE,
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

const shouldRetryDocumentsOnLocal = (error) => {
  if (DOCUMENTS_FALLBACK_BASE === API_BASE) return false
  return error?.response?.status === 404
}

const safeDocumentsRequest = async (request, fallbackRequest) => {
  try {
    return await safeRequest(request)
  } catch (error) {
    if (!shouldRetryDocumentsOnLocal(error)) {
      throw error
    }
    return safeRequest(fallbackRequest)
  }
}

export const api = {
  setAuthToken: (token) => {
    if (token) {
      client.defaults.headers.common.Authorization = `Bearer ${token}`
      documentsFallbackClient.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete client.defaults.headers.common.Authorization
      delete documentsFallbackClient.defaults.headers.common.Authorization
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
    formData.append('file', file)
    const response = await client.post('/investments/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    return response.data
  },
  getInvestmentImportTemplateUrl: () => `${client.defaults.baseURL}/investments/import/template`,
  getDocuments: (parentId = null) =>
    safeDocumentsRequest(
      () => client.get('/documents', { params: parentId ? { parentId } : {} }),
      () => documentsFallbackClient.get('/documents', { params: parentId ? { parentId } : {} }),
    ),
  getDocumentFolders: () =>
    safeDocumentsRequest(
      () => client.get('/documents/folders'),
      () => documentsFallbackClient.get('/documents/folders'),
    ),
  createDocumentFolder: (payload) =>
    safeDocumentsRequest(
      () => client.post('/documents/folders', payload),
      () => documentsFallbackClient.post('/documents/folders', payload),
    ),
  uploadDocuments: async ({ parentId, files, onUploadProgress }) => {
    const formData = new FormData()
    if (parentId) {
      formData.append('parentId', parentId)
    }
    files.forEach((file) => {
      formData.append('files', file)
    })
    return safeDocumentsRequest(
      async () => {
        const response = await client.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress,
        })
        return response.data
      },
      async () => {
        const response = await documentsFallbackClient.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress,
        })
        return response.data
      },
    )
  },
  renameDocument: (id, payload) =>
    safeDocumentsRequest(
      () => client.patch(`/documents/${id}`, payload),
      () => documentsFallbackClient.patch(`/documents/${id}`, payload),
    ),
  moveDocuments: (payload) =>
    safeDocumentsRequest(
      () => client.post('/documents/move', payload),
      () => documentsFallbackClient.post('/documents/move', payload),
    ),
  deleteDocument: (id) =>
    safeDocumentsRequest(
      () => client.delete(`/documents/${id}`),
      () => documentsFallbackClient.delete(`/documents/${id}`),
    ),
  getDocumentBlob: async (id) => {
    try {
      const response = await client.get(`/documents/${id}/content`, { responseType: 'blob' })
      return response.data
    } catch (error) {
      if (!shouldRetryDocumentsOnLocal(error)) {
        throw error
      }
      const response = await documentsFallbackClient.get(`/documents/${id}/content`, { responseType: 'blob' })
      return response.data
    }
  },
  getHistory: () => safeRequest(() => client.get('/history')),
}
