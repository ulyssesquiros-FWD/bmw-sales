export default function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  highlight = false
}) {
  return (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
      {Icon && (
        <div className={`stat-icon ${highlight ? 'glass' : variant}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

