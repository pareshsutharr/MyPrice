import './EmptyState.css'

const EmptyState = ({ icon: Icon, title, subtitle, actionLabel, onAction }) => (
  <div className="empty-state">
    {Icon ? (
      <div className="empty-state__icon" aria-hidden="true">
        <Icon size={48} />
      </div>
    ) : null}
    <h3 className="empty-state__title">{title}</h3>
    {subtitle ? <p className="empty-state__subtitle">{subtitle}</p> : null}
    {actionLabel && onAction ? (
      <button type="button" className="btn-primary empty-state__action" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null}
  </div>
)

export default EmptyState
