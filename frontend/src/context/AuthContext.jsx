import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@services/api.js'

const AuthContext = createContext()
const STORAGE_KEY = 'myprice-auth'
const enableDevLogin = import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token)
          setUser(parsed.user)
          api.setAuthToken(parsed.token)
        }
      } catch (error) {
        console.warn('Failed to parse auth storage', error)
      }
    }
    setAuthLoading(false)
  }, [])

  const loginWithGoogle = async (googleCredential) => {
    const response = await api.loginWithGoogle(googleCredential)
    setToken(response.token)
    setUser(response.user)
    api.setAuthToken(response.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response))
    return response.user
  }

  const loginWithDevAccount = async (payload) => {
    if (!enableDevLogin) {
      throw new Error('Developer login is disabled.')
    }
    const response = await api.devLogin(payload)
    setToken(response.token)
    setUser(response.user)
    api.setAuthToken(response.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response))
    return response.user
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    api.setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({ user, token, authLoading, loginWithGoogle, loginWithDevAccount, logout }),
    [user, token, authLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
