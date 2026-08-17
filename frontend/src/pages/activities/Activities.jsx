import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Timeline from '../../components/common/Timeline';
import { Badge, Avatar, UserCell, EmptyState, Field, TimeSelect } from '../../components/common/Ui';
import ActionIconButton from '../../components/common/ActionIconButton';
import { Drawer, Modal } from '../../components/common/Overlay';
import { MiniStat } from '../../components/common/PageParts';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, relativeDue, formatTime, priorityTone, activityIcon, getTodayISO, statusTone } from '../../utils/format';
import { salespeople, activityTypes, priorities, nextActions } from '../../data/mockData';
import FollowUps from './FollowUps';

const TODAY = getTodayISO();
const CALL_OUTCOMES = ['Interested', 'Not Interested', 'Call Back', 'Busy', 'Wrong Number', 'Proposal Requested', 'Demo Requested', 'No Response'];
const CALL_DIRECTIONS = ['Inbound', 'Outbound'];
const MEETING_MODES = ['Office', 'Customer Site', 'Google Meet', 'Zoom', 'Teams'];

// distinct light-theme dot color per activity type
const TYPE_COLOR = {
  Call: '#2563eb', Email: '#4f46e5', Meeting: '#7e22ce', Visit: '#0891b2',
  WhatsApp: '#16a34a', Demo: '#d97706', Proposal: '#be185d', Task: '#0e7490', Note: '#475569',
};

// ============================================================
// Log Activity Drawer
// ============================================================
function LogActivityDrawer({ open, onClose, initialType, companies, activity }) {
  const crm = useCrm();
  const toast = useToast();
  const blank = () => ({
    type: initialType || 'Call',
    subject: '',
    company: '',
    contact: '',
    date: TODAY,
    time: '10:00',
    priority: 'Medium',
    conductedBy: salespeople[0] || '',
    nextAction: '',
    reminder: '',
    summary: '',
    duration: '',
    direction: CALL_DIRECTIONS[0],
    outcome: '',
    mode: MEETING_MODES[0],
    location: '',
    agenda: '',
    attendees: '',
    meetingNotes: '',
    actionItems: '',
    nextMeeting: '',
  });
  const [form, setForm] = useState(blank());

  // reset form each time the drawer is opened (or the preset type changes)
  useEffect(() => {
    if (open) {
      if (activity) {
        setForm({ ...blank(), ...activity });
      } else {
        setForm(blank());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialType, activity]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isCall = form.type === 'Call';
  const isMeeting = form.type === 'Meeting';

  const save = (status) => {
    if (!form.subject.trim()) {
      toast.error('Subject required', 'Please enter a subject for this activity.');
      return;
    }
    if (activity) {
      crm.updateActivity(activity.id, {
        type: form.type, subject: form.subject, company: form.company, contact: form.contact,
        date: form.date, time: form.time, duration: form.duration,
        direction: isCall ? form.direction : undefined, mode: isMeeting ? form.mode : undefined,
        location: isMeeting ? form.location : undefined, conductedBy: form.conductedBy,
        priority: form.priority, status, outcome: isCall ? form.outcome : '',
        nextAction: form.nextAction, reminder: form.reminder,
        summary: isMeeting ? (form.meetingNotes || form.summary) : form.summary,
      });
    } else {
      crm.addActivity({
        id: `ACT-${Date.now()}`,
        type: form.type,
        subject: form.subject,
        lead: '',
        company: form.company,
        contact: form.contact,
        opportunity: '',
        date: form.date,
        time: form.time,
        duration: form.duration,
        direction: isCall ? form.direction : undefined,
        mode: isMeeting ? form.mode : undefined,
        location: isMeeting ? form.location : undefined,
        conductedBy: form.conductedBy,
        priority: form.priority,
        status,
        outcome: isCall ? form.outcome : '',
        nextAction: form.nextAction,
        reminder: form.reminder,
        summary: isMeeting ? (form.meetingNotes || form.summary) : form.summary,
      });
    }
    toast.success(
      status === 'Completed' ? 'Activity logged' : 'Activity scheduled',
      `${form.type} "${form.subject}" ${status === 'Completed' ? 'saved as completed' : 'added as pending'}.`
    );
    if (status === 'Completed') {
      toast.info('Schedule next action?', 'Every completed activity should have a next follow-up planned.');
    }
    onClose();
  };

  const footer = isCall ? (
    <div className="d-flex flex-wrap gap-2">
      <button className="btn btn-light btn-sm" onClick={() => toast.info('Follow-up', 'Schedule a follow-up from the Follow-ups view.')}>
        <i className="bi bi-arrow-repeat" /> Schedule Follow-up
      </button>
      <button className="btn btn-light btn-sm" onClick={() => toast.info('Convert to Meeting', 'A meeting draft was prepared from this call.')}>
        <i className="bi bi-people" /> Convert to Meeting
      </button>
      <button className="btn btn-light btn-sm" onClick={() => toast.success('Opportunity', 'A new opportunity draft was created from this call.')}>
        <i className="bi bi-graph-up-arrow" /> Create Opportunity
      </button>
      <span className="ms-auto d-flex gap-2">
        <button className="btn btn-light" onClick={() => save('Pending')}>Save</button>
        <button className="btn btn-primary" onClick={() => save('Completed')}><i className="bi bi-check-lg" /> Complete</button>
      </span>
    </div>
  ) : (
    <>
      <button className="btn btn-light" onClick={() => save('Pending')}>Save</button>
      <button className="btn btn-primary" onClick={() => save('Completed')}><i className="bi bi-check-lg" /> Complete</button>
    </>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Log Activity" subtitle="Record an interaction or plan a task" icon="bi-calendar-plus" width={560} footer={footer}>
      <div className="row">
        <Field label="Activity Type" required col={6}>
          <select className="form-select" value={form.type} onChange={set('type')}>
            {activityTypes.map((t) => <option key={t.code} value={t.name}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Priority" col={6}>
          <select className="form-select" value={form.priority} onChange={set('priority')}>
            {priorities.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
          </select>
        </Field>

        <Field label="Subject" required col={12}>
          <input className="form-control" value={form.subject} onChange={set('subject')} placeholder="e.g. Follow-up on proposal" />
        </Field>

        <Field label="Company" col={6}>
          <select className="form-select" value={form.company} onChange={set('company')}>
            <option value="">Select company…</option>
            {companies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Contact" col={6}>
          <select className="form-select" value={form.contact} onChange={set('contact')} disabled={!form.company}>
            <option value="">Select contact…</option>
            {crm.contacts?.filter(c => c.company === form.company).map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </Field>

        {form.contact && (() => {
          const c = crm.contacts?.find(x => x.name === form.contact && x.company === form.company);
          if (!c) return null;
          return (
            <div className="col-12 mb-3 mt-n2">
              <div className="p-2 border rounded bg-light fs-13 d-flex flex-wrap gap-3">
                <span className="text-muted-c"><i className="bi bi-person-badge me-1" /> {c.designation || 'No role'}</span>
                <span className="text-muted-c"><i className="bi bi-envelope me-1" /> {c.email || 'No email'}</span>
                <span className="text-muted-c"><i className="bi bi-telephone me-1" /> {c.mobile || 'No mobile'}</span>
              </div>
            </div>
          );
        })()}

        <Field label="Date" col={4}>
          <input type="date" className="form-control" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Time" col={4}>
          <TimeSelect className="form-select" value={form.time} onChange={set('time')} />
        </Field>
        <Field label="Conducted By" col={4}>
          <select className="form-select" value={form.conductedBy} onChange={set('conductedBy')}>
            {salespeople.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        {/* ---- Call-specific ---- */}
        {isCall && (
          <>
            <Field label="Duration" col={4}>
              <input className="form-control" value={form.duration} onChange={set('duration')} placeholder="e.g. 15 min" />
            </Field>
            <Field label="Direction" col={4}>
              <select className="form-select" value={form.direction} onChange={set('direction')}>
                {CALL_DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Call Outcome" col={4}>
              <select className="form-select" value={form.outcome} onChange={set('outcome')}>
                <option value="">Select outcome…</option>
                {CALL_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </>
        )}

        {/* ---- Meeting-specific ---- */}
        {isMeeting && (
          <>
            <Field label="Meeting Mode" col={6}>
              <select className="form-select" value={form.mode} onChange={set('mode')}>
                {MEETING_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Location" col={6}>
              <input className="form-control" value={form.location} onChange={set('location')} placeholder="Venue / link" />
            </Field>
            <Field label="Agenda" col={12}>
              <input className="form-control" value={form.agenda} onChange={set('agenda')} placeholder="Meeting agenda" />
            </Field>
            <Field label="Attendees" col={12}>
              <input className="form-control" value={form.attendees} onChange={set('attendees')} placeholder="Comma separated names" />
            </Field>
            <Field label="Meeting Notes" col={12}>
              <textarea className="form-control" rows={2} value={form.meetingNotes} onChange={set('meetingNotes')} placeholder="Discussion notes" />
            </Field>
            <Field label="Action Items" col={6}>
              <input className="form-control" value={form.actionItems} onChange={set('actionItems')} placeholder="Follow-up actions" />
            </Field>
            <Field label="Next Meeting" col={6}>
              <input type="date" className="form-control" value={form.nextMeeting} onChange={set('nextMeeting')} />
            </Field>
          </>
        )}

        {/* ---- Common tail ---- */}


        {!isMeeting && (
          <Field label="Summary" col={12}>
            <textarea className="form-control" rows={2} value={form.summary} onChange={set('summary')} placeholder="Notes / summary" />
          </Field>
        )}
      </div>
    </Drawer>
  );
}

// ============================================================
// Reschedule Modal (follow-up view)
// ============================================================
function RescheduleModal({ open, onClose, activity, onConfirm }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  useEffect(() => {
    if (activity) { setDate(activity.date || TODAY); setTime(activity.time || '10:00'); }
  }, [activity]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reschedule Follow-up"
      subtitle={activity?.subject}
      icon="bi-calendar-event"
      width={440}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onConfirm(date, time)}>Reschedule</button>
        </>
      }
    >
      <div className="row">
        <Field label="New Date" col={6}>
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="New Time" col={6}>
          <TimeSelect className="form-select" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

// ============================================================
// Follow-up card
// ============================================================
function FollowUpCard({ a, onComplete, onReschedule, onEdit }) {
  return (
    <div className="surface p-3" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="d-flex align-items-start gap-2">
        <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-soft)', color: TYPE_COLOR[a.type] || 'var(--primary)' }}>
          <i className={`bi ${activityIcon(a.type)}`} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fw-6 text-truncate">{a.company || '—'}</div>
          <div className="fs-13 text-secondary-c text-truncate">{a.subject}</div>
        </div>
        <Badge tone={priorityTone(a.priority)}>{a.priority}</Badge>
      </div>
      <div className="d-flex align-items-center justify-content-between">
        <span className="fs-12 text-muted-c"><i className="bi bi-clock" /> Due: {relativeDue(a.date)} · {a.time || '—'}</span>
        <div className="d-flex align-items-center gap-1" title={a.conductedBy}>
          <Avatar name={a.conductedBy} size="sm" />
        </div>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onComplete(a)}><i className="bi bi-check-lg" /> Complete</button>
        <button className="btn btn-light btn-sm" style={{ flex: 1 }} onClick={() => onReschedule(a)}><i className="bi bi-calendar-event" /> Reschedule</button>
        <button className="btn btn-light btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => onEdit(a)}><i className="bi bi-pencil" /></button>
      </div>
    </div>
  );
}

// ============================================================
// Follow-up view
// ============================================================
function FollowUpView({ crm, toast, onLog, onEdit }) {
  const navigate = useNavigate();
  const [rescheduleFor, setRescheduleFor] = useState(null);

  const scheduled = crm.activities.filter((a) => a.status === 'Scheduled' || a.status === 'Pending'); // Include pending for backward compatibility if any old ones exist

  const buckets = useMemo(() => {
    const b = { Overdue: [], Today: [], Tomorrow: [], 'This Week': [], Upcoming: [] };
    scheduled.forEach((a) => {
      const d = a.date;
      if (d < TODAY) b.Overdue.push(a);
      else if (d === TODAY) b.Today.push(a);
      else if (d === '2026-08-13') b.Tomorrow.push(a);
      else if (d >= '2026-08-14' && d <= '2026-08-18') b['This Week'].push(a);
      else b.Upcoming.push(a);
    });
    return b;
  }, [scheduled]);

  const META = {
    Overdue: { color: 'var(--danger)', icon: 'bi-exclamation-triangle-fill' },
    Today: { color: 'var(--primary)', icon: 'bi-calendar-check-fill' },
    Tomorrow: { color: 'var(--accent, #0891b2)', icon: 'bi-sunrise' },
    'This Week': { color: 'var(--warning)', icon: 'bi-calendar-week' },
    Upcoming: { color: 'var(--text-muted)', icon: 'bi-calendar3' },
  };

  const complete = (a) => {
    crm.updateActivity(a.id, { status: 'Completed' });
    toast.success('Follow-up completed', `"${a.subject}" marked as completed.`);
    toast.info('Schedule next action?', 'Every completed activity should have a next follow-up planned.');
  };
  const doReschedule = (date, time) => {
    crm.updateActivity(rescheduleFor.id, { date, time });
    toast.success('Rescheduled', `"${rescheduleFor.subject}" moved to ${formatDate(date)} ${time}.`);
    setRescheduleFor(null);
  };

  const order = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Upcoming'];
  const anyScheduled = scheduled.length > 0;

  return (
    <div className="page">
      <PageHeader
        title="Follow-ups"
        subtitle="Stay on top of every pending commitment"
        icon="bi-calendar-check"
        back="/activities"
        actions={
          <>
            <button className="btn btn-light" onClick={() => navigate('/activities')}><i className="bi bi-list-ul" /> All Activities</button>
            <button className="btn btn-primary" onClick={onLog}><i className="bi bi-plus-lg" /> Log Activity</button>
          </>
        }
      />

      <div className="grid grid-kpi mb-4">
        <MiniStat value={buckets.Overdue.length} label="Overdue" tone="var(--danger)" />
        <MiniStat value={buckets.Today.length} label="Due Today" tone="var(--primary)" />
        <MiniStat value={buckets.Tomorrow.length} label="Tomorrow" tone="#0891b2" />
        <MiniStat value={buckets['This Week'].length} label="This Week" tone="var(--warning)" />
        <MiniStat value={buckets.Upcoming.length} label="Upcoming" tone="var(--text-muted)" />
      </div>

      {!anyScheduled && (
        <EmptyState icon="bi-check2-circle" title="All caught up" message="You have no scheduled follow-ups. Great work!" />
      )}

      {order.filter((k) => buckets[k].length > 0).map((k) => (
        <div key={k} className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span style={{ width: 30, height: 30, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: META[k].color, color: '#fff' }}>
              <i className={`bi ${META[k].icon}`} />
            </span>
            <div className="fw-7" style={{ fontSize: 15 }}>{k}</div>
            <Badge tone={k === 'Overdue' ? 'tone-red' : 'tone-gray'}>{buckets[k].length}</Badge>
          </div>
          <div className="grid grid-3">
            {buckets[k].map((a) => (
              <FollowUpCard key={a.id} a={a} onComplete={complete} onReschedule={setRescheduleFor} onEdit={onEdit} />
            ))}
          </div>
        </div>
      ))}

      <RescheduleModal open={!!rescheduleFor} onClose={() => setRescheduleFor(null)} activity={rescheduleFor} onConfirm={doReschedule} />
    </div>
  );
}

// ============================================================
// Activity module (List / Calendar / Timeline)
// ============================================================
function ActivityModule({ crm, toast, onLog, onEdit }) {
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    type: '', status: '', from: '', to: ''
  });

  const { activities, deleteActivity } = crm;
  
  const doDelete = (act) => {
    if (window.confirm(`Are you sure you want to delete this ${act.type}?`)) {
      if (act.id.startsWith('FU-')) crm.deleteFollowUp(act.id);
      else crm.deleteActivity(act.id);
      toast.success('Deleted', 'The record was removed successfully.');
    }
  };

  const acts = useMemo(() => {
    return [
      ...crm.activities,
      ...crm.followUps.map(fu => ({
        ...fu,
        conductedBy: fu.assignedTo
      }))
    ];
  }, [crm.activities, crm.followUps]);

  const kpis = useMemo(() => {
    const total = acts.length;
    const completed = acts.filter((a) => a.status === 'Completed').length;
    const pending = acts.filter((a) => a.status === 'Scheduled' || a.status === 'Pending').length;
    const overdue = acts.filter((a) => (a.status === 'Scheduled' || a.status === 'Pending') && a.date < TODAY).length;
    const today = acts.filter((a) => a.date === TODAY).length;
    return { total, completed, pending, overdue, today };
  }, [acts]);

  const rows = useMemo(() => acts.filter((a) => {
    if (appliedFilters.type && a.type !== appliedFilters.type) return false;
    if (appliedFilters.status && a.status !== appliedFilters.status) return false;
    if (appliedFilters.from && a.date < appliedFilters.from) return false;
    if (appliedFilters.to && a.date > appliedFilters.to) return false;
    return true;
  }), [acts, appliedFilters]);

  const markComplete = (a) => {
    if (a.id.startsWith('FU-')) {
      crm.updateFollowUp(a.id, { status: 'Completed' });
    } else {
      crm.updateActivity(a.id, { status: 'Completed' });
    }
    toast.success('Activity completed', `"${a.subject}" marked as completed.`);
    toast.info('Schedule next action?', 'Plan the next follow-up to keep momentum.');
  };

  const columns = [
    { key: 'id', label: 'Activity No', sortable: true, className: 'mono', render: (r) => r.id },
    {
      key: 'type', label: 'Type', width: '150px', accessor: (r) => r.type,
      render: (r) => (
        <div className="d-flex align-items-center gap-2">
          <span style={{ color: TYPE_COLOR[r.type] || 'var(--primary)' }}><i className={`bi ${activityIcon(r.type)}`} /></span>
          <Badge tone="tone-gray">{r.type}</Badge>
        </div>
      ),
    },
    { key: 'subject', label: 'Subject', render: (r) => <span className="fw-6">{r.subject}</span> },
    { key: 'company', label: 'Company', render: (r) => r.company || '—' },
    {
      key: 'date', label: 'Date', sortable: true, accessor: (r) => r.date,
      render: (r) => (
        <div>
          <div className="fw-6">{formatDate(r.date)}</div>
          <div className="fs-12 text-muted-c">{formatTime(r.time) || ''}</div>
        </div>
      ),
    },
    { key: 'conductedBy', label: 'Conducted By', render: (r) => <UserCell name={r.conductedBy} /> },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    {
      key: '_act', label: 'Actions', width: '150px',
      render: (r) => (
        <div className="d-flex gap-2 align-items-center">

          <ActionIconButton type="edit" onClick={(e) => { e.stopPropagation(); onEdit(r); }} />
          <ActionIconButton type="delete" onClick={(e) => { e.stopPropagation(); doDelete(r); }} />
        </div>
      )
    },
  ];

  const handleSearch = () => {
    setAppliedFilters({ type: typeFilter, status: statusFilter, from: fromDate, to: toDate });
  };

  const handleClear = () => {
    setTypeFilter(''); setStatusFilter(''); setFromDate(''); setToDate('');
    setAppliedFilters({ type: '', status: '', from: '', to: '' });
  };

  const filters = (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <select className="form-select form-select-sm" style={{ width: 130 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
        <option value="">All Types</option>
        {activityTypes.map((t) => <option key={t.code} value={t.name}>{t.name}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All Status</option>
        <option value="Completed">Completed</option>
        <option value="Scheduled">Scheduled</option>
      </select>
    </div>
  );

  return (
    <div className="page">
      <PageHeader
        title="Activities"
        subtitle="Calls, meetings, tasks & every customer touchpoint"
        icon="bi-calendar-check"
        actions={
          <>
            <button className="btn btn-light" onClick={() => navigate('/activities/followups')}><i className="bi bi-bell" /> Follow-ups</button>
            <button className="btn btn-primary" onClick={onLog}><i className="bi bi-plus-lg" /> Log Activity</button>
          </>
        }
      />

      <div className="grid grid-kpi mb-4">
        <MiniStat value={kpis.total} label="Total" tone="var(--primary)" />
        <MiniStat value={kpis.completed} label="Completed" tone="var(--success)" />
        <MiniStat value={kpis.pending} label="Pending" tone="var(--warning)" />
        <MiniStat value={kpis.overdue} label="Overdue" tone="var(--danger)" />
        <MiniStat value={kpis.today} label="Today" tone="#0891b2" />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex flex-wrap align-items-center gap-3 bg-white p-2 border rounded shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-13 fw-6 text-secondary-c">From</span>
            <input type="date" className="form-control form-control-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="fs-13 fw-6 text-secondary-c">To</span>
            <input type="date" className="form-control form-control-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <div className="d-flex align-items-center gap-2 border-start ps-3">
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={handleSearch}>
              <i className="bi bi-search" /> Search
            </button>
            <button className="btn btn-light btn-sm d-flex align-items-center gap-2" onClick={handleClear}>
              <i className="bi bi-x-circle" /> Cancel
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        keyField="id"
        searchPlaceholder="Search activities…"
        searchKeys={['subject', 'company', 'contact', 'type']}
        filters={filters}
        empty={<EmptyState icon="bi-calendar-x" title="No activities found" message="Try adjusting filters or log a new activity." />}
      />
    </div>
  );
}

// ============================================================
// Root
// ============================================================
export default function Activities() {
  const { view } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const crm = useCrm();
  const toast = useToast();

  const isFollowups = view === 'followups';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [presetType, setPresetType] = useState('Call');
  const [editingAct, setEditingAct] = useState(null);

  // ?new=<Type> auto-opens the drawer with that type
  useEffect(() => {
    const nw = searchParams.get('new');
    if (nw) {
      const matched = activityTypes.find((t) => t.name.toLowerCase() === nw.toLowerCase())?.name || 'Task';
      setPresetType(matched);
      setEditingAct(null);
      setDrawerOpen(true);
      // clear the query param so it doesn't re-open
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLog = () => { setEditingAct(null); setPresetType('Call'); setDrawerOpen(true); };
  const openEdit = (act) => { setEditingAct(act); setPresetType(act.type); setDrawerOpen(true); };

  return (
    <>
      {isFollowups
        ? <FollowUps />
        : <ActivityModule crm={crm} toast={toast} onLog={openLog} onEdit={openEdit} />}

      <LogActivityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialType={presetType}
        companies={crm.companies}
        activity={editingAct}
      />
    </>
  );
}
