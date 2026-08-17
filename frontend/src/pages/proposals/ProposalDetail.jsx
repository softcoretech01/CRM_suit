import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { ProposalPreview } from '../../components/crm/Proposals';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import NotFound from '../NotFound';

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { proposals, setProposals, addActivity, addDocument } = useCrm();
  const toast = useToast();
  
  const [tab, setTab] = useState('Preview');
  const proposal = proposals.find(p => p.id === id);
  
  if (!proposal) return <NotFound />;

  const handleSend = () => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'Sent' } : p));
    
    // Simulate creating a document entry when proposal is generated/sent
    if (addDocument) {
      addDocument({
        number: proposal.number,
        name: proposal.name + ' - PDF',
        type: 'Proposal',
        category: 'SALES',
        company: proposal.company,
        companyId: proposal.companyId,
        opportunity: proposal.opportunity,
        uploadedBy: 'System',
        uploadDate: new Date().toISOString().split('T')[0],
        version: proposal.version,
        size: '1.5 MB',
        fileType: 'pdf',
        tags: ['Proposal'],
        status: 'Active'
      });
    }

    toast.success('Sent', 'Proposal sent to customer');
    addActivity({
      type: 'Proposal', subject: `Proposal ${proposal.number} Sent`, 
      company: proposal.company, date: new Date().toISOString().split('T')[0], status: 'Completed'
    });
  };

  const isReadOnly = ['Sent', 'Accepted', 'Archived'].includes(proposal.status);

  return (
    <div className="page">
      <PageHeader
        title={proposal.number}
        subtitle={
          <div className="d-flex align-items-center gap-3">
            <span className="fw-6 text-dark">{proposal.name}</span>
            <span className="text-muted-c">•</span>
            <span className="text-muted-c">{proposal.company}</span>
            <span className="text-muted-c">•</span>
            <span className={`badge-pill ${proposal.status === 'Draft' ? 'tone-gray' : 'tone-blue'}`}>{proposal.status}</span>
          </div>
        }
        icon="bi-file-earmark-check"
        backTo="/proposals"
        actions={
          <div className="d-flex gap-2">
            {!isReadOnly && <button className="btn btn-light" onClick={() => navigate(`/proposals/${id}/edit`)}><i className="bi bi-pencil" /> Edit</button>}
            <button className="btn btn-light" title="Duplicate"><i className="bi bi-copy" /> Duplicate</button>
            <button className="btn btn-light" title="Download PDF"><i className="bi bi-file-earmark-pdf" /> PDF</button>
            
            {proposal.status === 'Draft' && <button className="btn btn-primary" onClick={handleSend}><i className="bi bi-send" /> Send to Customer</button>}
            
            {(proposal.status === 'Sent') && <button className="btn btn-success" onClick={() => {
              setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'Accepted' } : p));
              toast.success('Accepted', 'Proposal accepted by customer');
            }}><i className="bi bi-check-lg" /> Mark as Accepted</button>}
          </div>
        }
      />
      
      <div className="bg-light p-4 rounded border" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <ProposalPreview proposal={proposal} sections={proposal.sections || []} />
      </div>
    </div>
  );
}
