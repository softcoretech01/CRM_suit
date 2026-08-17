import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, Avatar, UserCell, Meter } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import ActionIconButton from '../../components/common/ActionIconButton';
import { ConvertModal } from '../../components/crm/LeadModals';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import {
  formatINR, formatDate, relativeDue, statusTone, priorityTone, tempClass,
} from '../../utils/format';
import { leadSources, salespeople } from '../../data/mockData';

import { CheckCircle2 } from 'lucide-react';

const KANBAN_COLS = [
  { key: 'Qualified', label: 'Qualified', color: '#7e22ce' },
  { key: 'Converted', label: 'Converted', color: '#16a34a' },
];

export default function LeadsList() {
  const navigate = useNavigate();
  const { leads, activities, updateLead, deleteLead } = useCrm();
  const toast = useToast();
  const [convertLead, setConvertLead] = useState(null);
  const [fStatus, setFStatus] = useState('');
  const [fSource, setFSource] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    status: '', source: '', from: '', to: ''
  });

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        if (appliedFilters.status && l.status !== appliedFilters.status) return false;
        if (appliedFilters.source && l.source !== appliedFilters.source) return false;
        if (appliedFilters.from && l.date < appliedFilters.from) return false;
        if (appliedFilters.to && l.date > appliedFilters.to) return false;
        return true;
      }),
    [leads, appliedFilters]
  );

  const kpis = useMemo(() => ({
    total: leads.length,
    qualified: leads.filter((l) => l.status === 'Qualified').length,
    hot: leads.filter((l) => l.temperature === 'Hot').length,
    converted: leads.filter((l) => l.status === 'Converted' || l.status === 'Won').length,
  }), [leads]);

  const columns = [
    { key: 'number', label: 'Lead No', sortable: true, className: 'mono text-nowrap', render: (r) => r.number },
    {
      key: 'company', label: 'Lead', sortable: true, className: 'text-nowrap', render: (r) => (
        <div className="d-flex align-items-center gap-2">
          <Avatar name={r.company} size="sm" />
          <div style={{ minWidth: 0 }}>
            <div className="fw-6 text-truncate">{r.company}</div>
            <div className="fs-12 text-muted-c text-truncate">{r.contact}</div>
          </div>
        </div>
      )
    },
    { key: 'source', label: 'Source', className: 'text-nowrap', render: (r) => <Badge tone="tone-gray">{r.source}</Badge> },
    { key: 'assignedTo', label: 'Assigned To', className: 'text-nowrap', render: (r) => <UserCell name={r.assignedTo} /> },
    {
      key: 'conductedBy', label: 'Conducted By', className: 'text-nowrap', render: (r) => {
        const leadActs = activities.filter((a) => a.lead === r.id).sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
        const conductedBy = leadActs.length > 0 ? leadActs[0].conductedBy : '—';
        return <UserCell name={conductedBy} />;
      }
    },
    { key: 'status', label: 'Status', sortable: true, className: 'text-nowrap', render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    { key: 'value', label: 'Est. Value', sortable: true, className: 'text-nowrap', accessor: (r) => r.value, render: (r) => <span className="mono fw-6">{formatINR(r.value)}</span> },
    {
      key: 'actions', label: 'Action', width: '160px', render: (r) => (
        <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {['Converted'].includes(r.status) ? (
            <div title="Converted to Opportunity" className="d-flex align-items-center justify-content-center text-success" style={{ width: 32, height: 32 }}>
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
          ) : r.status !== 'Converted' ? (
            <ActionIconButton type="convert" tooltip="Convert to Opportunity" onClick={() => setConvertLead(r)} />
          ) : (
            <div style={{ width: 32 }} />
          )}
          <ActionIconButton type="view" onClick={() => navigate(`/leads/${r.id}`)} />
          <ActionIconButton type="edit" onClick={() => navigate(`/leads/${r.id}/edit`)} />
          <ActionIconButton type="delete" onClick={() => {
            if (window.confirm(`Are you sure you want to delete ${r.company}?`)) {
              deleteLead(r.id);
              toast.success('Lead deleted', `${r.company} was removed.`);
            }
          }} />
        </div>
      )
    },
  ];

  const handleSearch = () => {
    setAppliedFilters({ status: fStatus, source: fSource, from: fromDate, to: toDate });
  };

  const handleClear = () => {
    setFStatus(''); setFSource(''); setFromDate(''); setToDate('');
    setAppliedFilters({ status: '', source: '', from: '', to: '' });
  };

  const filters = (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <select className="form-select form-select-sm" style={{ width: 130 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
        <option value="">All Status</option>
        {KANBAN_COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>
      <select className="form-select form-select-sm" style={{ width: 130 }} value={fSource} onChange={(e) => setFSource(e.target.value)}>
        <option value="">All Sources</option>
        {leadSources.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  );

  return (
    <div className="page">
      <PageHeader
        title="Leads"
        subtitle="Capture, qualify and convert your sales leads"
        icon="bi-lightning-charge-fill"
        actions={<button className="btn btn-primary" onClick={() => navigate('/leads/new')}><i className="bi bi-plus-lg" /> New Lead</button>}
      />



      {/* View toggle */}
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
        <div className="fs-13 text-muted-c">{filtered.length} of {leads.length} leads</div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={(r) => navigate(`/leads/${r.id}`)}
        searchPlaceholder="Search leads by company, contact, number..."
        searchKeys={['company', 'contact', 'number', 'product', 'assignedTo', 'email', 'mobile']}
        filters={filters}
        pageSize={10}
      />
      <ConvertModal open={!!convertLead} onClose={() => setConvertLead(null)} lead={convertLead} />
    </div>
  );
}
