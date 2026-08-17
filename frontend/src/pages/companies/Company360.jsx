import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Timeline, { mixedToTimeline } from '../../components/common/Timeline';
import { Badge, Avatar, UserCell, Section, EmptyState, Field, Meter, Tabs, Skeleton } from '../../components/common/Ui';
import { Drawer, Modal } from '../../components/common/Overlay';
import { StatCard } from '../../components/common/PageParts';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate, statusTone, activityIcon } from '../../utils/format';
import { products, industries, salespeople } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { LogActivityModal, FollowUpModal } from '../../components/crm/ActivityModals';

const STAGE_PROB = { Qualification: 10, Requirement: 30, Demo: 50, Proposal: 70, Won: 100, Lost: 0 };
const STAGES = Object.keys(STAGE_PROB);

const MAIN_TABS = [
  { key: 'overview', label: 'Overview', icon: 'bi-grid-1x2' },
  { key: 'contacts', label: 'Contacts', icon: 'bi-people' },
  { key: 'opportunities', label: 'Opportunities', icon: 'bi-graph-up-arrow' },
  { key: 'activities', label: 'Activities', icon: 'bi-activity' },
  { key: 'notes', label: 'Notes', icon: 'bi-sticky' },
  { key: 'timeline', label: 'Timeline', icon: 'bi-clock-history' },
];
const PHASE_TABS = [
  { key: 'quotations', label: 'Quotations', icon: 'bi-file-earmark-ruled' },
  { key: 'emails', label: 'Emails', icon: 'bi-envelope' },
  { key: 'meetings', label: 'Meetings', icon: 'bi-calendar-event' },
  { key: 'calls', label: 'Calls', icon: 'bi-telephone' },
  { key: 'visits', label: 'Visits', icon: 'bi-geo-alt' },
  { key: 'documents', label: 'Documents', icon: 'bi-folder' },
  { key: 'marketing', label: 'Marketing', icon: 'bi-megaphone' },
];

function Chip({ icon, children }) {
  if (!children) return null;
  return (
    <span className="d-inline-flex align-items-center gap-1 fs-13 text-secondary-c" style={{ padding: '4px 10px', background: 'var(--bg-soft, #f1f5f9)', borderRadius: 999 }}>
      <i className={`bi ${icon}`} style={{ color: 'var(--primary)' }} /> {children}
    </span>
  );
}

export default function Company360() {
  const navigate = useNavigate();
  const crm = useCrm();
  const toast = useToast();
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [oppOpen, setOppOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [logActOpen, setLogActOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);

  const company = crm.companies.find((c) => c.id === id);

  const [oppForm, setOppForm] = useState({ name: '', product: products[0].name, stage: 'Qualification', value: '', closing: '', contact: '', owner: salespeople[0] || '', priority: 'Medium' });
  const [contactForm, setContactForm] = useState({ name: '', designation: '', department: '', email: '', mobile: '', whatsapp: '', decisionMaker: false, influencer: false, primary: false, source: 'Direct' });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const companyContacts = useMemo(() => crm.contacts.filter((c) => c.companyId === id), [crm.contacts, id]);
  const companyOpps = useMemo(() => crm.opportunities.filter((o) => o.companyId === id), [crm.opportunities, id]);
  const companyActivities = useMemo(() => crm.activities.filter((a) => a.company === company?.name), [crm.activities, company]);
  const companyFollowUps = useMemo(() => crm.followUps.filter((f) => f.relatedEntityId === id && f.relatedEntityType === 'Company'), [crm.followUps, id]);
  
  // Volume 3/4 Data
  const companyQuotations = useMemo(() => crm.quotations?.filter(q => q.companyId === id) || [], [crm.quotations, id]);
  const companyDocuments = useMemo(() => crm.documents?.filter(d => d.companyId === id) || [], [crm.documents, id]);

  const pipelineValue = useMemo(() => companyOpps.filter((o) => o.stage !== 'Lost').reduce((a, o) => a + (o.value || 0), 0), [companyOpps]);

  if (!company) {
    return (
      <div className="page">
        <PageHeader title="Company" icon="bi-building" back="/companies" />
        <EmptyState icon="bi-building-x" title="Company not found" message="This company may have been removed." action={<button className="btn btn-primary" onClick={() => navigate('/companies')}><i className="bi bi-arrow-left" /> Back to Companies</button>} />
      </div>
    );
  }

  const openEdit = () => { setEditForm({ ...company }); setEditOpen(true); };
  const setE = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));
  const saveEdit = () => {
    crm.updateCompany(company.id, { ...editForm, employees: Number(editForm.employees) || 0, revenue: Number(editForm.revenue) || 0 });
    toast.success('Company updated', `${editForm.name} was saved.`);
    setEditOpen(false);
  };

  const setO = (k) => (e) => setOppForm((f) => ({ ...f, [k]: e.target.value }));
  const saveOpp = () => {
    if (!oppForm.name.trim()) { toast.error('Name required', 'Please enter an opportunity name.'); return; }
    crm.addOpportunity({
      name: oppForm.name, company: company.name, companyId: company.id,
      contact: oppForm.contact, product: oppForm.product, stage: oppForm.stage,
      probability: STAGE_PROB[oppForm.stage], value: Number(oppForm.value) || 0,
      closing: oppForm.closing, owner: oppForm.owner, priority: oppForm.priority, risk: 'Medium', competitor: '', remarks: '',
    });
    toast.success('Opportunity created', `${oppForm.name} added to pipeline.`);
    setOppOpen(false);
    setOppForm({ name: '', product: products[0].name, stage: 'Qualification', value: '', closing: '', contact: '', owner: salespeople[0] || '', priority: 'Medium' });
    setTab('opportunities');
  };

  const setC = (k) => (e) => setContactForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleC = (k) => (e) => setContactForm((f) => ({ ...f, [k]: e.target.checked }));
  const saveContact = (keepOpen = false) => {
    if (!contactForm.name.trim()) { toast.error('Name required', 'Please enter the contact name.'); return; }
    crm.addContact({ ...contactForm, company: company.name, companyId: company.id, linkedin: '' });
    toast.success('Contact added', `${contactForm.name} added to ${company.name}.`);
    if (keepOpen) {
      setContactForm({ name: '', designation: '', department: '', email: '', mobile: '', whatsapp: '', decisionMaker: false, influencer: false, primary: false, source: 'Direct' });
    } else {
      setContactOpen(false);
      setContactForm({ name: '', designation: '', department: '', email: '', mobile: '', whatsapp: '', decisionMaker: false, influencer: false, primary: false, source: 'Direct' });
    }
    setTab('contacts');
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes((n) => [{ id: Date.now(), text: noteText.trim(), author: currentUser.name, time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }, ...n]);
    setNoteText('');
    toast.success('Note added', 'Your note was saved to this company.');
  };

  const timelineGroups = useMemo(() => {
    const base = mixedToTimeline(companyActivities, companyFollowUps);
    const synthetic = {
      day: 'Account History',
      items: [
        { icon: 'bi-building-add', tone: 'tone-green', title: 'Company account created', desc: `${company.name} added to CRM`, meta: company.owner, time: '' },
        { icon: 'bi-person-badge', tone: 'tone-indigo', title: 'Account owner assigned', desc: `Assigned to ${company.owner}`, meta: 'System', time: '' },
      ],
    };
    return [...base, synthetic];
  }, [companyActivities, companyFollowUps, company]);

  const tabsWithCounts = [
    ...MAIN_TABS.map((t) => ({
      ...t,
      count: t.key === 'contacts' ? companyContacts.length
        : t.key === 'opportunities' ? companyOpps.length
        : t.key === 'activities' ? companyActivities.length
        : t.key === 'notes' ? (notes.length || undefined)
        : undefined,
    })),
    ...PHASE_TABS.map((t) => ({
      ...t,
      count: t.key === 'quotations' ? (companyQuotations.length || undefined)
        : t.key === 'documents' ? (companyDocuments.length || undefined)
        : undefined,
    })),
  ];

  return (
    <div className="page">
      <PageHeader title="Company 360" icon="bi-building" back="/companies" />

      {/* Header card */}
      <div className="surface p-4 mb-4">
        {loading ? (
          <div className="d-flex align-items-center gap-3">
            <Skeleton w={80} h={80} r={16} />
            <div style={{ flex: 1 }}><Skeleton w="35%" h={24} /><Skeleton w="50%" h={14} style={{ marginTop: 10 }} /></div>
          </div>
        ) : (
          <div className="d-flex align-items-start gap-3 flex-wrap">
            <Avatar name={company.name} size="xl" />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h2 className="mb-0" style={{ fontSize: 26, fontWeight: 800 }}>{company.name}</h2>
                <Badge tone="tone-gray">{company.industry}</Badge>
                <Badge tone={statusTone(company.status)} dot>{company.status}</Badge>
              </div>
              <div className="fs-13 text-muted-c mono mt-1">{company.code} · {company.type}</div>
              <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
                <Chip icon="bi-globe">{company.website}</Chip>
                <Chip icon="bi-geo-alt">{company.city}, {company.state}</Chip>
                <Chip icon="bi-receipt">{company.gst}</Chip>
                <Chip icon="bi-person">{company.owner}</Chip>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button className="btn btn-light" onClick={() => navigate(`/leads/new?companyId=${id}`)}><i className="bi bi-lightning-charge" /> Create Lead</button>
              <button className="btn btn-light" onClick={() => setContactOpen(true)}><i className="bi bi-person-plus" /> Add Contact</button>
              <button className="btn btn-primary" onClick={() => setOppOpen(true)}><i className="bi bi-plus-circle" /> Create Opportunity</button>
              <button className="btn btn-light" onClick={openEdit}><i className="bi bi-pencil" /> Edit</button>
            </div>
          </div>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-kpi mb-4">
        <StatCard icon="bi-people-fill" value={companyContacts.length} label="Contacts" iconBg="var(--primary-soft)" iconColor="var(--primary)" onClick={() => setTab('contacts')} />
        <StatCard icon="bi-graph-up-arrow" value={companyOpps.length} label="Opportunities" iconBg="var(--secondary-soft)" iconColor="var(--secondary)" onClick={() => setTab('opportunities')} />
        <StatCard icon="bi-cash-stack" value={formatINR(pipelineValue)} label="Pipeline Value" iconBg="var(--success-soft)" iconColor="var(--success)" onClick={() => setTab('opportunities')} />
        <StatCard icon="bi-activity" value={companyActivities.length} label="Activities" iconBg="var(--warning-soft)" iconColor="var(--warning)" onClick={() => setTab('activities')} />
        <StatCard icon="bi-wallet2" value={formatINR((company.revenue || 0) * 100000)} label="Annual Revenue" iconBg="var(--accent-soft)" iconColor="var(--accent)" />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabsWithCounts} active={tab} onChange={setTab} />

      <div className="mt-3">
        {tab === 'overview' && (
          <div className="grid grid-2">
            <div className="surface p-4">
              <Section title="Company Details" icon="bi-info-circle">
                <ReadRow label="Legal Name">{company.legalName}</ReadRow>
                <ReadRow label="Industry">{company.industry}</ReadRow>
                <ReadRow label="Company Type">{company.type}</ReadRow>
                <ReadRow label="Employees">{(company.employees || 0).toLocaleString('en-IN')}</ReadRow>
                <ReadRow label="Annual Revenue">{formatINR((company.revenue || 0) * 100000)}</ReadRow>
                <ReadRow label="Website">{company.website ? <a href={`https://${company.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">{company.website}</a> : '—'}</ReadRow>
                <ReadRow label="GST"><span className="mono">{company.gst}</span></ReadRow>
                <ReadRow label="PAN"><span className="mono">{company.pan}</span></ReadRow>
                <ReadRow label="Address">{[company.address, company.city, company.state, company.pin].filter(Boolean).join(', ')}</ReadRow>
                <ReadRow label="Status"><Badge tone={statusTone(company.status)}>{company.status}</Badge></ReadRow>
                <ReadRow label="Account Owner">{company.owner}</ReadRow>
                <ReadRow label="Remarks">{company.remarks}</ReadRow>
              </Section>
            </div>
            <div className="d-flex flex-column gap-3">
              <div className="surface p-4">
                <div className="fw-7 fs-16 mb-3">Pipeline Summary</div>
                <div className="d-flex align-items-center justify-content-between mb-2"><span className="fs-13 text-secondary-c">Open Opportunities</span><span className="fw-7">{companyOpps.filter((o) => !['Won', 'Lost'].includes(o.stage)).length}</span></div>
                <div className="d-flex align-items-center justify-content-between mb-2"><span className="fs-13 text-secondary-c">Won Deals</span><span className="fw-7 text-success">{companyOpps.filter((o) => o.stage === 'Won').length}</span></div>
                <div className="d-flex align-items-center justify-content-between mb-2"><span className="fs-13 text-secondary-c">Pipeline Value</span><span className="fw-7 mono">{formatINR(pipelineValue)}</span></div>
                <div className="d-flex align-items-center justify-content-between"><span className="fs-13 text-secondary-c">Won Value</span><span className="fw-7 mono">{formatINR(companyOpps.filter((o) => o.stage === 'Won').reduce((a, o) => a + (o.value || 0), 0))}</span></div>
              </div>
              <div className="surface p-4">
                <div className="fw-7 fs-16 mb-3">Key Contacts</div>
                {companyContacts.slice(0, 4).map((c) => (
                  <div key={c.id} className="d-flex align-items-center gap-2 py-2" style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(`/contacts/${c.id}`)}>
                    <Avatar name={c.name} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-6 text-truncate">{c.name}</div>
                      <div className="fs-12 text-muted-c text-truncate">{c.designation}</div>
                    </div>
                    {c.decisionMaker && <Badge tone="tone-green">DM</Badge>}
                  </div>
                ))}
                {companyContacts.length === 0 && <div className="fs-13 text-muted-c">No contacts yet.</div>}
              </div>
            </div>
          </div>
        )}

        {tab === 'contacts' && (
          <DataTable
            keyField="id"
            rows={companyContacts}
            onRowClick={(r) => navigate(`/contacts/${r.id}`)}
            searchKeys={['name', 'designation', 'email', 'mobile']}
            searchPlaceholder="Search contacts..."
            toolbarActions={<button className="btn btn-primary btn-sm" onClick={() => setContactOpen(true)}><i className="bi bi-person-plus" /> Add</button>}
            empty={<EmptyState icon="bi-people" title="No contacts" message="Add the first contact for this company." action={<button className="btn btn-primary" onClick={() => setContactOpen(true)}><i className="bi bi-person-plus" /> Add Contact</button>} />}
            columns={[
              { key: 'name', label: 'Name', sortable: true, render: (r) => <UserCell name={r.name} sub={r.designation} /> },
              { key: 'designation', label: 'Designation', sortable: true },
              { key: 'email', label: 'Email', render: (r) => r.email ? <a href={`mailto:${r.email}`} onClick={(e) => e.stopPropagation()}>{r.email}</a> : '—' },
              { key: 'mobile', label: 'Mobile', className: 'mono' },
              { key: 'rel', label: 'Relationship', render: (r) => (
                <div className="d-flex gap-1 flex-wrap">
                  {r.decisionMaker && <Badge tone="tone-green">DM</Badge>}
                  {r.influencer && <Badge tone="tone-indigo">INF</Badge>}
                  {r.primary && <Badge tone="tone-blue">Primary</Badge>}
                  {!r.decisionMaker && !r.influencer && !r.primary && <span className="text-muted-c">—</span>}
                </div>
              ) },
              { key: 'status', label: 'Status', render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
            ]}
          />
        )}

        {tab === 'opportunities' && (
          <DataTable
            keyField="id"
            rows={companyOpps}
            onRowClick={(r) => navigate(`/opportunities/${r.id}`)}
            searchKeys={['name', 'product', 'stage', 'owner']}
            searchPlaceholder="Search opportunities..."
            toolbarActions={<button className="btn btn-primary btn-sm" onClick={() => setOppOpen(true)}><i className="bi bi-plus-lg" /> New</button>}
            empty={<EmptyState icon="bi-graph-up-arrow" title="No opportunities" message="Create the first opportunity for this company." action={<button className="btn btn-primary" onClick={() => setOppOpen(true)}><i className="bi bi-plus-circle" /> Create Opportunity</button>} />}
            columns={[
              { key: 'name', label: 'Opportunity', sortable: true, render: (r) => (<div><div className="fw-6">{r.name}</div><div className="fs-12 text-muted-c mono">{r.number}</div></div>) },
              { key: 'product', label: 'Product', sortable: true },
              { key: 'stage', label: 'Stage', sortable: true, render: (r) => <Badge tone={statusTone(r.stage)}>{r.stage}</Badge> },
              { key: 'probability', label: 'Probability', width: '140px', accessor: (r) => r.probability, render: (r) => (
                <div className="d-flex align-items-center gap-2">
                  <div style={{ flex: 1, minWidth: 60 }}><Meter value={r.probability} tone={r.probability >= 70 ? 'var(--success)' : r.probability >= 40 ? 'var(--warning)' : 'var(--danger)'} /></div>
                  <span className="fs-12 fw-6 mono">{r.probability}%</span>
                </div>
              ) },
              { key: 'value', label: 'Value', sortable: true, className: 'mono', accessor: (r) => r.value, render: (r) => formatINR(r.value) },
              { key: 'closing', label: 'Closing', sortable: true, accessor: (r) => r.closing, render: (r) => formatDate(r.closing) },
              { key: 'owner', label: 'Owner', render: (r) => <UserCell name={r.owner} /> },
            ]}
          />
        )}

        {tab === 'activities' && (
          <DataTable
            keyField="id"
            rows={companyActivities}
            searchKeys={['subject', 'type', 'conductedBy']}
            searchPlaceholder="Search activities..."
            toolbarActions={<button className="btn btn-primary btn-sm" onClick={() => setLogActOpen(true)}><i className="bi bi-plus-lg" /> Log Activity</button>}
            empty={<EmptyState icon="bi-activity" title="No activities" message="No activities logged for this company yet." action={<button className="btn btn-primary" onClick={() => setLogActOpen(true)}>Log Activity</button>} />}
            columns={[
              { key: 'type', label: 'Type', sortable: true, width: '130px', render: (r) => <span className="d-inline-flex align-items-center gap-2"><i className={`bi ${activityIcon(r.type)}`} style={{ color: 'var(--primary)' }} /> {r.type}</span> },
              { key: 'subject', label: 'Subject', sortable: true, render: (r) => <span className="fw-6">{r.subject}</span> },
              { key: 'date', label: 'Date', sortable: true, accessor: (r) => r.date, render: (r) => (<div><div className="fs-13">{formatDate(r.date)}</div><div className="fs-12 text-muted-c">{r.time}</div></div>) },
              { key: 'conductedBy', label: 'By', render: (r) => <UserCell name={r.conductedBy} /> },
              { key: 'status', label: 'Status', sortable: true, render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
            ]}
          />
        )}

        {tab === 'notes' && (
          <div className="grid grid-2">
            <div className="surface p-4">
              <Section title="Add a Note" icon="bi-pencil-square" />
              <textarea className="form-control" rows={5} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write a note about this account…" />
              <div className="mt-3 d-flex justify-content-end">
                <button className="btn btn-primary" onClick={addNote} disabled={!noteText.trim()}><i className="bi bi-plus-lg" /> Add Note</button>
              </div>
            </div>
            <div className="d-flex flex-column gap-3">
              {notes.length === 0 ? (
                <div className="surface p-4"><EmptyState icon="bi-sticky" title="No notes yet" message="Notes you add appear here." /></div>
              ) : notes.map((n) => (
                <div key={n.id} className="surface p-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Avatar name={n.author} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-6 fs-13">{n.author}</div>
                      <div className="fs-12 text-muted-c">{n.time}</div>
                    </div>
                    <i className="bi bi-sticky text-muted-c" />
                  </div>
                  <div className="fs-13 text-secondary-c" style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div className="surface p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Section title="Account Timeline" subtitle="All activity and follow-ups across this company" icon="bi-clock-history" className="mb-0" />
              <button className="btn btn-primary btn-sm" onClick={() => setLogActOpen(true)}>Log Activity</button>
            </div>
            <Timeline groups={timelineGroups} />
          </div>
        )}

        {tab === 'quotations' && (
          <DataTable
            keyField="id"
            rows={companyQuotations}
            onRowClick={(r) => navigate(`/quotations/${r.id}`)}
            searchKeys={['number']}
            searchPlaceholder="Search quotations..."
            toolbarActions={<button className="btn btn-primary btn-sm" onClick={() => navigate('/quotations/new')}><i className="bi bi-plus-lg" /> New</button>}
            empty={<EmptyState icon="bi-receipt" title="No quotations" message="Create the first quotation for this company." action={<button className="btn btn-primary" onClick={() => navigate('/quotations/new')}><i className="bi bi-plus-circle" /> Create Quotation</button>} />}
            columns={[
              { key: 'number', label: 'Quotation #', sortable: true, render: (r) => <span className="fw-6">{r.number}</span> },
              { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date, { short: true }) },
              { key: 'total', label: 'Amount', sortable: true, className: 'mono', render: (r) => formatINR(r.total) },
              { key: 'status', label: 'Status', render: (r) => <span className="badge-pill tone-blue">{r.status}</span> },
            ]}
          />
        )}

        {tab === 'documents' && (
          <DataTable
            keyField="id"
            rows={companyDocuments}
            searchKeys={['name', 'number']}
            searchPlaceholder="Search documents..."
            toolbarActions={<button className="btn btn-primary btn-sm" onClick={() => navigate('/documents?upload=1')}><i className="bi bi-upload" /> Upload</button>}
            empty={<EmptyState icon="bi-folder" title="No documents" message="Upload documents related to this company." action={<button className="btn btn-primary" onClick={() => navigate('/documents?upload=1')}><i className="bi bi-upload" /> Upload Document</button>} />}
            columns={[
              { key: 'name', label: 'Document Name', sortable: true, render: (r) => <span className="fw-6">{r.name}</span> },
              { key: 'type', label: 'Type', sortable: true },
              { key: 'uploadDate', label: 'Uploaded On', sortable: true },
              { key: 'uploadedBy', label: 'Uploaded By' },
            ]}
          />
        )}

        {['emails', 'meetings', 'calls', 'visits', 'marketing'].some((t) => t === tab) && (
          <div className="surface p-4">
            <EmptyState icon={PHASE_TABS.find((t) => t.key === tab)?.icon || 'bi-hourglass-split'} title={`${PHASE_TABS.find((t) => t.key === tab)?.label} — Coming in a later phase`} message="This module is planned for an upcoming release and is not available in this prototype." />
          </div>
        )}
      </div>

      {/* Edit company drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Company"
        subtitle={company.name}
        icon="bi-pencil-square"
        width={560}
        footer={<><button className="btn btn-light" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={saveEdit}><i className="bi bi-check-lg" /> Save Changes</button></>}
      >
        {editForm && (
          <>
            <Section title="Company Info" icon="bi-building">
              <div className="row">
                <Field label="Company Name" required col={12}><input className="form-control" value={editForm.name} onChange={setE('name')} /></Field>
                <Field label="Legal Name" col={12}><input className="form-control" value={editForm.legalName} onChange={setE('legalName')} /></Field>
                <Field label="Industry" col={6}>
                  <select className="form-select" value={editForm.industry} onChange={setE('industry')}>
                    {industries.map((i) => <option key={i.code} value={i.name}>{i.name}</option>)}
                  </select>
                </Field>
                <Field label="Website" col={6}><input className="form-control" value={editForm.website} onChange={setE('website')} /></Field>
                <Field label="Employees" col={6}><input type="number" className="form-control" value={editForm.employees} onChange={setE('employees')} /></Field>
                <Field label="Annual Revenue (₹ Lakh)" col={6}><input type="number" className="form-control" value={editForm.revenue} onChange={setE('revenue')} /></Field>
              </div>
            </Section>
            <Section title="Registration" icon="bi-receipt">
              <div className="row">
                <Field label="GST Number" col={6}><input className="form-control" value={editForm.gst} onChange={setE('gst')} /></Field>
                <Field label="PAN" col={6}><input className="form-control" value={editForm.pan} onChange={setE('pan')} /></Field>
                <Field label="Owner" col={6}>
                  <select className="form-select" value={editForm.owner} onChange={setE('owner')}>
                    {salespeople.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Status" col={6}>
                  <select className="form-select" value={editForm.status} onChange={setE('status')}>
                    {['Active', 'Prospect', 'Inactive', 'Paused'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </Section>
            <Section title="Address" icon="bi-geo-alt">
              <div className="row">
                <Field label="Address" col={12}><input className="form-control" value={editForm.address} onChange={setE('address')} /></Field>
                <Field label="City" col={6}><input className="form-control" value={editForm.city} onChange={setE('city')} /></Field>
                <Field label="State" col={6}><input className="form-control" value={editForm.state} onChange={setE('state')} /></Field>
                <Field label="Remarks" col={12}><textarea className="form-control" rows={2} value={editForm.remarks} onChange={setE('remarks')} /></Field>
              </div>
            </Section>
          </>
        )}
      </Drawer>

      {/* Add contact drawer */}
      <Drawer open={contactOpen} onClose={() => setContactOpen(false)} title="Add Contact" subtitle={company.name} icon="bi-person-plus" width={480} footer={<><button className="btn btn-light" onClick={() => setContactOpen(false)}>Cancel</button><button className="btn btn-outline-primary" onClick={() => saveContact(true)}><i className="bi bi-person-plus" /> Save & Add Another</button><button className="btn btn-primary" onClick={() => saveContact(false)}><i className="bi bi-check-lg" /> Save Contact</button></>}>
        <div className="row">
          <Field label="Name" required col={12}><input className="form-control" value={contactForm.name} onChange={setC('name')} /></Field>
          <Field label="Designation" col={6}><input className="form-control" value={contactForm.designation} onChange={setC('designation')} /></Field>
          <Field label="Department" col={6}><input className="form-control" value={contactForm.department} onChange={setC('department')} /></Field>
          <Field label="Email" col={12}><input type="email" className="form-control" value={contactForm.email} onChange={setC('email')} /></Field>
          <Field label="Mobile" col={6}><input className="form-control" value={contactForm.mobile} onChange={setC('mobile')} /></Field>
          <Field label="WhatsApp" col={6}><input className="form-control" value={contactForm.whatsapp} onChange={setC('whatsapp')} /></Field>
          <Field label="Source" col={12}>
            <select className="form-select" value={contactForm.source} onChange={setC('source')}>
              <option value="Direct">Direct</option>
              <option value="Website">Website</option>
              <option value="Campaign">Campaign</option>
              <option value="Business Card">Business Card</option>
              <option value="Company Leaflet">Company Leaflet</option>
              <option value="Referral">Referral</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <div className="col-12 mt-2">
            <div className="form-check mb-2"><input type="checkbox" className="form-check-input" id="c-dm" checked={contactForm.decisionMaker} onChange={toggleC('decisionMaker')} /><label className="form-check-label" htmlFor="c-dm">Decision Maker</label></div>
            <div className="form-check mb-2"><input type="checkbox" className="form-check-input" id="c-inf" checked={contactForm.influencer} onChange={toggleC('influencer')} /><label className="form-check-label" htmlFor="c-inf">Key Influencer</label></div>
            <div className="form-check"><input type="checkbox" className="form-check-input" id="c-pri" checked={contactForm.primary} onChange={toggleC('primary')} /><label className="form-check-label" htmlFor="c-pri">Primary Contact</label></div>
          </div>
        </div>
      </Drawer>

      {/* Modals */}
      {logActOpen && (
        <LogActivityModal
          open={logActOpen}
          onClose={(action) => {
            setLogActOpen(false);
            if (action === 'open-followup') setFollowUpOpen(true);
          }}
          entity={company}
          entityType="Company"
        />
      )}

      {followUpOpen && (
        <FollowUpModal
          open={followUpOpen}
          onClose={() => setFollowUpOpen(false)}
          entity={company}
          entityType="Company"
        />
      )}

      {/* Create opportunity modal */}
      <Modal
        open={oppOpen}
        onClose={() => setOppOpen(false)}
        title="Create Opportunity"
        subtitle={company.name}
        icon="bi-graph-up-arrow"
        width={580}
        footer={<><button className="btn btn-light" onClick={() => setOppOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={saveOpp}><i className="bi bi-check-lg" /> Create</button></>}
      >
        <div className="row">
          <Field label="Opportunity Name" required col={12}><input className="form-control" value={oppForm.name} onChange={setO('name')} placeholder="e.g. Manufacturing ERP Implementation" /></Field>
          <Field label="Product" col={6}>
            <select className="form-select" value={oppForm.product} onChange={setO('product')}>
              {products.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Contact" col={6}>
            <select className="form-select" value={oppForm.contact} onChange={setO('contact')}>
              <option value="">Select contact…</option>
              {companyContacts.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Stage" col={6} hint={`Probability: ${STAGE_PROB[oppForm.stage]}%`}>
            <select className="form-select" value={oppForm.stage} onChange={setO('stage')}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priority" col={6}>
            <select className="form-select" value={oppForm.priority} onChange={setO('priority')}>
              {['High', 'Medium', 'Low'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Value (₹)" col={6}><input type="number" className="form-control" value={oppForm.value} onChange={setO('value')} placeholder="2500000" /></Field>
          <Field label="Owner" col={6}>
            <select className="form-select" value={oppForm.owner} onChange={setO('owner')}>
              {salespeople.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function ReadRow({ label, children }) {
  return (
    <div className="d-flex align-items-start justify-content-between py-2" style={{ borderBottom: '1px solid var(--border)', gap: 16 }}>
      <span className="fs-13 text-muted-c" style={{ minWidth: 130 }}>{label}</span>
      <span className="fs-13 fw-6 text-end" style={{ minWidth: 0, wordBreak: 'break-word' }}>{children || '—'}</span>
    </div>
  );
}
