import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './ExpensesBarChart.css'

const ExpensesBarChart = ({ data }) => (
  <div className="expenses-bar-chart">
    <div className="expenses-bar-chart__header">
      <div>
        <p>Reports</p>
        <h3>Monthly expenses</h3>
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
