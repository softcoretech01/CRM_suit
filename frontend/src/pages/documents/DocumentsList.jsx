import { useState, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { Badge, Avatar, UserCell } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import ActionIconButton from '../../components/common/ActionIconButton';
import { DocumentUploader, DocumentPreview } from '../../components/crm/Documents';
import { useCrm } from '../../context/CrmContext';

const FOLDERS = [
  { id: 'all', name: 'All Documents', icon: 'bi-folder' },
  { id: 'SALES', name: 'Sales', icon: 'bi-briefcase' },
  { id: 'LEGAL', name: 'Legal', icon: 'bi-bank' },
  { id: 'COMMERCIAL', name: 'Commercial', icon: 'bi-receipt' },
  { id: 'TECHNICAL', name: 'Technical', icon: 'bi-pc-display' },
  { id: 'MEDIA', name: 'Media', icon: 'bi-images' },
];

export default function DocumentsList() {
  const { documents, setDocuments } = useCrm();
  const [folder, setFolder] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const filtered = useMemo(() => documents.filter((d) => folder === 'all' || d.category === folder), [documents, folder]);

  const kpis = useMemo(() => ({
    total: documents.length,
    sales: documents.filter(d => d.category === 'SALES').length,
    legal: documents.filter(d => d.category === 'LEGAL').length,
    tech: documents.filter(d => d.category === 'TECHNICAL').length,
  }), [documents]);

  const columns = [
    { key: 'icon', label: '', width: '50px', render: r => <i className={`bi bi-file-earmark-${r.fileType === 'pdf' ? 'pdf text-danger-c' : 'text text-primary-c'} fs-5`} /> },
    { key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className="text-secondary-c">{idx}</span> },
    { key: 'name', label: 'Document Name', sortable: true, render: r => <span className="fw-6">{r.name}</span> },
    { key: 'category', label: 'Category', render: r => <Badge tone="tone-blue">{r.category}</Badge> },
    { key: 'company', label: 'Company', sortable: true, render: r => <div className="text-truncate" style={{ maxWidth: 150 }}>{r.company}</div> },
    { key: 'version', label: 'Version', render: r => <span className="badge-pill tone-gray">{r.version}</span> },
    { key: 'uploadDate', label: 'Uploaded', sortable: true },
    { key: 'uploadedBy', label: 'Uploaded By', render: r => <UserCell name={r.uploadedBy} hideAvatar /> },
    { key: 'actions', label: 'Action', width: '100px', render: r => (
      <div className="d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}>
        <ActionIconButton type="view" onClick={() => setPreviewDoc(r)} />
        <ActionIconButton type="view" icon="bi-download" tooltip="Download" onClick={() => {}} />
      </div>
    ) },
  ];

  const handleUpload = (file) => {
    setDocuments(prev => [{
      id: `DOC-${Date.now()}`,
      number: `DOC-${String(Math.floor(Math.random() * 90000)).padStart(5, '0')}`,
      name: file.name,
      type: 'General',
      category: folder !== 'all' ? folder : 'SALES',
      company: 'Unassigned',
      uploadedBy: 'Rajesh Menon',
      uploadDate: new Date().toISOString().split('T')[0],
      version: 'v1',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      fileType: file.name.split('.').pop() || 'pdf',
      tags: [],
      status: 'Active'
    }, ...prev]);
    setUploading(false);
  };

  return (
    <div className="page position-relative" style={{ overflow: 'hidden' }}>
      <PageHeader
        title="Document Management"
        subtitle="Centralized repository for sales, legal and technical documents"
        icon="bi-folder2-open"
        actions={<button className="btn btn-primary" onClick={() => setUploading(true)}><i className="bi bi-upload" /> Upload Document</button>}
      />



      <div className="d-flex" style={{ height: 'calc(100vh - 240px)' }}>
        {/* Folder Tree */}
        <div className="bg-white border rounded me-4" style={{ width: 240, overflowY: 'auto' }}>
          <div className="p-3 border-bottom fs-12 fw-7 text-muted-c text-uppercase">Folders</div>
          <div className="py-2">
            {FOLDERS.map(f => (
              <button
                key={f.id}
                className={`w-100 text-start px-3 py-2 border-0 d-flex align-items-center gap-2`}
                style={{
                  background: folder === f.id ? 'var(--primary-soft)' : 'transparent',
                  color: folder === f.id ? 'var(--primary)' : 'inherit',
                }}
                onClick={() => setFolder(f.id)}
              >
                <i className={`bi ${f.icon} fs-5 ${folder === f.id ? 'text-primary' : 'text-muted-c'}`} />
                <span className="fs-14 fw-5">{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Document Grid */}
        <div className="flex-grow-1 bg-white border rounded d-flex flex-column" style={{ minWidth: 0 }}>
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
            <h6 className="m-0 fw-6 text-dark">{FOLDERS.find(f => f.id === folder)?.name}</h6>
            <div className="fs-13 text-muted-c">{filtered.length} items</div>
          </div>
          
          <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
            {uploading && (
              <div className="p-4 border-bottom bg-light">
                <DocumentUploader onUpload={handleUpload} onCancel={() => setUploading(false)} />
              </div>
            )}
            
            <DataTable
              columns={columns}
              rows={filtered}
              keyField="id"
              onRowClick={r => setPreviewDoc(r)}
              searchPlaceholder="Search documents by name, type, or company..."
              searchKeys={['name', 'number', 'company', 'type']}
              pageSize={10}
            />
          </div>
        </div>
      </div>

      {previewDoc && <DocumentPreview document={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
