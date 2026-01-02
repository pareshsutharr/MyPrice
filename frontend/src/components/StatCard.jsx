import clsx from 'clsx'

const StatCard = ({ label, value, description, icon: Icon, accent = 'from-accentBlue to-accentPurple' }) => (
  <div className="glass-card p-4 flex flex-col gap-2">
    <div className="flex items-center gap-3">
      <div className={clsx('p-3 rounded-2xl bg-gradient-to-tr text-white shadow-glow', accent)}>
        {Icon ? <Icon className="h-6 w-6" /> : <span className="text-xl font-semibold">₹</span>}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold font-display text-slate-900">{value}</p>
      </div>
    </div>
    {description && <p className="text-xs text-slate-500">{description}</p>}
  </div>
)

export default StatCard
