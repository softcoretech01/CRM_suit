import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, Avatar, EmptyState, Field, Section } from '../../components/common/Ui';
import { Drawer } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, statusTone } from '../../utils/format';
import { industries, states, cities, countries, salespeople } from '../../data/mockData';

const COMPANY_TYPES = ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Proprietorship'];
const STATUS_OPTIONS = ['Active', 'Prospect', 'Inactive', 'Paused'];

const emptyForm = {
  name: '', legalName: '', industry: 'Manufacturing', website: '', employees: '', revenue: '',
  gst: '', pan: '', type: 'Private Limited',
  address: '', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', pin: '',
  owner: salespeople[0] || '', remarks: '',
};

export default function CompaniesList() {
  const navigate = useNavigate();
  const crm = useCrm();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [fIndustry, setFIndustry] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fType, setFType] = useState('');

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

  const rows = useMemo(() => {
    return crm.companies.filter((c) =>
      (!fIndustry || c.industry === fIndustry) &&
      (!fStatus || c.status === fStatus) &&
      (!fType || c.type === fType)
    );
  }, [crm.companies, fIndustry, fStatus, fType]);

  const save = () => {
    if (!form.name.trim()) { toast.error('Company name required', 'Please enter a company name.'); return; }
    if (form.id) {
      crm.updateCompany(form.id, {
        ...form,
        employees: Number(form.employees) || 0,
        revenue: Number(form.revenue) || 0,
      });
      toast.success('Company updated', `${form.name} was saved.`);
    } else {
      const rec = crm.addCompany({
        ...form,
        employees: Number(form.employees) || 0,
        revenue: Number(form.revenue) || 0,
      });
      toast.success('Company added', `${rec.name} was created (${rec.code}).`);
    }
    setDrawer(false);
    setForm(emptyForm);
  };

  const openEdit = (c) => {
    setForm(c);
    setDrawer(true);
  };

  const doDelete = (c) => {
    if (window.confirm(`Are you sure you want to delete ${c.name}?`)) {
      crm.deleteCompany(c.id);
      toast.success('Company Deleted', 'The company was removed.');
    }
  };

  const columns = [
    { key: 'code', label: 'Company No', sortable: true, className: 'mono text-nowrap', render: (r) => r.code },
    {
      key: 'name', label: 'Company', sortable: true, accessor: (r) => r.name, className: 'text-nowrap',
      render: (r) => (
        <div className="d-flex align-items-center gap-2 text-nowrap">
          <Avatar name={r.name} size="md" />
          <div style={{ minWidth: 0 }}>
            <div className="fw-6 text-nowrap" style={{ lineHeight: 1.2 }}>{r.name}</div>
          </div>
        </div>
      ),
    },
    { key: 'industry', label: 'Industry', sortable: true, className: 'text-nowrap', render: (r) => <Badge tone="tone-gray">{r.industry}</Badge> },
    {
      key: 'city', label: 'Location', sortable: true, className: 'text-nowrap',
      render: (r) => (
        <div className="text-nowrap">
          <div className="fw-6 text-nowrap" style={{ lineHeight: 1.2 }}>{r.city}</div>
          <div className="fs-12 text-muted-c text-nowrap">{r.state}</div>
        </div>
      ),
    },
    { key: 'employees', label: 'Employees', sortable: true, className: 'mono text-nowrap', accessor: (r) => r.employees, render: (r) => (r.employees || 0).toLocaleString('en-IN') },
    { key: 'revenue', label: 'Revenue', sortable: true, className: 'mono text-nowrap', accessor: (r) => r.revenue, render: (r) => formatINR((r.revenue || 0) * 100000) },
    { key: 'status', label: 'Status', sortable: true, className: 'text-nowrap', render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    {
      key: 'actions', label: 'Action', width: '100px',
      render: (r) => (
        <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <ActionIconButton type="view" onClick={() => navigate(`/companies/${r.id}`)} />
          <ActionIconButton type="edit" onClick={() => openEdit(r)} />
          <ActionIconButton type="delete" onClick={() => doDelete(r)} />
        </div>
      ),
    },
  ];

  const filters = (
    <>
      <select className="form-select form-select-sm" style={{ width: 160 }} value={fIndustry} onChange={(e) => setFIndustry(e.target.value)}>
        <option value="">All Industries</option>
        {industries.map((i) => <option key={i.code} value={i.name}>{i.name}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 150 }} value={fType} onChange={(e) => setFType(e.target.value)}>
        <option value="">All Types</option>
        {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 140 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
        <option value="">All Status</option>
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </>
  );

  return (
    <div className="page">
      <PageHeader
        title="Companies"
        subtitle="Accounts and organizations in your CRM"
        icon="bi-building"
        actions={
          <>
            <button className="btn btn-primary" onClick={() => navigate('/companies?new=1')}><i className="bi bi-plus-lg" /> New Company</button>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        keyField="id"
        loading={loading}
        onRowClick={(r) => navigate(`/companies/${r.id}`)}
        searchPlaceholder="Search companies, code, city..."
        searchKeys={['name', 'code', 'legalName', 'city', 'address', 'gst', 'owner']}
        filters={filters}
        empty={<EmptyState icon="bi-building" title="No companies found" message="Try adjusting filters, or add a new company." action={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setDrawer(true); }}><i className="bi bi-plus-lg" /> Add Company</button>} />}
      />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={form.id ? "Edit Company" : "Add Company"}
        subtitle={form.id ? `Editing ${form.name}` : "Create a new account record"}
        icon="bi-building-add"
        width={560}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg" /> Save Company</button>
          </>
        }
      >
        <Section title="Company Info" icon="bi-building">
          <div className="row">
            <Field label="Company Name" required col={12}>
              <input className="form-control" value={form.name} onChange={set('name')} placeholder="e.g. ABC Manufacturing Pvt Ltd" />
            </Field>
            <Field label="Legal Name" col={12}>
              <input className="form-control" value={form.legalName} onChange={set('legalName')} placeholder="Registered legal name" />
            </Field>
            <Field label="Industry" col={6}>
              <select className="form-select" value={form.industry} onChange={set('industry')}>
                {industries.map((i) => <option key={i.code} value={i.name}>{i.name}</option>)}
              </select>
            </Field>
            <Field label="Website" col={6}>
              <input className="form-control" value={form.website} onChange={set('website')} placeholder="www.example.com" />
            </Field>
            <Field label="Employees" col={6}>
              <input type="number" className="form-control" value={form.employees} onChange={set('employees')} placeholder="0" />
            </Field>
            <Field label="Annual Revenue (₹ Lakh)" col={6}>
              <input type="number" className="form-control" value={form.revenue} onChange={set('revenue')} placeholder="0" />
            </Field>
          </div>
        </Section>

        <Section title="Registration" icon="bi-receipt">
          <div className="row">
            <Field label="GST Number" col={6}>
              <input className="form-control" value={form.gst} onChange={set('gst')} placeholder="33AABCA1234F1Z5" />
            </Field>
            <Field label="PAN" col={6}>
              <input className="form-control" value={form.pan} onChange={set('pan')} placeholder="AABCA1234F" />
            </Field>
            <Field label="Company Type" col={6}>
              <select className="form-select" value={form.type} onChange={set('type')}>
                {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Owner" col={6}>
              <select className="form-select" value={form.owner} onChange={set('owner')}>
                {salespeople.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Address" icon="bi-geo-alt">
          <div className="row">
            <Field label="Address" col={12}>
              <input className="form-control" value={form.address} onChange={set('address')} placeholder="Street, area" />
            </Field>
            <Field label="City" col={6}>
              <select className="form-select" value={form.city} onChange={set('city')}>
                {cities.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="State" col={6}>
              <select className="form-select" value={form.state} onChange={set('state')}>
                {states.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Country" col={6}>
              <select className="form-select" value={form.country} onChange={set('country')}>
                {countries.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="PIN Code" col={6}>
              <input className="form-control" value={form.pin} onChange={set('pin')} placeholder="641021" />
            </Field>
          </div>
        </Section>
      </Drawer>
    </div>
  );
}
