import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, EmptyState, Field, Section } from '../../components/common/Ui';
import { Drawer, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { statusTone } from '../../utils/format';
import {
  products, industries, leadSources, campaigns, activityTypes,
  leadStatuses, leadTemperatures, nextActions, priorities,
  countries, states, cities, salespeople,
} from '../../data/mockData';

// ---------- option helpers ----------
const TONE_OPTIONS = ['tone-blue', 'tone-indigo', 'tone-green', 'tone-amber', 'tone-red', 'tone-teal', 'tone-gray', 'tone-purple', 'tone-pink'];
const TEMP_OPTIONS = ['temp-hot', 'temp-warm', 'temp-cold'];
const COMPANY_TYPES = ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Proprietorship'];

// Helper to auto-assign icons for activities based on their name
const getAutoIcon = (name) => {
  if (!name) return 'bi-activity';
  const n = name.toLowerCase();
  if (n.includes('call') || n.includes('phone')) return 'bi-telephone';
  if (n.includes('email') || n.includes('mail')) return 'bi-envelope';
  if (n.includes('meet') || n.includes('zoom') || n.includes('video')) return 'bi-camera-video';
  if (n.includes('visit') || n.includes('site')) return 'bi-geo-alt';
  if (n.includes('msg') || n.includes('chat') || n.includes('whatsapp')) return 'bi-chat-dots';
  return 'bi-check2-square';
};
const PRODUCT_CATEGORIES = ['ERP', 'HR', 'Energy', 'Sales', 'Services', 'Support', 'Infrastructure'];
const CHANNELS = ['Google Ads', 'Meta Ads', 'LinkedIn', 'Email Campaign', 'Trade Fair', 'Referral', 'WhatsApp', 'Cold Calling'];

const truncate = (s, n = 46) => (s && s.length > n ? s.slice(0, n) + '…' : s || '—');
const swatch = (tone, label) => <Badge tone={tone || 'tone-gray'} dot>{label}</Badge>;

// Auto-generate the next code from existing rows (keeps prefix + numeric width).
function genCode(rows, name) {
  const codes = rows.map((r) => r.code).filter(Boolean);
  const numbered = codes.map((c) => c.match(/^(.*?)(\d+)$/)).filter(Boolean);
  if (numbered.length) {
    const prefix = numbered[0][1];
    const width = numbered[0][2].length;
    const max = Math.max(...numbered.map((m) => parseInt(m[2], 10)));
    return prefix + String(max + 1).padStart(width, '0');
  }
  const base = (name || 'NEW').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'NEW';
  let code = base;
  let i = 1;
  while (codes.includes(code)) { code = base + i; i += 1; }
  return code;
}

// ============================================================
// Config registry — one entry per :type slug
// ============================================================
const CONFIG = {
  company: {
    title: 'Companies', singular: 'Company', icon: 'bi-building', special: 'company',
    statusOptions: ['Active', 'Prospect', 'Inactive'],
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '120px' },
      { key: 'name', label: 'Company', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'industry', label: 'Industry', sortable: true, render: (r) => <Badge tone="tone-gray">{r.industry}</Badge> },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'city', label: 'City', sortable: true },
    ],
    formFields: [
      { key: 'name', label: 'Company Name', type: 'text', required: true, col: 12 },
      { key: 'legalName', label: 'Legal Name', type: 'text', col: 12 },
      { key: 'industry', label: 'Industry', type: 'select', options: industries.map((i) => i.name), col: 6 },
      { key: 'type', label: 'Company Type', type: 'select', options: COMPANY_TYPES, col: 6 },
      { key: 'website', label: 'Website', type: 'text', col: 6 },
      { key: 'owner', label: 'Owner', type: 'select', options: salespeople, col: 6 },
      { key: 'gst', label: 'GST Number', type: 'text', col: 6 },
      { key: 'pan', label: 'PAN', type: 'text', col: 6 },
      { key: 'employees', label: 'Employees', type: 'number', col: 6 },
      { key: 'revenue', label: 'Revenue (₹ Lakh)', type: 'number', col: 6 },
      { key: 'address', label: 'Address', type: 'text', col: 12 },
      { key: 'city', label: 'City', type: 'select', options: cities.map((c) => c.name), col: 4 },
      { key: 'state', label: 'State', type: 'select', options: states.map((s) => s.name), col: 4 },
      { key: 'country', label: 'Country', type: 'select', options: countries.map((c) => c.name), col: 4 },
      { key: 'remarks', label: 'Remarks', type: 'textarea', col: 12 },
    ],
    defaults: { industry: industries[0].name, type: COMPANY_TYPES[0], city: cities[0].name, state: states[0].name, country: 'India', owner: salespeople[0] || '' },
    seed: [],
  },
  products: {
    title: 'Products', singular: 'Product', icon: 'bi-box-seam',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'Product Name', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'category', label: 'Category', sortable: true, render: (r) => <Badge tone="tone-indigo">{r.category}</Badge> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Product Name', type: 'text', required: true, col: 12 },
      { key: 'category', label: 'Category', type: 'select', options: PRODUCT_CATEGORIES, col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { category: PRODUCT_CATEGORIES[0] },
    seed: products,
  },
  industries: {
    title: 'Industries', singular: 'Industry', icon: 'bi-diagram-3',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '120px' },
      { key: 'name', label: 'Industry', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Industry Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: industries,
  },
  'lead-sources': {
    title: 'Lead Sources', singular: 'Lead Source', icon: 'bi-signpost-split',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '120px' },
      { key: 'name', label: 'Source', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Source Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: leadSources,
  },
  campaigns: {
    title: 'Campaigns', singular: 'Campaign', icon: 'bi-megaphone',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'Campaign', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'channel', label: 'Channel', sortable: true, render: (r) => <Badge tone="tone-teal">{r.channel}</Badge> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Campaign Name', type: 'text', required: true, col: 12 },
      { key: 'channel', label: 'Channel', type: 'select', options: CHANNELS, col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { channel: CHANNELS[0] },
    statusOptions: ['Active', 'Paused', 'Inactive'],
    seed: campaigns,
  },
  'activity-types': {
    title: 'Activity Types', singular: 'Activity Type', icon: 'bi-activity',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      {
        key: 'name', label: 'Activity Type', sortable: true,
        render: (r) => (
          <span className="d-inline-flex align-items-center gap-2 fw-6">
            <i className={`bi ${getAutoIcon(r.name)}`} style={{ color: 'var(--primary)' }} /> {r.name}
          </span>
        ),
      },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Type Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: activityTypes,
  },
  'lead-status': {
    title: 'Lead Statuses', singular: 'Lead Status', icon: 'bi-flag',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'Status', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'color', label: 'Preview', render: (r) => swatch(r.color, r.name) },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Status Name', type: 'text', required: true, col: 6 },
      { key: 'color', label: 'Color Tone', type: 'select', options: TONE_OPTIONS, col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { color: 'tone-blue' },
    seed: leadStatuses,
  },
  'lead-temperature': {
    title: 'Lead Temperatures', singular: 'Lead Temperature', icon: 'bi-thermometer-half',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'Temperature', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'range', label: 'Score Range', render: (r) => <span className="text-secondary-c">{r.range || '—'}</span> },
      { key: 'color', label: 'Preview', render: (r) => swatch(r.color, r.name) },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Temperature Name', type: 'text', required: true, col: 6 },
      { key: 'range', label: 'Score Range', type: 'text', col: 6 },
      { key: 'color', label: 'Color Tone', type: 'select', options: TEMP_OPTIONS, col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { color: 'temp-warm' },
    seed: leadTemperatures,
  },
  'next-actions': {
    title: 'Next Actions', singular: 'Next Action', icon: 'bi-arrow-right-circle',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'Next Action', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Action Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: nextActions,
  },
  priorities: {
    title: 'Priorities', singular: 'Priority', icon: 'bi-exclamation-diamond',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'Priority', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'color', label: 'Preview', render: (r) => swatch(r.color, r.name) },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Priority Name', type: 'text', required: true, col: 6 },
      { key: 'color', label: 'Color Tone', type: 'select', options: TONE_OPTIONS, col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { color: 'tone-amber' },
    seed: priorities,
  },
  countries: {
    title: 'Countries', singular: 'Country', icon: 'bi-globe',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'Country', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Country Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: countries,
  },
  states: {
    title: 'States', singular: 'State', icon: 'bi-map',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'State', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'country', label: 'Country', sortable: true, render: (r) => <Badge tone="tone-gray">{r.country}</Badge> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'State Name', type: 'text', required: true, col: 6 },
      { key: 'country', label: 'Country', type: 'select', options: countries.map((c) => c.name), col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { country: 'India' },
    seed: states,
  },
  cities: {
    title: 'Cities', singular: 'City', icon: 'bi-geo-alt',
    columns: [
      { key: 'code', label: 'Code', className: 'mono', sortable: true, width: '110px' },
      { key: 'name', label: 'City', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'state', label: 'State', sortable: true, render: (r) => <Badge tone="tone-gray">{r.state}</Badge> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'City Name', type: 'text', required: true, col: 6 },
      { key: 'state', label: 'State', type: 'select', options: states.map((s) => s.name), col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { state: states[0].name },
    seed: cities,
  },
};

// ---------- Inner: metadata-driven form ----------
function MasterForm({ fields, values, onChange, statusOptions }) {
  const set = (k) => (e) => onChange({ ...values, [k]: e.target.value });
  return (
    <Section title="Details" icon="bi-pencil-square">
      <div className="row">
        {fields.map((f) => (
          <Field key={f.key} label={f.label} required={f.required} col={f.col || 12}>
            {f.type === 'textarea' ? (
              <textarea className="form-control" rows={3} value={values[f.key] ?? ''} onChange={set(f.key)} placeholder={f.label} />
            ) : f.type === 'select' ? (
              <select className="form-select" value={values[f.key] ?? ''} onChange={set(f.key)}>
                {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                className="form-control"
                value={values[f.key] ?? ''}
                onChange={set(f.key)}
                placeholder={f.label}
              />
            )}
          </Field>
        ))}
        <Field label="Status" col={6}>
          <select className="form-select" value={values.status ?? 'Active'} onChange={set('status')}>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
    </Section>
  );
}

export default function MasterPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const crm = useCrm();
  const toast = useToast();
  const config = CONFIG[type];

  const isCompany = config?.special === 'company';
  const [localRows, setLocalRows] = useState(config?.seed || []);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Re-seed local rows whenever the master type changes.
  useEffect(() => {
    if (config && !config.special) setLocalRows(config.seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [type]);

  const statusOptions = config?.statusOptions || ['Active', 'Inactive'];
  const rows = isCompany ? crm.companies : localRows;
  const keyField = isCompany ? 'id' : 'code';

  const columns = useMemo(() => {
    if (!config) return [];
    return [
      ...config.columns,
      { key: 'status', label: 'Status', sortable: true, render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
      {
        key: 'actions', label: 'Action', width: '96px',
        render: (r) => (
          <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <ActionIconButton type="edit" onClick={() => openEdit(r)} />
            <ActionIconButton type="delete" onClick={() => setConfirm(r)} />
          </div>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, type]);

  if (!config) {
    return (
      <div className="page">
        <PageHeader title="Master Not Found" icon="bi-question-circle" back="/dashboard" />
        <EmptyState
          icon="bi-exclamation-triangle"
          title="Master not found"
          message={`No master data screen is configured for "${type}".`}
          action={<button className="btn btn-primary" onClick={() => navigate('/dashboard')}><i className="bi bi-house" /> Back to Dashboard</button>}
        />
      </div>
    );
  }

  const openAdd = () => {
    setEditingKey(null);
    setForm({ ...(config.defaults || {}), status: statusOptions[0] });
    setDrawer(true);
  };
  const openEdit = (row) => {
    setEditingKey(row[keyField]);
    setForm({ ...row });
    setDrawer(true);
  };

  const save = () => {
    if (!form.name || !form.name.trim()) {
      toast.error('Name required', `Please enter a ${config.singular.toLowerCase()} name.`);
      return;
    }
    const payload = { ...form };
    if (isCompany) {
      payload.employees = Number(payload.employees) || 0;
      payload.revenue = Number(payload.revenue) || 0;
    }
    if (editingKey != null) {
      if (isCompany) crm.updateCompany(editingKey, payload);
      else {
        const newRows = localRows.map((r) => (r.code === editingKey ? { ...r, ...payload } : r));
        setLocalRows(newRows);
        if (config.seed) {
          const idx = config.seed.findIndex((r) => r.code === editingKey);
          if (idx > -1) config.seed[idx] = { ...config.seed[idx], ...payload };
        }
        try { localStorage.setItem(`crm_master_${type}`, JSON.stringify(newRows)); } catch(e) {}
      }
      toast.success(`${config.singular} updated`, `${payload.name} was saved.`);
    } else if (isCompany) {
      const rec = crm.addCompany(payload);
      toast.success(`${config.singular} added`, `${rec.name} was created (${rec.code}).`);
    } else {
      const code = genCode(localRows, payload.name);
      const rec = { ...payload, code };
      const newRows = [...localRows, rec];
      setLocalRows(newRows);
      if (config.seed) config.seed.push(rec);
      try { localStorage.setItem(`crm_master_${type}`, JSON.stringify(newRows)); } catch(e) {}
      toast.success(`${config.singular} added`, `${rec.name} was created (${code}).`);
    }
    setDrawer(false);
    setEditingKey(null);
    setForm({});
  };

  const doDelete = (row) => {
    if (isCompany) crm.deleteCompany(row.id);
    else {
      const newRows = localRows.filter((r) => r.code !== row.code);
      setLocalRows(newRows);
      if (config.seed) {
        const idx = config.seed.findIndex((r) => r.code === row.code);
        if (idx > -1) config.seed.splice(idx, 1);
      }
      try { localStorage.setItem(`crm_master_${type}`, JSON.stringify(newRows)); } catch(e) {}
    }
    toast.success(`${config.singular} deleted`, `${row.name} was removed.`);
  };

  return (
    <div className="page">
      <PageHeader
        title={config.title}
        subtitle={`Manage ${config.title}`}
        icon={config.icon}
        actions={
          <>
            <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg" /> Add {config.singular}</button>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        keyField={keyField}
        loading={loading}
        searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
        searchKeys={['code', 'name']}
        empty={
          <EmptyState
            icon={config.icon}
            title={`No ${config.title.toLowerCase()} found`}
            message="Try adjusting your search, or add a new record."
            action={<button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg" /> Add {config.singular}</button>}
          />
        }
      />

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={`${editingKey != null ? 'Edit' : 'Add'} ${config.singular}`}
        subtitle={editingKey != null ? `Update ${form.code || ''}` : `Create a new ${config.singular.toLowerCase()} record`}
        icon={config.icon}
        width={isCompany ? 600 : 520}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg" /> Save {config.singular}</button>
          </>
        }
      >
        <MasterForm fields={config.formFields} values={form} onChange={setForm} statusOptions={statusOptions} />
      </Drawer>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && doDelete(confirm)}
        title={`Delete ${config.singular}?`}
        message={confirm ? `This will permanently remove "${confirm.name}" from ${config.title}.` : ''}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
