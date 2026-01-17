import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@services/api.js'
import { useAuth } from '@context/AuthContext.jsx'

const FinanceContext = createContext()

export const FinanceProvider = ({ children }) => {
  const [stats, setStats] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [loans, setLoans] = useState({ active: [], completed: [] })
  const [investments, setInvestments] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token, logout } = useAuth()

  const recordError = useCallback((err, fallbackMessage = 'Something went wrong') => {
    if (!err && !fallbackMessage) return
    const message = err?.response?.data?.message ?? err?.message ?? fallbackMessage
    const details = err?.response?.data?.error
    const help =
      err?.response?.status === 401
        ? 'Please sign in again to continue.'
        : err?.message?.includes('Network Error')
          ? 'Check your internet connection and try again.'
          : 'Please try again or refresh the page.'
    setError({
      message,
      details,
      help,
      timestamp: new Date().toISOString(),
    })
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const fetchAll = useCallback(async () => {
    if (!token) {
      setStats(null)
      setExpenses([])
      setIncome([])
      setLoans({ active: [], completed: [] })
      setInvestments([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [statsRes, expensesRes, incomeRes, loansRes, investmentsRes, historyRes] =
        await Promise.all([
          api.getStats(),
          api.getExpenses(),
          api.getIncome(),
          api.getLoans(),
          api.getInvestments(),
          api.getHistory(),
        ])
      setStats(statsRes)
      setExpenses(expensesRes)
      setIncome(incomeRes)
      setLoans(loansRes)
      setInvestments(investmentsRes)
      setHistory(historyRes)
    } catch (err) {
      if (err?.response?.status === 401) {
        logout()
      } else {
        recordError(err, 'Unable to load your dashboard data right now.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, logout, recordError])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const withAuthGuard = useCallback(
    async (operation) => {
      try {
        return await operation()
      } catch (err) {
        if (err?.response?.status === 401) {
          logout()
        } else {
          recordError(err)
        }
        throw err
      }
    },
    [logout, recordError],
  )

  const addExpense = useCallback(
    (payload) =>
      withAuthGuard(async () => {
        await api.createExpense(payload)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const updateExpense = useCallback(
    (id, payload) =>
      withAuthGuard(async () => {
        await api.updateExpense(id, payload)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const deleteExpense = useCallback(
    (id) =>
      withAuthGuard(async () => {
        await api.deleteExpense(id)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const deleteExpensesBulk = useCallback(
    (ids = []) =>
      withAuthGuard(async () => {
        const uniqueIds = [...new Set(ids.filter(Boolean))]
        if (uniqueIds.length === 0) return
        await Promise.all(uniqueIds.map((expenseId) => api.deleteExpense(expenseId)))
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const addIncome = useCallback(
    (payload) =>
      withAuthGuard(async () => {
        await api.createIncome(payload)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const updateIncome = useCallback(
    (id, payload) =>
      withAuthGuard(async () => {
        await api.updateIncome(id, payload)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const deleteIncome = useCallback(
    (id) =>
      withAuthGuard(async () => {
        await api.deleteIncome(id)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const deleteIncomeBulk = useCallback(
    (ids = []) =>
      withAuthGuard(async () => {
        const uniqueIds = [...new Set(ids.filter(Boolean))]
        if (uniqueIds.length === 0) return
        await Promise.all(uniqueIds.map((incomeId) => api.deleteIncome(incomeId)))
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const addLoan = useCallback(
    (payload) =>
      withAuthGuard(async () => {
        await api.createLoan(payload)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const deleteLoan = useCallback(
    (id) =>
      withAuthGuard(async () => {
        await api.deleteLoan(id)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const addInvestment = useCallback(
    (payload) =>
      withAuthGuard(async () => {
        await api.createInvestment(payload)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const updateInvestment = useCallback(
    (id, payload) =>
      withAuthGuard(async () => {
        await api.updateInvestment(id, payload)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const deleteInvestment = useCallback(
    (id) =>
      withAuthGuard(async () => {
        await api.deleteInvestment(id)
        await fetchAll()
      }),
    [withAuthGuard, fetchAll],
  )

  const payLoan = useCallback(
    (id, payload = {}) =>
      withAuthGuard(async () => {
        const response = await api.payLoan(id, payload)
        await fetchAll()
        return response
      }),
    [withAuthGuard, fetchAll],
  )

  const undoLoanPayment = useCallback(
    (id, paymentId) =>
      withAuthGuard(async () => {
        const response = await api.undoLoanPayment(id, paymentId)
        await fetchAll()
        return response
      }),
    [withAuthGuard, fetchAll],
  )

  const importInvestments = useCallback(
    (payload) =>
      withAuthGuard(async () => {
        const response = await api.importInvestments(payload)
        await fetchAll()
        return response
      }),
    [withAuthGuard, fetchAll],
  )

  const contextValue = useMemo(
    () => ({
      stats,
      expenses,
      income,
      loans,
      investments,
      history,
      loading,
      error,
      clearError,
      refresh: fetchAll,
      actions: {
        addExpense,
        updateExpense,
        deleteExpense,
        deleteExpensesBulk,
        addIncome,
        updateIncome,
        deleteIncome,
        deleteIncomeBulk,
        addLoan,
        deleteLoan,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        importInvestments,
        payLoan,
        undoLoanPayment,
      },
    }),
    [
      stats,
      expenses,
      income,
      loans,
      investments,
      history,
      loading,
      error,
      clearError,
      fetchAll,
      addExpense,
      updateExpense,
      deleteExpense,
      deleteExpensesBulk,
      addIncome,
      updateIncome,
      deleteIncome,
      deleteIncomeBulk,
      addLoan,
      deleteLoan,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      importInvestments,
      payLoan,
      undoLoanPayment,
    ],
  )

  return <FinanceContext.Provider value={contextValue}>{children}</FinanceContext.Provider>
}

export const useFinance = () => useContext(FinanceContext)
