import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Card, Avatar } from '../../components/common/Ui';
import { QuotationTable, QuotationSummary, QuotationStatusBadge, RevisionTimeline } from '../../components/crm/Quotations';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';
import NotFound from '../NotFound';

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotations, setQuotations, pendingApprovals, setPendingApprovals, addActivity } = useCrm();
  const toast = useToast();
  
  const [tab, setTab] = useState('Overview');
  const quote = quotations.find(q => q.id === id);
  
  if (!quote) return <NotFound />;

  const handleApprove = () => {
    setQuotations(prev => prev.map(q => q.id === id ? { 
      ...q, 
      status: 'Approved',
      timeline: [...(q.timeline || []), { date: new Date().toLocaleString('en-GB'), text: 'Approved by Sales Manager' }]
    } : q));
    toast.success('Approved', 'Quotation has been approved');
    addActivity({
      type: 'Quotation Approved', subject: `Quotation ${quote.number} Approved`, 
      company: quote.company, date: new Date().toISOString().split('T')[0], status: 'Completed'
    });
  };

  const handleSend = () => {
    setQuotations(prev => prev.map(q => q.id === id ? { 
      ...q, 
      status: 'Sent',
      timeline: [...(q.timeline || []), { date: new Date().toLocaleString('en-GB'), text: 'Sent to customer via Email' }]
    } : q));
    toast.success('Sent', 'Quotation sent to customer');
    addActivity({
      type: 'Email', subject: `Quotation ${quote.number} Sent`, 
      company: quote.company, date: new Date().toISOString().split('T')[0], status: 'Completed'
    });
  };

  const isReadOnly = ['Approved', 'Sent', 'Accepted', 'Declined'].includes(quote.status);

  return (
    <div className="page">
      <PageHeader
        title={quote.number}
        subtitle={
          <div className="d-flex align-items-center gap-3">
            <span className="fw-6 text-dark">{quote.company}</span>
            <span className="text-muted-c">•</span>
            <span className="mono fw-7 text-primary-c">{formatINR(quote.total)}</span>
            <span className="text-muted-c">•</span>
            <QuotationStatusBadge status={quote.status} />
          </div>
        }
        icon="bi-receipt"
        backTo="/quotations"
        actions={
          <div className="d-flex gap-2">
            {!isReadOnly && <button className="btn btn-light" onClick={() => navigate(`/quotations/${id}/edit`)}><i className="bi bi-pencil" /> Edit</button>}
            <button className="btn btn-light" title="Duplicate"><i className="bi bi-copy" /> Duplicate</button>
            <button className="btn btn-light" title="Download PDF"><i className="bi bi-file-earmark-pdf" /> PDF</button>
            
            {quote.status === 'Draft' && <button className="btn btn-primary" onClick={() => {
              setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'Pending Approval' } : q));
              toast.success('Submitted', 'Submitted for approval');
            }}><i className="bi bi-send" /> Submit Approval</button>}
            
            {quote.status === 'Pending Approval' && <button className="btn btn-success" onClick={handleApprove}><i className="bi bi-check-lg" /> Approve</button>}
            
            {quote.status === 'Approved' && <button className="btn btn-primary" onClick={handleSend}><i className="bi bi-envelope" /> Send to Customer</button>}
            
            {(quote.status === 'Sent' || quote.status === 'Approved') && <button className="btn btn-warning"><i className="bi bi-arrow-counterclockwise" /> Revise</button>}
          </div>
        }
      />
      
      <div className="row g-4">
        <div className="col-lg-3">
          <Card title="Quotation Info" className="mb-4">
            <div className="mb-3">
              <div className="fs-12 text-muted-c">Date</div>
              <div className="fw-6 fs-14">{quote.date}</div>
            </div>
            <div className="mb-3">
              <div className="fs-12 text-muted-c">Valid Until</div>
              <div className="fw-6 fs-14 text-danger-c">{quote.validUntil}</div>
            </div>
            <div className="mb-3">
              <div className="fs-12 text-muted-c">Sales Executive</div>
              <div className="fw-6 fs-14">{quote.salesExecutive}</div>
            </div>
            <div className="mb-3">
              <div className="fs-12 text-muted-c">Revision</div>
              <div className="fw-6 fs-14">v{quote.revision}</div>
            </div>
          </Card>
        </div>
        
        <div className="col-lg-9">
          <div className="nav-tabs-custom mb-4 border-bottom">
            {['Overview', 'Items', 'Approval', 'Revisions', 'Timeline'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          
          {tab === 'Overview' && (
            <Card title="Summary" noPadding>
              <QuotationTable items={quote.items} readOnly />
              <div className="p-4 border-top">
                <QuotationSummary 
                  amount={quote.amount} 
                  discount={quote.discount} 
                  tax={quote.tax} 
                  total={quote.total} 
                  remarks={quote.remarks} 
                  terms={quote.paymentTerms} 
                  delivery={quote.delivery} 
                />
              </div>
            </Card>
          )}

          {tab === 'Items' && (
            <Card title="Line Items" noPadding>
              <QuotationTable items={quote.items} readOnly />
            </Card>
          )}
          
          {tab === 'Timeline' && (
            <Card title="Activity Timeline" noPadding>
              <RevisionTimeline timeline={quote.timeline || []} />
            </Card>
          )}

          {(tab === 'Approval' || tab === 'Revisions') && (
            <Card className="text-center py-5">
              <div className="text-muted-c">No {tab.toLowerCase()} data to display for this quotation.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
