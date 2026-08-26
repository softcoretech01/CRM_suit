import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, EmptyState, Field, Section } from '../../components/common/Ui';
import { Drawer, ConfirmDialog } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { ImageCropperModal } from '../../components/common/ImageCropperModal';
import GeographySelect from '../../components/common/GeographySelect';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { statusTone } from '../../utils/format';
import { apiFetch, BACKEND_URL, API_BASE_URL } from '../../utils/api';

// ---------- option helpers ----------
const TONE_OPTIONS = ['tone-blue', 'tone-indigo', 'tone-green', 'tone-amber', 'tone-red', 'tone-teal', 'tone-gray', 'tone-purple', 'tone-pink'];
const TEMP_OPTIONS = ['temp-hot', 'temp-warm', 'temp-cold'];


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
// Product categories will be loaded from the API dynamically
const CHANNELS = ['Google Ads', 'Meta Ads', 'LinkedIn', 'Email Campaign', 'Trade Fair', 'Referral', 'WhatsApp', 'Cold Calling'];

const truncate = (s, n = 46) => (s && s.length > n ? s.slice(0, n) + '…' : s || '—');
const swatch = (tone, label) => <Badge tone={tone || 'tone-gray'} dot>{label}</Badge>;

// Auto-generate the next code from existing rows (keeps prefix + numeric width).
// Auto-generate the next code from existing rows using the type slug as a prefix (e.g. COM-001)
const TYPE_PREFIXES = {
  industries: 'IND',
  'lead-sources': 'LDS',
  campaigns: 'CMP',
  'activity-types': 'ACT',
  'lead-statuses': 'LST',
  'next-actions': 'NXT',
  priorities: 'PRI',
  countries: 'COU',
  states: 'STA',
  cities: 'CIT',
  'company-types': 'COM',
  company: 'CMPY',
  products: 'PRD'
};

function genCode(rows, name, type) {
  const pfx = TYPE_PREFIXES[type] || (type || 'NEW').substring(0, 3).toUpperCase();
  const prefix = pfx + '-';
  const codes = rows.map((r) => r.code).filter(Boolean);
  
  const numbered = codes.map((c) => {
    if (c.startsWith(prefix)) {
      const numStr = c.substring(prefix.length);
      if (/^\d+$/.test(numStr)) return parseInt(numStr, 10);
    }
    return null;
  }).filter((n) => n !== null);
  
  if (numbered.length > 0) {
    const max = Math.max(...numbered);
    return prefix + String(max + 1).padStart(3, '0');
  }
  return prefix + '001';
}

// ============================================================
// Config registry — one entry per :type slug
// ============================================================
const CONFIG = {
  companies: {
    title: 'Companies', singular: 'Company', icon: 'bi-building',
    statusOptions: ['Active', 'Prospect', 'Inactive'],
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Company', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'industry', label: 'Industry', sortable: true, render: (r) => <Badge tone="tone-gray">{r.industry}</Badge> },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'city', label: 'City', sortable: true },
      { key: 'max_users', label: 'Max Users', sortable: true, render: (r) => <Badge tone="tone-blue">{r.max_users || 1}</Badge> },
    ],
    formFields: [
      { key: 'logo_url', label: 'Company Logo', type: 'logo_upload', col: 12 },
      { key: 'name', label: 'Company Name', type: 'text', required: true, col: 12 },
      { key: 'industry_id', label: 'Industry', type: 'master_select', slug: 'industries', col: 6 },
      { key: 'type_id', label: 'Company Type', type: 'master_select', slug: 'company-types', col: 6 },
      { key: 'founder', label: 'Founder Name', type: 'text', col: 12 },
      { key: 'address', label: 'Address', type: 'text', col: 12 },
      { key: 'geography', type: 'geography' },
      { key: 'contact_name', label: 'Primary Contact Name', type: 'text', required: true, col: 6 },
      { key: 'contact_designation', label: 'Designation', type: 'text', col: 6 },
      { key: 'contact_email', label: 'Email', type: 'text', required: true, col: 6 },
      { key: 'contact_mobile', label: 'Mobile', type: 'text', col: 6 },
      { key: 'max_users', label: 'Max Users', type: 'number', required: true, col: 6 },
      { key: 'remarks', label: 'Remarks', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: [],
  },

  'product-categories': {
    title: 'Product Categories', singular: 'Product Category', icon: 'bi-tags',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Category', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Category Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: [],
  },

  products: {
    title: 'Products', singular: 'Product', icon: 'bi-box-seam',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Product Name', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'category', label: 'Category', sortable: true, render: (r) => <Badge tone="tone-indigo">{r.category}</Badge> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Product Name', type: 'text', required: true, col: 12 },
      { key: 'category_id', label: 'Category', type: 'master_select', slug: 'product-categories', col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: [],
  },
  industries: {
    title: 'Industries', singular: 'Industry', icon: 'bi-diagram-3',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Industry', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Industry Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: [],
  },
  'lead-sources': {
    title: 'Lead Sources', singular: 'Lead Source', icon: 'bi-signpost-split',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Source', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Source Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: [],
  },
  campaigns: {
    title: 'Campaigns', singular: 'Campaign', icon: 'bi-megaphone',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Campaign', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Campaign Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    statusOptions: ['Active', 'Paused', 'Inactive'],
    seed: [],
  },
  'activity-types': {
    title: 'Activity Types', singular: 'Activity Type', icon: 'bi-activity',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
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
    seed: [],
  },
  'lead-statuses': {
    title: 'Lead Statuses', singular: 'Lead Status', icon: 'bi-flag',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Status', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'color', label: 'Preview', render: (r) => swatch(r.color_code || r.color, r.name) },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Status Name', type: 'text', required: true, col: 6 },
      { key: 'color_code', label: 'Color Tone', type: 'select', options: TONE_OPTIONS, col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { color_code: 'tone-blue' },
    seed: [],
  },

  'next-actions': {
    title: 'Next Actions', singular: 'Next Action', icon: 'bi-arrow-right-circle',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Next Action', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Action Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: [],
  },
  priorities: {
    title: 'Priorities', singular: 'Priority', icon: 'bi-exclamation-diamond',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Priority', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'color', label: 'Preview', render: (r) => swatch(r.color_code || (r.name === 'Hot' ? 'tone-red' : r.name === 'Medium' ? 'tone-amber' : 'tone-blue'), r.name) },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Priority Name', type: 'text', required: true, col: 6 },
      { key: 'color_code', label: 'Color Tone', type: 'select', options: TONE_OPTIONS, col: 6 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: { color_code: 'tone-amber' },
    seed: [],
  },
  countries: {
    title: 'Countries', singular: 'Country', icon: 'bi-globe',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Country', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Country Name', type: 'text', required: true, col: 12 },
    ],
    defaults: {},
    seed: [],
  },
  states: {
    title: 'States', singular: 'State', icon: 'bi-map',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'State', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'country', label: 'Country', sortable: true, render: (r) => <Badge tone="tone-gray">{r.country || r.country_name || '—'}</Badge> },
    ],
    formFields: [
      { key: 'name', label: 'State Name', type: 'text', required: true, col: 6 },
      { key: 'country_id', label: 'Country', type: 'master_select', slug: 'countries', col: 6 },
    ],
    defaults: { country_id: '' },
    seed: [],
  },
  cities: {
    title: 'Cities', singular: 'City', icon: 'bi-geo-alt',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'City', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'state', label: 'State', sortable: true, render: (r) => <Badge tone="tone-gray">{r.state || r.state_name || '—'}</Badge> },
    ],
    formFields: [
      { key: 'name', label: 'City Name', type: 'text', required: true, col: 6 },
      { key: 'country_id', label: 'Country', type: 'master_select', slug: 'countries', col: 6 },
      { key: 'state_id', label: 'State', type: 'master_select', slug: 'states', col: 6 },
    ],
    defaults: { state_id: '', country_id: '' },
    seed: [],
  },
  'company-types': {
    title: 'Company Types', singular: 'Company Type', icon: 'bi-building',
    columns: [
      { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
      { key: 'name', label: 'Type', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
      { key: 'description', label: 'Description', render: (r) => <span className="text-secondary-c" title={r.description}>{truncate(r.description)}</span> },
    ],
    formFields: [
      { key: 'name', label: 'Type Name', type: 'text', required: true, col: 12 },
      { key: 'description', label: 'Description', type: 'textarea', col: 12 },
    ],
    defaults: {},
    seed: [],
  },
};

function CompanySelect({ value, onChange }) {
  const { companies } = useCrm();
  return (
    <select className="form-select" value={value} onChange={onChange}>
      <option value="">Select a company...</option>
      {(companies || []).map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}

// ---------- Inner: MasterSelect for dynamic dropdowns ----------
function MasterSelect({ slug, value, onChange }) {
  const [options, setOptions] = useState([]);
  
  useEffect(() => {
    apiFetch(`/masters/${slug}`)
      .then(res => {
        const list = Array.isArray(res) ? res : res.data || [];
        setOptions(list.filter(r => r.is_active !== false && r.status !== 'Inactive' && r.status !== 'INACTIVE'));
      })
      .catch(err => console.error(`Failed to fetch ${slug}:`, err));
  }, [slug]);

  return (
    <select className="form-select" value={value} onChange={onChange}>
      <option value="">Select {slug.replace('-', ' ')}...</option>
      {options.map((o) => (
        <option key={o.id || o.code || o.name} value={o.id}>{o.name}</option>
      ))}
    </select>
  );
}

// ---------- Inner: LogoUploadField for file uploads ----------
function LogoUploadField({ value, onChange }) {
  const logoInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
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
      const res = await fetch(`${API_BASE_URL}/admin/companies/upload-logo`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (data.logo_url) {
        onChange(data.logo_url);
      }
    } catch (err) {
      console.error('Upload failed', err.message);
    } finally {
      setUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  return (
    <div className="d-flex align-items-center gap-3">
      <div className="avatar avatar-lg bg-light border overflow-hidden">
        {value ? <img src={`${BACKEND_URL}${value}`} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} /> : <i className="bi bi-building fs-4 text-muted" />}
      </div>
      <div>
        <input type="file" ref={logoInputRef} className="d-none" accept="image/*" onChange={handleLogoSelect} />
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => logoInputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Logo'}
        </button>
        {value && (
          <button type="button" className="btn btn-sm btn-link text-danger ms-2" onClick={() => onChange('')}>Remove</button>
        )}
      </div>

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

// ---------- Inner: metadata-driven form ----------
function MasterForm({ fields, sections, values, onChange, statusOptions }) {
  const set = (k) => (e) => onChange({ ...values, [k]: e.target.value });
  const toggle = (k) => (e) => onChange({ ...values, [k]: e.target.checked });

  const renderField = (f) => {
    if (f.type === 'checkbox') {
      return (
        <label key={f.key} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
          <input type="checkbox" className="form-check-input" checked={values[f.key] || false} onChange={toggle(f.key)} />
          <span className="fs-13">{f.label}</span>
        </label>
      );
    }
    if (f.type === 'geography') {
      // GeographySelect fires onChange 3x in a row (country, then resets state/city);
      // use a functional update so each call merges onto the latest state instead of
      // the stale `values` closure (otherwise calls 2 & 3 wipe the country just set).
      return <GeographySelect key={f.key} countryId={values.country_id} stateId={values.state_id} cityId={values.city_id} onChange={(k, v) => onChange((prev) => ({ ...prev, [k]: v }))} layout={4} />;
    }
    return (
      <Field key={f.key} label={f.label} required={f.required} col={f.col || 12}>
        {f.type === 'textarea' ? (
          <textarea className="form-control" rows={3} value={values[f.key] ?? ''} onChange={set(f.key)} placeholder={f.label} />
        ) : f.type === 'company_select' ? (
          <CompanySelect value={values[f.key] ?? ''} onChange={set(f.key)} />
        ) : f.type === 'master_select' ? (
          <MasterSelect slug={f.slug} value={values[f.key] ?? ''} onChange={set(f.key)} />
        ) : f.type === 'logo_upload' ? (
          <LogoUploadField value={values[f.key] ?? ''} onChange={(val) => onChange({ ...values, [f.key]: val })} />
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
    );
  };

  if (sections) {
    return (
      <>
        {sections.map((sec, i) => (
          <Section key={i} title={sec.title} icon={sec.icon}>
            <div className={sec.isFlex ? "d-flex flex-column gap-2" : "row"}>
              {sec.fields.map(renderField)}
              {sec.hasStatus && (
                <div className="mt-3">
                  <label className="form-label text-muted-c fs-12 mb-1">Status</label>
                  <select className="form-select" style={{ maxWidth: 200 }} value={values.status ?? 'Active'} onChange={set('status')}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
          </Section>
        ))}
      </>
    );
  }

  return (
    <Section title="Details" icon="bi-pencil-square">
      <div className="row">
        {fields.map(renderField)}
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
  const location = useLocation();
  const crm = useCrm();
  const toast = useToast();
  const config = CONFIG[type];

  const [apiRows, setApiRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [viewMaster, setViewMaster] = useState(null);
  const [productCategoryOptions, setProductCategoryOptions] = useState([]);

  const isAdmin = location.pathname.startsWith('/admin');
  const apiPrefix = isAdmin ? '/admin' : '/masters';

  // Map frontend slug to backend endpoint (e.g. 'company' -> 'companies')
  const endpoint = type === 'companies' ? 'companies' : type === 'company' ? 'companies' : type;

  // Status normalization: companies and admin use 'Active'/'Inactive', others use 'ACTIVE'/'INACTIVE'
  const toUiStatus = (s) => (s === 'ACTIVE' || s === 'Active' ? 'Active' : s === 'INACTIVE' || s === 'Inactive' ? 'Inactive' : s || 'Active');
  const toDbStatus = (s) => {
    if (isAdmin || type === 'companies') return s === 'Active' ? 'Active' : 'Inactive';
    return s === 'Active' ? 'ACTIVE' : 'INACTIVE';
  };

  // Load product categories from API when on products page
  useEffect(() => {
    if (type === 'products') {
      apiFetch('/masters/product-categories')
        .then((res) => {
          const cats = Array.isArray(res) ? res : (res?.data || []);
          setProductCategoryOptions(cats.map((c) => ({ label: c.name, value: String(c.id) })));
        })
        .catch(() => setProductCategoryOptions([]));
    }
  }, [type]);

  const fetchRows = useCallback(async () => {
    if (!config) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await apiFetch(`${apiPrefix}/${endpoint}`);
      const rawList = res.data || (Array.isArray(res) ? res : []);
      const data = rawList.map((r) => ({
        ...r,
        // Admin/companies use a string `status`; masters use a boolean `is_active`.
        status: (isAdmin || type === 'companies')
          ? toUiStatus(r.status)
          : (r.is_active === false || r.is_active === 0 ? 'Inactive' : 'Active'),
        name: r.name || r.first_name || ''
      }));
      setApiRows(data);
    } catch (e) {
      toast.error('Failed to load', e?.message || 'Could not load master data.');
      setApiRows([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, config]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const statusOptions = config?.statusOptions || ['Active', 'Inactive'];
  const rows = apiRows;
  const keyField = 'id';

  const columns = useMemo(() => {
    if (!config) return [];
    return [
      ...config.columns,
      { key: 'status', label: 'Status', sortable: true, render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
      {
        key: 'actions', label: 'Action', width: '120px',
        render: (r) => (
          <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {!['countries', 'states', 'cities'].includes(type) && (
              <ActionIconButton type="view" onClick={() => setViewMaster(r)} />
            )}
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

  const save = async () => {
    const hasName = (form.name && form.name.trim());
    
    if (!hasName) {
      toast.error('Name required', `Please enter a ${config.singular.toLowerCase()} name.`);
      return;
    }

    const recordName = form.name;

    const body = {
      name: recordName,
    };
    // Admin/companies persist a string `status`; masters persist a boolean `is_active`.
    if (isAdmin || type === 'companies') {
      body.status = toDbStatus(form.status);
    } else {
      body.is_active = form.status !== 'Inactive';
    }

    // Only include fields that are part of the specific config for this table
    config.formFields.forEach(field => {
      if (field.key === 'name' || field.key === 'status') return;
      
      const val = form[field.key];
      
      // Handle geography specifically since it maps to 3 different keys
      if (field.type === 'geography') {
        body['country_id'] = form.country_id ? Number(form.country_id) : null;
        body['state_id'] = form.state_id ? Number(form.state_id) : null;
        body['city_id'] = form.city_id ? Number(form.city_id) : null;
        return;
      }

      // Handle foreign keys dynamically based on naming conventions or specific mappings
      if (['industry', 'city', 'state', 'country', 'type'].includes(field.key)) {
        if (field.key === 'type' && !isNaN(val)) {
          body['type_id'] = val ? Number(val) : null;
        } else if (field.key !== 'type') {
           body[`${field.key}_id`] = val ? Number(val) : null;
        } else {
           body[field.key] = val ?? null;
        }
      } else if (field.type === 'number') {
        body[field.key] = val != null && val !== '' ? Number(val) : null;
      } else if (field.type === 'checkbox') {
        body[field.key] = val ?? false;
      } else {
        body[field.key] = val ?? null;
      }
    });

    // Handle code if the specific master needs it (like countries, states, etc that explicitly have a code column in DB)
    // We only send code if it was explicitly filled out in the form, to avoid crashing DB tables without a code column
    if (form.code) {
      body.code = form.code;
    }

    try {
      if (editingKey != null) {
        await apiFetch(`${apiPrefix}/${endpoint}/${editingKey}`, { method: 'PUT', body });
        toast.success(`${config.singular} updated`, `${form.name} was saved.`);
      } else {
        const res = await apiFetch(`${apiPrefix}/${endpoint}`, { method: 'POST', body });
        toast.success(`${config.singular} added`, `${form.name} was created (${res?.data?.code || ''}).`);
      }
      await fetchRows();
      if (crm.refreshMaster) crm.refreshMaster(endpoint);
      setDrawer(false); setEditingKey(null); setForm({});
    } catch (e) {
      toast.error('Save failed', e?.message || 'Could not save the record.');
    }
  };

  const doDelete = async (row) => {
    try {
      await apiFetch(`${apiPrefix}/${endpoint}/${row.id}`, { method: 'DELETE' });
      await fetchRows();
      if (crm.refreshMaster) crm.refreshMaster(endpoint);
      toast.success(`${config.singular} deleted`, `${row.name} was removed.`);
    } catch (e) {
      toast.error('Delete failed', e?.message || 'Could not delete the record.');
    }
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
        width={(type === 'company' || type === 'contacts') ? 600 : 520}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setDrawer(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg" /> Save {config.singular}</button>
          </>
        }
      >
        <MasterForm fields={config.formFields} sections={config.formSections} values={form} onChange={setForm} statusOptions={statusOptions} />
      </Drawer>

      <Drawer
        open={!!viewMaster}
        onClose={() => setViewMaster(null)}
        title={`${config.singular} Details`}
        subtitle={viewMaster?.name || ''}
        icon={config.icon}
        width={500}
      >
        {viewMaster && (
          <div className="p-3">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div>
                <h4 className="mb-1">{viewMaster.name}</h4>
                <div className="text-muted-c fs-13 mb-2">{viewMaster.code || config.singular}</div>
                <Badge tone={statusTone(viewMaster.status)} dot>{viewMaster.status}</Badge>
              </div>
            </div>

            <Section title="Information" icon="bi-info-circle">
              <div className="row g-3">
                {config.formFields.filter(f => f.type !== 'logo_upload').map(f => (
                  <div key={f.key} className={`col-${f.col === 12 ? '12' : '6'}`}>
                    <div className="fs-12 text-muted-c mb-1">{f.label}</div>
                    <div className="fw-6">{viewMaster[f.key] || '—'}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
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
