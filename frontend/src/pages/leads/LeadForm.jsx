import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Field, Badge, Avatar } from '../../components/common/Ui';
import { DuplicateWarning } from '../../components/crm/LeadModals';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatINRFull, tempFromScore } from '../../utils/format';
import {
  products, industries, leadSources, campaigns, salespeople, countries, states, cities,
  leadStatuses, priorities, nextActions
} from '../../data/mockData';

const STEPS = [
  { key: 'lead', label: 'Lead Info', icon: 'bi-flag' },
  { key: 'company', label: 'Company', icon: 'bi-building' },
  { key: 'contact', label: 'Contact', icon: 'bi-person' },
  { key: 'business', label: 'Business', icon: 'bi-briefcase' },
  { key: 'marketing', label: 'Marketing', icon: 'bi-megaphone' },
  { key: 'review', label: 'Review', icon: 'bi-check2-circle' },
];

export default function LeadForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const { leads, companies, contacts, addLead, updateLead } = useCrm();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const prefillCompanyId = searchParams.get('companyId');
  const editing = leads.find((l) => l.id === id);

  const [step, setStep] = useState(0);
  const [dup, setDup] = useState(false);
  const [dupMatch, setDupMatch] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(editing || {
    number: `LEAD-${String(134 + leads.length).padStart(6, '0')}`,
    date: new Date().toISOString().substring(0, 10), owner: currentUser.name, assignedTo: currentUser.role === 'Marketing' ? currentUser.name : '', status: 'Qualified', temperature: 'Warm', score: 45,
    company: '', industry: '', website: '', address: '', country: 'India', state: '', city: '',
    contact: '', designation: '', contactEmail: '', contactMobile: '', whatsapp: '', linkedin: '',
    products: [], product: '', value: '', closing: '', budget: '', decisionMaker: '', competitors: '', requirement: '',
    source: '', campaign: '', utmSource: '', utmMedium: '', utmCampaign: '',
    priority: 'Medium', nextAction: 'Call', nextActionDate: new Date().toISOString().substring(0, 10), lastActivity: new Date().toISOString().substring(0, 10),
  });

  // Prefill if companyId provided via URL
  
  useEffect(() => {
    if (!editing && prefillCompanyId && !form.companyId) {
      const match = companies.find((c) => c.id === prefillCompanyId);
      if (match) {
        setForm(f => ({
          ...f,
          company: match.name,
          companyId: match.id,
          industry: match.industry || '',
          website: match.website || '',
          address: match.address || '',
          city: match.city || '',
          state: match.state || '',
          country: match.country || 'India',
        }));
        const primaryContact = contacts.find((c) => c.companyId === match.id && c.primary);
        if (primaryContact) {
          setForm(f => ({
            ...f,
            contact: primaryContact.name,
            designation: primaryContact.designation || '',
            contactEmail: primaryContact.email || '',
            contactMobile: primaryContact.mobile || '',
            whatsapp: primaryContact.whatsapp || '',
            linkedin: primaryContact.linkedin || '',
          }));
        }
      }
    }
  }, [prefillCompanyId, companies, contacts, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleProduct = (p) => setForm((f) => {
    const has = (f.products || []).includes(p);
    const products = has ? f.products.filter((x) => x !== p) : [...(f.products || []), p];
    return { ...f, products, product: products[0] || '' };
  });

  const validateStep = () => {
    const e = {};
    if (step === 0 && !form.assignedTo) e.assignedTo = 'Assign the lead to an executive';
    if (step === 1 && !form.company.trim()) e.company = 'Company name is required';
    if (step === 1 && !form.industry) e.industry = 'Select an industry';
    if (step === 2 && !form.contact.trim()) e.contact = 'Contact name is required';
    if (step === 2 && form.contactEmail && !/^[^@]+@[^@]+\.[^@]+$/.test(form.contactEmail)) e.contactEmail = 'Enter a valid email';
    if (step === 3 && (!form.products || form.products.length === 0)) e.products = 'Select at least one product';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkDuplicate = () => {
    if (form.companyId) return false;
    const match = companies.find((c) => c.name.toLowerCase().trim() === form.company.toLowerCase().trim());
    if (match && !editing) { setDupMatch(match); setDup(true); return true; }
    return false;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step === 1 && checkDuplicate()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const save = (draft) => {
    const payload = { 
      ...form, 
      temperature: tempFromScore(Number(form.score) || 45), 
      value: Number(form.value) || 0, 
      budget: Number(form.budget) || 0, 
      status: draft ? 'New' : form.status 
    };
    if (editing) { 
      updateLead(editing.id, payload); 
      toast.success('Lead updated', `${form.company} saved`); 
      navigate(`/leads/${editing.id}`); 
    }
    else { 
      payload.createdBy = currentUser.id;
      payload.createdByName = currentUser.name;
      const rec = addLead(payload); 
      toast.success(draft ? 'Draft saved' : 'Lead created', `${form.company} added successfully`); 
      navigate(draft ? '/leads' : `/leads/${rec.id}`); 
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <PageHeader title={editing ? 'Edit Lead' : 'New Lead'} subtitle={editing ? editing.number : 'Create a new sales lead in 6 easy steps'} back="/leads" />

      {/* Stepper */}
      <div className="surface p-3 mb-4">
        <div className="d-flex align-items-center" style={{ overflowX: 'auto' }}>
          {STEPS.map((s, i) => (
            <div key={s.key} className="d-flex align-items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 'none', minWidth: 'fit-content' }}>
              <button className="d-flex align-items-center gap-2 border-0 bg-transparent" onClick={() => i < step && setStep(i)} style={{ cursor: i < step ? 'pointer' : 'default' }}>
                <span className="d-inline-flex align-items-center justify-content-center" style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: i < step ? 'var(--success)' : i === step ? 'var(--primary)' : '#f1f5f9',
                  color: i <= step ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: 14,
                  transition: 'all 0.2s',
                }}>
                  {i < step ? <i className="bi bi-check-lg" /> : i + 1}
                </span>
                <span className="d-none d-md-block text-start">
                  <div className="fs-12 text-muted-c" style={{ lineHeight: 1 }}>Step {i + 1}</div>
                  <div className="fw-6 fs-13" style={{ color: i === step ? 'var(--primary)' : 'var(--text-primary)' }}>{s.label}</div>
                </span>
              </button>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--success)' : 'var(--border)', margin: '0 10px', minWidth: 20 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step body */}
      <div className="surface p-4 mb-4">
        {step === 0 && (
          <>
            <h5 className="mb-3"><i className="bi bi-flag me-2 text-primary-c" />Lead Information</h5>
            <div className="row">
              <Field label="Lead Number" col={6}><input className="form-control mono" value={form.number} readOnly /></Field>
              <Field label="Lead Date" col={6}><input type="date" className="form-control" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
              <Field label="Marketing Person" required col={6} error={errors.assignedTo}>
                <select className={`form-select ${errors.assignedTo ? 'is-invalid' : ''}`} value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)} disabled={currentUser.role === 'Marketing'}>
                  <option value="">Select executive</option>
                  {!salespeople.includes(currentUser.name) && currentUser.role === 'Marketing' && <option value={currentUser.name}>{currentUser.name}</option>}
                  {salespeople.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Status" col={6}><select className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>{leadStatuses.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}</select></Field>
              <Field label="Lead Score" col={6} hint={`Temperature: ${tempFromScore(Number(form.score) || 0)}`}><input type="range" className="form-range mt-2" min={0} max={100} value={form.score} onChange={(e) => set('score', e.target.value)} /><div className="text-center fw-7">{form.score}</div></Field>
              <Field label="Priority" col={6}><select className="form-select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>{priorities.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}</select></Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h5 className="mb-3"><i className="bi bi-building me-2 text-primary-c" />Company Information</h5>
            <div className="row">
              <Field label="Company Name" required col={8} error={errors.company} hint="Select a company to auto-fill its details">
                <select
                  className={`form-select ${errors.company ? 'is-invalid' : ''}`}
                  value={form.companyId || ''}
                  onChange={(e) => {
                    const match = companies.find((c) => c.id === e.target.value);
                    if (match) {
                      set('company', match.name);
                      set('companyId', match.id);
                      if (match.industry) set('industry', match.industry);
                      if (match.website) set('website', match.website);
                      if (match.address) set('address', match.address);
                      if (match.city) set('city', match.city);
                      if (match.state) set('state', match.state);
                      if (match.country) set('country', match.country);
                      
                      // Auto-fill primary contact if available
                      const primaryContact = contacts.find((c) => c.companyId === match.id && c.primary);
                      if (primaryContact) {
                        set('contact', primaryContact.name);
                        set('designation', primaryContact.designation || '');
                        set('contactEmail', primaryContact.email || '');
                        set('contactMobile', primaryContact.mobile || '');
                        set('whatsapp', primaryContact.whatsapp || '');
                        set('linkedin', primaryContact.linkedin || '');
                      }
                    } else {
                      set('company', '');
                      set('companyId', '');
                    }
                  }}
                >
                  <option value="">Select a company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Industry" required col={4} error={errors.industry}><select className={`form-select ${errors.industry ? 'is-invalid' : ''}`} value={form.industry} onChange={(e) => set('industry', e.target.value)}><option value="">Select</option>{industries.map((i) => <option key={i.code}>{i.name}</option>)}</select></Field>
              <Field label="Website" col={6}><input className="form-control" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="www.example.com" /></Field>
              <Field label="Address" col={6}><input className="form-control" value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
              <Field label="Country" col={4}><select className="form-select" value={form.country} onChange={(e) => set('country', e.target.value)}>{countries.map((c) => <option key={c.code}>{c.name}</option>)}</select></Field>
              <Field label="State" col={4}><select className="form-select" value={form.state} onChange={(e) => set('state', e.target.value)}><option value="">Select</option>{states.map((s) => <option key={s.code}>{s.name}</option>)}</select></Field>
              <Field label="City" col={4}><select className="form-select" value={form.city} onChange={(e) => set('city', e.target.value)}><option value="">Select</option>{cities.map((c) => <option key={c.code}>{c.name}</option>)}</select></Field>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h5 className="mb-3"><i className="bi bi-person me-2 text-primary-c" />Contact Information</h5>
            <div className="row">
              <Field label="Contact Name" required col={6} error={errors.contact} hint="Type a new name or select below">
                <input
                  className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
                  list="lead-contacts"
                  value={form.contact}
                  onChange={(e) => {
                    const v = e.target.value;
                    set('contact', v);
                    const match = contacts.find((c) => c.name.toLowerCase() === v.toLowerCase().trim() && c.companyId === form.companyId);
                    if (match) {
                      set('designation', match.designation || '');
                      set('contactEmail', match.email || '');
                      set('contactMobile', match.mobile || '');
                      set('whatsapp', match.whatsapp || '');
                      set('linkedin', match.linkedin || '');
                    }
                  }}
                  autoComplete="off"
                  placeholder="Enter contact name"
                />
                <datalist id="lead-contacts">
                  {contacts.filter(c => c.companyId === form.companyId).map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
                
                {form.companyId && contacts.filter(c => c.companyId === form.companyId).length > 0 && (
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    <span className="fs-12 text-muted-c me-1 d-flex align-items-center">Existing contacts:</span>
                    {contacts.filter(c => c.companyId === form.companyId).map(c => (
                      <button 
                        key={c.id} 
                        type="button"
                        className="btn btn-sm btn-light border py-0 px-2 fs-12 rounded-pill"
                        onClick={() => {
                          set('contact', c.name);
                          set('designation', c.designation || '');
                          set('contactEmail', c.email || '');
                          set('contactMobile', c.mobile || '');
                          set('whatsapp', c.whatsapp || '');
                          set('linkedin', c.linkedin || '');
                        }}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Designation" col={6}><input className="form-control" value={form.designation} onChange={(e) => set('designation', e.target.value)} /></Field>
              <Field label="Email" col={6} error={errors.contactEmail}><input className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`} value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></Field>
              <Field label="Mobile" col={6}><input className="form-control" value={form.contactMobile} onChange={(e) => set('contactMobile', e.target.value)} placeholder="+91 " /></Field>
              <Field label="WhatsApp" col={6}><input className="form-control" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></Field>
              <Field label="LinkedIn" col={6}><input className="form-control" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="linkedin.com/in/..." /></Field>
              <Field label="Is Decision Maker?" col={6}><input className="form-control" value={form.decisionMaker} onChange={(e) => set('decisionMaker', e.target.value)} placeholder="Name of decision maker" /></Field>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h5 className="mb-3"><i className="bi bi-briefcase me-2 text-primary-c" />Business Information</h5>
            <div className="mb-3">
              <label className="form-label">Interested Products <span className="req">*</span></label>
              {errors.products && <div className="field-error mb-2"><i className="bi bi-exclamation-circle" /> {errors.products}</div>}
              <div className="d-flex flex-wrap gap-2">
                {products.map((p) => {
                  const on = (form.products || []).includes(p.name);
                  return (
                    <button key={p.code} type="button" onClick={() => toggleProduct(p.name)}
                      className="chip" style={{ cursor: 'pointer', border: on ? '1px solid var(--primary)' : '1px solid var(--border)', background: on ? 'var(--primary-soft)' : '#fff', color: on ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: on ? 600 : 500 }}>
                      {on && <i className="bi bi-check-lg" />} {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="row">
              <Field label="Estimated Deal Value" col={6} hint={formatINRFull(form.value)}><input type="number" className="form-control" value={form.value} onChange={(e) => set('value', e.target.value)} placeholder="2500000" /></Field>
              <Field label="Budget" col={6} hint={formatINRFull(form.budget)}><input type="number" className="form-control" value={form.budget} onChange={(e) => set('budget', e.target.value)} /></Field>
              <Field label="Competitors" col={12}><input className="form-control" value={form.competitors} onChange={(e) => set('competitors', e.target.value)} placeholder="e.g. SAP, Oracle" /></Field>
              <Field label="Business Requirement" col={12}><textarea className="form-control" rows={3} value={form.requirement} onChange={(e) => set('requirement', e.target.value)} placeholder="Describe the customer's requirement..." /></Field>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h5 className="mb-3"><i className="bi bi-megaphone me-2 text-primary-c" />Marketing Information</h5>
            <div className="row">
              <Field label="Lead Source" col={6}><select className="form-select" value={form.source} onChange={(e) => set('source', e.target.value)}><option value="">Select</option>{leadSources.map((s) => <option key={s.code}>{s.name}</option>)}</select></Field>
              <Field label="Campaign" col={6}><select className="form-select" value={form.campaign} onChange={(e) => set('campaign', e.target.value)}><option value="">Select</option>{campaigns.map((c) => <option key={c.code}>{c.name}</option>)}</select></Field>
              <Field label="UTM Source" col={4}><input className="form-control" value={form.utmSource} onChange={(e) => set('utmSource', e.target.value)} placeholder="google" /></Field>
              <Field label="UTM Medium" col={4}><input className="form-control" value={form.utmMedium} onChange={(e) => set('utmMedium', e.target.value)} placeholder="cpc" /></Field>
              <Field label="UTM Campaign" col={4}><input className="form-control" value={form.utmCampaign} onChange={(e) => set('utmCampaign', e.target.value)} placeholder="q3_growth" /></Field>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h5 className="mb-3"><i className="bi bi-check2-circle me-2 text-success" />Review &amp; Confirm</h5>
            <div className="row g-3">
              <ReviewBlock title="Lead" items={[['Number', form.number], ['Marketing Person', form.assignedTo], ['Status', form.status], ['Score', `${form.score} (${tempFromScore(Number(form.score))})`], ['Priority', form.priority]]} />
              <ReviewBlock title="Company" items={[['Name', form.company], ['Industry', form.industry], ['Website', form.website], ['Location', [form.city, form.state].filter(Boolean).join(', ')]]} />
              <ReviewBlock title="Contact" items={[['Name', form.contact], ['Designation', form.designation], ['Email', form.contactEmail], ['Mobile', form.contactMobile]]} />
              <ReviewBlock title="Business" items={[['Products', (form.products || []).join(', ')], ['Value', formatINR(form.value)], ['Budget', formatINR(form.budget)], ['Competitors', form.competitors]]} />
              <ReviewBlock title="Marketing" items={[['Source', form.source], ['Campaign', form.campaign], ['UTM', [form.utmSource, form.utmMedium, form.utmCampaign].filter(Boolean).join(' / ')]]} />
            </div>
          </>
        )}
      </div>

      {/* Footer nav */}
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-light" disabled={step === 0} onClick={back}><i className="bi bi-arrow-left" /> Back</button>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => save(true)}><i className="bi bi-save" /> Save Draft</button>
          {step < STEPS.length - 1
            ? <button className="btn btn-primary" onClick={next}>Continue <i className="bi bi-arrow-right" /></button>
            : <button className="btn btn-success" onClick={() => save(false)}><i className="bi bi-check2-circle" /> {editing ? 'Update Lead' : 'Save Lead'}</button>}
        </div>
      </div>

      <DuplicateWarning
        open={dup}
        existing={dupMatch}
        onClose={() => setDup(false)}
        onView={() => { setDup(false); navigate(`/companies/${dupMatch.id}`); }}
        onUseExisting={() => { set('industry', dupMatch.industry); set('city', dupMatch.city); set('state', dupMatch.state); setDup(false); setStep(2); toast.info('Using existing company', dupMatch.name); }}
        onCreateAnyway={() => { setDup(false); setStep(2); }}
      />
    </div>
  );
}

function ReviewBlock({ title, items }) {
  return (
    <div className="col-md-6">
      <div className="surface p-3 h-100" style={{ background: '#f8fafc' }}>
        <div className="fw-7 mb-2 fs-13 text-primary-c">{title}</div>
        {items.map(([k, v]) => (
          <div key={k} className="d-flex justify-content-between py-1 fs-13">
            <span className="text-muted-c">{k}</span>
            <span className="fw-6 text-end" style={{ maxWidth: '60%' }}>{v || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
