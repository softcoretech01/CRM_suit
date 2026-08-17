import { useState, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';

export default function EmailCampaigns() {
  const { emailCampaigns } = useCrm();
  const [fStatus, setFStatus] = useState('');

  const filtered = useMemo(() => emailCampaigns.filter((c) => !fStatus || c.status === fStatus), [emailCampaigns, fStatus]);

  const kpis = useMemo(() => ({
    total: emailCampaigns.length,
    sent: emailCampaigns.filter(c => c.status === 'Sent').length,
    scheduled: emailCampaigns.filter(c => c.status === 'Scheduled').length,
    drafts: emailCampaigns.filter(c => c.status === 'Draft').length,
  }), [emailCampaigns]);

  const columns = [
    { key: 'code', label: 'Campaign Code', sortable: true, render: r => <span className="mono fw-6 text-primary-c">{r.code}</span> },
    { key: 'name', label: 'Campaign Name', sortable: true, render: r => <span className="fw-6">{r.name}</span> },
    { key: 'audience', label: 'Audience', render: r => <Badge tone="tone-blue">{r.audience}</Badge> },
    { key: 'product', label: 'Product Focus', render: r => <span className="fs-13">{r.product}</span> },
    { key: 'startDate', label: 'Start Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: r => {
        const tones = { Draft: 'tone-gray', Scheduled: 'tone-amber', Sent: 'tone-green' };
        return <Badge tone={tones[r.status] || 'tone-gray'} dot>{r.status}</Badge>;
    } },
    { key: 'stats', label: 'Performance', width: '200px', render: r => {
      if (r.status !== 'Sent') return <span className="text-muted-c fs-12">—</span>;
      const openRate = ((r.opened / r.delivered) * 100).toFixed(1);
      const clickRate = ((r.clicked / r.opened) * 100).toFixed(1);
      return (
        <div>
          <div className="d-flex justify-content-between fs-11 text-muted-c mb-1">
            <span>Open: <strong>{openRate}%</strong></span>
            <span>Click: <strong>{clickRate}%</strong></span>
          </div>
          <div className="progress" style={{ height: 4 }}>
            <div className="progress-bar bg-success-c" style={{ width: `${openRate}%` }}></div>
            <div className="progress-bar bg-info-c" style={{ width: `${clickRate}%` }}></div>
          </div>
        </div>
      );
    }},
    { key: 'actions', label: 'Action', width: '90px', render: r => (
      <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
        <ActionIconButton type="view" icon="bi-bar-chart" tooltip="View Report" onClick={() => {}} />
        <ActionIconButton type="edit" tooltip="Edit/Duplicate" onClick={() => {}} />
      </div>
    ) },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Email Campaigns"
        subtitle="Create, schedule and track email marketing campaigns"
        icon="bi-envelope-paper"
        actions={<button className="btn btn-primary"><i className="bi bi-plus-lg" /> New Campaign</button>}
      />



      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={() => {}}
        searchPlaceholder="Search campaigns by name, code, or audience..."
        searchKeys={['name', 'code', 'audience', 'product']}
        pageSize={10}
      />
    </div>
  );
}
