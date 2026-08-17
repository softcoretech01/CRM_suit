import { useState, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import { AutomationNode } from '../../components/crm/Workflow';
import ActionIconButton from '../../components/common/ActionIconButton';
import { useCrm } from '../../context/CrmContext';

export default function MarketingAutomation() {
  const { automations } = useCrm();
  const [fStatus, setFStatus] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'builder'

  const filtered = useMemo(() => automations.filter((a) => !fStatus || a.status === fStatus), [automations, fStatus]);

  const kpis = useMemo(() => ({
    total: automations.length,
    active: automations.filter(a => a.status === 'Active').length,
    paused: automations.filter(a => a.status === 'Paused').length,
  }), [automations]);

  const columns = [
    { key: 'name', label: 'Workflow Name', sortable: true, render: r => <span className="fw-6">{r.name}</span> },
    { key: 'trigger', label: 'Trigger Event', render: r => <span className="fs-13 text-secondary-c"><i className="bi bi-lightning-charge text-amber-c me-1" /> {r.trigger}</span> },
    { key: 'status', label: 'Status', sortable: true, render: r => {
        const tones = { Paused: 'tone-gray', Active: 'tone-green' };
        return <Badge tone={tones[r.status] || 'tone-gray'} dot>{r.status}</Badge>;
    } },
    { key: 'lastRun', label: 'Last Run' },
    { key: 'executions', label: 'Total Executions', sortable: true, render: r => <span className="fw-6">{r.executions}</span> },
    { key: 'successRate', label: 'Success Rate', sortable: true, render: r => <span className="text-success-c fw-6">{r.successRate}%</span> },
    { key: 'actions', label: 'Action', width: '100px', render: r => (
      <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
        <ActionIconButton type="view" icon="bi-diagram-3" tooltip="View Builder" onClick={() => setView('builder')} />
        <ActionIconButton type="status" isActive={r.status === 'Active'} onClick={() => {}} />
      </div>
    ) },
  ];

  const demoNodes = [
    { id: 1, type: 'TRIGGER', title: 'Lead is Created' },
    { id: 2, type: 'CONDITION', title: 'Source is "Website"' },
    { id: 3, type: 'WAIT', title: 'Wait for 15 minutes' },
    { id: 4, type: 'ACTION', title: 'Send Welcome Email', isLast: true },
  ];

  if (view === 'builder') {
    return (
      <div className="page" style={{ background: 'var(--bg-light)' }}>
        <PageHeader
          title="Workflow Builder"
          subtitle="New Lead Welcome Journey"
          icon="bi-robot"
          backTo={() => setView('list')}
          actions={
            <div className="d-flex gap-2">
              <button className="btn btn-light" onClick={() => setView('list')}>Discard</button>
              <button className="btn btn-primary"><i className="bi bi-save" /> Save Workflow</button>
            </div>
          }
        />
        
        <div className="d-flex justify-content-center py-5" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <div>
            {demoNodes.map((node) => (
              <AutomationNode key={node.id} node={node} onEdit={() => {}} onDelete={() => {}} />
            ))}
            
            <div className="text-center mt-5">
              <button className="btn btn-outline-primary btn-sm rounded-pill px-3"><i className="bi bi-plus-lg me-1" /> Add Step</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Marketing Automation"
        subtitle="Build visual workflows to automate your marketing tasks"
        icon="bi-robot"
        actions={<button className="btn btn-primary" onClick={() => setView('builder')}><i className="bi bi-plus-lg" /> Create Workflow</button>}
      />



      <DataTable
        columns={columns}
        rows={filtered}
        keyField="id"
        onRowClick={() => setView('builder')}
        searchPlaceholder="Search workflows by name or trigger..."
        searchKeys={['name', 'trigger']}
        pageSize={10}
      />
    </div>
  );
}
