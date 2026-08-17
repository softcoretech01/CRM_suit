import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, Avatar, UserCell } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import { QuotationStatusBadge } from '../../components/crm/Quotations';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';
import { formatINR, formatDate } from '../../utils/format';

export default function QuotationsList() {
  const navigate = useNavigate();
  const { quotations } = useCrm();
  const [fStatus, setFStatus] = useState('');

  const filtered = useMemo(() => quotations.filter((q) => !fStatus || q.status === fStatus), [quotations, fStatus]);

  const kpis = useMemo(() => ({
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'Draft').length,
    pending: quotations.filter(q => q.status === 'Pending Approval').length,
    approved: quotations.filter(q => q.status === 'Approved').length,
    sent: quotations.filter(q => q.status === 'Sent').length,
    accepted: quotations.filter(q => q.status === 'Accepted').length,
  }), [quotations]);

  const columns = [
    { key: 'number', label: 'Quotation', sortable: true, render: r => <span className="fw-6 text-primary-c">{r.number}</span> },
    { key: 'company', label: 'Customer', sortable: true, render: r => (
      <div className="d-flex align-items-center gap-2">
        <Avatar name={r.company} size="sm" />
        <div style={{ minWidth: 0 }}>
          <div className="fw-6 text-truncate">{r.company}</div>
          <div className="fs-12 text-muted-c text-truncate">{r.contact}</div>
        </div>
      </div>
    ) },
    { key: 'total', label: 'Amount', sortable: true, render: r => <span className="mono fw-6">{formatINR(r.total)}</span> },
    { key: 'date', label: 'Valid Until', sortable: true, render: r => <span className="fs-13">{formatDate(r.date, { short: true })}</span> },
    { key: 'salesExecutive', label: 'Owner', render: r => <UserCell name={r.salesExecutive} /> },
    { key: 'status', label: 'Status', sortable: true, render: r => <QuotationStatusBadge status={r.status} /> },
    { key: 'actions', label: 'Action', width: '100px', render: r => (
      <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
        <ActionIconButton type="view" onClick={() => navigate(`/quotations/${r.id}`)} />
        <ActionIconButton type="view" icon="bi-file-earmark-pdf" tooltip="Download PDF" onClick={() => {}} />
      </div>
    ) },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Quotations"
        subtitle="Manage sales quotations and pricing approvals"
        icon="bi-receipt"
        actions={<button className="btn btn-primary" onClick={() => navigate('/quotations/new')}><i className="bi bi-plus-lg" /> New Quotation</button>}
      />



      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={r => navigate(`/quotations/${r.id}`)}
        searchPlaceholder="Search by quote # or customer..."
        searchKeys={['number', 'company']}
        pageSize={10}
      />
    </div>
  );
}
