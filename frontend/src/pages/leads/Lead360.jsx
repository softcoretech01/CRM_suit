import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, EmptyState, Field } from '../../components/common/Ui';
import { Drawer, Modal } from '../../components/common/Overlay';
import { StatCard } from '../../components/common/PageParts';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';
import DateTimePicker from '../../components/common/DateTimePicker';

const TEMPS = ['Hot', 'Warm', 'Cold'];
const tempTone = (t) => ({ Hot: 'tone-red', Warm: 'tone-amber', Cold: 'tone-blue' }[t] || 'tone-gray');
const closureTone = (s) => ({ Open: 'tone-blue', Closed: 'tone-green', Cancelled: 'tone-gray' }[s] || 'tone-gray');
const inr = (v) => (v ? `₹${Number(v).toLocaleString('en-IN')}` : '—');
const fmtDT = (v) => (v ? String(v).replace('T', ' ').slice(0, 16) : '—');
const toSql = (v) => (v ? v.replace('T', ' ') + (v.length === 16 ? ':00' : '') : null);

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'bi-grid-1x2' },
  { key: 'followups', label: 'Follow-ups', icon: 'bi-clock-history' },
  { key: 'activities', label: 'Activities', icon: 'bi-activity' },
  { key: 'registration', label: 'Registration', icon: 'bi-receipt' },
  { key: 'feedback', label: 'Feedback', icon: 'bi-star' },
];

function MiniTable({ columns, rows, empty }) {
  if (!rows.length) return <div className="text-muted-c fs-13 text-center py-4">{empty}</div>;
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead><tr>{columns.map((c) => <th key={c.key} className="fs-13 text-nowrap">{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={r.id ?? i}>{columns.map((c) => <td key={c.key} className="fs-13">{c.render ? c.render(r, i) : (r[c.key] ?? '—')}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function Lead360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [lead, setLead] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [fuOpen, setFuOpen] = useState(false);
  const [fu, setFu] = useState({ followup_date: '', followup_type: 'Call', activity: '', next_followup_date: '', outcome: '' });
  const [completingId, setCompletingId] = useState(null);
  const [cOutcome, setCOutcome] = useState('');
  const [cSubject, setCSubject] = useState('');
  const openComplete = (it) => { setCompletingId(it.id); setCOutcome(''); setCSubject(it.activity || it.followup_type || ''); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const l = await apiFetch(`/crm/leads/${id}`);
      setLead(l.data);
      const [fu2, ac, rg, fb] = await Promise.all([
        apiFetch(`/crm/leads/${id}/followups`).catch(() => ({ data: [] })),
        apiFetch(`/crm/leads/${id}/activities`).catch(() => ({ data: [] })),
        apiFetch(`/crm/leads/${id}/registration`).catch(() => ({ data: null })),
        apiFetch(`/crm/leads/${id}/feedback`).catch(() => ({ data: [] })),
      ]);
      setFollowups(fu2.data || []);
      setActivities(ac.data || []);
      setRegistration(rg.data || null);
      setFeedback(fb.data || []);
    } catch { toast.error('Error', 'Failed to load lead'); setLead(null); }
    finally { setLoading(false); }
  }, [id, toast]);
  useEffect(() => { load(); }, [load]);

  const pendingFu = useMemo(() => followups.filter((f) => f.status !== 'Done' && f.status !== 'Completed'), [followups]);
  const rating = useMemo(() => (feedback.length ? (feedback.reduce((a, f) => a + (f.rating || 0), 0) / feedback.length).toFixed(1) : '—'), [feedback]);

  const openEdit = () => { setEditForm({ ...lead }); setEditOpen(true); };
  const eset = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));
  const saveEdit = async () => {
    if (!editForm.lead_name?.trim()) { toast.error('Client name required', ''); return; }
    try {
      await apiFetch(`/crm/leads/${id}`, { method: 'PUT', body: {
        lead_name: editForm.lead_name, contact_name: editForm.contact_name, phone: editForm.phone, email: editForm.email,
        address: editForm.address, business_details: editForm.business_details, requirement: editForm.requirement,
        temperature: editForm.temperature, source: editForm.source, value: editForm.value === '' ? null : Number(editForm.value),
      } });
      toast.success('Lead updated', editForm.lead_name); setEditOpen(false); load();
    } catch { toast.error('Error', 'Failed to update lead'); }
  };

  const saveFu = async () => {
    if (!fu.followup_date) { toast.error('Date required', 'Pick the date/time of this touch.'); return; }
    try {
      await apiFetch(`/crm/leads/${id}/log-touch`, { method: 'POST', body: { ...fu, followup_date: toSql(fu.followup_date), next_followup_date: toSql(fu.next_followup_date) } });
      toast.success('Saved', fu.next_followup_date ? 'Logged to Activities + next follow-up scheduled' : 'Logged to Activities');
      setFuOpen(false); setFu({ followup_date: '', followup_type: 'Call', activity: '', next_followup_date: '', outcome: '' }); load();
    } catch { toast.error('Error', 'Failed to save'); }
  };
  const completeFu = async (fid) => {
    try {
      await apiFetch(`/crm/followups/${fid}/done`, { method: 'POST', body: { outcome: cOutcome, subject: cSubject } });
      toast.success('Follow-up completed', 'Logged to Activities'); setCompletingId(null); setCOutcome(''); setCSubject(''); load();
    } catch { toast.error('Error', 'Failed to complete'); }
  };

  if (loading) return <div className="page"><div className="text-center py-5 text-muted-c"><span className="spinner-border" /></div></div>;
  if (!lead) return (
    <div className="page"><EmptyState icon="bi-lightning-charge" title="Lead not found" message="This lead may have been removed."
      action={<button className="btn btn-primary" onClick={() => navigate('/leads')}><i className="bi bi-arrow-left" /> Back to Leads</button>} /></div>
  );

  return (
    <div className="page">
      <div className="d-flex align-items-center gap-3 mb-3">
        <button className="btn btn-light btn-icon" onClick={() => navigate('/leads')}><i className="bi bi-arrow-left" /></button>
        <div className="d-flex align-items-center gap-2"><i className="bi bi-lightning-charge-fill fs-4 text-primary-c" /><h4 className="m-0 fw-7">Lead 360</h4></div>
      </div>

      {/* Lead card */}
      <div className="surface p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h4 className="m-0 fw-7">{lead.lead_name}</h4>
              <Badge tone={tempTone(lead.temperature)} dot>{lead.temperature || '—'}</Badge>
              <Badge tone={closureTone(lead.closure_status || 'Open')}>{lead.closure_status || 'Open'}</Badge>
              {lead.product_name && <Badge tone="tone-indigo">{lead.product_name}</Badge>}
            </div>
            <div className="fs-13 text-muted-c mt-1">{lead.company_name || '—'}{lead.contact_name ? ` · ${lead.contact_name}` : ''}{lead.phone ? ` · ${lead.phone}` : ''}</div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={() => setFuOpen(true)}><i className="bi bi-clock-history" /> Log Follow-up</button>
            <button className="btn btn-light" onClick={openEdit}><i className="bi bi-pencil" /> Edit</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-3"><StatCard label="Pending Follow-ups" value={pendingFu.length} icon="bi-clock" color="var(--warning)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Activities" value={activities.length} icon="bi-activity" color="var(--primary)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Value" value={inr(lead.value)} icon="bi-cash-stack" color="var(--success)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Feedback" value={rating === '—' ? '—' : `${rating} ★`} icon="bi-star" color="var(--info)" /></div>
      </div>

      {/* Tabs */}
      <div className="surface">
        <div className="d-flex gap-1 p-2 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
          {TABS.map((t) => {
            const count = { followups: pendingFu.length, activities: activities.length, feedback: feedback.length }[t.key];
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-light'}`}>
                <i className={`bi ${t.icon} me-1`} />{t.label}{count != null && <span className={`badge ms-1 ${tab === t.key ? 'bg-light text-primary' : 'bg-secondary'}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="p-3">
          {tab === 'overview' && (
            <div className="row g-3">
              {[['Client', lead.lead_name], ['Company', lead.company_name], ['Contact', lead.contact_name],
                ['Phone', lead.phone], ['Email', lead.email], ['Source', lead.source], ['Product', lead.product_name],
                ['Value', inr(lead.value)], ['Address', lead.address], ['Created', fmtDT(lead.created_at)]].map(([l, v]) => (
                <div key={l} className="col-6 col-lg-3"><div className="fs-12 text-muted-c">{l}</div><div className="fs-14">{v || '—'}</div></div>
              ))}
              {lead.business_details && <div className="col-12"><div className="fs-12 text-muted-c">Business Details</div><div className="fs-14">{lead.business_details}</div></div>}
              {lead.requirement && <div className="col-12"><div className="fs-12 text-muted-c">Requirement</div><div className="fs-14">{lead.requirement}</div></div>}
            </div>
          )}

          {tab === 'followups' && (
            pendingFu.length === 0 ? <div className="text-muted-c fs-13 text-center py-4">No pending follow-ups.</div> :
            pendingFu.map((it) => (
              <div key={it.id} className="py-2 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-13"><i className="bi bi-clock text-primary-c me-1" />{fmtDT(it.next_followup_date || it.followup_date)} · {it.followup_type}{it.activity ? ` · ${it.activity}` : ''}</span>
                  <div className="d-flex align-items-center gap-2">
                    <Badge tone="tone-amber">Pending</Badge>
                    <button className="btn btn-sm btn-success py-0 px-2" title="Complete — enter outcome" onClick={() => openComplete(it)}><i className="bi bi-check-lg" /></button>
                  </div>
                </div>
                {completingId === it.id && (
                  <div className="mt-1"><input className="form-control form-control-sm mb-1" placeholder="Subject" value={cSubject} onChange={(e) => setCSubject(e.target.value)} /><div className="d-flex gap-2"><input className="form-control form-control-sm" placeholder="Outcome of this follow-up" value={cOutcome} onChange={(e) => setCOutcome(e.target.value)} autoFocus />
                    <button className="btn btn-sm btn-primary" onClick={() => completeFu(it.id)}>Save</button>
                    <button className="btn btn-sm btn-light" onClick={() => setCompletingId(null)}>Cancel</button>
                  </div></div>
                )}
              </div>
            ))
          )}

          {tab === 'activities' && (
            <MiniTable empty="No activities yet." rows={activities} columns={[
              { key: 'subject', label: 'Subject', render: (r) => <span className="fw-6">{r.subject}</span> },
              { key: 'activity_type', label: 'Type', render: (r) => <Badge tone="tone-indigo">{r.activity_type || '—'}</Badge> },
              { key: 'activity_datetime', label: 'Date/Time', render: (r) => fmtDT(r.activity_datetime) },
              { key: 'outcome', label: 'Outcome' },
              { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'Completed' ? 'tone-green' : 'tone-amber'} dot>{r.status}</Badge> },
            ]} />
          )}

          {tab === 'registration' && (
            !registration ? <div className="text-muted-c fs-13 text-center py-4">No registration — close this lead as "Closed" to add one.</div> :
            <div className="row g-3">
              {[['Registration No', registration.registration_no], ['Registration Date', registration.registration_date ? String(registration.registration_date).slice(0, 10) : '—'],
                ['Amount', inr(registration.amount)], ['Payment', registration.payment_status]].map(([l, v]) => (
                <div key={l} className="col-6 col-lg-3"><div className="fs-12 text-muted-c">{l}</div><div className="fs-14">{v || '—'}</div></div>
              ))}
              {registration.details && <div className="col-12"><div className="fs-12 text-muted-c">Details</div><div className="fs-14">{registration.details}</div></div>}
            </div>
          )}

          {tab === 'feedback' && (
            feedback.length === 0 ? <div className="text-muted-c fs-13 text-center py-4">No feedback yet.</div> :
            feedback.map((fb) => (
              <div key={fb.id} className="py-2 border-bottom">
                <div className="fs-14"><span className="text-warning">{'★'.repeat(fb.rating || 0)}</span><span className="text-muted">{'☆'.repeat(5 - (fb.rating || 0))}</span></div>
                <div className="fs-13 text-secondary-c">{fb.feedback_text || '—'}</div>
                <div className="fs-12 text-muted-c">{fmtDT(fb.created_at)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit drawer */}
      <Drawer open={editOpen} onClose={() => setEditOpen(false)} title="Edit Lead" icon="bi-lightning-charge-fill" width={520}
        footer={<><button className="btn btn-light" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={saveEdit}><i className="bi bi-check-lg" /> Save</button></>}>
        <div className="row g-3">
          <Field label="Client Name" col={12}><input className="form-control" value={editForm.lead_name || ''} onChange={eset('lead_name')} /></Field>
          <Field label="Contact" col={6}><input className="form-control" value={editForm.contact_name || ''} onChange={eset('contact_name')} /></Field>
          <Field label="Phone" col={6}><input className="form-control" value={editForm.phone || ''} onChange={eset('phone')} /></Field>
          <Field label="Email" col={6}><input className="form-control" value={editForm.email || ''} onChange={eset('email')} /></Field>
          <Field label="Status" col={6}><select className="form-select" value={editForm.temperature || 'Warm'} onChange={eset('temperature')}>{TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
          <Field label="Address" col={12}><input className="form-control" value={editForm.address || ''} onChange={eset('address')} /></Field>
          <Field label="Business Details" col={12}><textarea className="form-control" rows={2} value={editForm.business_details || ''} onChange={eset('business_details')} /></Field>
          <Field label="Requirement" col={12}><textarea className="form-control" rows={2} value={editForm.requirement || ''} onChange={eset('requirement')} /></Field>
          <Field label="Est. Value (₹)" col={6}><input type="number" className="form-control" value={editForm.value || ''} onChange={eset('value')} /></Field>
        </div>
      </Drawer>

      {/* Log follow-up modal */}
      {fuOpen && (
        <Modal open onClose={() => setFuOpen(false)} title={`Log Follow-up — ${lead.lead_name}`} icon="bi-clock-history" width={560}
          footer={<><button className="btn btn-light" onClick={() => setFuOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={saveFu}><i className="bi bi-check-lg" /> Save Touch</button></>}>
          <div className="row g-2">
            <div className="col-12 fs-12 text-muted-c mb-1">Logs to <b>Activities</b>. Add a next date to schedule a follow-up.</div>
            <Field label="Date/Time (this touch)" col={6}><DateTimePicker value={fu.followup_date} onChange={(v) => setFu({ ...fu, followup_date: v })} /></Field>
            <Field label="Type" col={6}><select className="form-select" value={fu.followup_type} onChange={(e) => setFu({ ...fu, followup_type: e.target.value })}>{['Call', 'Email', 'Meeting', 'Visit', 'WhatsApp'].map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Subject" col={12}><input className="form-control" value={fu.activity} onChange={(e) => setFu({ ...fu, activity: e.target.value })} placeholder="Subject — what was done" /></Field>
            <Field label="Outcome" col={6}><input className="form-control" value={fu.outcome} onChange={(e) => setFu({ ...fu, outcome: e.target.value })} /></Field>
            <Field label="Next Follow-up Date/Time" col={6}><DateTimePicker value={fu.next_followup_date} onChange={(v) => setFu({ ...fu, next_followup_date: v })} /></Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
