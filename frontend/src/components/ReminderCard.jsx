const ReminderCard = ({ reminder }) => (
  <div className="glass-card p-4 flex justify-between items-center">
    <div>
      <p className="text-xs text-slate-500">EMI Reminder</p>
      <p className="text-lg font-display text-slate-900">{reminder.lender}</p>
      <p className="text-sm text-slate-500">
        Due on {new Date(reminder.dueOn).toLocaleDateString('en-IN')} · EMI{' '}
        {reminder.emiNumber}/{reminder.totalMonths}
      </p>
    </div>
    <p className="text-accentBlue font-semibold">₹ {reminder.monthlyEmi}</p>
  </div>
)

export default ReminderCard
