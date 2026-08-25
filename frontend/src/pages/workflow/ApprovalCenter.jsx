import { useState, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, UserCell } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';

export default function ApprovalCenter() {
  const { pendingApprovals, setPendingApprovals } = useCrm();
  const toast = useToast();
  const [fStatus, setFStatus] = useState('Pending');

  const filtered = useMemo(() => pendingApprovals.filter((a) => !fStatus || a.status === fStatus), [pendingApprovals, fStatus]);

  const kpis = useMemo(() => ({
    total: pendingApprovals.length,
    pending: pendingApprovals.filter(a => a.status === 'Pending').length,
    approved: pendingApprovals.filter(a => a.status === 'Approved').length,
    rejected: pendingApprovals.filter(a => a.status === 'Rejected').length,
  }), [pendingApprovals]);

  const handleAction = (id, action) => {
    setPendingApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
    toast.success('Success', `Approval request marked as ${action}`);
  };

  const columns = [
    { key: 'type', label: 'Type', sortable: true, render: r => <Badge tone="tone-gray">{r.type}</Badge> },
    { key: 'reference', label: 'Reference', sortable: true, render: r => <span className="mono fw-6 text-primary-c">{r.reference}</span> },
    { key: 'requestedBy', label: 'Requested By', render: r => <UserCell name={r.requestedBy} hideAvatar /> },
    { key: 'amount', label: 'Amount', sortable: true, render: r => <span className="mono fw-6">{formatINR(r.amount)}</span> },
    { key: 'date', label: 'Date Submitted', sortable: true },
    { key: 'priority', label: 'Priority', render: r => {
        const tones = { High: 'tone-red', Medium: 'tone-amber', Low: 'tone-gray' };
        return <Badge tone={tones[r.priority] || 'tone-gray'}>{r.priority}</Badge>;
    } },
    { key: 'status', label: 'Status', render: r => {
        const tones = { Pending: 'tone-amber', Approved: 'tone-green', Rejected: 'tone-red' };
        return <Badge tone={tones[r.status] || 'tone-gray'} dot>{r.status}</Badge>;
    } },
    { key: 'actions', label: 'Action', width: '120px', render: r => (
      <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
        <ActionIconButton type="view" tooltip="View Details" onClick={() => {}} />
        {r.status === 'Pending' && (
          <>
            <ActionIconButton type="status" isActive={false} icon="bi-check-lg" tooltip="Approve" onClick={() => handleAction(r.id, 'Approved')} />
            <ActionIconButton type="delete" icon="bi-x-lg" tooltip="Reject" onClick={() => handleAction(r.id, 'Rejected')} />
          </>
        )}
      </div>
    ) },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Approval Center"
        subtitle="Manage pending approvals for campaigns and more"
        icon="bi-check2-square"
      />



      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        searchPlaceholder="Search approvals by reference or requester..."
        searchKeys={['reference', 'requestedBy', 'type']}
        pageSize={10}
      />
    </div>
  );
}
