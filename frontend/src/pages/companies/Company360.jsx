import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, EmptyState, Field } from '../../components/common/Ui';
import { Drawer } from '../../components/common/Overlay';
import { StatCard } from '../../components/common/PageParts';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';

const statusTone = (s) => ({ Active: 'tone-green', Prospect: 'tone-blue', Inactive: 'tone-gray', Paused: 'tone-amber' }[s] || 'tone-gray');
const tempTone = (t) => ({ Hot: 'tone-red', Warm: 'tone-amber', Cold: 'tone-blue' }[t] || 'tone-gray');
const closureTone = (s) => ({ Open: 'tone-blue', Closed: 'tone-green', Cancelled: 'tone-gray' }[s] || 'tone-gray');
const inr = (v) => (v ? `₹${Number(v).toLocaleString('en-IN')}` : '—');
const fmtDT = (v) => (v ? String(v).replace('T', ' ').slice(0, 16) : '—');

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'bi-grid-1x2' },
  { key: 'contacts', label: 'Contacts', icon: 'bi-people' },
  { key: 'leads', label: 'Leads', icon: 'bi-lightning-charge' },
  { key: 'opportunities', label: 'Opportunities', icon: 'bi-graph-up-arrow' },
  { key: 'activities', label: 'Activities', icon: 'bi-activity' },
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

export default function Company360() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [opps, setOpps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ first_name: '', designation: '', email: '', mobile: '', phone: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await apiFetch(`/crm/companies/${id}`);
      setCompany(c.data);
      const [ct, ld, op, ac] = await Promise.all([
        apiFetch('/crm/contacts').catch(() => ({ data: [] })),
        apiFetch('/crm/leads').catch(() => ({ data: [] })),
        apiFetch('/crm/opportunities').catch(() => ({ data: [] })),
        apiFetch('/crm/activities').catch(() => ({ data: [] })),
      ]);
      const same = (x) => String(x.company_id) === String(id);
      const cLeads = (ld.data || []).filter(same);
      const leadIds = new Set(cLeads.map((l) => l.id));
      setContacts((ct.data || []).filter(same));
      setLeads(cLeads);
      setOpps((op.data || []).filter(same));
      setActivities((ac.data || []).filter((a) => same(a) || leadIds.has(a.lead_id)));
    } catch { toast.error('Error', 'Failed to load company'); setCompany(null); }
    finally { setLoading(false); }
  }, [id, toast]);
  useEffect(() => { load(); }, [load]);

  const openEdit = () => { setEditForm({ ...company }); setEditOpen(true); };
  const eset = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));
  const saveEdit = async () => {
    if (!editForm.name?.trim()) { toast.error('Name required', 'Enter a company name.'); return; }
    try {
      await apiFetch(`/crm/companies/${id}`, { method: 'PUT', body: {
        name: editForm.name, industry: editForm.industry, type: editForm.type, city: editForm.city,
        state: editForm.state, country: editForm.country, address: editForm.address,
        remarks: editForm.remarks, status: editForm.status,
      } });
      toast.success('Company updated', editForm.name); setEditOpen(false); load();
    } catch { toast.error('Error', 'Failed to update company'); }
  };

  const cset = (k) => (e) => setContactForm((f) => ({ ...f, [k]: e.target.value }));
  const saveContact = async () => {
    if (!contactForm.first_name.trim()) { toast.error('Name required', 'Enter the contact name.'); return; }
    try {
      await apiFetch('/crm/contacts', { method: 'POST', body: { ...contactForm, company_id: Number(id), status: 'ACTIVE' } });
      toast.success('Contact added', contactForm.first_name);
      setContactOpen(false); setContactForm({ first_name: '', designation: '', email: '', mobile: '', phone: '' }); load();
    } catch { toast.error('Error', 'Failed to add contact'); }
  };

  const pipeline = useMemo(() => opps.filter((o) => o.stage !== 'Lost' && o.status !== 'Lost').reduce((a, o) => a + (Number(o.value) || 0), 0), [opps]);
  const cname = (c) => [c.first_name, c.last_name].filter(Boolean).join(' ') || c.name || '—';

  if (loading) return <div className="page"><div className="text-center py-5 text-muted-c"><span className="spinner-border" /></div></div>;
  if (!company) return (
    <div className="page">
      <EmptyState icon="bi-building-x" title="Company not found" message="This company may have been removed."
        action={<button className="btn btn-primary" onClick={() => navigate('/companies')}><i className="bi bi-arrow-left" /> Back to Companies</button>} />
    </div>
  );

  const loc = [company.city, company.state, company.country].filter(Boolean).join(', ');

  return (
    <div className="page">
      {/* Header bar */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <button className="btn btn-light btn-icon" onClick={() => navigate('/companies')}><i className="bi bi-arrow-left" /></button>
        <div className="d-flex align-items-center gap-2"><i className="bi bi-building fs-4 text-primary-c" /><h4 className="m-0 fw-7">Company 360</h4></div>
      </div>

      {/* Company card */}
      <div className="surface p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="avatar avatar-lg" style={{ background: '#334155', color: '#fff', width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {(company.name || '?').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h4 className="m-0 fw-7">{company.name}</h4>
              {company.industry && <Badge tone="tone-gray">{company.industry}</Badge>}
              <Badge tone={statusTone(company.status)} dot>{company.status || 'Active'}</Badge>
            </div>
            <div className="fs-13 text-muted-c mt-1">{company.type || '—'}{loc ? ` · ${loc}` : ''}</div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={() => setContactOpen(true)}><i className="bi bi-person-plus" /> Add Contact</button>
            <button className="btn btn-light" onClick={openEdit}><i className="bi bi-pencil" /> Edit</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-3"><StatCard label="Contacts" value={contacts.length} icon="bi-people" color="var(--primary)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Leads" value={leads.length} icon="bi-lightning-charge" color="var(--warning)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Opportunities" value={opps.length} icon="bi-graph-up-arrow" color="var(--info)" /></div>
        <div className="col-6 col-lg-3"><StatCard label="Pipeline Value" value={inr(pipeline)} icon="bi-cash-stack" color="var(--success)" /></div>
      </div>

      {/* Tabs */}
      <div className="surface">
        <div className="d-flex gap-1 p-2 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
          {TABS.map((t) => {
            const count = { contacts: contacts.length, leads: leads.length, opportunities: opps.length, activities: activities.length }[t.key];
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-light'}`}>
                <i className={`bi ${t.icon} me-1`} />{t.label}{count != null && <span className={`badge ms-1 ${tab === t.key ? 'bg-light text-primary' : 'bg-secondary'}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="p-3">
          {tab === 'overview' && (
            <div className="row g-3">
              {[['Industry', company.industry], ['Type', company.type], ['Status', company.status],
                ['City', company.city], ['State', company.state], ['Country', company.country],
                ['Address', company.address], ['Created', fmtDT(company.created_at)]].map(([l, v]) => (
                <div key={l} className="col-6 col-lg-3"><div className="fs-12 text-muted-c">{l}</div><div className="fs-14">{v || '—'}</div></div>
              ))}
              {company.remarks && <div className="col-12"><div className="fs-12 text-muted-c">Remarks</div><div className="fs-14">{company.remarks}</div></div>}
            </div>
          )}

          {tab === 'contacts' && (
            <MiniTable empty="No contacts for this company." rows={contacts} columns={[
              { key: 'name', label: 'Name', render: (r) => <span className="fw-6">{cname(r)}</span> },
              { key: 'designation', label: 'Designation' },
              { key: 'email', label: 'Email' },
              { key: 'mobile', label: 'Mobile', render: (r) => r.mobile || r.phone || '—' },
              { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'ACTIVE' || r.status === 'Active' ? 'tone-green' : 'tone-gray'}>{r.status}</Badge> },
            ]} />
          )}

          {tab === 'leads' && (
            <MiniTable empty="No leads for this company." rows={leads} columns={[
              { key: 'lead_name', label: 'Lead', render: (r) => <span className="fw-6">{r.lead_name}</span> },
              { key: 'contact_name', label: 'Contact' },
              { key: 'temperature', label: 'Status', render: (r) => <Badge tone={tempTone(r.temperature)} dot>{r.temperature || '—'}</Badge> },
              { key: 'closure_status', label: 'Closure', render: (r) => <Badge tone={closureTone(r.closure_status || 'Open')}>{r.closure_status || 'Open'}</Badge> },
              { key: 'value', label: 'Value', render: (r) => inr(r.value) },
            ]} />
          )}

          {tab === 'opportunities' && (
            <MiniTable empty="No opportunities for this company." rows={opps} columns={[
              { key: 'name', label: 'Opportunity', render: (r) => <span className="fw-6">{r.name}</span> },
              { key: 'stage', label: 'Stage', render: (r) => <Badge tone="tone-indigo">{r.stage || '—'}</Badge> },
              { key: 'probability', label: 'Prob.', render: (r) => (r.probability != null ? `${r.probability}%` : '—') },
              { key: 'value', label: 'Value', render: (r) => inr(r.value) },
              { key: 'expected_close_date', label: 'Close', render: (r) => (r.expected_close_date ? String(r.expected_close_date).slice(0, 10) : '—') },
            ]} />
          )}

          {tab === 'activities' && (
            <MiniTable empty="No activities for this company." rows={activities} columns={[
              { key: 'subject', label: 'Subject', render: (r) => <span className="fw-6">{r.subject}</span> },
              { key: 'activity_type', label: 'Type', render: (r) => <Badge tone="tone-indigo">{r.activity_type || '—'}</Badge> },
              { key: 'activity_datetime', label: 'Date/Time', render: (r) => fmtDT(r.activity_datetime) },
              { key: 'outcome', label: 'Outcome' },
              { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'Completed' ? 'tone-green' : 'tone-amber'} dot>{r.status}</Badge> },
            ]} />
          )}
        </div>
      </div>

      {/* Edit company drawer */}
      <Drawer open={editOpen} onClose={() => setEditOpen(false)} title="Edit Company" icon="bi-building" width={520}
        footer={<><button className="btn btn-light" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={saveEdit}><i className="bi bi-check-lg" /> Save</button></>}>
        <div className="row g-3">
          <Field label="Company Name" col={12}><input className="form-control" value={editForm.name || ''} onChange={eset('name')} /></Field>
          <Field label="Industry" col={6}><input className="form-control" value={editForm.industry || ''} onChange={eset('industry')} /></Field>
          <Field label="Type" col={6}><input className="form-control" value={editForm.type || ''} onChange={eset('type')} /></Field>
          <Field label="Status" col={6}><select className="form-select" value={editForm.status || 'Active'} onChange={eset('status')}>{['Active', 'Prospect', 'Inactive', 'Paused'].map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field label="City" col={6}><input className="form-control" value={editForm.city || ''} onChange={eset('city')} /></Field>
          <Field label="State" col={6}><input className="form-control" value={editForm.state || ''} onChange={eset('state')} /></Field>
          <Field label="Country" col={6}><input className="form-control" value={editForm.country || ''} onChange={eset('country')} /></Field>
          <Field label="Address" col={12}><input className="form-control" value={editForm.address || ''} onChange={eset('address')} /></Field>
          <Field label="Remarks" col={12}><textarea className="form-control" rows={2} value={editForm.remarks || ''} onChange={eset('remarks')} /></Field>
        </div>
      </Drawer>

      {/* Add contact drawer */}
      <Drawer open={contactOpen} onClose={() => setContactOpen(false)} title="Add Contact" icon="bi-person-plus" width={480}
        footer={<><button className="btn btn-light" onClick={() => setContactOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={saveContact}><i className="bi bi-check-lg" /> Save</button></>}>
        <div className="row g-3">
          <Field label="Contact Name" col={12}><input className="form-control" value={contactForm.first_name} onChange={cset('first_name')} /></Field>
          <Field label="Designation" col={6}><input className="form-control" value={contactForm.designation} onChange={cset('designation')} /></Field>
          <Field label="Email" col={6}><input className="form-control" value={contactForm.email} onChange={cset('email')} /></Field>
          <Field label="Mobile" col={6}><input className="form-control" value={contactForm.mobile} onChange={cset('mobile')} /></Field>
          <Field label="Phone" col={6}><input className="form-control" value={contactForm.phone} onChange={cset('phone')} /></Field>
        </div>
      </Drawer>
    </div>
  );
}
