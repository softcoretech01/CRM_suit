import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/common/Ui';
import { ProposalEditor } from '../../components/crm/Proposals';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_SECTIONS = [
  { id: 'cover', title: 'Cover Page', content: 'Proposal for [Project Name]\n\nPrepared for:\n[Client Name]\n\nDate: [Date]' },
  { id: 'intro', title: 'Company Introduction', content: 'Techspire Solutions is a leading provider of...' },
  { id: 'challenges', title: 'Business Challenges', content: 'Based on our discussions, the key challenges are:\n1. ...\n2. ...' },
  { id: 'solution', title: 'Proposed Solution', content: 'Our proposed solution includes...' },
  { id: 'scope', title: 'Scope of Work', content: 'The scope covers the following modules:\n- ...' },
  { id: 'commercial', title: 'Commercial Proposal', content: 'Total Investment: ₹[Amount]\n\nPayment Terms:\n- 50% Advance\n- 50% on Delivery' },
  { id: 'terms', title: 'Terms & Conditions', content: '1. Validity: 30 days\n2. Taxes as applicable' },
];

export default function ProposalForm() {
  const navigate = useNavigate();
  const { companies, opportunities, setProposals } = useCrm();
  const toast = useToast();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    opportunity: '',
    template: 'Blank',
  });

  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [activeSection, setActiveSection] = useState('cover');

  const updateSection = (id, content) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content } : s));
  };

  const handleSave = () => {
    if (!formData.name || !formData.companyId) {
      return toast.error('Validation Error', 'Please provide a proposal name and select a company.');
    }
    
    const comp = companies.find(c => c.id === formData.companyId);
    
    const newProposal = {
      id: `PROP-${Date.now()}`,
      number: `PROP-2026-${String(Math.floor(Math.random() * 90000)).padStart(5, '0')}`,
      name: formData.name,
      company: comp?.name || '',
      companyId: comp?.id,
      opportunity: formData.opportunity,
      template: formData.template,
      createdBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      version: 'v1.0',
      status: 'Draft',
      sections: sections
    };
    
    setProposals(prev => [newProposal, ...prev]);
    toast.success('Success', 'Proposal drafted successfully');
    navigate(`/proposals/${newProposal.id}`);
  };

  return (
    <div className="page">
      <PageHeader
        title="New Proposal"
        icon="bi-file-earmark-check"
        backTo="/proposals"
        actions={
          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={() => navigate('/proposals')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><i className="bi bi-save" /> Save Proposal</button>
          </div>
        }
      />
      
      <div className="row g-4">
        <div className="col-12">
          <Card title="Proposal Details" className="mb-4">
            <div className="row g-3">
              <div className="col-md-6 col-lg-3">
                <label className="form-label">Proposal Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="e.g. ERP Implementation" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-md-6 col-lg-3">
                <label className="form-label">Company <span className="text-danger">*</span></label>
                <select className="form-select" value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})}>
                  <option value="">Select Company...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6 col-lg-3">
                <label className="form-label">Opportunity</label>
                <select className="form-select" value={formData.opportunity} onChange={e => setFormData({...formData, opportunity: e.target.value})}>
                  <option value="">Select Opportunity...</option>
                  {opportunities.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="col-md-6 col-lg-3">
                <label className="form-label">Template</label>
                <select className="form-select" value={formData.template} onChange={e => setFormData({...formData, template: e.target.value})}>
                  <option value="Blank">Blank Template</option>
                  <option value="ERP Proposal">ERP Proposal</option>
                  <option value="Hospital Proposal">Hospital Proposal</option>
                  <option value="HRMS Proposal">HRMS Proposal</option>
                  <option value="Website Proposal">Website Proposal</option>
                </select>
              </div>
            </div>
          </Card>
          
          <Card title="Proposal Editor" noPadding>
            <ProposalEditor 
              sections={sections} 
              activeSection={activeSection} 
              setActiveSection={setActiveSection}
              onUpdate={updateSection}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
