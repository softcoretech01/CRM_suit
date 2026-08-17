import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Timeline, { mixedToTimeline } from '../../components/common/Timeline';
import { Badge, Avatar, Section, Meter, EmptyState, Tabs } from '../../components/common/Ui';
import { LogActivityModal, FollowUpModal } from '../../components/crm/ActivityModals';
import { ConvertModal } from '../../components/crm/LeadModals';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import {
  formatINR, formatINRFull, formatDate, statusTone, priorityTone, tempClass,
} from '../../utils/format';
import { auditTrail } from '../../data/mockData';

function Row({ label, children }) {
  return (
    <div className="d-flex py-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="fs-13 text-muted-c" style={{ width: 150, flexShrink: 0 }}>{label}</div>
      <div className="fs-13 fw-6" style={{ flex: 1, minWidth: 0 }}>{children ?? '—'}</div>
    </div>
  );
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { leads, activities, followUps, updateLead } = useCrm();
  const [logActOpen, setLogActOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [tab, setTab] = useState('Overview');

  const lead = leads.find((l) => l.id === id);
  if (!lead) {
    return (
      <div className="page">
        <EmptyState icon="bi-search" title="Lead not found" message="This lead may have been removed."
          action={<button className="btn btn-primary" onClick={() => navigate('/leads')}>Back to Leads</button>} />
      </div>
    );
  }

  const leadActivities = useMemo(
    () => activities.filter((a) => a.lead === lead.number || a.lead === lead.id),
    [activities, lead]
  );
  const leadFollowUps = useMemo(
    () => followUps.filter((f) => f.relatedEntityId === lead.id && f.relatedEntityType === 'Lead'),
    [followUps, lead]
  );

  const scoreTone = lead.score > 60 ? 'var(--danger)' : lead.score >= 21 ? 'var(--warning)' : 'var(--accent)';
  const history = auditTrail.filter((a) => a.entity === lead.number);

  const tabs = [
    { key: 'Overview', label: 'Overview', icon: 'bi-info-circle' },
    { key: 'Activities', label: 'Activity Timeline', icon: 'bi-clock-history', count: leadActivities.length + leadFollowUps.length },
    { key: 'History', label: 'Lead History', icon: 'bi-journal-text' },
  ];

  return (
    <div className="page">
      <PageHeader title={lead.company} subtitle={`${lead.number} · ${lead.industry}`} back="/leads"
        actions={
          <>
            <button className="btn btn-light" onClick={() => navigate(`/leads/${lead.id}/edit`)}><i className="bi bi-pencil" /> Edit</button>
            {!['Won', 'Converted', 'Lost'].includes(lead.status) && (lead.status === 'Qualified' || lead.status === 'Confirmed')
              ? <button className="btn btn-primary" onClick={() => setConvertOpen(true)}><i className="bi bi-arrow-repeat" /> Convert to Opportunity</button>
              : <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>}
          </>
        }
      />

      {/* Hero band */}
      <div className="surface p-4 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-4">
          <div className="d-flex align-items-center gap-3" style={{ minWidth: 200 }}>
            <Avatar name={lead.company} size="xl" />
            <div>
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <Badge tone={statusTone(lead.status)} dot>{lead.status}</Badge>
              </div>
              <div className="fs-13 text-secondary-c">{lead.contact} · {lead.contactMobile}</div>
            </div>
          </div>

          <div className="vr d-none d-md-block" />

          {/* Score gauge */}
          <div style={{ minWidth: 180 }}>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fw-8 mono" style={{ fontSize: 32, color: scoreTone, fontWeight: 800 }}>{lead.score}</span>
              <span className="text-muted-c fs-13">/ 100</span>
            </div>
            <div className="fs-12 text-muted-c mb-1">Lead Score</div>
            <Meter value={lead.score} tone={scoreTone} />
          </div>

          <div className="vr d-none d-md-block" />

          <div className="d-flex gap-4 flex-wrap">
            <div><div className="fs-12 text-muted-c">Est. Value</div><div className="fw-7 mono fs-18">{formatINR(lead.value)}</div></div>
            <div><div className="fs-12 text-muted-c">Expected Close</div><div className="fw-7 fs-18">{formatDate(lead.closing)}</div></div>
            <div><div className="fs-12 text-muted-c">Marketing Person</div><div className="fw-7 fs-18">{lead.assignedTo}</div></div>
          </div>
        </div>
      </div>



      <div className="mb-3"><Tabs tabs={tabs} active={tab} onChange={setTab} /></div>

      {tab === 'Overview' && (
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="d-flex flex-column gap-4">
            <div className="surface p-4">
              <Section title="Company Information" icon="bi-building">
                <Row label="Company"><Link to={`/companies/${lead.companyId}`}>{lead.company}</Link></Row>
                <Row label="Industry">{lead.industry}</Row>
                <Row label="Requirement">{lead.requirement}</Row>
              </Section>
              <Section title="Primary Contact" icon="bi-person">
                <Row label="Name">{lead.contact}</Row>
                <Row label="Mobile">{lead.contactMobile}</Row>
                <Row label="Email"><a href={`mailto:${lead.contactEmail}`}>{lead.contactEmail}</a></Row>
                <Row label="Decision Maker">{lead.decisionMaker}</Row>
              </Section>
              <Section title="Business Information" icon="bi-briefcase">
                <Row label="Interested Products">{(lead.products || [lead.product]).map((p) => <Badge key={p} tone="tone-blue">{p}</Badge>)}</Row>
                <Row label="Estimated Value">{formatINRFull(lead.value)}</Row>
                <Row label="Budget">{formatINRFull(lead.budget)}</Row>
                <Row label="Expected Closing">{formatDate(lead.closing)}</Row>
                <Row label="Competitors">{lead.competitors || 'None identified'}</Row>
              </Section>
              <Section title="Marketing Information" icon="bi-megaphone">
                <Row label="Lead Source"><Badge tone="tone-gray">{lead.source}</Badge></Row>
                <Row label="Campaign">{lead.campaign || '—'}</Row>
                <Row label="UTM Source">{lead.utmSource || '—'}</Row>
                <Row label="UTM Medium">{lead.utmMedium || '—'}</Row>
                <Row label="UTM Campaign">{lead.utmCampaign || '—'}</Row>
              </Section>
            </div>
          </div>

          <div className="d-flex flex-column gap-4">
            <div className="surface p-4">
              <Section title="Lead Details" icon="bi-card-list">
                <Row label="Lead Number"><span className="mono">{lead.number}</span></Row>
                <Row label="Lead Date">{formatDate(lead.date)}</Row>
                <Row label="Marketing Person"><div className="d-flex align-items-center gap-2"><Avatar name={lead.assignedTo} size="sm" />{lead.assignedTo}</div></Row>
                <Row label="Status"><Badge tone={statusTone(lead.status)} dot>{lead.status}</Badge></Row>
                {lead.lossReason && <Row label="Loss Reason"><Badge tone="tone-red">{lead.lossReason}</Badge></Row>}
              </Section>
            </div>
            <div className="surface p-4">
              <div className="fw-7 mb-2">Notes</div>
              <div className="fs-13 text-secondary-c" style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}>
                {lead.requirement}
              </div>
              <button className="btn btn-light btn-sm mt-3 w-100" onClick={() => toast.info('Add note', 'Note editor would open here.')}><i className="bi bi-plus" /> Add Note</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Activities' && (
        <div className="surface p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="fw-7 fs-18">Activity Timeline</div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-primary btn-sm" onClick={() => setFollowUpOpen(true)}><i className="bi bi-calendar-plus" /> Schedule Follow-up</button>
              <button className="btn btn-primary btn-sm" onClick={() => setLogActOpen(true)}><i className="bi bi-plus" /> Log Activity</button>
            </div>
          </div>
          <Timeline groups={mixedToTimeline(leadActivities, leadFollowUps)} />
        </div>
      )}

      {tab === 'History' && (
        <div className="surface p-4">
          <div className="fw-7 fs-18 mb-3">Lead History &amp; Audit Trail</div>
          {history.length === 0 ? (
            <Timeline groups={[{ day: 'Recent', items: [
              { icon: 'bi-plus-circle', tone: 'tone-blue', title: 'Lead created', meta: lead.owner, time: formatDate(lead.date, { short: true }) },
              { icon: 'bi-person-check', tone: 'tone-indigo', title: `Assigned to ${lead.assignedTo}`, meta: lead.owner, time: formatDate(lead.date, { short: true }) },
            ] }]} />
          ) : (
            <Timeline groups={[{ day: 'Audit Trail', items: history.map((h) => ({
              icon: 'bi-pencil-square', tone: 'tone-amber',
              title: h.action, desc: h.from ? `${h.from} → ${h.to}` : h.to, meta: h.user, time: `${formatDate(h.date, { short: true })} ${h.time}`,
            })) }]} />
          )}
        </div>
      )}

      {logActOpen && (
        <LogActivityModal
          open={logActOpen}
          onClose={(action) => {
            setLogActOpen(false);
            if (action === 'open-followup') setFollowUpOpen(true);
          }}
          entity={lead}
          entityType="Lead"
        />
      )}

      {followUpOpen && (
        <FollowUpModal
          open={followUpOpen}
          onClose={() => setFollowUpOpen(false)}
          entity={lead}
          entityType="Lead"
        />
      )}

      {convertOpen && (
        <ConvertModal
          open={convertOpen}
          onClose={() => setConvertOpen(false)}
          lead={lead}
        />
      )}
    </div>
  );
}
