import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Overlay';
import { TimeSelect } from '../common/Ui';
import { useCrm } from '../../context/CrmContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function LogActivityModal({ open, onClose, entity, entityType }) {
  const crm = useCrm();
  const toast = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'Call',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '',
    outcome: '',
    notes: '',
  });
  const [showFollowUpPrompt, setShowFollowUpPrompt] = useState(false);
  const [activitySaved, setActivitySaved] = useState(false);

  const reset = () => {
    setForm({ type: 'Call', subject: '', date: new Date().toISOString().split('T')[0], time: '', duration: '', outcome: '', notes: '' });
    setShowFollowUpPrompt(false);
    setActivitySaved(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = () => {
    if (!form.subject.trim()) {
      toast.error('Required', 'Please enter a subject.');
      return;
    }

    const activity = {
      ...form,
      status: 'Completed',
      company: entity?.company || entity?.name || '', // for company, name is the company name
      contact: entity?.contact || '',
      lead: entityType === 'Lead' ? entity?.id : (entity?.leadId || ''),
      opportunity: entityType === 'Opportunity' ? entity?.id : '',
      conductedBy: currentUser.name,
    };
    
    crm.addActivity(activity);
    
    // Also update lastActivity on the entity if it's Lead
    if (entityType === 'Lead' && entity) {
      crm.updateLead(entity.id, { lastActivity: form.date });
    }
    
    toast.success('Activity Logged', 'Activity has been successfully recorded.');
    setActivitySaved(true);
    setShowFollowUpPrompt(true);
  };

  const handleCreateFollowUp = () => {
    onClose('open-followup'); // tell parent to open follow-up modal
    reset();
  };

  if (showFollowUpPrompt) {
    return (
      <Modal open={open} onClose={handleClose} title="Create Follow-up?">
        <div className="p-3 text-center">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
          </div>
          <h5>Activity Logged Successfully</h5>
          <p className="text-muted-c mb-4">Would you like to schedule a follow-up action for this?</p>
          <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-light" onClick={handleClose}>No, thanks</button>
            <button className="btn btn-primary" onClick={handleCreateFollowUp}>Yes, Create Follow-up</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Log Activity">
      <div className="p-3">
        <div className="mb-3">
          <label className="form-label">Activity Type <span className="text-danger">*</span></label>
          <select className="form-select" value={form.type} onChange={setF('type')}>
            {crm.activityTypes?.map(t => <option key={t.id || t.code || t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Subject <span className="text-danger">*</span></label>
          <input className="form-control" placeholder="e.g. Discussed ERP requirements" value={form.subject} onChange={setF('subject')} />
        </div>
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={form.date} onChange={setF('date')} />
          </div>
          <div className="col-6">
            <label className="form-label">Time</label>
            <TimeSelect className="form-control" value={form.time} onChange={setF('time')} />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">Duration</label>
            <input className="form-control" placeholder="e.g. 30 mins" value={form.duration} onChange={setF('duration')} />
          </div>
          <div className="col-6">
            <label className="form-label">Outcome</label>
            <input className="form-control" placeholder="e.g. Interested" value={form.outcome} onChange={setF('outcome')} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows="3" placeholder="Detailed notes about the interaction..." value={form.notes} onChange={setF('notes')}></textarea>
        </div>
        <div className="d-flex justify-content-between gap-2 mt-4">
          <div className="d-flex gap-2">
            {entityType === 'Company' && (
              <button className="btn btn-outline-primary" onClick={() => { handleSave(); navigate(`/leads/new?companyId=${entity?.id}`); }}>
                <i className="bi bi-lightning-charge" /> Create Lead
              </button>
            )}
            {entityType === 'Lead' && (
              <button className="btn btn-outline-primary" onClick={() => { handleSave(); navigate(`/opportunities?new=1&leadId=${entity?.id}`); }}>
                <i className="bi bi-graph-up-arrow" /> Create Opportunity
              </button>
            )}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Activity</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function FollowUpModal({ open, onClose, entity, entityType }) {
  const crm = useCrm();
  const toast = useToast();
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    type: 'Call',
    subject: '',
    date: '',
    time: '',
    assignedTo: currentUser.name,
    priority: 'Medium',
    reminder: '15 minutes',
    companyId: '',
    contact: ''
  });

  const reset = () => {
    setForm({ type: 'Call', subject: '', date: '', time: '', assignedTo: 'Rajesh Menon', priority: 'Medium', reminder: '15 minutes', companyId: '', contact: '' });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = () => {
    if (!form.subject.trim() || !form.date) {
      toast.error('Required', 'Please enter a subject and date.');
      return;
    }

    const when = `${form.date} ${(form.time || '09:00')}:00`;
    const fu = {
      followup_type: form.type,
      activity: form.subject,
      followup_date: when,
      next_followup_date: when,
      lead_id: entityType === 'Lead' ? (entity?.id || null) : null,
      opportunity_id: entityType === 'Opportunity' ? (entity?.id || null) : null,
      outcome: '',
      status: 'Pending',
    };

    crm.addFollowUp(fu);
    
    // update nextAction and nextActionDate on the entity if applicable
    if (entityType === 'Lead' || entityType === 'Opportunity') {
      const patch = { nextAction: form.type, nextActionDate: form.date };
      if (entityType === 'Lead' && entity) crm.updateLead(entity.id, patch);
      if (entityType === 'Opportunity' && entity) crm.updateOpportunity(entity.id, patch);
    }

    toast.success('Follow-up Scheduled', 'Your next action has been planned.');
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Schedule Follow-up">
      <div className="p-3">
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">Type <span className="text-danger">*</span></label>
            <select className="form-select" value={form.type} onChange={setF('type')}>
              {crm.activityTypes?.map(t => <option key={t.id || t.code || t.name} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div className="col-6">
            <label className="form-label">Priority</label>
            <select className="form-select" value={form.priority} onChange={setF('priority')}>
              {crm.priorities?.map(p => <option key={p.id || p.code || p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Subject <span className="text-danger">*</span></label>
          <input className="form-control" placeholder="e.g. Schedule Demo" value={form.subject} onChange={setF('subject')} />
        </div>
        {(!entityType || entityType === 'General') && (
          <>
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label">Company</label>
                <select className="form-select" value={form.companyId} onChange={setF('companyId')}>
                  <option value="">Select company...</option>
                  {crm.companies?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Contact</label>
                <select className="form-select" value={form.contact} onChange={setF('contact')} disabled={!form.companyId}>
                  <option value="">Select contact...</option>
                  {crm.contacts?.filter(c => String(c.companyId ?? c.company_id) === String(form.companyId)).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {form.contact && (() => {
              const c = crm.contacts?.find(x => x.name === form.contact && String(x.companyId ?? x.company_id) === String(form.companyId));
              if (!c) return null;
              return (
                <div className="mb-3 mt-n2">
                  <div className="p-2 border rounded bg-light fs-13 d-flex flex-wrap gap-3">
                    <span className="text-muted-c"><i className="bi bi-person-badge me-1" /> {c.designation || 'No role'}</span>
                    <span className="text-muted-c"><i className="bi bi-envelope me-1" /> {c.email || 'No email'}</span>
                    <span className="text-muted-c"><i className="bi bi-telephone me-1" /> {c.mobile || 'No mobile'}</span>
                  </div>
                </div>
              );
            })()}
          </>
        )}
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">Date <span className="text-danger">*</span></label>
            <input type="date" className="form-control" value={form.date} onChange={setF('date')} />
          </div>
          <div className="col-6">
            <label className="form-label">Time</label>
            <TimeSelect className="form-control" value={form.time} onChange={setF('time')} />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">Assigned To</label>
            <input className="form-control" value={form.assignedTo} onChange={setF('assignedTo')} />
          </div>
          <div className="col-6">
            <label className="form-label">Reminder</label>
            <select className="form-select" value={form.reminder} onChange={setF('reminder')}>
              <option>No Reminder</option>
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>1 day</option>
            </select>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-light" onClick={handleClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Schedule Next</button>
        </div>
      </div>
    </Modal>
  );
}

export function CompleteFollowUpModal({ open, onClose, followUp, entity, entityType }) {
  const crm = useCrm();
  const toast = useToast();
  const [form, setForm] = useState({ outcome: '', notes: '' });
  const [showFollowUpPrompt, setShowFollowUpPrompt] = useState(false);

  const reset = () => {
    setForm({ outcome: '', notes: '' });
    setShowFollowUpPrompt(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleComplete = () => {
    if (!followUp) return;
    
    // 1. Mark follow-up as complete
    crm.updateFollowUp(followUp.id, { status: 'Completed' });
    
    // 2. Also log it as an Activity so it stays in the history!
    crm.addActivity({
      type: followUp.type,
      subject: followUp.subject,
      date: new Date().toISOString().split('T')[0],
      outcome: form.outcome,
      notes: form.notes,
      status: 'Completed',
      company: entity?.company || followUp.company || entity?.name || '',
      contact: entity?.contact || '',
      lead: entityType === 'Lead' ? entity?.id : '',
      opportunity: entityType === 'Opportunity' ? entity?.id : '',
    });
    
    // update lastActivity on Lead
    if (entityType === 'Lead' && entity) {
      crm.updateLead(entity.id, { lastActivity: new Date().toISOString().split('T')[0] });
    }

    toast.success('Follow-up Completed', 'The task has been marked as completed.');
    setShowFollowUpPrompt(true);
  };

  const handleCreateFollowUp = () => {
    onClose('open-followup'); // Tell parent to open follow-up modal
    reset();
  };

  if (showFollowUpPrompt) {
    return (
      <Modal open={open} onClose={handleClose} title="Create Next Follow-up?">
        <div className="p-3 text-center">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
          </div>
          <h5>Task Completed Successfully</h5>
          <p className="text-muted-c mb-4">Would you like to schedule the next follow-up action?</p>
          <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-light" onClick={handleClose}>No, thanks</button>
            <button className="btn btn-primary" onClick={handleCreateFollowUp}>Yes, Schedule Next</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Complete ${followUp?.type || 'Action'}`}>
      <div className="p-3">
        <div className="p-3 bg-light rounded mb-4">
          <div className="fw-6 mb-1">{followUp?.subject}</div>
          <div className="fs-13 text-muted-c">
            <i className="bi bi-calendar-event me-1" /> {followUp?.date} {followUp?.time}
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Outcome</label>
          <input className="form-control" placeholder="e.g. Customer agreed to demo" value={form.outcome} onChange={setF('outcome')} />
        </div>
        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows="3" placeholder="Any additional details..." value={form.notes} onChange={setF('notes')}></textarea>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-light" onClick={handleClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleComplete}>Complete Action</button>
        </div>
      </div>
    </Modal>
  );
}
