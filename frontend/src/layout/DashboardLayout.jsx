import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarRange,
  WalletCards,
  BarChart3,
  LineChart,
  CandlestickChart,
  Coins,
  History as HistoryIcon,
  Settings as SettingsIcon,
  AlertCircle,
} from 'lucide-react'
import { useFinance } from '@context/FinanceContext.jsx'
import { useAuth } from '@context/AuthContext.jsx'
import FloatingActionButton from '@components/FloatingActionButton.jsx'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: CalendarRange },
  { to: '/loans', label: 'Loans & EMI', icon: WalletCards },
  { to: '/mutual-funds', label: 'Mutual Funds', icon: LineChart },
  { to: '/stocks', label: 'Stocks', icon: CandlestickChart },
  { to: '/net-worth', label: 'Net Worth', icon: Coins },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

const primaryMobileRoutes = ['/', '/mutual-funds', '/net-worth']

const DashboardLayout = () => {
  const { stats, refresh, error, clearError } = useFinance()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const primaryMobileNav = navItems.filter((item) => primaryMobileRoutes.includes(item.to))
  const extraMobileNav = navItems.filter((item) => !primaryMobileRoutes.includes(item.to))

  return (
    <div className="min-h-screen bg-surfaceMuted text-slate-900">
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-borderLight bg-white p-6 flex-col gap-8">
        <div>
          <h1 className="font-display text-2xl text-slate-900">MyPrice</h1>
          <p className="text-slate-500 text-sm">Finance tracker PWA</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  isActive ? 'bg-surfaceMuted text-slate-900' : 'text-slate-500'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto text-sm text-slate-500">
          Balance{' '}
          <span className="block text-2xl font-display text-slate-900">
            ₹ {stats?.totals?.balance?.toLocaleString() ?? 0}
          </span>
        </div>
      </div>
      <div className="lg:ml-64 min-h-screen">
        <header className="border-b border-borderLight bg-white px-3 py-3 md:p-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Welcome back</p>
            <h2 className="text-2xl font-display text-slate-900">Your finance buddy</h2>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="btn-secondary hidden md:block" onClick={refresh}>
              Refresh
            </button>
            {user && (
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
                    {user.name?.[0] ?? 'U'}
                  </div>
                )}
                <div className="text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <button type="button" className="text-xs text-rose-500" onClick={logout}>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="p-3 md:p-8 space-y-4">
          {error && (
            <div className="glass-card border border-rose-100 text-rose-700 flex flex-col md:flex-row md:items-center gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-rose-700">{error.message}</p>
                  {error.help && <p className="text-sm text-rose-500">{error.help}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-auto text-sm">
                <button type="button" className="text-slate-500 underline" onClick={clearError}>
                  Dismiss
                </button>
                <button type="button" className="btn-secondary" onClick={refresh}>
                  Try again
                </button>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-borderLight flex">
        {primaryMobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 text-xs ${
                isActive ? 'text-accentBlue' : 'text-slate-500'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
        <button
          type="button"
          className="flex-1 flex flex-col items-center py-2.5 text-xs text-slate-600"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="h-5 w-5 rounded-full border border-borderLight flex items-center justify-center text-sm">
            ⋯
          </span>
          More
        </button>
      </nav>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="absolute bottom-16 left-3 right-3 bg-white rounded-2xl shadow-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">More sections</p>
              <button
                type="button"
                className="text-xs text-slate-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {extraMobileNav.map((item) => (
                <NavLink
                  key={`mobile-extra-${item.to}`}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 border border-borderLight rounded-xl px-3 py-2 text-sm ${
                      isActive ? 'bg-surfaceMuted text-slate-900' : 'text-slate-600'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
      <FloatingActionButton />
    </div>
  )
}

export default DashboardLayout
