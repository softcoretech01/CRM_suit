import { useState, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import DateRangeBar, { inRange } from '../../components/common/DateRangeBar';
import { Badge, EmptyState, Field } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import { Drawer, Modal, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useToast } from '../../context/ToastContext';
import { useCrm } from '../../context/CrmContext';
import { apiFetch } from '../../utils/api';
import DateTimePicker from '../../components/common/DateTimePicker';

const TYPE_FALLBACK = ['Call', 'Email', 'Meeting', 'Visit', 'WhatsApp', 'Note'];
const STATUSES = ['Completed', 'Scheduled', 'Pending'];
const statusTone = (s) => ({ Completed: 'tone-green', Scheduled: 'tone-blue', Pending: 'tone-amber' }[s] || 'tone-gray');
const typeIcon = (t = '') => {
  const n = t.toLowerCase();
  if (n.includes('call') || n.includes('phone')) return 'bi-telephone';
  if (n.includes('mail')) return 'bi-envelope';
  if (n.includes('meet') || n.includes('video')) return 'bi-camera-video';
  if (n.includes('visit')) return 'bi-geo-alt';
  if (n.includes('whats') || n.includes('chat')) return 'bi-chat-dots';
  return 'bi-check2-square';
};
const toSql = (v) => (v ? v.replace('T', ' ') + (v.length === 16 ? ':00' : '') : null);
const toLocal = (v) => (v ? String(v).replace(' ', 'T').slice(0, 16) : '');
const fmtDT = (v) => {
  if (!v) return '—';
  const s = String(v).replace('T', ' ');
  if (s.length < 16) return s;
  let [h, m] = s.slice(11, 16).split(':');
  let hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12 || 12;
  return `${s.slice(0, 10)} ${hr < 10 ? '0'+hr : hr}:${m} ${ampm}`;
};

const emptyAct = {
  activity_type: 'Call', subject: '', lead_id: '', activity_datetime: '',
  duration: '', outcome: '', next_action: '', status: 'Completed', notes: '',
};

// Labeled read-only row for the details modal; hides itself when empty.
function ViewRow({ label, value, full }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={`${full ? 'col-12' : 'col-6'} mb-2`}>
      <div className="fs-13 text-muted-c">{label}</div>
      <div className="fs-15 text-dark fw-5">{value}</div>
    </div>
  );
}

export default function Activities() {
  const toast = useToast();
  const crm = useCrm();
  const { activityTypes, nextActions } = crm;

  const [rows, setRows] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fType, setFType] = useState('');
  const [fStatus, setFStatus] = useState('Completed'); // Activities = the "done" log by default
  const [range, setRange] = useState({ from: '', to: '' });

  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(emptyAct);
  const [viewAct, setViewAct] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const typeOptions = (activityTypes && activityTypes.length ? activityTypes.map((t) => t.name) : TYPE_FALLBACK);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await apiFetch('/crm/activities'); setRows(res.data || []); }
    catch { toast.error('Error', 'Failed to load activities'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    load();
    apiFetch('/crm/leads').then((r) => setLeads(r.data || [])).catch(() => {});
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openNew = () => { setForm(emptyAct); setDrawer(true); };
  const openEdit = (a) => {
    setForm({
      id: a.id, activity_type: a.activity_type || 'Call', subject: a.subject || '',
      lead_id: a.lead_id || '', activity_datetime: toLocal(a.activity_datetime), duration: a.duration || '',
      outcome: a.outcome || '', next_action: a.next_action || '', status: a.status || 'Completed', notes: a.notes || '',
    });
    setDrawer(true);
  };

  const save = async () => {
    if (!form.subject.trim()) { toast.error('Subject required', 'Please enter a subject.'); return; }
    const body = {
      ...form, activity_datetime: toSql(form.activity_datetime),
      duration: form.duration === '' ? null : Number(form.duration),
      lead_id: form.lead_id || null,
    };
    try {
      if (form.id) { await apiFetch(`/crm/activities/${form.id}`, { method: 'PUT', body }); toast.success('Activity updated', form.subject); }
      else { await apiFetch('/crm/activities', { method: 'POST', body }); toast.success('Activity logged', form.subject); }
      setDrawer(false); load();
    } catch { toast.error('Error', 'Failed to save activity'); }
  };

  const doDelete = async () => {
    try { await apiFetch(`/crm/activities/${confirmDel.id}`, { method: 'DELETE' }); toast.success('Activity deleted', confirmDel.subject); load(); }
    catch { toast.error('Error', 'Failed to delete activity'); }
    finally { setConfirmDel(null); }
  };

  const relatedTo = (a) => {
    const isOpp = a.related_type === 'Opportunity' && a.opportunity_name;
    const name = isOpp ? a.opportunity_name : a.lead_name;
    if (!name) return <span className="text-secondary-c">{a.company_name || a.contact_full_name || '—'}</span>;
    return (
      <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
        <span className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 28, height: 28, borderRadius: 8, background: isOpp ? '#eef2ff' : '#fff7ed', color: isOpp ? '#4f46e5' : '#c2410c' }}>
          <i className={`bi ${isOpp ? 'bi-graph-up-arrow' : 'bi-lightning-charge-fill'}`} style={{ fontSize: 13 }} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="fw-6 text-truncate">{name}</div>
          <div className="fs-12 text-muted-c text-truncate">{isOpp ? 'Opportunity' : 'Lead'}{a.company_name ? ` · ${a.company_name}` : ''}</div>
        </div>
      </div>
    );
  };

  const kpis = useMemo(() => ({
    total: rows.length,
    completed: rows.filter((a) => a.status === 'Completed').length,
    scheduled: rows.filter((a) => a.status === 'Scheduled' || a.status === 'Pending').length,
  }), [rows]);

  const filtered = useMemo(() => rows.filter((a) =>
    (!fType || a.activity_type === fType) && (!fStatus || a.status === fStatus) && inRange(a.activity_datetime, range)
  ), [rows, fType, fStatus, range]);

  const columns = [
    { key: 'sno', label: 'S.No', width: '64px', render: (_, i) => <span className="text-secondary-c">{i}</span> },
    { key: 'subject', label: 'Subject', sortable: true, render: (r) => (
      <div className="d-flex align-items-center gap-2"><i className={`bi ${typeIcon(r.activity_type)} text-primary-c`} />
        <span className="fw-6">{r.subject}</span></div>) },
    { key: 'activity_type', label: 'Type', render: (r) => <Badge tone="tone-indigo">{r.activity_type || '—'}</Badge> },
    { key: 'related', label: 'Related To', render: (r) => relatedTo(r) },
    { key: 'activity_datetime', label: 'Date/Time', sortable: true, accessor: (r) => r.activity_datetime || '', render: (r) => <span className="fs-13">{fmtDT(r.activity_datetime)}</span> },
    { key: 'outcome', label: 'Outcome', render: (r) => (
      <div>
        {r.subject && <div className="fs-13 text-muted-c mb-1">{r.subject}</div>}
        <div>{r.outcome || '—'}</div>
      </div>
    ) },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status || '—'}</Badge> },
    { key: 'actions', label: 'Action', width: '150px', render: (r) => (
      <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <ActionIconButton type="view" tooltip="View details" onClick={() => setViewAct(r)} />
        <ActionIconButton type="delete" tooltip="Delete" onClick={() => setConfirmDel(r)} />
      </div>) },
  ];

  const filters = (
    <>
      <select className="form-select form-select-sm" style={{ width: 140 }} value={fType} onChange={(e) => setFType(e.target.value)}>
        <option value="">All Types</option>{typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 140 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
        <option value="">All Status</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </>
  );

  return (
    <div className="page">
      <PageHeader title="Activities" subtitle="History of completed calls, emails, meetings and visits" icon="bi-activity" />

      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-4"><StatCard label="Total Activities" value={kpis.total} icon="bi-activity" color="var(--primary)" /></div>
        <div className="col-6 col-lg-4"><StatCard label="Completed" value={kpis.completed} icon="bi-check-circle" color="var(--success)" /></div>
        <div className="col-6 col-lg-4"><StatCard label="Scheduled" value={kpis.scheduled} icon="bi-calendar-event" color="var(--info)" /></div>
      </div>

      <DateRangeBar onApply={setRange} />
      <DataTable columns={columns} rows={filtered} keyField="id" loading={loading} filters={filters}
        searchPlaceholder="Search activities..." searchKeys={['subject', 'activity_type', 'outcome', 'lead_name', 'company_name']}
        empty={<EmptyState icon="bi-activity" title="No activities yet" message="Log your first activity to get started." />} />

      {/* Add / Edit drawer */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? 'Edit Activity' : 'Log Activity'} icon="bi-activity" width={560}
        footer={<><button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button><button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg" /> Save</button></>}>
        <div className="row g-3">
          <Field label="Activity Type" col={6}><select className="form-select" value={form.activity_type} onChange={set('activity_type')}>{typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
          <Field label="Status" col={6}><select className="form-select" value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="Subject" required col={12}><input className="form-control" value={form.subject} onChange={set('subject')} placeholder="e.g. Demo call with client" /></Field>
          <Field label="Related Lead" col={12}><select className="form-select" value={form.lead_id} onChange={set('lead_id')}><option value="">— none —</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.lead_name}{l.company_name ? ` (${l.company_name})` : ''}</option>)}</select></Field>
          <Field label="Date / Time" col={6}><DateTimePicker value={form.activity_datetime} onChange={(v) => setForm((ff) => ({ ...ff, activity_datetime: v }))} /></Field>
          <Field label="Duration (min)" col={6}><input type="number" className="form-control" value={form.duration} onChange={set('duration')} /></Field>
          <Field label="Outcome" col={6}><input className="form-control" value={form.outcome} onChange={set('outcome')} /></Field>
          <Field label="Next Action" col={6}><select className="form-select" value={form.next_action} onChange={set('next_action')}><option value="">Select</option>{(nextActions || []).map((n) => <option key={n.id || n.name} value={n.name}>{n.name}</option>)}</select></Field>
          <Field label="Notes" col={12}><textarea className="form-control" rows={2} value={form.notes} onChange={set('notes')} /></Field>
        </div>
      </Drawer>

      {viewAct && (
        <Modal open onClose={() => setViewAct(null)} title={viewAct.subject} subtitle="Activity details" icon="bi-activity" width={560}>
          <div className="d-flex gap-2 mb-3 align-items-center">
            <Badge tone="tone-indigo">{viewAct.activity_type}</Badge>
            <Badge tone={statusTone(viewAct.status)} dot>{viewAct.status}</Badge>
          </div>

          {(viewAct.lead_name || viewAct.company_name || viewAct.opportunity_name) && (
            <>
              <div className="fs-14 fw-7 text-muted-c mb-2">Related</div>
              <div className="row mb-2">
                {viewAct.opportunity_name && (
                  <>
                    <ViewRow label="Opportunity" value={viewAct.opportunity_name.replace(/\s*[-—]\s*Opportunity/i, '')} />
                    {viewAct.opportunity_stage && <ViewRow label="Stage" value={viewAct.opportunity_stage} />}
                  </>
                )}
                <ViewRow label="Lead" value={viewAct.lead_name} />
                <ViewRow label="Company" value={viewAct.company_name} />
                <ViewRow label="Contact" value={viewAct.lead_contact} />
                {String(viewAct.activity_type || '').toLowerCase().includes('email')
                  ? <ViewRow label="Email" value={viewAct.lead_email} />
                  : <ViewRow label="Phone" value={viewAct.lead_phone} />}
                {viewAct.lead_temperature && <div className="col-6 mb-2"><div className="fs-13 text-muted-c">Lead Status</div><Badge tone={{ Hot: 'tone-red', Warm: 'tone-amber', Cold: 'tone-blue' }[viewAct.lead_temperature] || 'tone-gray'} dot>{viewAct.lead_temperature}</Badge></div>}
              </div>
            </>
          )}

          <div className="fs-14 fw-7 text-muted-c mb-2 mt-2">Activity</div>
          <div className="row">
            <ViewRow label="Date/Time" value={fmtDT(viewAct.activity_datetime)} />
            <ViewRow label="Outcome" value={viewAct.outcome} />
            {viewAct.duration ? <ViewRow label="Duration" value={`${viewAct.duration} min`} /> : null}
            <ViewRow label="Notes" value={viewAct.notes} full />
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={doDelete} title="Delete activity?" message={`Delete "${confirmDel?.subject}"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}
