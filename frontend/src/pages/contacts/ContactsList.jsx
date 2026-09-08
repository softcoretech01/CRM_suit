import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import DateRangeBar, { inRange } from '../../components/common/DateRangeBar';
import { Badge, UserCell, EmptyState, Field, Section } from '../../components/common/Ui';
import ActionIconButton from '../../components/common/ActionIconButton';
import { Drawer } from '../../components/common/Overlay';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { statusTone } from '../../utils/format';
const emptyForm = {
  name: '', companyId: '', designation: '', department: '', email: '', mobile: '',
  whatsapp: '', linkedin: '', decisionMaker: false, influencer: false, primary: false, source: '',
};

function RelBadges({ c }) {
  if (!c.decisionMaker && !c.influencer && !c.primary) return <span className="text-muted-c">—</span>;
  return (
    <div className="d-flex align-items-center gap-1 flex-wrap">
      {c.decisionMaker && <Badge tone="tone-green">DM</Badge>}
      {c.influencer && <Badge tone="tone-indigo">INF</Badge>}
      {c.primary && <Badge tone="tone-blue">Primary</Badge>}
    </div>
  );
}

export default function ContactsList() {
  const navigate = useNavigate();
  const crm = useCrm();
  const { leadSources } = crm;
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [fCompany, setFCompany] = useState('');
  const [fDM, setFDM] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (params.get('new') === '1') {
      setDrawer(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  const rows = useMemo(() => {
    return crm.contacts.filter((c) =>
      (!fCompany || String(c.companyId ?? c.company_id) === String(fCompany)) &&
      (!fDM || (fDM === 'yes' ? c.decisionMaker : !c.decisionMaker)) &&
      (!fStatus || c.status === fStatus) &&
      inRange(c.created_at, range)
    );
  }, [crm.contacts, fCompany, fDM, fStatus, range]);

  const save = async (keepOpen = false) => {
    if (!form.name?.trim()) { toast.error('Name required', 'Please enter the full name.'); return; }
    const company = crm.companies.find((c) => c.id === form.companyId);
    
    try {
      if (form.id) {
        await crm.updateContact(form.id, {
          ...form,
          company: company ? company.name : '',
        });
        toast.success('Contact updated', `${form.name} was saved.`);
      } else {
        const rec = await crm.addContact({
          ...form,
          company: company ? company.name : '',
        });
        toast.success('Contact added', `${rec.name} was created.`);
      }
      
      if (keepOpen) {
        setForm({ ...emptyForm, companyId: form.companyId });
      } else {
        setDrawer(false);
        setForm(emptyForm);
      }
    } catch (err) {
      toast.error('Error', 'Failed to save contact');
    }
  };

  const openEdit = (c) => {
    // Replace nulls with empty strings to avoid React uncontrolled input warnings
    const sanitized = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v ?? '']));
    setForm({ ...emptyForm, ...sanitized });
    setDrawer(true);
  };

  const doDelete = async (c) => {
    const fullName = c.name || 'Unknown Contact';
    if (window.confirm(`Are you sure you want to delete ${fullName}?`)) {
      try {
        await crm.deleteContact(c.id);
        toast.success('Contact Deleted', 'The contact was removed.');
      } catch (err) {
        toast.error('Error', 'Failed to delete contact');
      }
    }
  };

  const columns = [
    { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
    {
      key: 'name', label: 'Name', sortable: true, accessor: (r) => r.name, className: 'text-nowrap',
      render: (r) => <span className="fw-6 text-nowrap">{r.name}</span>,
    },
    {
      key: 'company', label: 'Company', sortable: true,
      accessor: (r) => {
        const c = crm.companies.find(c => String(c.id) === String(r.companyId));
        return c ? c.name : (r.company || '');
      },
      className: 'text-nowrap',
      render: (r) => {
        const c = crm.companies.find(c => String(c.id) === String(r.companyId));
        return <span className="fw-5 text-nowrap">{c ? c.name : (r.company || '—')}</span>;
      }
    },
    { key: 'designation', label: 'Designation', sortable: true, className: 'text-nowrap', render: (r) => <Badge tone="tone-gray">{r.designation}</Badge> },
    { key: 'email', label: 'Email', className: 'text-nowrap', render: (r) => r.email ? <a href={`mailto:${r.email}`} onClick={(e) => e.stopPropagation()}>{r.email}</a> : '—' },
    { key: 'mobile', label: 'Mobile', className: 'mono text-nowrap', render: (r) => r.mobile || '—' },
    { key: 'status', label: 'Status', sortable: true, className: 'text-nowrap', render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    {
      key: 'actions', label: 'Action', width: '100px',
      render: (r) => (
        <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <ActionIconButton type="view" onClick={() => navigate(`/contacts/${r.id}`)} />
          <ActionIconButton type="edit" onClick={() => openEdit(r)} />
          <ActionIconButton type="delete" onClick={() => doDelete(r)} />
        </div>
      ),
    },
  ];

  const filters = (
    <>
      <select className="form-select form-select-sm" style={{ width: 190 }} value={fCompany} onChange={(e) => setFCompany(e.target.value)}>
        <option value="">All Companies</option>
        {crm.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 160 }} value={fDM} onChange={(e) => setFDM(e.target.value)}>
        <option value="">All Contacts</option>
        <option value="yes">Decision Makers</option>
        <option value="no">Non Decision Makers</option>
      </select>
    </>
  );

  return (
    <div className="page">
      <PageHeader
        title="Contacts"
        subtitle="People and stakeholders across your accounts"
        icon="bi-person-lines-fill"
        actions={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setDrawer(true); }}><i className="bi bi-plus-lg" /> Add Contact</button>}
      />

      <DateRangeBar onApply={setRange} />
      <DataTable
        columns={columns}
        rows={rows}
        keyField="id"
        loading={loading}
        searchPlaceholder="Search name, company, email..."
        searchKeys={['name', 'company', 'designation', 'email', 'mobile', 'department']}
        filters={filters}
        empty={<EmptyState icon="bi-person-lines-fill" title="No contacts found" message="Try adjusting filters, or add a new contact." action={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setDrawer(true); }}><i className="bi bi-plus-lg" /> Add Contact</button>} />}
      />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={form.id ? "Edit Contact" : "Add Contact"}
        subtitle={form.id ? `Editing ${form.name}` : "Create a new contact record"}
        icon="bi-person-plus"
        width={540}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button>
            {!form.id && (
              <button className="btn btn-outline-primary" onClick={() => save(true)}><i className="bi bi-person-plus" /> Save & Add Another</button>
            )}
            <button className="btn btn-primary" onClick={() => save(false)}><i className="bi bi-check-lg" /> Save Contact</button>
          </>
        }
      >
        <Section title="Personal & Role" icon="bi-person">
          <div className="row">
            <Field label="Full Name" required col={12}>
              <input className="form-control" value={form.name} onChange={set('name')} placeholder="Full Name" />
            </Field>
            <Field label="Company" col={12}>
              <select className="form-select" value={form.companyId} onChange={set('companyId')}>
                <option value="">Select company…</option>
                {crm.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Designation" col={6}>
              <input className="form-control" value={form.designation} onChange={set('designation')} placeholder="e.g. General Manager" />
            </Field>
            <Field label="Department" col={6}>
              <input className="form-control" value={form.department} onChange={set('department')} placeholder="e.g. IT" />
            </Field>
            <Field label="Source" col={12}>
              <select className="form-select" value={form.source} onChange={set('source')}>
                <option value="">Select source…</option>
                {leadSources?.map((s) => <option key={s.id || s.code || s.name} value={s.name}>{s.name}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Communication" icon="bi-chat-dots">
          <div className="row">
            <Field label="Email" col={12}>
              <input className="form-control" value={form.email} onChange={set('email')} placeholder="name@company.com" />
            </Field>
            <Field label="Mobile" col={6}>
              <input className="form-control" value={form.mobile} onChange={set('mobile')} placeholder="+91 98431 20034" />
            </Field>
            <Field label="WhatsApp" col={6}>
              <input className="form-control" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+91 98431 20034" />
            </Field>
            <Field label="LinkedIn" col={12}>
              <input className="form-control" value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/username" />
            </Field>
          </div>
        </Section>
      </Drawer>
    </div>
  );
}
