import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import './CashFlowSparkline.css'

const tooltipStyles = {
  backgroundColor: 'var(--app-card-bg)',
  border: '1px solid var(--app-card-border)',
  color: 'var(--app-body-text)',
  borderRadius: '9999px',
  padding: '0.35rem 0.75rem',
}

const CashFlowSparkline = ({ data = [] }) => (
  <div className="cash-flow-sparkline">
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f0f0f" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#0f0f0f" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Tooltip contentStyle={tooltipStyles} />
        <Area type="monotone" dataKey="value" stroke="#0f0f0f" strokeWidth={2} fillOpacity={1} fill="url(#cashFlowGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

export default CashFlowSparkline
