import { activityIcon, statusTone } from '../../utils/format';

/**
 * Timeline grouped by day.
 * groups: [{ day, items: [{ icon, tone, title, meta, desc, time, badge }] }]
 */
export default function Timeline({ groups }) {
  if (!groups || groups.length === 0) {
    return <div className="text-center text-muted-c py-4 fs-13">No timeline activity yet.</div>;
  }
  return (
    <div>
      {groups.map((g, gi) => (
        <div key={gi}>
          <div className="tl-day">{g.day}</div>
          <div className="timeline">
            {g.items.map((it, i) => {
              const [bg, fg] = toneColor(it.tone);
              return (
                <div className="tl-item" key={i}>
                  <span className="tl-dot" style={{ background: bg, borderColor: bg, color: fg }}>
                    <i className={`bi ${it.icon}`} />
                  </span>
                  <div className="d-flex align-items-start gap-2">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-6" style={{ fontSize: 13.5 }}>{it.title}</div>
                      {it.desc && <div className="fs-13 text-secondary-c mt-1">{it.desc}</div>}
                      {it.meta && <div className="fs-12 text-muted-c mt-1">{it.meta}</div>}
                    </div>
                    {it.time && <span className="fs-12 text-muted-c" style={{ whiteSpace: 'nowrap' }}>{it.time}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function toneColor(tone) {
  const map = {
    'tone-blue': ['#eff4ff', '#2563eb'],
    'tone-green': ['#e8f6ec', '#16a34a'],
    'tone-amber': ['#fdf3e5', '#d97706'],
    'tone-red': ['#fdeceb', '#dc2626'],
    'tone-teal': ['#e6f6fa', '#0891b2'],
    'tone-indigo': ['#eef0ff', '#4f46e5'],
    'tone-purple': ['#f3e8ff', '#7e22ce'],
    'tone-gray': ['#f1f5f9', '#64748b'],
  };
  return map[tone] || map['tone-gray'];
}

// Helper to build activity timeline groups from activity records
export function activitiesToTimeline(activities) {
  const byDate = {};
  [...activities]
    .sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')) - new Date(a.date + 'T' + (a.time || '00:00')))
    .forEach((a) => {
      (byDate[a.date] = byDate[a.date] || []).push(a);
    });
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Object.entries(byDate).map(([date, items]) => {
    const d = new Date(date);
    return {
      day: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
      items: items.map((a) => ({
        icon: activityIcon(a.type),
        tone: statusTone(a.status),
        title: `${a.type} — ${a.subject}`,
        desc: a.summary || undefined,
        meta: `${a.conductedBy || a.assignedTo || 'System'}${a.outcome ? ' · ' + a.outcome : ''}`,
        time: a.time,
      })),
    };
  });
}

export function mixedToTimeline(activities = [], followUps = []) {
  const merged = [
    ...activities.map(a => ({ ...a, _isFu: false })),
    ...followUps.map(f => ({ ...f, _isFu: true, summary: f.notes }))
  ];
  const byDate = {};
  merged
    .sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')) - new Date(a.date + 'T' + (a.time || '00:00')))
    .forEach((a) => {
      (byDate[a.date] = byDate[a.date] || []).push(a);
    });
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Object.entries(byDate).map(([date, items]) => {
    const d = new Date(date);
    return {
      day: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
      items: items.map((a) => ({
        icon: a._isFu ? 'bi-calendar-check' : activityIcon(a.type),
        tone: a._isFu ? (a.status === 'Completed' ? 'tone-green' : 'tone-amber') : statusTone(a.status),
        title: `${a._isFu ? 'Follow-up' : a.type} — ${a.subject}`,
        desc: a.summary || undefined,
        meta: `${a.conductedBy || a.assignedTo || 'System'}${a.outcome ? ' · ' + a.outcome : ''}`,
        time: a.time,
      })),
    };
  });
}
