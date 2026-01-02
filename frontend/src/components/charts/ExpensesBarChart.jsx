import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const ExpensesBarChart = ({ data }) => (
  <div className="glass-card p-4 h-72 min-w-0">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm text-slate-500">Reports</p>
        <h3 className="text-xl font-display text-slate-900">Monthly expenses</h3>
      </div>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="label" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }}
        />
        <Bar dataKey="total" fill="#7c3aed" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default ExpensesBarChart
