import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Timeline, { activitiesToTimeline } from '../../components/common/Timeline';
import { Badge, Avatar, Section, EmptyState, Field, Skeleton } from '../../components/common/Ui';
import { Drawer } from '../../components/common/Overlay';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';

function ReadRow({ label, children }) {
  return (
    <div className="d-flex align-items-start justify-content-between py-2" style={{ borderBottom: '1px solid var(--border)', gap: 16 }}>
      <span className="fs-13 text-muted-c" style={{ minWidth: 130 }}>{label}</span>
      <span className="fs-13 fw-6 text-end" style={{ minWidth: 0, wordBreak: 'break-word' }}>{children ?? '—'}</span>
    </div>
  );
}

function CheckRow({ label, on }) {
  return (
    <div className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <i className={`bi ${on ? 'bi-check-circle-fill' : 'bi-dash-circle'}`} style={{ fontSize: 16, color: on ? 'var(--success)' : 'var(--text-muted)' }} />
      <span className="fs-13" style={{ flex: 1 }}>{label}</span>
      <Badge tone={on ? 'tone-green' : 'tone-gray'}>{on ? 'Yes' : 'No'}</Badge>
    </div>
  );
}

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const crm = useCrm();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);

  const contact = crm.contacts.find((c) => c.id === id);
  const company = crm.companies.find((c) => c.id === contact?.companyId);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const timelineGroups = useMemo(() => {
    if (!contact) return [];
    return activitiesToTimeline(crm.activities.filter((a) => a.contact === contact.name));
  }, [crm.activities, contact]);

  if (!contact) {
    return (
      <div className="page">
        <PageHeader title="Contact" icon="bi-person" back="/contacts" />
        <EmptyState icon="bi-person-x" title="Contact not found" message="This contact may have been removed." action={<button className="btn btn-primary" onClick={() => navigate('/contacts')}><i className="bi bi-arrow-left" /> Back to Contacts</button>} />
      </div>
    );
  }

  const openEdit = () => {
    setForm({ ...contact });
    setEditOpen(true);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));
  const saveEdit = () => {
    crm.updateContact(contact.id, form);
    toast.success('Contact updated', `${form.name} was saved.`);
    setEditOpen(false);
  };

  return (
    <div className="page">
      <PageHeader title="Contact Details" icon="bi-person-lines-fill" back="/contacts" />

      {/* Header card */}
      <div className="surface p-4 mb-4">
        {loading ? (
          <div className="d-flex align-items-center gap-3">
            <Skeleton w={72} h={72} r={16} />
            <div style={{ flex: 1 }}><Skeleton w="40%" h={22} /><Skeleton w="30%" h={14} style={{ marginTop: 10 }} /></div>
          </div>
        ) : (
          <div className="d-flex align-items-start gap-3 flex-wrap">
            <Avatar name={contact.name} size="xl" />
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h2 className="mb-0" style={{ fontSize: 24, fontWeight: 800 }}>{contact.name}</h2>
                <Badge tone={contact.status === 'Active' ? 'tone-green' : 'tone-gray'} dot>{contact.status}</Badge>
              </div>
              <div className="fs-14 text-secondary-c mt-1">
                {contact.designation || 'Contact'}
                {company && <> @ <Link to={`/companies/${company.id}`}>{company.name}</Link></>}
              </div>
              <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
                {contact.decisionMaker && <Badge tone="tone-green" icon="bi-star-fill">Decision Maker</Badge>}
                {contact.influencer && <Badge tone="tone-indigo" icon="bi-people-fill">Influencer</Badge>}
                {contact.primary && <Badge tone="tone-blue" icon="bi-person-check-fill">Primary Contact</Badge>}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button className="btn btn-light" onClick={() => toast.info('Opening dialer…', `Calling ${contact.name} on ${contact.mobile || 'mobile'}.`)}><i className="bi bi-telephone" /> Log Call</button>
              <button className="btn btn-light" onClick={() => toast.info('Opening email…', `Composing email to ${contact.email || contact.name}.`)}><i className="bi bi-envelope" /> Send Email</button>
              {contact.whatsapp && <button className="btn btn-light" onClick={() => toast.info('Opening WhatsApp…', `Chat with ${contact.name}.`)}><i className="bi bi-whatsapp" /> WhatsApp</button>}
              <button className="btn btn-primary" onClick={openEdit}><i className="bi bi-pencil" /> Edit</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail sections */}
      <div className="grid grid-2 mb-4">
        <div className="surface p-4">
          <Section title="Personal Information" icon="bi-person">
            <ReadRow label="Full Name">{contact.name}</ReadRow>
            <ReadRow label="Designation">{contact.designation}</ReadRow>
            <ReadRow label="Department">{contact.department}</ReadRow>
            <ReadRow label="Status"><Badge tone={contact.status === 'Active' ? 'tone-green' : 'tone-gray'}>{contact.status}</Badge></ReadRow>
          </Section>

          <Section title="Professional" icon="bi-briefcase">
            <ReadRow label="Company">{company ? <Link to={`/companies/${company.id}`}>{company.name}</Link> : (contact.company || '—')}</ReadRow>
            <ReadRow label="Industry">{company?.industry}</ReadRow>
            <ReadRow label="Department">{contact.department}</ReadRow>
          </Section>
        </div>

        <div className="surface p-4">
          <Section title="Communication" icon="bi-chat-dots">
            <ReadRow label="Email">{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : '—'}</ReadRow>
            <ReadRow label="Mobile"><span className="mono">{contact.mobile || '—'}</span></ReadRow>
            <ReadRow label="WhatsApp">{contact.whatsapp ? <a href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer">{contact.whatsapp}</a> : '—'}</ReadRow>
            <ReadRow label="LinkedIn">{contact.linkedin ? <a href={`https://${contact.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">{contact.linkedin}</a> : '—'}</ReadRow>
          </Section>

          <Section title="Preferences & Role" icon="bi-diagram-3">
            <CheckRow label="Decision Maker" on={contact.decisionMaker} />
            <CheckRow label="Influencer" on={contact.influencer} />
            <CheckRow label="Primary Contact" on={contact.primary} />
          </Section>
        </div>
      </div>

      {/* Timeline */}
      <div className="surface p-4">
        <Section title="Contact Timeline" subtitle="Calls, meetings, emails, WhatsApp, proposals and notes" icon="bi-clock-history" />
        {loading ? <Skeleton h={180} /> : <Timeline groups={timelineGroups} />}
      </div>

      {/* Edit drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Contact"
        subtitle={contact.name}
        icon="bi-pencil-square"
        width={540}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}><i className="bi bi-check-lg" /> Save Changes</button>
          </>
        }
      >
        {form && (
          <>
            <Section title="Personal & Role" icon="bi-person">
              <div className="row">
                <Field label="Full Name" required col={12}>
                  <input className="form-control" value={form.name} onChange={set('name')} />
                </Field>
                <Field label="Designation" col={6}>
                  <input className="form-control" value={form.designation} onChange={set('designation')} />
                </Field>
                <Field label="Department" col={6}>
                  <input className="form-control" value={form.department} onChange={set('department')} />
                </Field>
              </div>
            </Section>
            <Section title="Communication" icon="bi-chat-dots">
              <div className="row">
                <Field label="Email" col={12}>
                  <input className="form-control" value={form.email} onChange={set('email')} />
                </Field>
                <Field label="Mobile" col={6}>
                  <input className="form-control" value={form.mobile} onChange={set('mobile')} />
                </Field>
                <Field label="WhatsApp" col={6}>
                  <input className="form-control" value={form.whatsapp} onChange={set('whatsapp')} />
                </Field>
                <Field label="LinkedIn" col={12}>
                  <input className="form-control" value={form.linkedin} onChange={set('linkedin')} />
                </Field>
              </div>
            </Section>
            <Section title="Relationship" icon="bi-diagram-3">
              <div className="d-flex flex-column gap-2">
                <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" className="form-check-input" checked={!!form.decisionMaker} onChange={toggle('decisionMaker')} />
                  <span className="fs-13">Decision Maker</span>
                </label>
                <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" className="form-check-input" checked={!!form.influencer} onChange={toggle('influencer')} />
                  <span className="fs-13">Influencer</span>
                </label>
                <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" className="form-check-input" checked={!!form.primary} onChange={toggle('primary')} />
                  <span className="fs-13">Primary Contact</span>
                </label>
              </div>
            </Section>
          </>
        )}
      </Drawer>
    </div>
  );
}
