import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { useCrm } from '../../context/CrmContext';
import { useToast } from '../../context/ToastContext';
import { Section, Field } from '../../components/common/Ui';
import { apiFetch } from '../../utils/api';

export default function SMS() {
  const crm = useCrm();
  const toast = useToast();
  
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!recipient) {
      toast.error('Recipient required', 'Please select a recipient first.');
      return;
    }
    if (!message.trim()) {
      toast.error('Message empty', 'Please type a message to send.');
      return;
    }

    setSending(true);
    try {
      const contact = crm.contacts.find(c => String(c.id) === String(recipient));
      const lead = crm.leads.find(l => String(l.id) === String(recipient));
      
      const payload = {
        recipient_id: recipient,
        recipient_type: contact ? 'contact' : 'lead',
        message: message
      };

      await apiFetch('/crm/sms', {
        method: 'POST',
        body: payload
      });

      toast.success('SMS Sent', `Message successfully sent to ${contact ? contact.name : lead?.lead_name || 'recipient'}.`);
      setMessage('');
      setRecipient('');
      
      if (crm.refresh) crm.refresh();
      
    } catch (err) {
      toast.error('Send Failed', err.message || 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="SMS Messaging"
        subtitle="Send text messages directly to customers and leads"
        icon="bi-chat-left-text"
      />
      
      <div className="grid grid-2 mt-4">
        <div className="surface p-4">
          <Section title="Compose Message" icon="bi-pencil-square">
            <div className="row">
              <Field label="Recipient" col={12} required>
                <select 
                  className="form-select" 
                  value={recipient} 
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={sending}
                >
                  <option value="">Select a contact or lead...</option>
                  <optgroup label="Contacts">
                    {crm.contacts?.map(c => (
                      <option key={`c-${c.id}`} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''} - {c.phone || 'No phone'}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Leads">
                    {crm.leads?.map(l => (
                      <option key={`l-${l.id}`} value={l.id}>
                        {l.lead_name} {l.company ? `(${l.company})` : ''} - {l.phone || 'No phone'}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </Field>
              <Field label="Message" col={12} required>
                <textarea 
                  className="form-control" 
                  rows={6} 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your SMS message here..."
                  disabled={sending}
                  maxLength={160}
                />
                <div className="text-end mt-1 text-secondary-c fs-13">
                  {message.length} / 160 characters
                </div>
              </Field>
            </div>
            
            <div className="mt-4 d-flex justify-content-end">
              <button 
                className="btn btn-primary" 
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <><span className="spinner-border spinner-border-sm me-2" /> Sending...</>
                ) : (
                  <><i className="bi bi-send me-2" /> Send SMS</>
                )}
              </button>
            </div>
          </Section>
        </div>
        
        <div className="surface p-4 bg-light">
          <div className="d-flex flex-column h-100 align-items-center justify-content-center text-center text-secondary-c">
            <i className="bi bi-chat-left-text" style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }} />
            <h5 className="mb-2">SMS Preview</h5>
            <div className="bg-white p-3 rounded shadow-sm text-start" style={{ minWidth: 260, maxWidth: 320, border: '1px solid var(--border)' }}>
              {message ? (
                <p className="mb-0 fs-14" style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
              ) : (
                <p className="mb-0 fs-14 text-muted fst-italic">Your message will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
