import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import DateRangeBar, { inRange } from '../../components/common/DateRangeBar';
import { Badge, EmptyState, Field } from '../../components/common/Ui';
import { Drawer, Modal, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { Clock, Flag, Star } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCrm } from '../../context/CrmContext';
import { apiFetch } from '../../utils/api';
import DateTimePicker from '../../components/common/DateTimePicker';

const TEMPERATURES = ['Hot', 'Warm', 'Cold'];
const tempTone = (t) => ({ Hot: 'tone-red', Warm: 'tone-amber', Cold: 'tone-blue' }[t] || 'tone-gray');
const closureTone = (s) => ({ Open: 'tone-blue', Closed: 'tone-green', Cancelled: 'tone-gray' }[s] || 'tone-gray');

// datetime-local (2026-08-25T10:00) -> MySQL DATETIME (2026-08-25 10:00:00)
const toSql = (v) => (v ? v.replace('T', ' ') + (v.length === 16 ? ':00' : '') : null);
const toLocal = (v) => (v ? String(v).replace(' ', 'T').slice(0, 16) : '');
const fmtDT = (v) => {
  if (!v) return '';
  const s = String(v).replace('T', ' ');
  if (s.length < 16) return s;
  let [h, m] = s.slice(11, 16).split(':');
  let hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12 || 12;
  return `${s.slice(0, 10)} ${hr < 10 ? '0'+hr : hr}:${m} ${ampm}`;
};

// Lead form defaults (company_id links to a crm_companies row; contact fills from it)
const emptyLead = {
  lead_name: '', contact_name: '', phone: '', email: '', address: '',
  business_details: '', requirement: '', temperature: 'Warm', source: '',
  priority: 'Medium', value: '', company_id: '', product_id: '',
};

export default function LeadsList() {
  const toast = useToast();
  const navigate = useNavigate();
  const crm = useCrm();
  const { leadSources } = crm;

  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const contactName = (c) => [c.first_name, c.last_name].filter(Boolean).join(' ') || c.name || '';

  const [fTemp, setFTemp] = useState('');
  const [fClosure, setFClosure] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });

  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(emptyLead);

  const contactsForCompany = useMemo(
    () => contacts.filter((c) => String(c.company_id ?? c.companyId ?? '') === String(form.company_id ?? '')),
    [contacts, form.company_id]
  );

  // Picking a company fills company_id + client name (if blank) and resets the contact
  const onPickCompany = (e) => {
    const cid = e.target.value;
    const comp = companies.find((c) => String(c.id) === String(cid));
    setForm((f) => ({ ...f, company_id: cid, lead_name: f.lead_name || (comp?.name || ''), contact_name: '', phone: '', email: '' }));
  };
  // Picking a contact fills the contact name + phone/email from the contact record
  const onPickContact = (e) => {
    const val = e.target.value;
    const ct = contactsForCompany.find((c) => contactName(c) === val);
    setForm((f) => ({ ...f, contact_name: val, phone: ct?.mobile || ct?.phone || f.phone, email: ct?.email || f.email }));
  };
  const [followLead, setFollowLead] = useState(null);
  const [closeLead, setCloseLead] = useState(null);
  const [feedbackLead, setFeedbackLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/crm/leads');
      setLeads(res.data || []);
    } catch { toast.error('Error', 'Failed to load leads'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    loadLeads();
    apiFetch('/crm/companies').then((r) => setCompanies(r.data || [])).catch(() => {});
    apiFetch('/crm/contacts').then((r) => setContacts(r.data || [])).catch(() => {});
    apiFetch('/crm/products').then((r) => setProducts(r.data || [])).catch(() => {});
  }, [loadLeads]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openNew = () => { setForm(emptyLead); setDrawer(true); };
  const openEdit = (l) => {
    setForm({
      id: l.id, lead_name: l.lead_name || '', contact_name: l.contact_name || '', phone: l.phone || '',
      email: l.email || '', address: l.address || '', business_details: l.business_details || '',
      requirement: l.requirement || '', temperature: l.temperature || 'Warm', source: l.source || '',
      priority: l.priority || 'Medium', value: l.value || '', company_id: l.company_id || '', product_id: l.product_id || '',
    });
    setDrawer(true);
  };

  const saveLead = async () => {
    if (!form.lead_name.trim()) { toast.error('Client name required', 'Please enter the client name.'); return; }
    const body = { ...form, value: form.value === '' ? null : Number(form.value) };
    try {
      if (form.id) { await apiFetch(`/crm/leads/${form.id}`, { method: 'PUT', body }); toast.success('Lead updated', form.lead_name); }
      else { await apiFetch('/crm/leads', { method: 'POST', body }); toast.success('Lead added', form.lead_name); }
      setDrawer(false); loadLeads();
    } catch (e) { toast.error('Error', 'Failed to save lead'); }
  };

  const doDelete = async () => {
    try { await apiFetch(`/crm/leads/${confirmDel.id}`, { method: 'DELETE' }); toast.success('Lead deleted', confirmDel.lead_name); loadLeads(); }
    catch { toast.error('Error', 'Failed to delete lead'); }
    finally { setConfirmDel(null); }
  };

  const filtered = useMemo(() => leads.filter((l) =>
    (!fTemp || l.temperature === fTemp) && (!fClosure || (l.closure_status || 'Open') === fClosure) && inRange(l.created_at, range)
  ), [leads, fTemp, fClosure, range]);

  const columns = [
    { key: 'sno', label: 'S.No', width: '64px', render: (_, i) => <span className="text-secondary-c">{i}</span> },
    { key: 'lead_name', label: 'Client', sortable: true, render: (r) => (
      <div><div className="fw-6">{r.lead_name}</div><div className="fs-12 text-muted-c">{r.company_name || ''}</div></div>) },
    { key: 'contact_name', label: 'Contact', render: (r) => <div>{r.contact_name || '—'}<div className="fs-12 text-muted-c">{r.phone || ''}</div></div> },
    { key: 'product_name', label: 'Product', sortable: true, render: (r) => r.product_name ? <Badge tone="tone-indigo">{r.product_name}</Badge> : <span className="text-muted-c">—</span> },
    { key: 'temperature', label: 'Status', sortable: true, render: (r) => <Badge tone={tempTone(r.temperature)} dot>{r.temperature || '—'}</Badge> },
    { key: 'closure_status', label: 'Closure', render: (r) => <Badge tone={closureTone(r.closure_status || 'Open')}>{r.closure_status || 'Open'}</Badge> },
    { key: 'value', label: 'Value', sortable: true, accessor: (r) => Number(r.value) || 0, render: (r) => <span className="mono">{r.value ? `₹${Number(r.value).toLocaleString('en-IN')}` : '—'}</span> },
    { key: 'actions', label: 'Action', width: '200px', render: (r) => {
      const closed = ['Closed', 'Cancelled'].includes(r.closure_status);
      return (
        <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <ActionIconButton type="view" tooltip="View 360" onClick={() => navigate(`/leads/${r.id}`)} />
          <span className="position-relative d-inline-flex">
            <ActionIconButton icon={Clock} tooltip={r.followup_count ? `${r.followup_count} pending follow-up${r.followup_count > 1 ? 's' : ''}` : 'Follow-ups'} onClick={() => setFollowLead(r)} />
            {r.followup_count > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2, minWidth: 15, height: 15, lineHeight: '15px',
                fontSize: 9, fontWeight: 700, textAlign: 'center', color: '#fff', background: '#ef4444',
                borderRadius: 999, padding: '0 3px', boxShadow: '0 0 0 2px #fff', pointerEvents: 'none',
              }}>{r.followup_count}</span>
            )}
          </span>
          {!closed && <ActionIconButton icon={Flag} tooltip="Close / Cancel deal" onClick={() => setCloseLead(r)} />}
          {r.closure_status === 'Closed' && <ActionIconButton icon={Star} tooltip="Feedback" onClick={() => setFeedbackLead(r)} />}
          <ActionIconButton type="edit" tooltip="Edit" onClick={() => openEdit(r)} />
          <ActionIconButton type="delete" tooltip="Delete" onClick={() => setConfirmDel(r)} />
        </div>
      );
    } },
  ];

  const filters = (
    <>
      <select className="form-select form-select-sm" style={{ width: 140 }} value={fTemp} onChange={(e) => setFTemp(e.target.value)}>
        <option value="">All Status</option>{TEMPERATURES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 150 }} value={fClosure} onChange={(e) => setFClosure(e.target.value)}>
        <option value="">All Closure</option>{['Open', 'Closed', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </>
  );

  return (
    <div className="page">
      <PageHeader title="Leads" subtitle="Capture, follow up, close and collect feedback" icon="bi-lightning-charge-fill"
        actions={<button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg" /> New Lead</button>} />

      <DateRangeBar onApply={setRange} />
      <DataTable columns={columns} rows={filtered} keyField="id" loading={loading} filters={filters}
        searchPlaceholder="Search client, contact, phone..." searchKeys={['lead_name', 'contact_name', 'phone', 'email', 'requirement']}
        empty={<EmptyState icon="bi-lightning-charge" title="No leads yet" message="Add your first lead to get started." action={<button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg" /> New Lead</button>} />} />

      {/* Add / Edit Lead */}
      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? 'Edit Lead' : 'New Lead'} icon="bi-lightning-charge-fill" width={560}
        footer={<><button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button><button className="btn btn-primary" onClick={saveLead}><i className="bi bi-check-lg" /> Save</button></>}>
        <div className="row g-3">
          <Field label="Company" col={12} hint="Pick an existing company (create them under Companies first)">
            <select className="form-select" value={form.company_id} onChange={onPickCompany}>
              <option value="">— select company —</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Client Name" required col={12}><input className="form-control" value={form.lead_name} onChange={set('lead_name')} placeholder="Client / company name" /></Field>
          <Field label="Contact" col={6} hint={form.company_id ? undefined : 'Select a company first'}>
            <select className="form-select" value={form.contact_name} onChange={onPickContact} disabled={!form.company_id}>
              <option value="">{form.company_id ? (contactsForCompany.length ? '— select contact —' : 'No contacts for this company') : 'Select company first'}</option>
              {contactsForCompany.map((c) => <option key={c.id} value={contactName(c)}>{contactName(c)}{c.designation ? ` — ${c.designation}` : ''}</option>)}
            </select>
          </Field>
          <Field label="Phone" col={6}><input className="form-control" value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Email" col={6}><input className="form-control" value={form.email} onChange={set('email')} /></Field>
          <Field label="Status" col={6}><select className="form-select" value={form.temperature} onChange={set('temperature')}>{TEMPERATURES.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
          <Field label="Address" col={12}><input className="form-control" value={form.address} onChange={set('address')} /></Field>
          <Field label="Product" col={12}>
            <select className="form-select" value={form.product_id} onChange={set('product_id')}>
              <option value="">— select product —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Business Details" col={12}><textarea className="form-control" rows={2} value={form.business_details} onChange={set('business_details')} /></Field>
          <Field label="Requirement" col={12}><textarea className="form-control" rows={2} value={form.requirement} onChange={set('requirement')} /></Field>
          <Field label="Source" col={6}><select className="form-select" value={form.source} onChange={set('source')}><option value="">Select</option>{(leadSources || []).map((s) => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}</select></Field>
          <Field label="Est. Value (₹)" col={6}><input type="number" className="form-control" value={form.value} onChange={set('value')} /></Field>
        </div>
      </Drawer>

      {viewLead && <ViewLeadModal lead={viewLead} onClose={() => setViewLead(null)} />}
      {followLead && <FollowUpModal lead={followLead} onClose={() => { setFollowLead(null); loadLeads(); }} />}
      {closeLead && <ClosureModal lead={closeLead} onDone={() => { setCloseLead(null); loadLeads(); }} onClose={() => setCloseLead(null)} />}
      {feedbackLead && <FeedbackModal lead={feedbackLead} onClose={() => setFeedbackLead(null)} />}
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={doDelete} title="Delete lead?" message={`Delete "${confirmDel?.lead_name}"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}

// ---------- Follow-up modal ----------
function FollowUpModal({ lead, onClose }) {
  const toast = useToast();
  const [followups, setFollowups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [completingId, setCompletingId] = useState(null);
  const [cOutcome, setCOutcome] = useState('');
  const [cSubject, setCSubject] = useState('');
  const openComplete = (it) => { setCompletingId(it.id); setCOutcome(''); setCSubject(it.activity || it.followup_type || ''); };
  const [f, setF] = useState({ followup_date: '', followup_type: 'Call', activity: '', next_followup_date: '', outcome: '' });
  const load = useCallback(() => {
    apiFetch(`/crm/leads/${lead.id}/followups`).then((r) => setFollowups((r.data || []).filter((x) => x.status !== 'Done'))).catch(() => {});
    apiFetch(`/crm/leads/${lead.id}/activities`).then((r) => setActivities(r.data || [])).catch(() => {});
  }, [lead.id]);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    if (!f.followup_date) { toast.error('Date required', 'Pick the date/time of this touch.'); return; }
    try {
      await apiFetch(`/crm/leads/${lead.id}/log-touch`, { method: 'POST', body: { ...f, followup_date: toSql(f.followup_date), next_followup_date: toSql(f.next_followup_date) } });
      toast.success('Saved', f.next_followup_date ? 'Logged to Activities + next follow-up scheduled' : 'Logged to Activities');
      setF({ followup_date: '', followup_type: 'Call', activity: '', next_followup_date: '', outcome: '' }); load();
    } catch { toast.error('Error', 'Failed to save'); }
  };
  // Schedule a follow-up on its own — creates a pending Follow-up only (no Activity)
  const scheduleOnly = async () => {
    if (!f.next_followup_date) { toast.error('Date required', 'Pick the next follow-up date/time.'); return; }
    try {
      await apiFetch('/crm/followups', { method: 'POST', body: {
        lead_id: lead.id, followup_date: toSql(f.next_followup_date), next_followup_date: toSql(f.next_followup_date),
        followup_type: f.followup_type, activity: f.activity, status: 'Pending',
      } });
      toast.success('Follow-up scheduled', 'Added to the Follow-ups screen');
      setF({ ...f, next_followup_date: '' }); load();
    } catch { toast.error('Error', 'Failed to schedule follow-up'); }
  };
  // Complete a scheduled follow-up right here — enter the outcome, log it to Activities
  const completeFollowup = async (id) => {
    try {
      await apiFetch(`/crm/followups/${id}/done`, { method: 'POST', body: { outcome: cOutcome, subject: cSubject } });
      toast.success('Follow-up completed', 'Logged to Activities');
      setCompletingId(null); setCOutcome(''); setCSubject(''); load();
    } catch { toast.error('Error', 'Failed to complete follow-up'); }
  };
  return (
    <Modal open onClose={onClose} title={`Follow-up — ${lead.lead_name}`} icon="bi-clock-history" width={660}>
      <div className="row g-2 mb-3">
        <div className="col-12 fs-12 text-muted-c mb-1"><b>Save Touch</b> = log this interaction to <b>Activities</b> (and schedule the next follow-up if a next date is set). <b>Schedule Follow-up</b> = just plan a future follow-up (no activity logged).</div>
        <Field label="Date/Time (this touch)" col={6}><DateTimePicker value={f.followup_date} onChange={(v) => setF({ ...f, followup_date: v })} /></Field>
        <Field label="Type" col={6}><select className="form-select" value={f.followup_type} onChange={(e) => setF({ ...f, followup_type: e.target.value })}>{['Call', 'Email', 'Meeting', 'Visit', 'WhatsApp'].map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Subject" col={12}><input className="form-control" value={f.activity} onChange={(e) => setF({ ...f, activity: e.target.value })} placeholder="Subject — what was done" /></Field>
        <Field label="Outcome" col={6}><input className="form-control" value={f.outcome} onChange={(e) => setF({ ...f, outcome: e.target.value })} /></Field>
        <Field label="Next Follow-up Date/Time" col={6} hint="Used by both buttons below"><DateTimePicker value={f.next_followup_date} onChange={(v) => setF({ ...f, next_followup_date: v })} /></Field>
        <div className="col-12 d-flex justify-content-end gap-2">
          <button className="btn btn-light btn-sm" onClick={scheduleOnly} title="Create a pending follow-up only (no activity logged)"><i className="bi bi-calendar-plus" /> Schedule Follow-up</button>
          <button className="btn btn-primary btn-sm" onClick={save} title="Log this touch to Activities (+ next follow-up if a next date is set)"><i className="bi bi-check-lg" /> Save Touch</button>
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
              <div className="mt-1"><input className="form-control form-control-sm mb-1" placeholder="Subject" value={cSubject} onChange={(e) => setCSubject(e.target.value)} /><div className="d-flex gap-2"><input className="form-control form-control-sm" placeholder="What was the follow-up outcome?" value={cOutcome} onChange={(e) => setCOutcome(e.target.value)} autoFocus />
                <button className="btn btn-sm btn-primary" onClick={() => completeFollowup(it.id)}>Save</button>
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

// ---------- Closure + registration modal ----------
function ClosureModal({ lead, onDone, onClose }) {
  const toast = useToast();
  const [choice, setChoice] = useState('Closed');
  const [reg, setReg] = useState({ registration_no: '', registration_date: '', amount: '', payment_status: 'Paid', details: '' });
  const submit = async () => {
    try {
      await apiFetch(`/crm/leads/${lead.id}/close`, { method: 'POST', body: { closure_status: choice } });
      if (choice === 'Closed') {
        await apiFetch(`/crm/leads/${lead.id}/registration`, { method: 'POST', body: { ...reg, amount: reg.amount === '' ? null : Number(reg.amount) } });
      }
      toast.success(`Lead ${choice}`, lead.lead_name); onDone();
    } catch { toast.error('Error', 'Failed to close lead'); }
  };
  return (
    <Modal open onClose={onClose} title={`Close Deal — ${lead.lead_name}`} icon="bi-flag" width={560}
      footer={<><button className="btn btn-light" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit}><i className="bi bi-check-lg" /> Confirm</button></>}>
      <div className="d-flex gap-3 mb-3">
        {['Closed', 'Cancelled'].map((c) => (
          <label key={c} className={`flex-fill border rounded p-3 text-center ${choice === c ? 'border-primary bg-primary-soft' : ''}`} style={{ cursor: 'pointer' }}>
            <input type="radio" className="d-none" checked={choice === c} onChange={() => setChoice(c)} />
            <i className={`bi ${c === 'Closed' ? 'bi-check-circle text-success' : 'bi-x-circle text-secondary-c'} fs-4 d-block mb-1`} />{c}
          </label>
        ))}
      </div>
      {choice === 'Closed' && (
        <div className="row g-2">
          <div className="col-12 fw-7 fs-13 text-muted-c">Registration Details</div>
          <Field label="Registration No" col={6}><input className="form-control" value={reg.registration_no} onChange={(e) => setReg({ ...reg, registration_no: e.target.value })} /></Field>
          <Field label="Registration Date" col={6}><input type="date" className="form-control" value={reg.registration_date} onChange={(e) => setReg({ ...reg, registration_date: e.target.value })} /></Field>
          <Field label="Amount (₹)" col={6}><input type="number" className="form-control" value={reg.amount} onChange={(e) => setReg({ ...reg, amount: e.target.value })} /></Field>
          <Field label="Payment Status" col={6}><select className="form-select" value={reg.payment_status} onChange={(e) => setReg({ ...reg, payment_status: e.target.value })}>{['Paid', 'Partial', 'Pending'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Details" col={12}><textarea className="form-control" rows={2} value={reg.details} onChange={(e) => setReg({ ...reg, details: e.target.value })} /></Field>
        </div>
      )}
    </Modal>
  );
}

// ---------- Feedback modal (5-star) ----------
function FeedbackModal({ lead, onClose }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);
  useEffect(() => { apiFetch(`/crm/leads/${lead.id}/feedback`).then((r) => setItems(r.data || [])).catch(() => {}); }, [lead.id]);
  const save = async () => {
    if (!rating) { toast.error('Rating required', 'Please select a star rating.'); return; }
    try { await apiFetch(`/crm/leads/${lead.id}/feedback`, { method: 'POST', body: { rating, feedback_text: text } }); toast.success('Feedback saved', ''); onClose(); }
    catch { toast.error('Error', 'Failed to save feedback'); }
  };
  return (
    <Modal open onClose={onClose} title={`Feedback — ${lead.lead_name}`} icon="bi-star-fill" width={520}
      footer={<><button className="btn btn-light" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg" /> Submit</button></>}>
      <div className="text-center mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <i key={n} className={`bi ${n <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'} fs-2 mx-1`} style={{ cursor: 'pointer' }} onClick={() => setRating(n)} />
        ))}
      </div>
      <Field label="Comments" col={12}><textarea className="form-control" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="How was the experience?" /></Field>
      {items.length > 0 && (
        <div className="border-top mt-3 pt-2">
          <div className="fs-12 fw-7 text-muted-c mb-1">Previous feedback</div>
          {items.map((it) => (
            <div key={it.id} className="fs-13 py-1">{'★'.repeat(it.rating || 0)}<span className="text-muted-c ms-2">{it.feedback_text}</span></div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ---------- View lead details (read-only) ----------
function ViewLeadModal({ lead, onClose }) {
  const [followups, setFollowups] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    apiFetch(`/crm/leads/${lead.id}/followups`).then((r) => setFollowups(r.data || [])).catch(() => {});
    apiFetch(`/crm/leads/${lead.id}/registration`).then((r) => setRegistration(r.data || null)).catch(() => {});
    apiFetch(`/crm/leads/${lead.id}/feedback`).then((r) => setFeedback(r.data || [])).catch(() => {});
  }, [lead.id]);

  const Row = ({ label, value }) => (
    <div className="col-6 mb-3"><div className="fs-13 text-muted-c mb-1">{label}</div><div className="fs-15 text-dark fw-5">{value || '—'}</div></div>
  );

  return (
    <Modal open onClose={onClose} title={lead.lead_name} subtitle="Lead details" icon="bi-eye" width={860}>
      <div className="d-flex gap-2 mb-3">
        <Badge tone={tempTone(lead.temperature)} dot>{lead.temperature || '—'}</Badge>
        <Badge tone={closureTone(lead.closure_status || 'Open')}>{lead.closure_status || 'Open'}</Badge>
        {lead.value ? <Badge tone="tone-gray">₹{Number(lead.value).toLocaleString('en-IN')}</Badge> : null}
      </div>

      <div className="fs-14 fw-7 text-muted-c mb-2 mt-2">Client & Contact</div>
      <div className="row">
        <Row label="Client Name" value={lead.lead_name} />
        <Row label="Company" value={lead.company_name} />
        <Row label="Contact" value={lead.contact_name} />
        <Row label="Phone" value={lead.phone} />
        <Row label="Email" value={lead.email} />
        <Row label="Source" value={lead.source} />
        <Row label="Address" value={lead.address} />
        <Row label="Created" value={fmtDT(lead.created_at)} />
      </div>

      <div className="fs-14 fw-7 text-muted-c mb-2 mt-2">Business & Requirement</div>
      <div className="row">
        <div className="col-12 mb-3"><div className="fs-13 text-muted-c mb-1">Business Details</div><div className="fs-15 text-dark fw-5">{lead.business_details || '—'}</div></div>
        <div className="col-12 mb-3"><div className="fs-13 text-muted-c mb-1">Requirement</div><div className="fs-15 text-dark fw-5">{lead.requirement || '—'}</div></div>
      </div>

      <div className="fs-14 fw-7 text-muted-c mb-2 mt-3">Follow-ups ({followups.length})</div>
      {followups.length === 0 ? <div className="fs-13 text-muted-c">No follow-ups logged.</div> :
        <div style={{ maxHeight: 160, overflow: 'auto' }}>
          {followups.map((f) => (
            <div key={f.id} className="border-bottom py-2">
              <div className="fs-14 fw-6 mb-1">{f.followup_type} · {f.activity || '—'}</div>
              <div className="fs-13 text-muted-c">{fmtDT(f.followup_date)}{f.next_followup_date ? ` → next ${fmtDT(f.next_followup_date)}` : ''}{f.outcome ? ` · ${f.outcome}` : ''}</div>
            </div>
          ))}
        </div>}

      {registration && (
        <>
          <div className="fs-14 fw-7 text-muted-c mb-2 mt-3">Registration</div>
          <div className="row">
            <Row label="Reg. No" value={registration.registration_no} />
            <Row label="Reg. Date" value={String(registration.registration_date || '').slice(0, 10)} />
            <Row label="Amount" value={registration.amount ? `₹${Number(registration.amount).toLocaleString('en-IN')}` : '—'} />
            <Row label="Payment" value={registration.payment_status} />
          </div>
        </>
      )}

      {feedback.length > 0 && (
        <>
          <div className="fs-14 fw-7 text-muted-c mb-2 mt-3">Feedback</div>
          {feedback.map((fb) => (
            <div key={fb.id} className="fs-14 py-1"><span className="text-warning">{'★'.repeat(fb.rating || 0)}</span><span className="text-muted-c">{'☆'.repeat(5 - (fb.rating || 0))}</span> <span className="ms-2">{fb.feedback_text}</span></div>
          ))}
        </>
      )}
    </Modal>
  );
}
