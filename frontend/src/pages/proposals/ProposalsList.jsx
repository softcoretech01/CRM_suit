import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, Avatar, UserCell } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';

export default function ProposalsList() {
  const navigate = useNavigate();
  const { proposals } = useCrm();
  const [fStatus, setFStatus] = useState('');

  const filtered = useMemo(() => proposals.filter((p) => !fStatus || p.status === fStatus), [proposals, fStatus]);

  const kpis = useMemo(() => ({
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'Draft').length,
    sent: proposals.filter(p => p.status === 'Sent').length,
    accepted: proposals.filter(p => p.status === 'Accepted').length,
  }), [proposals]);

  const columns = [
    { key: 'number', label: 'Proposal #', sortable: true, render: r => <span className="mono fw-6 text-primary-c">{r.number}</span> },
    { key: 'name', label: 'Proposal Name', sortable: true, render: r => <span className="fw-6">{r.name}</span> },
    { key: 'company', label: 'Customer', sortable: true, render: r => (
      <div className="d-flex align-items-center gap-2">
        <Avatar name={r.company} size="sm" />
        <span className="text-truncate" style={{ maxWidth: 150 }}>{r.company}</span>
      </div>
    ) },
    { key: 'template', label: 'Template', render: r => <Badge tone="tone-gray">{r.template}</Badge> },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'version', label: 'Version', render: r => <span className="badge-pill tone-blue">{r.version}</span> },
    { key: 'createdBy', label: 'Created By', render: r => <UserCell name={r.createdBy} /> },
    { key: 'status', label: 'Status', sortable: true, render: r => {
        const tones = { Draft: 'tone-gray', Sent: 'tone-blue', Accepted: 'tone-green', Archived: 'tone-amber' };
        return <Badge tone={tones[r.status] || 'tone-gray'} dot>{r.status}</Badge>;
    } },
    { key: 'actions', label: 'Action', width: '100px', render: r => (
      <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
        <ActionIconButton type="view" onClick={() => navigate(`/proposals/${r.id}`)} />
        <ActionIconButton type="view" icon="bi-file-earmark-pdf" tooltip="Generate PDF" onClick={() => {}} />
      </div>
    ) },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Proposals"
        subtitle="Manage professional business proposals"
        icon="bi-file-earmark-check"
        actions={<button className="btn btn-primary" onClick={() => navigate('/proposals/new')}><i className="bi bi-plus-lg" /> New Proposal</button>}
      />



      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={r => navigate(`/proposals/${r.id}`)}
        searchPlaceholder="Search proposals by name or number..."
        searchKeys={['name', 'number', 'company']}
        pageSize={10}
      />
    </div>
  );
}
