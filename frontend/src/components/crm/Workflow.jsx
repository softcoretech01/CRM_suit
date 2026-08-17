import { Card } from '../common/Ui';

export function AutomationNode({ node, onEdit, onDelete }) {
  let icon = 'bi-record-circle';
  let color = 'tone-gray';
  
  if (node.type === 'TRIGGER') { icon = 'bi-lightning-charge-fill'; color = 'tone-amber'; }
  if (node.type === 'CONDITION') { icon = 'bi-diagram-2-fill'; color = 'tone-blue'; }
  if (node.type === 'ACTION') { icon = 'bi-play-fill'; color = 'tone-green'; }
  if (node.type === 'WAIT') { icon = 'bi-stopwatch-fill'; color = 'tone-purple'; }
  
  return (
    <div className="automation-node position-relative mb-4" style={{ width: 300, margin: '0 auto' }}>
      <div className={`p-3 bg-white border rounded shadow-sm d-flex align-items-center position-relative`} style={{ zIndex: 2 }}>
        <div className={`rounded-circle ${color} d-flex align-items-center justify-content-center me-3`} style={{ width: 40, height: 40 }}>
          <i className={`bi ${icon} fs-5`} />
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="fs-11 fw-7 text-muted-c mb-1 text-uppercase">{node.type}</div>
          <div className="fw-6 fs-13 text-truncate">{node.title}</div>
        </div>
        <div className="ms-2 d-flex flex-column gap-1">
          <button className="icon-btn icon-btn-sm text-secondary-c" onClick={onEdit}><i className="bi bi-pencil" /></button>
          {node.type !== 'TRIGGER' && <button className="icon-btn icon-btn-sm text-danger-c" onClick={onDelete}><i className="bi bi-trash" /></button>}
        </div>
      </div>
      {!node.isLast && (
        <div className="position-absolute bg-border" style={{ width: 2, height: 30, left: '50%', bottom: -30, transform: 'translateX(-50%)', zIndex: 1 }}></div>
      )}
    </div>
  );
}

export function ApprovalTimeline({ levels = [] }) {
  return (
    <div className="d-flex flex-column align-items-center w-100 py-3">
      <div className="d-flex align-items-center justify-content-between w-100 position-relative px-4" style={{ maxWidth: 600 }}>
        <div className="position-absolute bg-border" style={{ height: 2, top: 15, left: 40, right: 40, zIndex: 0 }}></div>
        {levels.map((lvl, i) => {
          let statusColor = 'bg-light border';
          let icon = '';
          if (lvl.status === 'Approved') { statusColor = 'bg-success-c text-white'; icon = 'bi-check-lg'; }
          else if (lvl.status === 'Rejected') { statusColor = 'bg-danger-c text-white'; icon = 'bi-x-lg'; }
          else if (lvl.status === 'Pending') { statusColor = 'bg-warning-c text-white'; icon = 'bi-hourglass-split'; }

          return (
            <div key={i} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 1, width: 80 }}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm ${statusColor}`} style={{ width: 32, height: 32 }}>
                {icon ? <i className={`bi ${icon}`} /> : <span className="fs-12 fw-6">{i+1}</span>}
              </div>
              <div className="mt-2 text-center">
                <div className="fs-12 fw-6 text-truncate" style={{ maxWidth: 100 }}>{lvl.role}</div>
                <div className="fs-10 text-muted-c text-truncate" style={{ maxWidth: 100 }}>{lvl.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReportCard({ title, value, subtitle, trend, trendLabel, icon, tone = 'tone-blue' }) {
  return (
    <Card className="h-100">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <div className="text-muted-c fs-13 fw-6 mb-1">{title}</div>
          <div className="fs-24 fw-7 text-dark">{value}</div>
          {subtitle && <div className="fs-12 text-secondary-c mt-1">{subtitle}</div>}
        </div>
        <div className={`rounded-circle ${tone} d-flex align-items-center justify-content-center`} style={{ width: 48, height: 48 }}>
          <i className={`bi ${icon} fs-4`} />
        </div>
      </div>
      {trend && (
        <div className="mt-auto pt-3 border-top d-flex align-items-center">
          <span className={`badge bg-${trend > 0 ? 'success' : 'danger'}-subtle text-${trend > 0 ? 'success' : 'danger'}-c me-2 fs-12 fw-6 px-2 py-1`}>
            <i className={`bi bi-arrow-${trend > 0 ? 'up' : 'down'}-short`} /> {Math.abs(trend)}%
          </span>
          <span className="text-muted-c fs-12">{trendLabel || 'vs last month'}</span>
        </div>
      )}
    </Card>
  );
}
