import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarRange,
  WalletCards,
  BarChart3,
  LineChart,
  CandlestickChart,
  Coins,
  PiggyBank,
  History as HistoryIcon,
  Settings as SettingsIcon,
  AlertCircle,
  EllipsisVertical,
  SlidersHorizontal,
  Palette,
} from 'lucide-react'
import { useFinance } from '@context/FinanceContext.jsx'
import { useAuth } from '@context/AuthContext.jsx'
import FloatingActionButton from '@components/FloatingActionButton.jsx'
import { useCurrencyFormatter } from '@hooks/useCurrencyFormatter.js'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: CalendarRange },
  { to: '/income', label: 'Income', icon: PiggyBank },
  { to: '/loans', label: 'Loans & EMI', icon: WalletCards },
  { to: '/mutual-funds', label: 'Mutual Funds', icon: LineChart },
  { to: '/stocks', label: 'Stocks', icon: CandlestickChart },
  { to: '/net-worth', label: 'Net Worth', icon: Coins },
  { to: '/history', label: 'History', icon: HistoryIcon },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

const primaryMobileRoutes = ['/', '/mutual-funds', '/net-worth']

const mobileUtilities = [
  {
    label: 'Customize dashboard',
    description: 'Reorder tiles & manage cards',
    to: '/?customize=1',
    icon: SlidersHorizontal,
  },
  {
    label: 'Appearance',
    description: 'Theme, currency, date format',
    to: '/settings',
    icon: Palette,
  },
]

const DashboardLayout = () => {
  const { stats, refresh, error, clearError } = useFinance()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const primaryMobileNav = navItems.filter((item) => primaryMobileRoutes.includes(item.to))
  const extraMobileNav = navItems.filter((item) => !primaryMobileRoutes.includes(item.to))
  const formatCurrency = useCurrencyFormatter()

  return (
    <div className="min-h-screen bg-surfaceMuted text-slate-900">
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-borderLight bg-white p-6 flex-col gap-8">
        <div>
          <Link to="/" className="inline-flex" aria-label="MoneyXP Dashboard">
            <img src="/assets/moneyxp_logo.png" alt="MoneyXP" className="h-12 md:h-14 w-auto" />
          </Link>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' }
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
            {formatCurrency(stats?.totals?.balance ?? 0)}
          </span>
        </div>
      </div>
      <div className="lg:ml-64 min-h-screen">
        <header className="border-b border-borderLight bg-white px-3 py-3 md:p-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <img
              src="/assets/moneyxp_logo.png"
              alt="MoneyXP"
              className="h-7 w-auto md:hidden"
            />
            <p className="text-xs text-slate-500 uppercase tracking-widest hidden md:block">Welcome back</p>
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
            end={item.to === '/' }
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center py-2.5 ${
                isActive ? 'text-accentBlue' : 'text-slate-500'
              }`
            }
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className="flex-1 flex items-center justify-center py-2.5 text-slate-600"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="More"
        >
          <span className="h-8 w-8 rounded-full border border-borderLight flex items-center justify-center">
            <EllipsisVertical className="h-5 w-5" aria-hidden="true" />
          </span>
        </button>
      </nav>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="absolute bottom-16 left-3 right-3 bg-white rounded-2xl shadow-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Navigate</p>
              <button type="button" className="text-xs text-slate-500" onClick={() => setMobileMenuOpen(false)}>
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
            <div className="space-y-2 pt-2 border-t border-borderLight">
              <p className="text-xs uppercase tracking-wide text-slate-400">Quick tools</p>
              <div className="space-y-2">
                {mobileUtilities.map((tool) => (
                  <Link
                    key={`mobile-tool-${tool.to}`}
                    to={tool.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-borderLight px-3 py-2 text-sm text-slate-600"
                  >
                    <tool.icon className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-slate-800">{tool.label}</p>
                      <p className="text-xs text-slate-500">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <FloatingActionButton />
    </div>
  )
}

export default DashboardLayout
