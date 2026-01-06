import { useMemo, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '@context/AuthContext.jsx'

const Login = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const enableDevLogin = import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true'
  const { loginWithGoogle, loginWithDevAccount } = useAuth()
  const [error, setError] = useState('')
  const [devEmail, setDevEmail] = useState('dev@example.com')
  const [devName, setDevName] = useState('Dev User')
  const [devError, setDevError] = useState('')
  const [devSubmitting, setDevSubmitting] = useState(false)
  const canUseGoogleLogin = useMemo(() => Boolean(googleClientId), [googleClientId])

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

  const handleDevSubmit = async (event) => {
    event.preventDefault()
    setDevError('')
    const trimmedEmail = devEmail.trim()
    if (!trimmedEmail) {
      setDevError('Enter an email to simulate login.')
      return
    }
    try {
      setDevSubmitting(true)
      await loginWithDevAccount({ email: trimmedEmail, name: devName.trim() })
    } catch (err) {
      setDevError(err?.response?.data?.message ?? err.message ?? 'Unable to run developer login.')
    } finally {
      setDevSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surfaceMuted px-4">
      <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
        <div>
          <h1 className="text-3xl font-display text-slate-900">Welcome to MoneyXP</h1>
          <p className="text-slate-500 mt-2">
            Sign in with Google to sync your personal finance data.
            {!canUseGoogleLogin && ' (Google Sign-In client ID missing in this build.)'}
          </p>
        </div>
        {canUseGoogleLogin ? (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              ux_mode="popup"
              shape="pill"
            />
          </div>
        ) : (
          <p className="text-sm text-amber-600">
            Provide <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google Sign-In.
          </p>
        )}
        {error && canUseGoogleLogin && <p className="text-sm text-rose-500">{error}</p>}
        {enableDevLogin && (
          <div className="text-left space-y-3 border-t border-borderLight pt-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Developer shortcut</p>
              <p className="text-xs text-slate-500">
                Issue a local token without contacting Google. Only available because
                <code className="ml-1">VITE_ENABLE_DEV_LOGIN=true</code>.
              </p>
            </div>
            <form className="space-y-3" onSubmit={handleDevSubmit}>
              <div className="text-left">
                <label className="block text-sm text-slate-600 mb-1">Email</label>
                <input
                  className="w-full rounded-xl border border-borderLight px-3 py-2 text-sm"
                  type="email"
                  value={devEmail}
                  onChange={(event) => setDevEmail(event.target.value)}
                  placeholder="developer@example.com"
                />
              </div>
              <div className="text-left">
                <label className="block text-sm text-slate-600 mb-1">Name (optional)</label>
                <input
                  className="w-full rounded-xl border border-borderLight px-3 py-2 text-sm"
                  type="text"
                  value={devName}
                  onChange={(event) => setDevName(event.target.value)}
                  placeholder="Dev User"
                />
              </div>
              <button
                type="submit"
                disabled={devSubmitting}
                className="btn-secondary w-full disabled:opacity-60"
              >
                {devSubmitting ? 'Signing in...' : 'Sign in without Google'}
              </button>
            </form>
            {devError && <p className="text-sm text-rose-500">{devError}</p>}
          </div>
        )}
        {!enableDevLogin && !canUseGoogleLogin && (
          <p className="text-sm text-rose-500">
            No login methods are enabled. Add Google credentials or toggle developer login in your
            .env files.
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
