import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { registerSW } from 'virtual:pwa-register'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { FinanceProvider } from '@context/FinanceContext.jsx'
import { AuthProvider } from '@context/AuthContext.jsx'
import { SettingsProvider } from '@context/SettingsContext.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

registerSW()

const AppTree = (
  <BrowserRouter>
    <AuthProvider>
      <SettingsProvider>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </SettingsProvider>
    </AuthProvider>
  </BrowserRouter>
)

if (!googleClientId && import.meta.env.DEV) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google login is disabled (dev login only).')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="bottom-right"
      toastOptions={{
        success: { duration: 3000 },
        error: { duration: 6000 },
      }}
    />
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{AppTree}</GoogleOAuthProvider>
    ) : (
      AppTree
    )}
  </StrictMode>,
)
