// StatCard + PageHeader + misc layout parts

export function StatCard({ icon, iconBg = 'var(--primary-soft)', iconColor = 'var(--primary)', value, label, trend, trendUp, sub, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="sc-top">
        <div className="sc-icon" style={{ background: iconBg, color: iconColor }}>
          <i className={`bi ${icon}`} />
        </div>
        {trend != null && (
          <span className={`sc-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            <i className={`bi ${trendUp ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} />
            {trend}
          </span>
        )}
      </div>
      <div className="sc-value">{value}</div>
      <div className="sc-label">{label}</div>
      {sub && <div className="fs-12 text-muted-c mt-1">{sub}</div>}
    </div>
  );
}

// Compact KPI used in strips
export function MiniStat({ value, label, tone = 'var(--primary)' }) {
  return (
    <div className="surface p-3 text-center" style={{ minWidth: 0 }}>
      <div className="fw-7 mono" style={{ fontSize: 20, color: tone }}>{value}</div>
      <div className="fs-12 text-secondary-c mt-1">{label}</div>
    </div>
  );
}
