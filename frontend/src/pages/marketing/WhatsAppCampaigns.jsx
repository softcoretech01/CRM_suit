import { useState, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';

export default function WhatsAppCampaigns() {
  const { whatsappCampaigns } = useCrm();
  const [fStatus, setFStatus] = useState('');

  const filtered = useMemo(() => whatsappCampaigns.filter((c) => !fStatus || c.status === fStatus), [whatsappCampaigns, fStatus]);

  const kpis = useMemo(() => ({
    total: whatsappCampaigns.length,
    completed: whatsappCampaigns.filter(c => c.status === 'Completed').length,
    active: whatsappCampaigns.filter(c => c.status === 'Active').length,
    drafts: whatsappCampaigns.filter(c => c.status === 'Draft').length,
  }), [whatsappCampaigns]);

  const columns = [
    { key: 'name', label: 'Campaign Name', sortable: true, render: r => <span className="fw-6">{r.name}</span> },
    { key: 'type', label: 'Type', render: r => <Badge tone="tone-gray">{r.type}</Badge> },
    { key: 'audience', label: 'Audience', render: r => <span className="fs-13">{r.audience}</span> },
    { key: 'status', label: 'Status', sortable: true, render: r => {
        const tones = { Draft: 'tone-gray', Active: 'tone-blue', Completed: 'tone-green' };
        return <Badge tone={tones[r.status] || 'tone-gray'} dot>{r.status}</Badge>;
    } },
    { key: 'stats', label: 'Performance (Delivered / Read)', width: '250px', render: r => {
      if (r.status === 'Draft') return <span className="text-muted-c fs-12">—</span>;
      const deliveryRate = ((r.delivered / r.sent) * 100).toFixed(1);
      const readRate = ((r.read / r.delivered) * 100).toFixed(1);
      return (
        <div>
          <div className="d-flex justify-content-between fs-11 text-muted-c mb-1">
            <span>Dlv: <strong>{deliveryRate}%</strong></span>
            <span>Read: <strong>{readRate}%</strong></span>
          </div>
          <div className="progress" style={{ height: 4 }}>
            <div className="progress-bar bg-primary-c" style={{ width: `${deliveryRate}%` }}></div>
            <div className="progress-bar bg-info-c" style={{ width: `${readRate}%` }}></div>
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
        title="WhatsApp Campaigns"
        subtitle="Broadcast messages and manage conversational marketing"
        icon="bi-whatsapp text-success"
        actions={<button className="btn btn-success"><i className="bi bi-plus-lg" /> New Broadcast</button>}
      />



      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={() => {}}
        searchPlaceholder="Search campaigns by name, type, or audience..."
        searchKeys={['name', 'type', 'audience']}
        pageSize={10}
      />
    </div>
  );
}
