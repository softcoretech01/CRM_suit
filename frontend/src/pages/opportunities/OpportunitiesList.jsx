import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import DateRangeBar, { inRange } from '../../components/common/DateRangeBar';
import { Badge, EmptyState, Field } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import { Drawer, Modal, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';
import DateTimePicker from '../../components/common/DateTimePicker';

export const STAGE_PROB = { Qualification: 10, Requirement: 30, Demo: 50, Proposal: 70, Won: 100, Lost: 0 };
export const STAGES = Object.keys(STAGE_PROB);
export const stageTone = (s) => ({ Qualification: 'tone-gray', Requirement: 'tone-blue', Demo: 'tone-indigo', Proposal: 'tone-amber', Won: 'tone-green', Lost: 'tone-red' }[s] || 'tone-gray');
const inr = (v) => (v ? `₹${Number(v).toLocaleString('en-IN')}` : '—');
const toSql = (v) => (v ? v.replace('T', ' ') + (v.length === 16 ? ':00' : '') : null);
const fmtDT = (v) => (v ? String(v).replace('T', ' ').slice(0, 16) : '—');

const emptyOpp = { name: '', lead_id: '', company_id: '', value: '', stage: 'Qualification', probability: 10, expected_close_date: '', description: '' };

export default function OpportunitiesList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fStage, setFStage] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(emptyOpp);
  const [confirmDel, setConfirmDel] = useState(null);
  const [fuOpp, setFuOpp] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await apiFetch('/crm/opportunities'); setRows(res.data || []); }
    catch { toast.error('Error', 'Failed to load opportunities'); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => {
    load();
    apiFetch('/crm/companies').then((r) => setCompanies(r.data || [])).catch(() => {});
    apiFetch('/crm/leads').then((r) => setLeads(r.data || [])).catch(() => {});
  }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const onStage = (e) => { const s = e.target.value; setForm((f) => ({ ...f, stage: s, probability: STAGE_PROB[s] ?? f.probability })); };
  // Selecting a lead auto-fills the opportunity from that lead
  const onLead = (e) => {
    const lid = e.target.value;
    const l = leads.find((x) => String(x.id) === String(lid));
    setForm((f) => ({
      ...f, lead_id: lid,
      name: f.name || (l ? l.lead_name : ''),
      company_id: l?.company_id ? String(l.company_id) : f.company_id,
      value: (f.value === '' || f.value == null) && l?.value ? l.value : f.value,
    }));
  };

  const openNew = () => { setForm(emptyOpp); setDrawer(true); };
  const openEdit = (o) => {
    setForm({
      id: o.id, name: o.name || '', company_id: o.company_id || '', value: o.value || '',
      stage: o.stage || 'Qualification', probability: o.probability ?? STAGE_PROB[o.stage] ?? 10,
      expected_close_date: o.expected_close_date ? String(o.expected_close_date).slice(0, 10) : '', description: o.description || '',
    });
    setDrawer(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name required', 'Enter an opportunity name.'); return; }
    const body = { ...form, value: form.value === '' ? null : Number(form.value), probability: Number(form.probability), expected_close_date: form.expected_close_date || null };
    try {
      if (form.id) { await apiFetch(`/crm/opportunities/${form.id}`, { method: 'PUT', body }); toast.success('Opportunity updated', form.name); }
      else { await apiFetch('/crm/opportunities', { method: 'POST', body }); toast.success('Opportunity created', form.name); }
      setDrawer(false); load();
    } catch { toast.error('Error', 'Failed to save opportunity'); }
  };

  const doDelete = async () => {
    try { await apiFetch(`/crm/opportunities/${confirmDel.id}`, { method: 'DELETE' }); toast.success('Deleted', confirmDel.name); load(); }
    catch { toast.error('Error', 'Failed to delete'); }
    finally { setConfirmDel(null); }
  };

  const filtered = useMemo(() => rows.filter((o) => (!fStage || o.stage === fStage) && inRange(o.created_at, range)), [rows, fStage, range]);

  const columns = [
    { key: 'sno', label: 'S.No', width: '64px', render: (_, i) => <span className="text-secondary-c">{i}</span> },
    { key: 'name', label: 'Opportunity', sortable: true, render: (r) => (
      <div><div className="fw-6">{r.name}</div><div className="fs-12 text-muted-c">{r.company_name || r.lead_name || ''}</div></div>) },
    { key: 'stage', label: 'Stage', sortable: true, render: (r) => <Badge tone={stageTone(r.stage)} dot>{r.stage || '—'}</Badge> },
    { key: 'probability', label: 'Prob.', render: (r) => (r.probability != null ? `${r.probability}%` : '—') },
    { key: 'value', label: 'Value', sortable: true, accessor: (r) => Number(r.value) || 0, render: (r) => <span className="mono">{inr(r.value)}</span> },
    { key: 'expected_close_date', label: 'Expected Close', render: (r) => (r.expected_close_date ? String(r.expected_close_date).slice(0, 10) : '—') },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'WON' ? 'tone-green' : r.status === 'LOST' ? 'tone-red' : 'tone-blue'}>{r.status || 'ACTIVE'}</Badge> },
    { key: 'actions', label: 'Action', width: '150px', render: (r) => (
      <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <ActionIconButton type="view" tooltip="View 360" onClick={() => navigate(`/opportunities/${r.id}`)} />
        <span className="position-relative d-inline-flex">
          <ActionIconButton icon={Clock} tooltip={r.followup_count ? `${r.followup_count} pending follow-up${r.followup_count > 1 ? 's' : ''}` : 'Follow-ups'} onClick={() => setFuOpp(r)} />
          {r.followup_count > 0 && (
            <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 15, height: 15, lineHeight: '15px', fontSize: 9, fontWeight: 700, textAlign: 'center', color: '#fff', background: '#ef4444', borderRadius: 999, padding: '0 3px', boxShadow: '0 0 0 2px #fff', pointerEvents: 'none' }}>{r.followup_count}</span>
          )}
        </span>
        <ActionIconButton type="edit" tooltip="Edit" onClick={() => openEdit(r)} />
        <ActionIconButton type="delete" tooltip="Delete" onClick={() => setConfirmDel(r)} />
      </div>) },
  ];

  const filters = (
    <select className="form-select form-select-sm" style={{ width: 160 }} value={fStage} onChange={(e) => setFStage(e.target.value)}>
      <option value="">All Stages</option>{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );

  return (
    <div className="page">
      <PageHeader title="Opportunities" subtitle="Track deals through your sales pipeline" icon="bi-graph-up-arrow"
        actions={<button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg" /> New Opportunity</button>} />


      <DateRangeBar onApply={setRange} />
      <DataTable columns={columns} rows={filtered} keyField="id" loading={loading} filters={filters}
        onRowClick={(r) => navigate(`/opportunities/${r.id}`)}
        searchPlaceholder="Search opportunity, company..." searchKeys={['name', 'company_name', 'lead_name', 'stage']}
        empty={<EmptyState icon="bi-graph-up-arrow" title="No opportunities yet" message="Create one, or convert a lead from the Leads screen." action={<button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg" /> New Opportunity</button>} />} />

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? 'Edit Opportunity' : 'New Opportunity'} icon="bi-graph-up-arrow" width={520}
        footer={<><button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button><button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg" /> Save</button></>}>
        <div className="row g-3">
          {!form.id && (
            <Field label="From Lead (auto-fills details)" col={12}>
              <select className="form-select" value={form.lead_id} onChange={onLead}>
                <option value="">— none —</option>
                {leads.map((l) => <option key={l.id} value={l.id}>{l.lead_name}{l.company_name ? ` (${l.company_name})` : ''}</option>)}
              </select>
            </Field>
          )}
          <Field label="Opportunity Name" required col={12}><input className="form-control" value={form.name} onChange={set('name')} /></Field>
          <Field label="Company" col={12}><select className="form-select" value={form.company_id} onChange={set('company_id')}><option value="">— none —</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Stage" col={6}><select className="form-select" value={form.stage} onChange={onStage}>{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="Probability (%)" col={6}><input type="number" className="form-control" value={form.probability} onChange={set('probability')} /></Field>
          <Field label="Value (₹)" col={6}><input type="number" className="form-control" value={form.value} onChange={set('value')} /></Field>
          <Field label="Expected Close" col={6}><input type="date" className="form-control" value={form.expected_close_date} onChange={set('expected_close_date')} /></Field>
          <Field label="Description" col={12}><textarea className="form-control" rows={2} value={form.description} onChange={set('description')} /></Field>
        </div>
      </Drawer>

      {fuOpp && <OppFollowUpModal opp={fuOpp} onClose={() => { setFuOpp(null); load(); }} />}
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={doDelete} title="Delete opportunity?" message={`Delete "${confirmDel?.name}"?`} confirmLabel="Delete" />
    </div>
  );
}

// ---------- Follow-up modal for an opportunity ----------
function OppFollowUpModal({ opp, onClose }) {
  const toast = useToast();
  const [followups, setFollowups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [f, setF] = useState({ followup_date: '', followup_type: 'Call', activity: '', next_followup_date: '', outcome: '' });
  const [completingId, setCompletingId] = useState(null);
  const [cOutcome, setCOutcome] = useState('');
  const [cSubject, setCSubject] = useState('');
  const openComplete = (it) => { setCompletingId(it.id); setCOutcome(''); setCSubject(it.activity || it.followup_type || ''); };
  const load = useCallback(() => {
    apiFetch(`/crm/opportunities/${opp.id}/followups`).then((r) => setFollowups((r.data || []).filter((x) => x.status !== 'Done'))).catch(() => {});
    apiFetch(`/crm/opportunities/${opp.id}/activities`).then((r) => setActivities(r.data || [])).catch(() => {});
  }, [opp.id]);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    if (!f.followup_date) { toast.error('Date required', 'Pick the date/time of this touch.'); return; }
    try {
      await apiFetch(`/crm/opportunities/${opp.id}/log-touch`, { method: 'POST', body: { ...f, followup_date: toSql(f.followup_date), next_followup_date: toSql(f.next_followup_date) } });
      toast.success('Saved', f.next_followup_date ? 'Logged to Activities + next follow-up scheduled' : 'Logged to Activities');
      setF({ followup_date: '', followup_type: 'Call', activity: '', next_followup_date: '', outcome: '' }); load();
    } catch { toast.error('Error', 'Failed to save'); }
  };
  const scheduleOnly = async () => {
    if (!f.next_followup_date) { toast.error('Date required', 'Pick the next follow-up date/time.'); return; }
    try {
      await apiFetch('/crm/followups', { method: 'POST', body: { opportunity_id: opp.id, followup_date: toSql(f.next_followup_date), next_followup_date: toSql(f.next_followup_date), followup_type: f.followup_type, activity: f.activity, status: 'Pending' } });
      toast.success('Follow-up scheduled', 'Added to the Follow-ups screen'); setF({ ...f, next_followup_date: '' }); load();
    } catch { toast.error('Error', 'Failed to schedule follow-up'); }
  };
  const completeFu = async (fid) => {
    try { await apiFetch(`/crm/followups/${fid}/done`, { method: 'POST', body: { outcome: cOutcome, subject: cSubject } }); toast.success('Follow-up completed', 'Logged to Activities'); setCompletingId(null); setCOutcome(''); setCSubject(''); load(); }
    catch { toast.error('Error', 'Failed to complete'); }
  };
  return (
    <Modal open onClose={onClose} title={`Follow-up — ${opp.name}`} icon="bi-clock-history" width={660}>
      <div className="row g-2 mb-3">
        <div className="col-12 fs-12 text-muted-c mb-1"><b>Save Touch</b> logs to <b>Activities</b> (as an Opportunity activity). <b>Schedule Follow-up</b> just plans a future one.</div>
        <Field label="Date/Time (this touch)" col={6}><DateTimePicker value={f.followup_date} onChange={(v) => setF({ ...f, followup_date: v })} /></Field>
        <Field label="Type" col={6}><select className="form-select" value={f.followup_type} onChange={(e) => setF({ ...f, followup_type: e.target.value })}>{['Call', 'Email', 'Meeting', 'Visit', 'WhatsApp'].map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Subject" col={12}><input className="form-control" value={f.activity} onChange={(e) => setF({ ...f, activity: e.target.value })} placeholder="Subject — what was done" /></Field>
        <Field label="Outcome" col={6}><input className="form-control" value={f.outcome} onChange={(e) => setF({ ...f, outcome: e.target.value })} /></Field>
        <Field label="Next Follow-up Date/Time" col={6} hint="Used by both buttons"><DateTimePicker value={f.next_followup_date} onChange={(v) => setF({ ...f, next_followup_date: v })} /></Field>
        <div className="col-12 d-flex justify-content-end gap-2">
          <button className="btn btn-light btn-sm" onClick={scheduleOnly}><i className="bi bi-calendar-plus" /> Schedule Follow-up</button>
          <button className="btn btn-primary btn-sm" onClick={save}><i className="bi bi-check-lg" /> Save Touch</button>
        </div>
      </div>

      <div className="fs-13 fw-7 text-muted-c mb-1">Upcoming follow-ups ({followups.length})</div>
      {followups.length === 0 ? <div className="text-muted-c fs-12 mb-2">None scheduled.</div> :
        followups.map((it) => (
          <div key={it.id} className="py-1 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <span className="fs-13"><i className="bi bi-clock text-primary-c me-1" />{fmtDT(it.next_followup_date || it.followup_date)} · {it.followup_type}</span>
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
          </div>))}

      <div className="fs-13 fw-7 text-muted-c mb-1 mt-3">Activity history ({activities.length})</div>
      {activities.length === 0 ? <div className="text-muted-c fs-12">No activities yet.</div> :
        <div style={{ maxHeight: 170, overflow: 'auto' }}>
          {activities.map((a) => (
            <div key={a.id} className="py-1 border-bottom">
              <div className="fs-13 fw-6">{a.activity_type} · {a.subject}</div>
              <div className="fs-12 text-muted-c">{fmtDT(a.activity_datetime)}{a.outcome ? ` · ${a.outcome}` : ''}</div>
            </div>))}
        </div>}
    </Modal>
  );
}
