import { useState } from 'react';
import { Modal } from '../common/Overlay';
import { Field } from '../common/Ui';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatINRFull } from '../../utils/format';
import { salespeople } from '../../data/mockData';

// ---------- Assign Lead ----------
export function AssignModal({ open, onClose, lead }) {
  const crm = useCrm();
  const { updateLead } = crm;
  const toast = useToast();
  const [assignTo, setAssignTo] = useState(lead?.assignedTo || '');
  const [priority, setPriority] = useState(lead?.priority || 'Medium');
  const [reason, setReason] = useState('');

  if (!lead) return null;

  const submit = () => {
    if (!assignTo) return toast.warning('Select an executive', 'Please choose who to assign this lead to.');
    updateLead(lead.id, { assignedTo: assignTo, priority, status: lead.status === 'New' ? 'Assigned' : lead.status });
    toast.success('Lead assigned', `${lead.company} assigned to ${assignTo}`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Lead"
      subtitle={lead.number}
      icon="bi-person-check"
      width={480}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}><i className="bi bi-person-check" /> Assign Lead</button>
        </>
      }
    >
      <div className="surface p-3 mb-3" style={{ background: 'var(--primary-softer)' }}>
        <div className="fs-12 text-muted-c">Lead</div>
        <div className="fw-7">{lead.company}</div>
        <div className="fs-12 text-secondary-c mt-1">Current owner: <b>{lead.assignedTo}</b></div>
      </div>
      <div className="row">
        <Field label="Assign To" required col={12}>
          <select className="form-select" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
            <option value="">Select Executive</option>
            {salespeople.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Priority" col={12}>
          <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {crm.priorities?.map((p) => <option key={p.id || p.code || p.name} value={p.name}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Reason (optional)" col={12}>
          <textarea className="form-control" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this being reassigned?" />
        </Field>
      </div>
    </Modal>
  );
}

// ---------- Convert Lead ----------
export function ConvertModal({ open, onClose, lead }) {
  const { updateLead, companies, contacts, addCompany, addContact } = useCrm();
  const toast = useToast();
  
  // Check if they already exist
  const companyExists = lead ? companies.some(c => c.name === lead.company) : false;
  const contactExists = lead ? contacts.some(c => c.name === lead.contact) : false;

  const [createCompany, setCreateCompany] = useState(!companyExists);
  const [createContact, setCreateContact] = useState(!contactExists);

  if (!lead) return null;

  const submit = () => {
    let companyId = lead.companyId;

    if (createCompany && !companyExists) {
      const newComp = addCompany({ 
        name: lead.company,
        industry: lead.industry,
        owner: lead.assignedTo
      });
      companyId = newComp.id;
    }

    if (createContact && !contactExists) {
      addContact({
        name: lead.contact,
        company: lead.company,
        companyId: companyId,
        email: lead.contactEmail,
        mobile: lead.contactMobile,
        decisionMaker: true
      });
    }

    // Mark the lead as Converted.
    updateLead(lead.id, { status: 'Converted', converted: true });
    toast.success('Lead converted', `${lead.company} marked as Converted.`);
    onClose();
  };

  const CheckRow = ({ checked, onChange, label, desc, disabled }) => (
    <label className={`d-flex align-items-center gap-3 p-3 mb-2 ${disabled ? 'opacity-50' : ''}`} style={{ border: '1px solid var(--border)', borderRadius: 10, cursor: disabled ? 'default' : 'pointer', background: checked ? 'var(--primary-softer)' : '#fff' }}>
      <input type="checkbox" className="form-check-input mt-0" checked={checked} onChange={(e) => !disabled && onChange(e.target.checked)} disabled={disabled} />
      <span style={{ flex: 1 }}>
        <div className="fw-6">{label}</div>
        <div className="fs-12 text-muted-c">{desc}</div>
      </span>
      {checked && <i className="bi bi-check-circle-fill text-success" />}
    </label>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Convert Lead"
      subtitle={lead.number}
      icon="bi-arrow-repeat"
      tone="success"
      width={520}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={submit}><i className="bi bi-check2-circle" /> Convert Lead</button>
        </>
      }
    >
      <div className="surface p-3 mb-3" style={{ background: 'var(--success-soft)' }}>
        <div className="fs-12 text-muted-c">Lead</div>
        <div className="fw-7">{lead.company}</div>
      </div>

      <CheckRow 
        checked={companyExists ? false : createCompany} 
        onChange={setCreateCompany} 
        label={companyExists ? "Company Exists" : "Create Company"} 
        desc={companyExists ? "This company is already in your CRM" : "Add company record to your CRM"} 
        disabled={companyExists}
      />
      <CheckRow 
        checked={contactExists ? false : createContact} 
        onChange={setCreateContact} 
        label={contactExists ? "Contact Exists" : "Create Contact"} 
        desc={contactExists ? "This contact is already in your CRM" : "Add the primary contact"}
        disabled={contactExists}
      />
    </Modal>
  );
}

// ---------- Duplicate detection warning ----------
export function DuplicateWarning({ open, onClose, existing, onUseExisting, onCreateAnyway, onView }) {
  if (!existing) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Possible Duplicate Found"
      icon="bi-exclamation-triangle"
      tone="warning"
      width={480}
      footer={
        <>
          <button className="btn btn-light" onClick={onView}><i className="bi bi-eye" /> View Existing</button>
          <button className="btn btn-outline-secondary" onClick={onUseExisting}>Use Existing</button>
          <button className="btn btn-primary" onClick={onCreateAnyway}>Create Anyway</button>
        </>
      }
    >
      <p className="text-secondary-c">We found an existing record that closely matches what you're entering:</p>
      <div className="surface p-3" style={{ background: 'var(--warning-soft)', borderColor: '#f6d9a8' }}>
        <div className="fw-7">{existing.name}</div>
        <div className="fs-13 text-secondary-c mt-1">
          {existing.gst && <div>GST: <span className="mono">{existing.gst}</span></div>}
          {existing.city && <div>{existing.city}, {existing.state}</div>}
          {existing.value != null && <div>Value: {formatINR(existing.value)}</div>}
        </div>
      </div>
    </Modal>
  );
}
