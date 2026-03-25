import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from '@components/ErrorBoundary.jsx'
import DashboardLayout from '@layout/DashboardLayout.jsx'
import Dashboard from '@pages/Dashboard.jsx'
import Expenses from '@pages/Expenses.jsx'
import Income from '@pages/Income.jsx'
import Loans from '@pages/Loans.jsx'
import MutualFunds from '@pages/MutualFunds.jsx'
import Stocks from '@pages/Stocks.jsx'
import NetWorth from '@pages/NetWorth.jsx'
import Goals from '@pages/Goals.jsx'
import Reports from '@pages/Reports.jsx'
import Settings from '@pages/Settings.jsx'
import History from '@pages/History.jsx'
import Login from '@pages/Login.jsx'
import ImportData from '@pages/ImportData.jsx'
import ItrFiling from '@pages/ItrFiling.jsx'
import Banks from '@pages/Banks.jsx'
import Documents from '@pages/Documents.jsx'
import { useAuth } from '@context/AuthContext.jsx'

const App = () => {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surfaceMuted">
        <p className="text-slate-500">Checking session...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="/expenses" element={<ErrorBoundary><Expenses /></ErrorBoundary>} />
        <Route path="/income" element={<ErrorBoundary><Income /></ErrorBoundary>} />
        <Route path="/loans" element={<ErrorBoundary><Loans /></ErrorBoundary>} />
        <Route path="/mutual-funds" element={<ErrorBoundary><MutualFunds /></ErrorBoundary>} />
        <Route path="/stocks" element={<ErrorBoundary><Stocks /></ErrorBoundary>} />
        <Route path="/net-worth" element={<ErrorBoundary><NetWorth /></ErrorBoundary>} />
        <Route path="/goals" element={<ErrorBoundary><Goals /></ErrorBoundary>} />
        <Route path="/investments" element={<ErrorBoundary><MutualFunds /></ErrorBoundary>} />
        <Route path="/history" element={<ErrorBoundary><History /></ErrorBoundary>} />
        <Route path="/reports" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
        <Route path="/import" element={<ErrorBoundary><ImportData /></ErrorBoundary>} />
        <Route path="/itr-filing" element={<ErrorBoundary><ItrFiling /></ErrorBoundary>} />
        <Route path="/banks" element={<ErrorBoundary><Banks /></ErrorBoundary>} />
        <Route path="/documents" element={<ErrorBoundary><Documents /></ErrorBoundary>} />
        <Route path="/document" element={<ErrorBoundary><Navigate to="/documents" replace /></ErrorBoundary>} />
        <Route path="/document-page" element={<ErrorBoundary><Navigate to="/documents" replace /></ErrorBoundary>} />
        <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
      </Route>
    </Routes>
  )
}

export default App
