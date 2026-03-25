import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route error boundary caught an error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-[1.75rem] border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-500/30 dark:bg-slate-950">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-2xl font-display text-slate-900 dark:text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Try refreshing the page.</p>
            <button type="button" className="btn-primary mt-5" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <details className="mt-6 rounded-2xl border border-borderLight bg-surfaceMuted p-4 text-left text-sm text-slate-600 dark:text-slate-300">
              <summary className="cursor-pointer font-medium text-slate-900 dark:text-white">
                Technical details
              </summary>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs">
                {this.state.error?.message ?? 'Unknown error'}
              </pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
