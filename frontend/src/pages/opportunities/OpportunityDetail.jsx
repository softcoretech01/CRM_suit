import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, EmptyState, Field } from '../../components/common/Ui';
import { Drawer, Modal } from '../../components/common/Overlay';
import { StatCard } from '../../components/common/PageParts';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';
import DateTimePicker from '../../components/common/DateTimePicker';
import { STAGE_PROB, STAGES, stageTone } from './OpportunitiesList';

const inr = (v) => (v ? `₹${Number(v).toLocaleString('en-IN')}` : '—');
const fmtDT = (v) => (v ? String(v).replace('T', ' ').slice(0, 16) : '—');
const toSql = (v) => (v ? v.replace('T', ' ') + (v.length === 16 ? ':00' : '') : null);
const PIPELINE = ['Qualification', 'Requirement', 'Demo', 'Proposal', 'Won'];
const TABS = [
  { key: 'overview', label: 'Overview', icon: 'bi-grid-1x2' },
  { key: 'followups', label: 'Follow-ups', icon: 'bi-clock-history' },
  { key: 'activities', label: 'Activities', icon: 'bi-activity' },
];

function MiniTable({ columns, rows, empty }) {
  if (!rows.length) return <div className="text-muted-c fs-13 text-center py-4">{empty}</div>;
  return (
    <div className="table-responsive"><table className="table table-hover align-middle mb-0">
      <thead><tr>{columns.map((c) => <th key={c.key} className="fs-13 text-nowrap">{c.label}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={r.id ?? i}>{columns.map((c) => <td key={c.key} className="fs-13">{c.render ? c.render(r) : (r[c.key] ?? '—')}</td>)}</tr>)}</tbody>
    </table></div>
  );
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [opp, setOpp] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});
  const [fuOpen, setFuOpen] = useState(false);
  const [fu, setFu] = useState({ followup_date: '', followup_type: 'Call', activity: '', next_followup_date: '', outcome: '' });
  const [completingId, setCompletingId] = useState(null);
  const [cOutcome, setCOutcome] = useState('');
  const [cSubject, setCSubject] = useState('');
  const openComplete = (it) => { setCompletingId(it.id); setCOutcome(''); setCSubject(it.activity || it.followup_type || ''); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch(`/crm/opportunities/${id}`); setOpp(r.data);
      const [fu2, ac] = await Promise.all([
        apiFetch(`/crm/opportunities/${id}/followups`).catch(() => ({ data: [] })),
        apiFetch(`/crm/opportunities/${id}/activities`).catch(() => ({ data: [] })),
      ]);
      setFollowups(fu2.data || []); setActivities(ac.data || []);
    } catch { toast.error('Error', 'Failed to load opportunity'); setOpp(null); }
    finally { setLoading(false); }
  }, [id, toast]);
  useEffect(() => { load(); }, [load]);

  const pendingFu = useMemo(() => followups.filter((f) => f.status !== 'Done' && f.status !== 'Completed'), [followups]);

  const setStage = async (stage) => {
    try { await apiFetch(`/crm/opportunities/${id}/stage`, { method: 'POST', body: { stage, probability: STAGE_PROB[stage] } }); toast.success('Stage updated', stage); load(); }
    catch { toast.error('Error', 'Failed to update stage'); }
  };
  const openEdit = () => { setForm({ ...opp, expected_close_date: opp.expected_close_date ? String(opp.expected_close_date).slice(0, 10) : '' }); setEditOpen(true); };
  const eset = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const saveEdit = async () => {
    if (!form.name?.trim()) { toast.error('Name required', ''); return; }
    try {
      await apiFetch(`/crm/opportunities/${id}`, { method: 'PUT', body: {
        name: form.name, value: form.value === '' ? null : Number(form.value), stage: form.stage,
        probability: Number(form.probability), expected_close_date: form.expected_close_date || null, description: form.description,
      } });
      toast.success('Opportunity updated', form.name); setEditOpen(false); load();
    } catch { toast.error('Error', 'Failed to update'); }
  };
  const saveFu = async () => {
    if (!fu.followup_date) { toast.error('Date required', 'Pick the date/time of this touch.'); return; }
    try {
      await apiFetch(`/crm/opportunities/${id}/log-touch`, { method: 'POST', body: { ...fu, followup_date: toSql(fu.followup_date), next_followup_date: toSql(fu.next_followup_date) } });
      toast.success('Saved', fu.next_followup_date ? 'Logged to Activities + next follow-up scheduled' : 'Logged to Activities');
      setFuOpen(false); setFu({ followup_date: '', followup_type: 'Call', activity: '', next_followup_date: '', outcome: '' }); load();
    } catch { toast.error('Error', 'Failed to save'); }
  };
  const completeFu = async (fid) => {
    try { await apiFetch(`/crm/followups/${fid}/done`, { method: 'POST', body: { outcome: cOutcome, subject: cSubject } }); toast.success('Follow-up completed', 'Logged to Activities'); setCompletingId(null); setCOutcome(''); setCSubject(''); load(); }
    catch { toast.error('Error', 'Failed to complete'); }
  };

  if (loading) return <div className="page"><div className="text-center py-5 text-muted-c"><span className="spinner-border" /></div></div>;
  if (!opp) return (
    <div className="page"><EmptyState icon="bi-graph-down" title="Opportunity not found" message="This opportunity may have been removed."
      action={<button className="btn btn-primary" onClick={() => navigate('/opportunities')}><i className="bi bi-arrow-left" /> Back</button>} /></div>
  );
  const currentIdx = PIPELINE.indexOf(opp.stage);

  return (
    <div className="page">
      <div className="d-flex align-items-center gap-3 mb-3">
        <button className="btn btn-light btn-icon" onClick={() => navigate('/opportunities')}><i className="bi bi-arrow-left" /></button>
        <div className="d-flex align-items-center gap-2"><i className="bi bi-graph-up-arrow fs-4 text-primary-c" /><h4 className="m-0 fw-7">Opportunity 360</h4></div>
      </div>

      <div className="surface p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h4 className="m-0 fw-7">{opp.name}</h4>
              <Badge tone={stageTone(opp.stage)} dot>{opp.stage}</Badge>
              <Badge tone={opp.status === 'WON' ? 'tone-green' : opp.status === 'LOST' ? 'tone-red' : 'tone-blue'}>{opp.status || 'ACTIVE'}</Badge>
            </div>
            <div className="fs-13 text-muted-c mt-1">{opp.company_name || '—'}{opp.lead_name ? ` · from lead: ${opp.lead_name}` : ''}</div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={() => setFuOpen(true)}><i className="bi bi-clock-history" /> Log Follow-up</button>
            <button className="btn btn-light" onClick={openEdit}><i className="bi bi-pencil" /> Edit</button>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-3"><StatCard label="Value" value={inr(opp.value)} icon="bi-cash-stack" color="var(--success)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Probability" value={opp.probability != null ? `${opp.probability}%` : '—'} icon="bi-percent" color="var(--info)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Pending Follow-ups" value={pendingFu.length} icon="bi-clock" color="var(--warning)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Activities" value={activities.length} icon="bi-activity" color="var(--primary)" /></div>
      </div>

      {/* Stage stepper */}
      <div className="surface p-3 mb-3">
        <div className="fs-13 fw-7 text-muted-c mb-2">Pipeline Stage</div>
        <div className="d-flex align-items-center flex-wrap gap-2">
          {PIPELINE.map((s, i) => {
            const done = currentIdx >= 0 && i <= currentIdx && opp.stage !== 'Lost';
            return (
              <div key={s} className="d-flex align-items-center gap-2">
                <button onClick={() => setStage(s)} className={`btn btn-sm ${done ? 'btn-primary' : 'btn-light'}`} title={`Move to ${s}`}>{i + 1}. {s}</button>
                {i < PIPELINE.length - 1 && <i className={`bi bi-arrow-right ${done ? 'text-primary-c' : 'text-muted-c'}`} />}
              </div>
            );
          })}
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-sm btn-outline-success" onClick={() => setStage('Won')} disabled={opp.stage === 'Won'}><i className="bi bi-trophy" /> Won</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => setStage('Lost')} disabled={opp.stage === 'Lost'}><i className="bi bi-x-circle" /> Lost</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="surface">
        <div className="d-flex gap-1 p-2 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
          {TABS.map((t) => {
            const count = { followups: pendingFu.length, activities: activities.length }[t.key];
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
              {[['Company', opp.company_name], ['Industry', opp.company_industry], ['City', opp.company_city],
                ['Source Lead', opp.lead_name], ['Contact', opp.contact_name], ['Phone', opp.lead_phone],
                ['Weighted Value', inr((Number(opp.value) || 0) * (Number(opp.probability) || 0) / 100)],
                ['Expected Close', opp.expected_close_date ? String(opp.expected_close_date).slice(0, 10) : '—'], ['Created', fmtDT(opp.created_at)]].map(([l, v]) => (
                <div key={l} className="col-6 col-lg-3"><div className="fs-12 text-muted-c">{l}</div><div className="fs-14">{v || '—'}</div></div>
              ))}
              {opp.description && <div className="col-12"><div className="fs-12 text-muted-c">Description</div><div className="fs-14">{opp.description}</div></div>}
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
        </div>
      </div>

      {/* Edit drawer */}
      <Drawer open={editOpen} onClose={() => setEditOpen(false)} title="Edit Opportunity" icon="bi-graph-up-arrow" width={520}
        footer={<><button className="btn btn-light" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={saveEdit}><i className="bi bi-check-lg" /> Save</button></>}>
        <div className="row g-3">
          <Field label="Name" col={12}><input className="form-control" value={form.name || ''} onChange={eset('name')} /></Field>
          <Field label="Stage" col={6}><select className="form-select" value={form.stage || 'Qualification'} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value, probability: STAGE_PROB[e.target.value] ?? f.probability }))}>{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="Probability (%)" col={6}><input type="number" className="form-control" value={form.probability ?? ''} onChange={eset('probability')} /></Field>
          <Field label="Value (₹)" col={6}><input type="number" className="form-control" value={form.value ?? ''} onChange={eset('value')} /></Field>
          <Field label="Expected Close" col={6}><input type="date" className="form-control" value={form.expected_close_date || ''} onChange={eset('expected_close_date')} /></Field>
          <Field label="Description" col={12}><textarea className="form-control" rows={2} value={form.description || ''} onChange={eset('description')} /></Field>
        </div>
      </Drawer>

      {/* Log follow-up */}
      {fuOpen && (
        <Modal open onClose={() => setFuOpen(false)} title={`Log Follow-up — ${opp.name}`} icon="bi-clock-history" width={560}
          footer={<><button className="btn btn-light" onClick={() => setFuOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={saveFu}><i className="bi bi-check-lg" /> Save Touch</button></>}>
          <div className="row g-2">
            <div className="col-12 fs-12 text-muted-c mb-1">Logs to <b>Activities</b> (as an Opportunity activity). Add a next date to schedule a follow-up.</div>
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
