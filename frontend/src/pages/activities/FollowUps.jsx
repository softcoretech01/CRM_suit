import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Badge, Avatar, EmptyState } from '../../components/common/Ui';
import { MiniStat } from '../../components/common/PageParts';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, relativeDue, priorityTone, activityIcon, getTodayISO } from '../../utils/format';
import { FollowUpModal, CompleteFollowUpModal } from '../../components/crm/ActivityModals';

const TODAY = getTodayISO();

const TYPE_COLOR = {
  Call: '#2563eb', Email: '#4f46e5', Meeting: '#7e22ce', Visit: '#0891b2',
  WhatsApp: '#16a34a', Demo: '#d97706', Proposal: '#be185d', Task: '#0e7490', Note: '#475569',
};

function FollowUpCard({ fu, onComplete }) {
  const isOverdue = fu.status !== 'Completed' && fu.date < TODAY;
  const isCompleted = fu.status === 'Completed';
  
  return (
    <div className={`surface p-3 ${isCompleted ? 'opacity-75' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: isOverdue ? '4px solid var(--danger)' : '4px solid transparent' }}>
      <div className="d-flex align-items-start gap-2">
        <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-soft)', color: TYPE_COLOR[fu.type] || 'var(--primary)' }}>
          <i className={`bi ${activityIcon(fu.type)}`} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fw-6 text-truncate">{fu.company || '—'}</div>
          <div className="fs-13 text-secondary-c text-truncate">{fu.subject}</div>
        </div>
        <Badge tone={isCompleted ? 'tone-green' : priorityTone(fu.priority)}>{isCompleted ? 'Completed' : fu.priority}</Badge>
      </div>
      <div className="d-flex align-items-center justify-content-between">
        <span className={`fs-12 ${isOverdue ? 'text-danger fw-6' : 'text-muted-c'}`}>
          <i className="bi bi-clock" /> {isCompleted ? `Completed ${fu.date}` : `Due: ${relativeDue(fu.date)} · ${fu.time || '—'}`}
        </span>
        <div className="d-flex align-items-center gap-1" title={fu.assignedTo}>
          <Avatar name={fu.assignedTo} size="sm" />
        </div>
      </div>
      {!isCompleted && (
        <div className="d-flex gap-2 mt-1">
          <button className="btn btn-primary btn-sm flex-fill" onClick={() => onComplete(fu)}><i className="bi bi-check-lg" /> Complete</button>
        </div>
      )}
    </div>
  );
}

function CalendarView({ followUps, onComplete }) {
  const year = 2026, month = 7; // August (0-indexed)
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = 31;
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = useMemo(() => {
    const m = {};
    followUps.forEach((fu) => {
      const d = new Date(fu.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        (m[day] = m[day] || []).push(fu);
      }
    });
    return m;
  }, [followUps]);

  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="surface p-3" style={{ overflowX: 'auto' }}>
      <div className="d-flex align-items-center justify-content-between mb-3 px-1">
        <div className="fw-7" style={{ fontSize: 16 }}>August 2026</div>
      </div>
      <div style={{ minWidth: 720 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
          {DOW.map((d) => <div key={d} className="fs-12 fw-6 text-secondary-c text-center">{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, gridAutoRows: 'minmax(100px, auto)' }}>
          {cells.map((d, i) => (
            <div key={i} className="rounded" style={{ border: '1px solid var(--border-soft)', padding: 6, background: d === 12 ? 'var(--primary-soft)' : '#fff' }}>
              {d && <div className={`fs-13 fw-6 mb-1 ${d === 12 ? 'text-primary' : 'text-secondary-c'}`}>{d}</div>}
              {d && byDay[d]?.map((fu) => (
                <div key={fu.id} className="p-1 mb-1 rounded fs-11 text-truncate" style={{ background: fu.status === 'Completed' ? 'var(--bg-soft)' : (TYPE_COLOR[fu.type] + '20'), color: fu.status === 'Completed' ? 'var(--text-muted)' : (TYPE_COLOR[fu.type] || '#000'), cursor: 'pointer', textDecoration: fu.status === 'Completed' ? 'line-through' : 'none' }} onClick={() => fu.status !== 'Completed' && onComplete(fu)}>
                  {fu.time} {fu.subject}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FollowUps() {
  const navigate = useNavigate();
  const crm = useCrm();
  const [view, setView] = useState('list');
  const [completeModal, setCompleteModal] = useState(null);
  const [newFollowUpModal, setNewFollowUpModal] = useState(false);

  const buckets = useMemo(() => {
    const b = { Overdue: [], Today: [], Upcoming: [], Completed: [] };
    crm.followUps.forEach((fu) => {
      if (fu.status === 'Completed') b.Completed.push(fu);
      else if (fu.date < TODAY) b.Overdue.push(fu);
      else if (fu.date === TODAY) b.Today.push(fu);
      else b.Upcoming.push(fu);
    });
    return b;
  }, [crm.followUps]);

  const META = {
    Overdue: { color: 'var(--danger)', icon: 'bi-exclamation-triangle-fill' },
    Today: { color: 'var(--primary)', icon: 'bi-calendar-check-fill' },
    Upcoming: { color: 'var(--text-muted)', icon: 'bi-calendar3' },
    Completed: { color: 'var(--success)', icon: 'bi-check2-all' },
  };

  const order = ['Overdue', 'Today', 'Upcoming', 'Completed'];

  return (
    <div className="page">
      <PageHeader
        title="Follow-ups"
        subtitle="Manage all your future actions"
        icon="bi-check2-square"
      />

      <div className="grid grid-kpi mb-4">
        <MiniStat value={buckets.Overdue.length} label="Overdue" tone="var(--danger)" />
        <MiniStat value={buckets.Today.length} label="Due Today" tone="var(--primary)" />
        <MiniStat value={buckets.Upcoming.length} label="Upcoming" tone="var(--text-muted)" />
        <MiniStat value={buckets.Completed.length} label="Completed" tone="var(--success)" />
        
        <div 
          className="surface p-3 text-center d-flex flex-column align-items-center justify-content-center"
          style={{ minWidth: 0, cursor: 'pointer', border: '1px dashed var(--primary)', background: 'var(--primary-soft)' }}
          onClick={() => setNewFollowUpModal(true)}
        >
          <div className="fw-7 mono" style={{ fontSize: 20, color: 'var(--primary)' }}><i className="bi bi-plus-lg" /></div>
          <div className="fs-12 text-primary-c mt-1 fw-6">New Follow-up</div>
        </div>
      </div>

      <div className="d-flex align-items-center mb-4 gap-2">
        <div className="seg">
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><i className="bi bi-list-ul" /> List View</button>
          <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}><i className="bi bi-calendar3" /> Calendar</button>
        </div>
      </div>

      {view === 'list' ? (
        <>
          {crm.followUps.length === 0 && (
            <EmptyState icon="bi-check2-circle" title="All caught up" message="You have no pending follow-ups. Great work!" />
          )}

          {order.filter((k) => buckets[k].length > 0).map((k) => (
            <div key={k} className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ width: 30, height: 30, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: META[k].color, color: '#fff' }}>
                  <i className={`bi ${META[k].icon}`} />
                </span>
                <div className="fw-7" style={{ fontSize: 15 }}>{k}</div>
                <Badge tone={k === 'Overdue' ? 'tone-red' : (k === 'Completed' ? 'tone-green' : 'tone-gray')}>{buckets[k].length}</Badge>
              </div>
              <div className="grid grid-3">
                {buckets[k].map((fu) => (
                  <FollowUpCard key={fu.id} fu={fu} onComplete={setCompleteModal} />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <CalendarView followUps={crm.followUps} onComplete={setCompleteModal} />
      )}

      {/* Complete Follow Up Modal */}
      {completeModal && (
        <CompleteFollowUpModal
          open={!!completeModal}
          followUp={completeModal}
          onClose={(action) => {
            setCompleteModal(null);
            if (action === 'open-followup') setNewFollowUpModal(true);
          }}
          entity={
            completeModal.relatedEntityType === 'Lead' ? crm.leads.find(l => l.id === completeModal.relatedEntityId) :
            completeModal.relatedEntityType === 'Opportunity' ? crm.opportunities.find(o => o.id === completeModal.relatedEntityId) :
            crm.companies.find(c => c.id === completeModal.relatedEntityId)
          }
          entityType={completeModal.relatedEntityType}
        />
      )}

      {/* New Follow Up Modal */}
      {newFollowUpModal && (
        <FollowUpModal
          open={newFollowUpModal}
          onClose={() => setNewFollowUpModal(false)}
          entity={{}}
          entityType="General"
        />
      )}
    </div>
  );
}
