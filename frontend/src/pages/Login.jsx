import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '@context/AuthContext.jsx'

const Login = () => {
  const { loginWithGoogle } = useAuth()
  const [error, setError] = useState('')

  const handleSuccess = async (response) => {
    try {
      await loginWithGoogle(response.credential)
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to sign in with Google')
    }
  }

  const handleError = () => {
    setError('Google login interrupted. Please try again.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surfaceMuted px-4">
      <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
        <div>
          <h1 className="text-3xl font-display text-slate-900">Welcome to MoneyXP</h1>
          <p className="text-slate-500 mt-2">Sign in with Google to sync your personal finance data.</p>
        </div>
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap />
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>
    </div>
  )
}

export default Login
