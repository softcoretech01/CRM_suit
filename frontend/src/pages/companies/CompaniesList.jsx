import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import DateRangeBar, { inRange } from '../../components/common/DateRangeBar';
import { Badge, Avatar, EmptyState, Field, Section } from '../../components/common/Ui';
import { Drawer } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { ImageCropperModal } from '../../components/common/ImageCropperModal';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, statusTone } from '../../utils/format';
import { salespeople } from '../../data/mockData';
import GeographySelect from '../../components/common/GeographySelect';

const STATUS_OPTIONS = ['Active', 'Prospect', 'Inactive', 'Paused'];

const emptyForm = {
  name: '', industry: '', type: '',
  address: '', city_id: '', state_id: '', country_id: '',
  remarks: ''
};

export default function CompaniesList() {
  const crm = useCrm();
  const { industries, states, cities, countries, companyTypes } = crm;
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const logoInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [fIndustry, setFIndustry] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fType, setFType] = useState('');
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

  const [cropSrc, setCropSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleLogoCrop = async (croppedFile) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', croppedFile);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/api/masters/companies/upload-logo', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.logo_url) {
        setForm((f) => ({ ...f, logo_url: data.logo_url }));
        toast.success('Logo uploaded successfully');
      }
    } catch (err) {
      toast.error('Upload failed', err.message || 'Could not upload logo');
    } finally {
      setUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const rows = useMemo(() => {
    return crm.companies.filter((c) =>
      (!fIndustry || c.industry === fIndustry) &&
      (!fStatus || c.status === fStatus) &&
      (!fType || c.type === fType) &&
      inRange(c.created_at, range)
    );
  }, [crm.companies, fIndustry, fStatus, fType, range]);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Company name required', 'Please enter a company name.'); return; }
    try {
      const payload = { ...form };
      if (payload.country_id) payload.country = countries?.find(x => String(x.id) === String(payload.country_id))?.name || '';
      if (payload.state_id) payload.state = states?.find(x => String(x.id) === String(payload.state_id))?.name || '';
      if (payload.city_id) payload.city = cities?.find(x => String(x.id) === String(payload.city_id))?.name || '';
      delete payload.country_id;
      delete payload.state_id;
      delete payload.city_id;

      if (form.id) {
        await crm.updateCompany(form.id, payload);
        toast.success('Company updated', `${form.name} was saved.`);
      } else {
        const rec = await crm.addCompany(payload);
        toast.success('Company added', `${rec.name} was created (${rec.code || ''}).`);
      }
      setDrawer(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error('Error', 'Failed to save company');
    }
  };

  const openEdit = (c) => {
    let country_id = '';
    let state_id = '';
    let city_id = '';
    if (c.country) country_id = countries?.find(x => x.name === c.country)?.id || '';
    if (c.state) state_id = states?.find(x => x.name === c.state)?.id || '';
    if (c.city) city_id = cities?.find(x => x.name === c.city)?.id || '';
    setForm({ ...emptyForm, ...c, country_id, state_id, city_id });
    setDrawer(true);
  };

  const doDelete = async (c) => {
    if (window.confirm(`Are you sure you want to delete ${c.name}?`)) {
      try {
        await crm.deleteCompany(c.id);
        toast.success('Company Deleted', 'The company was removed.');
      } catch (err) {
        toast.error('Error', 'Failed to delete company');
      }
    }
  };

  const columns = [
    { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
    {
      key: 'name', label: 'Company', sortable: true, accessor: (r) => r.name, className: 'text-nowrap',
      render: (r) => <span className="fw-6 text-nowrap">{r.name}</span>,
    },
    { key: 'industry', label: 'Industry', sortable: true, className: 'text-nowrap', render: (r) => <Badge tone="tone-gray">{r.industry}</Badge> },
    { key: 'type', label: 'Type', sortable: true, className: 'text-nowrap' },
    { key: 'city', label: 'City', sortable: true, className: 'text-nowrap' },
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
        {industries?.map((i) => <option key={i.id || i.code} value={i.name}>{i.name}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 150 }} value={fType} onChange={(e) => setFType(e.target.value)}>
        <option value="">All Types</option>
        {companyTypes?.map((t) => <option key={t.id || t.code || t.name} value={t.name}>{t.name}</option>)}
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
            <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setDrawer(true); }}><i className="bi bi-plus-lg" /> New Company</button>
          </>
        }
      />

      <DateRangeBar onApply={setRange} />
      <DataTable
        columns={columns}
        rows={rows}
        keyField="id"
        loading={loading}
        onRowClick={(r) => navigate(`/companies/${r.id}`)}
        searchPlaceholder="Search companies, code, city..."
        searchKeys={['name', 'code', 'legalName', 'city', 'address', 'gst']}
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
        <Section title="Details" icon="bi-pencil-square">
          <div className="row">
            <Field label="Company Name" required col={12}>
              <input className="form-control" value={form.name} onChange={set('name')} placeholder="Company Name" />
            </Field>
            <Field label="Industry" col={6}>
              <select className="form-select" value={form.industry || ''} onChange={set('industry')}>
                <option value="">Select industry...</option>
                {industries?.map((i) => <option key={i.id || i.code} value={i.name}>{i.name}</option>)}
              </select>
            </Field>
            <Field label="Company Type" col={6}>
              <select className="form-select" value={form.type || ''} onChange={set('type')}>
                <option value="">Select type...</option>
                {companyTypes?.map((t) => <option key={t.id || t.code || t.name} value={t.name}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Address" col={12}>
              <input className="form-control" value={form.address} onChange={set('address')} placeholder="Address" />
            </Field>
            <GeographySelect countryId={form.country_id} stateId={form.state_id} cityId={form.city_id} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} layout={4} />
            <Field label="Remarks" col={12}>
              <textarea className="form-control" rows={3} value={form.remarks} onChange={set('remarks')} placeholder="Remarks" />
            </Field>
          </div>
        </Section>
      </Drawer>

      <ImageCropperModal 
        isOpen={isCropping}
        onClose={() => setIsCropping(false)}
        imageSrc={cropSrc}
        onCropCompleteAction={handleLogoCrop}
        aspectRatio={16/9}
        title="Crop Logo"
      />
    </div>
  );
}
