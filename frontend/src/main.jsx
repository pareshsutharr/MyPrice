import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { FinanceProvider } from '@context/FinanceContext.jsx'
import { AuthProvider } from '@context/AuthContext.jsx'
import { SettingsProvider } from '@context/SettingsContext.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

registerSW()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <FinanceProvider>
              <App />
            </FinanceProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
