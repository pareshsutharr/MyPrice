import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const TrendAreaChart = ({ data = [] }) => (
  <div className="glass-card p-4 h-64 min-w-0">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm text-slate-500">Monthly trend</p>
        <p className="text-xl font-semibold font-display text-slate-900">Spending pulse</p>
      </div>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#2563eb"
          fillOpacity={1}
          fill="url(#trendGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

export default TrendAreaChart
