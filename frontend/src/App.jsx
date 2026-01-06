import { Route, Routes } from 'react-router-dom'
import DashboardLayout from '@layout/DashboardLayout.jsx'
import Dashboard from '@pages/Dashboard.jsx'
import Expenses from '@pages/Expenses.jsx'
import Income from '@pages/Income.jsx'
import Loans from '@pages/Loans.jsx'
import MutualFunds from '@pages/MutualFunds.jsx'
import Stocks from '@pages/Stocks.jsx'
import NetWorth from '@pages/NetWorth.jsx'
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/income" element={<Income />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/mutual-funds" element={<MutualFunds />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/net-worth" element={<NetWorth />} />
        <Route path="/investments" element={<MutualFunds />} />
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/import" element={<ImportData />} />
        <Route path="/itr-filing" element={<ItrFiling />} />
        <Route path="/banks" element={<Banks />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
