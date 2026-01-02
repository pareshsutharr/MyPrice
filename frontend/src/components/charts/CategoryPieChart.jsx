import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const CategoryPieChart = ({ data }) => (
  <div className="glass-card p-4 h-72 min-w-0">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm text-slate-500">Distribution</p>
        <h3 className="text-xl font-display text-slate-900">Category split</h3>
      </div>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={60}
          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
        >
          {data?.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
)

export default CategoryPieChart
