import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Timeline, { mixedToTimeline } from '../../components/common/Timeline';
import { Badge, UserCell, Section, EmptyState, Meter, Field, Avatar } from '../../components/common/Ui';
import { Drawer, Modal } from '../../components/common/Overlay';
import { LogActivityModal, FollowUpModal } from '../../components/crm/ActivityModals';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import {
  formatINR, formatINRFull, formatDate, statusTone, priorityTone, riskTone, activityIcon,
} from '../../utils/format';
import { products, priorities, salespeople, activityTypes } from '../../data/mockData';

const STAGES = [
  { key: 'Qualification', color: '#2563eb' },
  { key: 'Requirement', color: '#4f46e5' },
  { key: 'Demo', color: '#0891b2' },
  { key: 'Proposal', color: '#8b5cf6' },
  { key: 'Won', color: '#16a34a' },
  { key: 'Lost', color: '#dc2626' },
];

const STAGE_PROB = {
  Qualification: 10, Requirement: 30, Demo: 50, Proposal: 70, Won: 100, Lost: 0,
};

// Progress tracker excludes "Lost" (dead-end state)
const TRACKER = ['Qualification', 'Requirement', 'Demo', 'Proposal', 'Won'];

const LOSS_REASONS = ['Price', 'Competitor', 'Budget', 'Postponed', 'No Response'];
const RISKS = ['Low', 'Medium', 'High'];

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const crm = useCrm();
  const toast = useToast();

  const opp = crm.opportunities.find((o) => o.id === id || o.number === id);

  const [editOpen, setEditOpen] = useState(false);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const [stageForm, setStageForm] = useState({});
  useEffect(() => {
    if (opp?.stage) {
      setStageForm(opp.stageData?.[opp.stage] || stageDefaults(opp.stage));
    }
  }, [opp?.stage, opp?.stageData]);
  const [closeResult, setCloseResult] = useState('Won');
  const [lossReason, setLossReason] = useState('Price');

  const [form, setForm] = useState(opp || {});
  const [activity, setActivity] = useState({ type: 'Call', subject: '', priority: 'Medium' });

  const activities = useMemo(
    () => (opp ? crm.activities.filter((a) => a.opportunity === opp.number || a.opportunity === opp.id) : []),
    [crm.activities, opp]
  );
  const followUps = useMemo(
    () => (opp ? crm.followUps.filter((f) => f.relatedEntityId === opp.id && f.relatedEntityType === 'Opportunity') : []),
    [crm.followUps, opp]
  );
  const [logActOpen, setLogActOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);

  if (!opp) {
    return (
      <div className="page">
        <PageHeader title="Opportunity" icon="bi-graph-up-arrow" back="/opportunities" />
        <EmptyState
          icon="bi-graph-up-arrow"
          title="Opportunity not found"
          message="This opportunity may have been removed or the link is invalid."
          action={<button className="btn btn-primary" onClick={() => navigate('/opportunities')}>Back to Opportunities</button>}
        />
      </div>
    );
  }

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const currentIdx = TRACKER.indexOf(opp.stage);
  const weighted = (opp.value * opp.probability) / 100;

  const saveEdit = () => {
    crm.updateOpportunity(opp.id, {
      name: form.name, company: form.company, contact: form.contact, product: form.product,
      value: Number(form.value) || 0, closing: form.closing, owner: form.owner,
      priority: form.priority, risk: form.risk, competitor: form.competitor, remarks: form.remarks,
    });
    toast.success('Opportunity updated', `${form.name} saved.`);
    setEditOpen(false);
  };

  const nextStage = currentIdx >= 0 && currentIdx < TRACKER.length - 1 ? TRACKER[currentIdx + 1] : null;
  const sf = (k, v) => setStageForm((s) => ({ ...s, [k]: v }));

  const stageDefaults = (stage) => ({
    Requirement: { requirementDetails: opp?.stageData?.Requirement?.requirementDetails || opp?.remarks || '', budgetConfirmed: 'Yes' },
    Demo: { demoDate: '2026-08-20', demoFeedback: '' },
    Proposal: { proposalSentDate: '2026-08-15', proposalValue: opp?.value || '' },
    Won: {},
  }[stage] || {});

  const openAdvance = () => {
    if (!nextStage) return;
    setStageForm(stageDefaults(nextStage));
    setAdvanceOpen(true);
  };

  const applyAdvance = () => {
    if (nextStage === 'Won') {
      crm.updateOpportunity(opp.id, { stage: 'Won', probability: 100 });
      toast.success('Opportunity won', `${opp.name} closed as Won.`);
    } else {
      const patch = {
        stage: nextStage,
        probability: STAGE_PROB[nextStage],
        stageData: { ...(opp.stageData || {}), [nextStage]: stageForm },
      };
      crm.updateOpportunity(opp.id, patch);
      toast.success('Stage advanced', `Moved to ${nextStage} (${STAGE_PROB[nextStage]}%).`);
    }
    setAdvanceOpen(false);
  };

  const jumpToStage = (stage) => {
    if (stage === opp.stage) return;
    crm.updateOpportunity(opp.id, { stage, probability: STAGE_PROB[stage] ?? opp.probability });
    toast.info('Stage changed', `Moved to ${stage} (${STAGE_PROB[stage]}%).`);
  };

  const saveCurrentStage = () => {
    const patch = {
      stageData: { ...(opp.stageData || {}), [opp.stage]: stageForm },
    };
    crm.updateOpportunity(opp.id, patch);
    toast.success('Stage details saved', `Saved details for ${opp.stage}.`);
  };

  const applyClose = () => {
    if (closeResult === 'Lost') {
      crm.updateOpportunity(opp.id, { stage: 'Lost', probability: 0, lossReason });
      toast.warning('Opportunity lost', `Marked as Lost — reason: ${lossReason}.`);
    } else {
      crm.updateOpportunity(opp.id, { stage: 'Won', probability: 100 });
      toast.success('Opportunity won', `${opp.name} closed as Won.`);
    }
    setCloseOpen(false);
  };

  // Removed logActivity function to use LogActivityModal

  const activityColumns = [
    {
      key: 'type', label: 'Type',
      render: (a) => (
        <span className="d-inline-flex align-items-center gap-2">
          <i className={`bi ${activityIcon(a.type)}`} style={{ color: 'var(--primary)' }} />
          {a.type}
        </span>
      ),
    },
    { key: 'subject', label: 'Subject', render: (a) => <span className="fw-6">{a.subject}</span> },
    { key: 'date', label: 'Date', render: (a) => `${formatDate(a.date, { short: true })} · ${a.time}` },
    { key: 'conductedBy', label: 'By', render: (a) => <UserCell name={a.conductedBy} /> },
    { key: 'priority', label: 'Priority', render: (a) => <Badge tone={priorityTone(a.priority)}>{a.priority}</Badge> },
    { key: 'status', label: 'Status', render: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge> },
  ];

  return (
    <div className="page">
      <PageHeader
        title={opp.name}
        subtitle={`${opp.number} · ${opp.company}`}
        icon="bi-graph-up-arrow"
        back="/opportunities"
        actions={
          <>
            <button className="btn btn-light" onClick={() => { setForm(opp); setEditOpen(true); }}><i className="bi bi-pencil" /> Edit</button>
            <button className="btn btn-primary" onClick={() => setCloseOpen(true)}><i className="bi bi-flag" /> Close Opportunity</button>
          </>
        }
      />

      {/* Hero surface */}
      <div className="surface p-4 mb-4">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div style={{ minWidth: 0 }}>
            <h2 className="fw-7 mb-1" style={{ fontSize: 22 }}>{opp.name}</h2>
            <div className="text-secondary-c">
              <Link to={`/companies/${opp.companyId}`}>{opp.company}</Link>
              {opp.contact && <span className="text-muted-c"> · {opp.contact}</span>}
            </div>
            <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
              <Badge tone={statusTone(opp.stage)}>{opp.stage}</Badge>
            </div>
          </div>
          <div className="text-end" style={{ minWidth: 220 }}>
            <div className="fs-12 text-muted-c">Estimated Value</div>
            <div className="fw-7 mono" style={{ fontSize: 30, fontWeight: 800, color: 'var(--primary)' }}>{formatINR(opp.value)}</div>
            <div className="d-flex align-items-center justify-content-end gap-2 mt-2">
              <span className="fw-7" style={{ fontSize: 18 }}>{opp.probability}%</span>
              <span className="fs-12 text-muted-c">probability</span>
            </div>
            <div style={{ marginTop: 6 }}><Meter value={opp.probability} tone="var(--primary)" /></div>
          </div>
        </div>
      </div>

      {/* Stage progress tracker */}
      <div className="surface p-4 mb-4">
        <div className="fw-7 mb-3" style={{ fontSize: 14 }}>Stage Progress</div>
        <div style={{ overflowX: 'auto' }}>
          <div className="d-flex align-items-center" style={{ minWidth: 640 }}>
            {TRACKER.map((stage, i) => {
              const isDone = currentIdx > i && currentIdx !== -1;
              const isCurrent = currentIdx === i;
              const bg = isCurrent ? 'var(--primary)' : isDone ? 'var(--success)' : '#e2e8f0';
              const fg = isCurrent || isDone ? '#fff' : 'var(--text-muted)';
              const lineDone = currentIdx > i && currentIdx !== -1;
              return (
                <div key={stage} className="d-flex align-items-center" style={{ flex: i < TRACKER.length - 1 ? 1 : '0 0 auto' }}>
                  <div className="d-flex flex-column align-items-center" style={{ flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => jumpToStage(stage)}
                      title={`Jump to ${stage}`}
                      className="d-inline-flex align-items-center justify-content-center"
                      style={{ width: 34, height: 34, borderRadius: '50%', background: bg, color: fg, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none' }}>
                      {isDone ? <i className="bi bi-check-lg" /> : i + 1}
                    </button>
                    <span className="fs-12 mt-2" style={{ color: isCurrent ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: isCurrent ? 700 : 500, whiteSpace: 'nowrap' }}>
                      {stage}
                    </span>
                  </div>
                  {i < TRACKER.length - 1 && (
                    <div style={{ flex: 1, height: 3, margin: '0 8px', marginBottom: 22, background: lineDone ? 'var(--success)' : '#e2e8f0', borderRadius: 2 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {opp.stage === 'Lost' && (
          <div className="mt-3">
            <Badge tone="tone-red" icon="bi-x-octagon">Lost{opp.lossReason ? ` · ${opp.lossReason}` : ''}</Badge>
          </div>
        )}


        {/* Captured stage details */}
        {opp.stageData && Object.keys(opp.stageData).filter(stg => stg !== opp.stage).length > 0 && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="fs-12 fw-7 text-muted-c mb-2" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Previous Stage Notes</div>
            <div className="d-flex flex-column gap-2">
              {Object.entries(opp.stageData).filter(([stg]) => stg !== opp.stage).map(([stg, data]) => (
                <div key={stg} className="d-flex gap-2 fs-13">
                  <Badge tone={statusTone(stg)}>{stg}</Badge>
                  <span className="text-secondary-c">
                    {Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Stage Details Form */}
        {!['Won', 'Lost'].includes(opp.stage) && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="fs-12 fw-7 text-primary-c mb-3" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Current Stage: {opp.stage}</div>
            
            {opp.stage === 'Requirement' && (
              <div className="row g-3">
                <Field label="Requirement Details" col={12}>
                  <textarea className="form-control" rows={3} value={stageForm.requirementDetails || ''} onChange={(e) => sf('requirementDetails', e.target.value)} />
                </Field>
                <Field label="Budget Confirmed" col={6}>
                  <select className="form-select" value={stageForm.budgetConfirmed || ''} onChange={(e) => sf('budgetConfirmed', e.target.value)}>
                    <option>Yes</option><option>No</option>
                  </select>
                </Field>
              </div>
            )}
            
            {opp.stage === 'Demo' && (
              <div className="row g-3">
                <Field label="Demo Date" col={6}>
                  <input type="date" className="form-control" value={stageForm.demoDate || ''} onChange={(e) => sf('demoDate', e.target.value)} />
                </Field>
                <Field label="Feedback" col={12}>
                  <textarea className="form-control" rows={2} value={stageForm.demoFeedback || ''} onChange={(e) => sf('demoFeedback', e.target.value)} />
                </Field>
              </div>
            )}

            {opp.stage === 'Proposal' && (
              <div className="row g-3">
                <Field label="Proposal Sent Date" col={6}>
                  <input type="date" className="form-control" value={stageForm.proposalSentDate || ''} onChange={(e) => sf('proposalSentDate', e.target.value)} />
                </Field>
                <Field label="Proposal Value" col={6}>
                  <input type="number" className="form-control" value={stageForm.proposalValue || ''} onChange={(e) => sf('proposalValue', e.target.value)} />
                </Field>
              </div>
            )}

            <div className="mt-3 text-end">
              <button className="btn btn-primary btn-sm" onClick={saveCurrentStage}>Save {opp.stage} Details</button>
            </div>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-2 mb-4">
        <div className="surface p-4">
          <Section title="Deal Information" icon="bi-info-circle">
            <div className="dl">
              <Row label="Company"><Link to={`/companies/${opp.companyId}`}>{opp.company}</Link></Row>
              <Row label="Contact">{opp.contact || '—'}</Row>
              <Row label="Product">{opp.product || '—'}</Row>
              <Row label="Probability">{opp.probability}%</Row>
              <Row label="Estimated Value"><span className="mono">{formatINRFull(opp.value)}</span></Row>
              <Row label="Currency">{opp.currency || 'INR'}</Row>
              <Row label="Priority"><Badge tone={priorityTone(opp.priority)}>{opp.priority}</Badge></Row>
              <Row label="Risk"><Badge tone={riskTone(opp.risk)}>{opp.risk || '—'}</Badge></Row>
              <Row label="Competitor">{opp.competitor || '—'}</Row>
              <Row label="Remarks">{opp.remarks || '—'}</Row>
            </div>
          </Section>
        </div>

        <div className="surface p-4">
          <Section title="Relationships & Forecast" icon="bi-diagram-3">
            <div className="dl">
              <Row label="Linked Lead">
                {opp.leadId ? <Link to={`/leads/${opp.leadId}`} className="mono">{opp.leadId}</Link> : '—'}
              </Row>
              <Row label="Marketing Person"><UserCell name={opp.owner} /></Row>
              <Row label="Weighted Value"><span className="mono fw-7" style={{ color: 'var(--success)' }}>{formatINR(weighted)}</span></Row>
              <Row label="Stage"><Badge tone={statusTone(opp.stage)}>{opp.stage}</Badge></Row>
            </div>
            <div className="mt-3">
              <div className="fs-12 text-muted-c mb-1">Win probability</div>
              <Meter value={opp.probability} tone="var(--primary)" />
            </div>
          </Section>
        </div>
      </div>

      {/* Activities */}
      <Section
        title="Activity Timeline"
        subtitle={`${activities.length + followUps.length} events logged`}
        icon="bi-activity"
        right={
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-primary btn-sm" onClick={() => setFollowUpOpen(true)}>
              <i className="bi bi-calendar-plus" /> Schedule Follow-up
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setLogActOpen(true)}>
              <i className="bi bi-plus-lg" /> Log Activity
            </button>
          </div>
        }
      >
        <div className="surface p-3 mt-3">
          <Timeline groups={mixedToTimeline(activities, followUps)} />
        </div>
      </Section>

      {/* Edit Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Opportunity"
        subtitle={opp.number}
        icon="bi-pencil"
        width={560}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}><i className="bi bi-check-lg" /> Save Changes</button>
          </>
        }
      >
        <div className="row">
          <Field label="Opportunity Name" col={12}>
            <input className="form-control" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} />
          </Field>
          <Field label="Company" col={6}>
            <input className="form-control" value={form.company || ''} onChange={(e) => setField('company', e.target.value)} />
          </Field>
          <Field label="Contact" col={6}>
            <input className="form-control" value={form.contact || ''} onChange={(e) => setField('contact', e.target.value)} />
          </Field>
          <Field label="Product" col={6}>
            <select className="form-select" value={form.product || ''} onChange={(e) => setField('product', e.target.value)}>
              {products.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Estimated Value (₹)" col={6}>
            <input type="number" className="form-control" value={form.value ?? ''} onChange={(e) => setField('value', e.target.value)} />
          </Field>

          <Field label="Marketing Person" col={6}>
            <select className="form-select" value={form.owner || ''} onChange={(e) => setField('owner', e.target.value)}>
              {salespeople.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Priority" col={6}>
            <select className="form-select" value={form.priority || ''} onChange={(e) => setField('priority', e.target.value)}>
              {priorities.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Risk" col={6}>
            <select className="form-select" value={form.risk || ''} onChange={(e) => setField('risk', e.target.value)}>
              {RISKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Competitor" col={12}>
            <input className="form-control" value={form.competitor || ''} onChange={(e) => setField('competitor', e.target.value)} />
          </Field>
          <Field label="Remarks" col={12}>
            <textarea className="form-control" rows={3} value={form.remarks || ''} onChange={(e) => setField('remarks', e.target.value)} />
          </Field>
        </div>
      </Drawer>

      {/* Advance Stage Modal — captures per-stage data */}
      <Modal
        open={advanceOpen}
        onClose={() => setAdvanceOpen(false)}
        title={`Advance to ${nextStage || ''}`}
        subtitle={nextStage ? `Probability will be set to ${STAGE_PROB[nextStage]}%` : ''}
        icon="bi-arrow-right-circle"
        tone="primary"
        footer={
          <>
            <button className="btn btn-light" onClick={() => setAdvanceOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={applyAdvance}>Advance <i className="bi bi-arrow-right" /></button>
          </>
        }
      >
        <div className="row">
          {nextStage === 'Requirement' && (
            <>
              <Field label="Requirement Details" col={12}>
                <textarea className="form-control" rows={3} value={stageForm.requirementDetails || ''} onChange={(e) => sf('requirementDetails', e.target.value)} placeholder="Confirmed scope, modules, integrations…" />
              </Field>
              <Field label="Budget Confirmed" col={12}>
                <select className="form-select" value={stageForm.budgetConfirmed || 'Yes'} onChange={(e) => sf('budgetConfirmed', e.target.value)}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </Field>
            </>
          )}
          {nextStage === 'Demo' && (
            <>
              <Field label="Demo Date" col={6}>
                <input type="date" className="form-control" value={stageForm.demoDate || ''} onChange={(e) => sf('demoDate', e.target.value)} />
              </Field>
              <Field label="Demo Feedback" col={12}>
                <textarea className="form-control" rows={3} value={stageForm.demoFeedback || ''} onChange={(e) => sf('demoFeedback', e.target.value)} placeholder="How did the demo go? Key reactions…" />
              </Field>
            </>
          )}
          {nextStage === 'Won' && (
            <div className="col-12 fs-14">
              Advancing to <b>Won</b> marks this opportunity as closed-won at 100% probability.
            </div>
          )}
        </div>
      </Modal>

      {/* Close Modal */}
      <Modal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Close Opportunity"
        subtitle="Mark this deal as Won or Lost"
        icon="bi-flag"
        tone={closeResult === 'Lost' ? 'danger' : 'success'}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setCloseOpen(false)}>Cancel</button>
            <button className={`btn btn-${closeResult === 'Lost' ? 'danger' : 'primary'}`} onClick={applyClose}>
              Mark as {closeResult}
            </button>
          </>
        }
      >
        <Field label="Outcome" col={12}>
          <select className="form-select" value={closeResult} onChange={(e) => setCloseResult(e.target.value)}>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </Field>
        {closeResult === 'Lost' && (
          <Field label="Loss Reason" required col={12}>
            <select className="form-select" value={lossReason} onChange={(e) => setLossReason(e.target.value)}>
              {LOSS_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        )}
      </Modal>

      {logActOpen && (
        <LogActivityModal
          open={logActOpen}
          onClose={(action) => {
            setLogActOpen(false);
            if (action === 'open-followup') setFollowUpOpen(true);
          }}
          entity={opp}
          entityType="Opportunity"
        />
      )}

      {followUpOpen && (
        <FollowUpModal
          open={followUpOpen}
          onClose={() => setFollowUpOpen(false)}
          entity={opp}
          entityType="Opportunity"
        />
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="d-flex py-2" style={{ borderBottom: '1px solid var(--border)', gap: 12 }}>
      <div className="fs-13 text-muted-c" style={{ width: 150, flexShrink: 0 }}>{label}</div>
      <div className="fs-13 fw-6" style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
