import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/common/Ui';
import { QuotationTable, QuotationSummary } from '../../components/crm/Quotations';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';

export default function QuotationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { quotations, companies, opportunities, setQuotations } = useCrm();
  const toast = useToast();
  
  const isEdit = Boolean(id);
  const existing = isEdit ? quotations.find(q => q.id === id) : null;
  
  const [formData, setFormData] = useState(existing || {
    companyId: '',
    opportunity: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    currency: 'INR',
    remarks: '',
    paymentTerms: '',
    delivery: '',
    items: [],
  });

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', qty: 1, price: 0, discountPercent: 0, taxPercent: 18, total: 0 }]
    }));
  };

  const removeLineItem = (idx) => {
    setFormData(prev => {
      const items = [...prev.items];
      items.splice(idx, 1);
      return { ...prev, items };
    });
  };

  const updateLineItem = (idx, field, value) => {
    setFormData(prev => {
      const items = [...prev.items];
      const item = { ...items[idx], [field]: value };
      
      // Calculate total
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty) || 0;
      const disc = parseFloat(item.discountPercent) || 0;
      const tax = parseFloat(item.taxPercent) || 0;
      
      const base = price * qty;
      const discAmt = base * (disc / 100);
      const afterDisc = base - discAmt;
      const taxAmt = afterDisc * (tax / 100);
      
      item.discountAmt = discAmt;
      item.taxAmt = taxAmt;
      item.total = afterDisc + taxAmt;
      
      items[idx] = item;
      return { ...prev, items };
    });
  };

  const calcTotals = () => {
    let amount = 0;
    let discount = 0;
    let tax = 0;
    
    formData.items.forEach(it => {
      const base = (parseFloat(it.price) || 0) * (parseInt(it.qty) || 0);
      amount += base;
      discount += it.discountAmt || 0;
      tax += it.taxAmt || 0;
    });
    
    return { amount, discount, tax, total: amount - discount + tax };
  };

  const totals = calcTotals();

  const handleSave = () => {
    if (!formData.companyId) return toast.error('Validation Error', 'Please select a company');
    if (formData.items.length === 0) return toast.error('Validation Error', 'Add at least one line item');
    
    const comp = companies.find(c => c.id === formData.companyId);
    const newQuote = {
      ...formData,
      company: comp?.name || '',
      number: `QT-2026-08-${String(Math.floor(Math.random() * 9000)).padStart(6, '0')}`,
      amount: totals.amount,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      status: 'Draft',
      revision: 1,
      id: `QT-${Date.now()}`
    };
    
    setQuotations(prev => [newQuote, ...prev]);
    toast.success('Success', 'Quotation drafted successfully');
    navigate(`/quotations/${newQuote.id}`);
  };

  return (
    <div className="page">
      <PageHeader
        title={isEdit ? 'Edit Quotation' : 'New Quotation'}
        icon="bi-receipt"
        backTo="/quotations"
        actions={
          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={() => navigate('/quotations')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><i className="bi bi-save" /> Save as Draft</button>
          </div>
        }
      />
      
      <div className="row g-4">
        <div className="col-12">
          <Card title="Quotation Details" className="mb-4">
            <div className="row g-3">
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
              <div className="col-md-6 col-lg-2">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="col-md-6 col-lg-2">
                <label className="form-label">Valid Until</label>
                <input type="date" className="form-control" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
              </div>
              <div className="col-md-6 col-lg-2">
                <label className="form-label">Currency</label>
                <select className="form-select" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </Card>
          
          <Card title="Line Items" className="mb-4" noPadding>
            <QuotationTable 
              items={formData.items} 
              onAdd={addLineItem} 
              onRemove={removeLineItem} 
              onUpdate={updateLineItem} 
            />
          </Card>
          
          <Card title="Terms & Summary">
            <div className="row">
              <div className="col-md-12">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Payment Terms</label>
                    <input type="text" className="form-control" placeholder="e.g. 50% Advance" value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Delivery Timeline</label>
                    <input type="text" className="form-control" placeholder="e.g. 3 Months" value={formData.delivery} onChange={e => setFormData({...formData, delivery: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea className="form-control" rows={2} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})}></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-top pt-3 mt-3">
              <QuotationSummary {...totals} remarks={formData.remarks} terms={formData.paymentTerms} delivery={formData.delivery} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
