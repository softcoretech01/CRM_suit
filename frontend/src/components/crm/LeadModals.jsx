import { useState } from 'react';
import { Modal } from '../common/Overlay';
import { Field } from '../common/Ui';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatINRFull } from '../../utils/format';
import { salespeople, priorities } from '../../data/mockData';

// ---------- Assign Lead ----------
export function AssignModal({ open, onClose, lead }) {
  const { updateLead } = useCrm();
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
        <div className="fs-12 text-secondary-c mt-1">Current owner: <b>{lead.assignedTo || lead.owner}</b></div>
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
            {priorities.map((p) => <option key={p.code} value={p.name}>{p.name}</option>)}
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
  const { updateLead, addOpportunity, opportunities } = useCrm();
  const toast = useToast();
  const [createCompany, setCreateCompany] = useState(true);
  const [createContact, setCreateContact] = useState(true);

  if (!lead) return null;

  const submit = () => {
    // Simply mark the lead as Converted. Opportunity creation is now handled separately.
    updateLead(lead.id, { status: 'Converted', converted: true });
    toast.success('Lead converted', `${lead.company} marked as Converted.`);
    onClose();
  };

  const CheckRow = ({ checked, onChange, label, desc }) => (
    <label className="d-flex align-items-center gap-3 p-3 mb-2" style={{ border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', background: checked ? 'var(--primary-softer)' : '#fff' }}>
      <input type="checkbox" className="form-check-input mt-0" checked={checked} onChange={(e) => onChange(e.target.checked)} />
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

      <CheckRow checked={createCompany} onChange={setCreateCompany} label="Create Company" desc="Add company record to your CRM" />
      <CheckRow checked={createContact} onChange={setCreateContact} label="Create Contact" desc="Add the primary contact" />
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
