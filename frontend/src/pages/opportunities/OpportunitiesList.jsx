import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, Avatar, UserCell, EmptyState, Meter, Field } from '../../components/common/Ui';
import { Drawer } from '../../components/common/Overlay';
import { StatCard } from '../../components/common/PageParts';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate, statusTone, priorityTone, riskTone } from '../../utils/format';
import { products, priorities, salespeople } from '../../data/mockData';
import { Milestone } from 'lucide-react';

const STAGES = [
  { key: 'Qualification', label: 'Qualification', color: '#2563eb' },
  { key: 'Requirement', label: 'Requirement', color: '#4f46e5' },
  { key: 'Demo', label: 'Demo', color: '#0891b2' },
  { key: 'Proposal', label: 'Proposal', color: '#8b5cf6' },
  { key: 'Won', label: 'Won', color: '#16a34a' },
  { key: 'Lost', label: 'Lost', color: '#dc2626' },
];

const STAGE_PROB = {
  Qualification: 10, Requirement: 30, Demo: 50, Proposal: 70, Won: 100, Lost: 0,
};

const RISKS = ['Low', 'Medium', 'High'];

const emptyForm = {
  leadId: '', name: '', company: '', companyId: '', contact: '', product: 'Manufacturing ERP', stage: 'Qualification',
  value: '', closing: '', owner: 'Arun Kumar', priority: 'Medium', risk: 'Medium',
  competitor: '', remarks: '',
};

export default function OpportunitiesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const crm = useCrm();
  const toast = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [fStage, setFStage] = useState('');
  const [fPriority, setFPriority] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    stage: '', priority: '', from: '', to: ''
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      const lId = searchParams.get('leadId');
      if (lId) {
        pickLead(lId);
      }
      setDrawerOpen(true);
      searchParams.delete('new');
      if (lId) searchParams.delete('leadId');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opps = crm.opportunities;

  const kpis = useMemo(() => {
    const total = opps.length;
    const pipeline = opps.filter((o) => o.stage !== 'Lost').reduce((a, o) => a + o.value, 0);
    const open = opps.filter((o) => !['Won', 'Lost'].includes(o.stage));
    const weighted = open.reduce((a, o) => a + (o.value * o.probability) / 100, 0);
    const closingThisMonth = open.filter((o) => {
      const d = new Date(o.closing);
      return d.getFullYear() === 2026 && d.getMonth() === 7; // August
    }).length;
    const won = opps.filter((o) => o.stage === 'Won').length;
    const lost = opps.filter((o) => o.stage === 'Lost').length;
    return { total, pipeline, weighted, closingThisMonth, won, lost };
  }, [opps]);

  const filtered = useMemo(() => opps.filter((o) => {
    if (appliedFilters.stage && o.stage !== appliedFilters.stage) return false;
    if (appliedFilters.priority && o.priority !== appliedFilters.priority) return false;
    if (appliedFilters.from && o.closing < appliedFilters.from) return false;
    if (appliedFilters.to && o.closing > appliedFilters.to) return false;
    return true;
  }), [opps, appliedFilters]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Leads eligible to convert: qualified/open leads NOT already linked to an opportunity
  const eligibleLeads = useMemo(() => {
    const linked = new Set(crm.opportunities.map((o) => o.leadId).filter(Boolean));
    return crm.leads.filter(
      (l) => !linked.has(l.id) && l.status !== 'Lost'
    );
  }, [crm.leads, crm.opportunities]);

  // Selecting a lead auto-fills the opportunity from the lead's company/contact/product/value
  const pickLead = (leadId) => {
    if (!leadId) { setForm((f) => ({ ...f, leadId: '' })); return; }
    const l = crm.leads.find((x) => x.id === leadId);
    if (!l) return;
    setForm((f) => ({
      ...f,
      leadId: l.id,
      name: l.product ? `${l.product} — ${l.company}` : f.name,
      company: l.company,
      companyId: l.companyId || '',
      contact: l.contact || '',
      product: l.product || f.product,
      value: l.value != null ? String(l.value) : f.value,
      closing: l.closing || f.closing,
      owner: l.assignedTo || l.owner || f.owner,
      priority: l.priority || f.priority,
      competitor: l.competitors || f.competitor,
      remarks: l.requirement || f.remarks,
    }));
  };

  const submit = () => {
    if (!form.name.trim() || !form.company.trim()) {
      toast.error('Missing details', 'Opportunity name and company are required.');
      return;
    }
    if (form.id) {
      crm.updateOpportunity(form.id, {
        ...form,
        value: Number(form.value) || 0,
        probability: STAGE_PROB[form.stage] ?? 10,
      });
      toast.success('Opportunity updated', `${form.name} has been updated.`);
    } else {
      const created = crm.addOpportunity({
        ...form,
        value: Number(form.value) || 0,
        probability: STAGE_PROB[form.stage] ?? 10,
      });
      if (form.leadId) {
        crm.updateLead(form.leadId, { status: 'Converted', converted: true, opportunityId: created.id });
        toast.success('Lead converted', `Linked to ${created.number} — lead marked Converted.`);
      } else {
        toast.success('Opportunity created', `${form.name} added to the pipeline.`);
      }
    }
    setForm(emptyForm);
    setDrawerOpen(false);
  };

  const openEdit = (o) => {
    setForm({
      id: o.id,
      name: o.name || '',
      company: o.company || '',
      companyId: o.companyId || '',
      contact: o.contact || '',
      product: o.product || 'Manufacturing ERP',
      stage: o.stage || 'Qualification',
      value: o.value != null ? String(o.value) : '',
      closing: o.closing || '',
      owner: o.owner || 'Arun Kumar',
      priority: o.priority || 'Medium',
      risk: o.risk || 'Medium',
      competitor: o.competitor || '',
      remarks: o.remarks || '',
    });
    setDrawerOpen(true);
  };

  const handleMove = (item, newStage) => {
    crm.updateOpportunity(item.id, { stage: newStage, probability: STAGE_PROB[newStage] ?? item.probability });
    toast.success('Stage updated', `${item.name} moved to ${newStage}.`);
  };

  const doDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      crm.deleteOpportunity(item.id);
      toast.success('Opportunity Deleted', 'The opportunity was removed.');
    }
  };

  const columns = [
    { key: 'number', label: 'Opp No', sortable: true, className: 'mono text-nowrap', render: (r) => r.number },
    {
      key: 'name', label: 'Opportunity', sortable: true,
      render: (r) => (
        <div>
          <div className="fw-6 text-nowrap">{r.name}</div>
        </div>
      ),
    },
    { key: 'company', label: 'Company', className: 'text-nowrap', render: (r) => r.company },
    { key: 'stage', label: 'Stage', className: 'text-nowrap', render: (r) => <Badge tone={statusTone(r.stage)}>{r.stage}</Badge> },
    {
      key: 'probability', label: 'Probability', width: '140px',
      render: (r) => (
        <div style={{ minWidth: 96 }}>
          <div className="d-flex justify-content-between fs-12 mb-1"><span>{r.probability}%</span></div>
          <Meter value={r.probability} tone="var(--primary)" />
        </div>
      ),
    },
    {
      key: 'value', label: 'Value', sortable: true, accessor: (r) => r.value, className: 'mono text-nowrap',
      render: (r) => <span className="mono fw-6 text-nowrap">{formatINR(r.value)}</span>,
    },
    { key: 'owner', label: 'Marketing Person', className: 'text-nowrap', render: (r) => <UserCell name={r.owner} /> },
    {
      key: 'actions', label: 'Action', width: '130px',
      render: (r) => (
        <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <ActionIconButton type="view" tooltip="View Stages" icon={Milestone} onClick={() => navigate(`/opportunities/${r.id}`)} />
          <ActionIconButton type="delete" onClick={() => doDelete(r)} />
        </div>
      ),
    },
  ];

  const handleSearch = () => {
    setAppliedFilters({ stage: fStage, priority: fPriority, from: fromDate, to: toDate });
  };

  const handleClear = () => {
    setFStage(''); setFPriority(''); setFromDate(''); setToDate('');
    setAppliedFilters({ stage: '', priority: '', from: '', to: '' });
  };

  const filterControls = (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <select className="form-select form-select-sm" style={{ width: 130 }} value={fStage} onChange={(e) => setFStage(e.target.value)}>
        <option value="">All Stages</option>
        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 130 }} value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
        <option value="">All Priorities</option>
        {priorities.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
      </select>
    </div>
  );

  const renderCard = (item) => {
    const stage = STAGES.find((s) => s.key === item.stage);
    return (
      <div>
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div style={{ minWidth: 0 }}>
            <div className="fw-6 text-truncate">{item.name}</div>
            <div className="fs-12 text-muted-c text-truncate">{item.company}</div>
          </div>
          <button className="icon-btn" title="Open" style={{ flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/opportunities/${item.id}`); }}>
            <i className="bi bi-box-arrow-up-right" style={{ fontSize: 13 }} />
          </button>
        </div>
        <div className="d-flex align-items-center justify-content-between mt-2">
          <span className="mono fw-7">{formatINR(item.value)}</span>
          <Badge tone="tone-blue">{item.probability}%</Badge>
        </div>
        <div className="fs-12 text-muted-c mt-2">Expected: {formatDate(item.closing, { short: true })}</div>
        <div className="d-flex align-items-center justify-content-between mt-2">
          <Badge tone={riskTone(item.risk)}>{item.risk || '—'} risk</Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <PageHeader
        title="Opportunities"
        subtitle="Track deals through every stage of the sales pipeline"
        icon="bi-graph-up-arrow"
        actions={
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setDrawerOpen(true); }}>
            <i className="bi bi-plus-lg" /> New Opportunity
          </button>
        }
      />



      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex flex-wrap align-items-center gap-3 bg-white p-2 border rounded shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-13 fw-6 text-secondary-c">From</span>
            <input type="date" className="form-control form-control-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="fs-13 fw-6 text-secondary-c">To</span>
            <input type="date" className="form-control form-control-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <div className="d-flex align-items-center gap-2 border-start ps-3">
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={handleSearch}>
              <i className="bi bi-search" /> Search
            </button>
            <button className="btn btn-light btn-sm d-flex align-items-center gap-2" onClick={handleClear}>
              <i className="bi bi-x-circle" /> Cancel
            </button>
          </div>
        </div>
        <div className="fs-13 text-muted-c">{filtered.length} of {opps.length} opps</div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={(r) => navigate(`/opportunities/${r.id}`)}
        searchPlaceholder="Search opportunities..."
        searchKeys={['name', 'number', 'company', 'contact', 'product', 'owner']}
        filters={filterControls}
        empty={<EmptyState icon="bi-graph-up-arrow" title="No opportunities found"
          message="Adjust your filters or create a new opportunity."
          action={<button className="btn btn-primary" onClick={() => { setForm(emptyForm); setDrawerOpen(true); }}><i className="bi bi-plus-lg" /> New Opportunity</button>} />}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={form.id ? "Edit Opportunity" : "New Opportunity"}
        subtitle={form.id ? "Update deal details" : "Add a deal to your pipeline"}
        icon="bi-graph-up-arrow"
        width={560}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setDrawerOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}><i className="bi bi-check-lg" /> {form.id ? "Save Changes" : "Create Opportunity"}</button>
          </>
        }
      >
        <div className="row">
          {!form.id && (
            <Field label="Convert from Lead" col={12} hint="Pick a qualified lead to auto-fill this opportunity — the lead is then marked Converted">
              <select className="form-select" value={form.leadId || ''} onChange={(e) => pickLead(e.target.value)}>
                <option value="">— Start blank (no lead) —</option>
                {eligibleLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.number} · {l.company} · {l.product} · {formatINR(l.value)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {!form.id && form.leadId && (
            <div className="col-12 mb-3">
              <div className="chip" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                <i className="bi bi-link-45deg" /> Auto-filled from lead {form.leadId}
              </div>
            </div>
          )}
          <Field label="Opportunity Name" required col={12}>
            <input className="form-control" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Manufacturing ERP Implementation" />
          </Field>
          <Field label="Company" required col={6}>
            <input className="form-control" value={form.company} onChange={(e) => setField('company', e.target.value)} placeholder="Company name" />
          </Field>
          <Field label="Contact" col={6}>
            <input className="form-control" value={form.contact} onChange={(e) => setField('contact', e.target.value)} placeholder="Contact person" />
          </Field>
          <Field label="Product" col={6}>
            <select className="form-select" value={form.product} onChange={(e) => setField('product', e.target.value)}>
              {products.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Stage" col={6} hint={`Probability auto-set to ${STAGE_PROB[form.stage]}%`}>
            <select className="form-select" value={form.stage} onChange={(e) => setField('stage', e.target.value)}>
              {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Estimated Value (₹)" col={6}>
            <input type="number" className="form-control" value={form.value} onChange={(e) => setField('value', e.target.value)} placeholder="2500000" />
          </Field>
          <Field label="Expected Closing" col={6}>
            <input type="date" className="form-control" value={form.closing} onChange={(e) => setField('closing', e.target.value)} />
          </Field>
          <Field label="Marketing Person" col={6}>
            <select className="form-select" value={form.owner} onChange={(e) => setField('owner', e.target.value)}>
              {salespeople.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="Priority" col={6}>
            <select className="form-select" value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
              {priorities.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Risk" col={6}>
            <select className="form-select" value={form.risk} onChange={(e) => setField('risk', e.target.value)}>
              {RISKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Competitor" col={6}>
            <input className="form-control" value={form.competitor} onChange={(e) => setField('competitor', e.target.value)} placeholder="Competing vendor" />
          </Field>
          <Field label="Remarks" col={12}>
            <textarea className="form-control" rows={3} value={form.remarks} onChange={(e) => setField('remarks', e.target.value)} placeholder="Notes about this opportunity" />
          </Field>
        </div>
      </Drawer>
    </div>
  );
}
