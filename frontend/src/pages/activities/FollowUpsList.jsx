import { useState, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import DateRangeBar, { inRange } from '../../components/common/DateRangeBar';
import { Badge, EmptyState, Field } from '../../components/common/Ui';
import { StatCard } from '../../components/common/PageParts';
import { Modal } from '../../components/common/Overlay';
import ActionIconButton from '../../components/common/ActionIconButton';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';

const tempTone = (t) => ({ Hot: 'tone-red', Warm: 'tone-amber', Cold: 'tone-blue' }[t] || 'tone-gray');
const statusTone = (s) => ({ Done: 'tone-green', Completed: 'tone-green', Pending: 'tone-amber', Overdue: 'tone-red' }[s] || 'tone-gray');
const fmtDT = (v) => {
  if (!v) return '—';
  const s = String(v).replace('T', ' ');
  if (s.length < 16) return s;
  let [h, m] = s.slice(11, 16).split(':');
  let hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12 || 12;
  return `${s.slice(0, 10)} ${hr < 10 ? '0'+hr : hr}:${m} ${ampm}`;
};
const dayOf = (v) => (v ? String(v).slice(0, 10) : '');

export default function FollowUpsList() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fStatus, setFStatus] = useState('Pending');
  const [fWhen, setFWhen] = useState(''); // '', 'upcoming', 'overdue'
  const [range, setRange] = useState({ from: '', to: '' });

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await apiFetch('/crm/followups'); setRows(res.data || []); }
    catch { toast.error('Error', 'Failed to load follow-ups'); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  // Completing a follow-up: open a popup to capture the outcome, then log it to Activities
  const [completing, setCompleting] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [cSubject, setCSubject] = useState('');
  const openComplete = (r) => { setCompleting(r); setOutcome(''); setCSubject(r.activity || r.followup_type || ''); };
  const submitComplete = async () => {
    try {
      await apiFetch(`/crm/followups/${completing.id}/done`, { method: 'POST', body: { outcome, subject: cSubject } });
      toast.success('Follow-up completed', 'Logged to Activities');
      setCompleting(null); setOutcome(''); setCSubject(''); load();
    } catch { toast.error('Error', 'Failed to complete follow-up'); }
  };

  const kpis = useMemo(() => {
    let upcoming = 0, overdue = 0;
    rows.forEach((r) => {
      const d = dayOf(r.next_followup_date || r.followup_date);
      const s = r.status || 'Pending';
      if (!d) return;
      if (d >= today) {
        if (s !== 'Done' && s !== 'Completed') upcoming++;
      } else if (s !== 'Done' && s !== 'Completed') {
        overdue++;
      }
    });
    return { total: rows.length, upcoming, overdue };
  }, [rows, today]);

  const filtered = useMemo(() => rows.filter((r) => {
    const s = r.status || 'Pending';
    if (fStatus && s !== fStatus) return false;
    if (!inRange(r.created_at || r.next_followup_date || r.followup_date, range)) return false;
    const d = dayOf(r.next_followup_date || r.followup_date);
    if (fWhen === 'upcoming' && !(d && d >= today && s !== 'Done' && s !== 'Completed')) return false;
    if (fWhen === 'overdue' && !(d && d < today && s !== 'Done' && s !== 'Completed')) return false;
    return true;
  }), [rows, fStatus, fWhen, today, range]);

  const columns = [
    { key: 'sno', label: 'S.No', width: '64px', render: (_, i) => <span className="text-secondary-c">{i}</span> },
    { key: 'lead_name', label: 'Client', sortable: true, accessor: (r) => r.lead_name || r.opportunity_name || '', render: (r) => (
      <div><div className="fw-6">{r.lead_name || r.opportunity_name || '—'}</div><div className="fs-12 text-muted-c">{r.company_name || ''}</div></div>) },
    { key: 'contact_name', label: 'Contact', render: (r) => <div>{r.contact_name || '—'}<div className="fs-12 text-muted-c">{r.phone || ''}</div></div> },
    { key: 'followup_type', label: 'Type', render: (r) => <Badge tone="tone-indigo">{r.followup_type || '—'}</Badge> },
    { key: 'next_followup_date', label: 'Follow-up Date', sortable: true, accessor: (r) => r.next_followup_date || r.followup_date || '', render: (r) => {
      const val = r.next_followup_date || r.followup_date;
      const d = dayOf(val);
      const overdue = d && d < today && r.status !== 'Done' && r.status !== 'Completed';
      if (!val) return <span className="text-muted-c">—</span>;
      return <span className={`fs-13 fw-6 ${overdue ? 'text-danger' : 'text-primary-c'}`}><i className="bi bi-clock me-1" />{fmtDT(val)}</span>;
    } },
    { key: 'related', label: 'Related', render: (r) => {
      if (r.related_type === 'Opportunity' || r.opportunity_name) {
        return <Badge tone="tone-indigo">Opportunity</Badge>;
      }
      return <div className="d-flex align-items-center gap-1"><Badge tone="tone-amber">Lead</Badge>{r.temperature && <Badge tone={tempTone(r.temperature)} dot>{r.temperature}</Badge>}</div>;
    } },
    { key: 'status', label: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status || 'Pending'}</Badge> },
    { key: 'actions', label: 'Action', width: '90px', render: (r) => (
      <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {r.status !== 'Done' && r.status !== 'Completed'
          ? <ActionIconButton icon={CheckCircle2} tooltip="Complete — enter outcome & log to Activities" onClick={() => openComplete(r)} />
          : <i className="bi bi-check-circle-fill text-success" title="Completed" />}
      </div>) },
  ];

  const filters = (
    <>
      <select className="form-select form-select-sm" style={{ width: 150 }} value={fWhen} onChange={(e) => setFWhen(e.target.value)}>
        <option value="">All Dates</option>
        <option value="upcoming">Upcoming</option>
        <option value="overdue">Overdue</option>
      </select>
      <select className="form-select form-select-sm" style={{ width: 150 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
        <option value="">All (incl. done)</option>
        {['Pending', 'Done'].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </>
  );

  return (
    <div className="page">
      <PageHeader title="Follow-ups" subtitle="Upcoming follow-up schedule — mark done to log it to Activities" icon="bi-clock-history" />

      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-4"><StatCard label="Total Follow-ups" value={kpis.total} icon="bi-list-check" color="var(--primary)" /></div>
        <div className="col-6 col-lg-4"><StatCard label="Upcoming" value={kpis.upcoming} icon="bi-calendar-check" color="var(--success)" /></div>
        <div className="col-6 col-lg-4"><StatCard label="Overdue" value={kpis.overdue} icon="bi-exclamation-triangle" color="var(--danger)" /></div>
      </div>

      <DateRangeBar onApply={setRange} />
      <DataTable
        columns={columns} rows={filtered} keyField="id" loading={loading} filters={filters}
        searchPlaceholder="Search client, contact, activity..."
        searchKeys={['lead_name', 'opportunity_name', 'contact_name', 'phone', 'activity', 'followup_type', 'company_name']}
        empty={<EmptyState icon="bi-clock-history" title="No follow-ups yet" message="Add follow-ups from a lead's clock icon on the Leads screen." />}
      />

      {completing && (
        <Modal open onClose={() => setCompleting(null)} title={`Complete Follow-up — ${completing.lead_name || ''}`} icon="bi-check-circle" width={520}
          footer={<><button className="btn btn-light" onClick={() => setCompleting(null)}>Cancel</button><button className="btn btn-primary" onClick={submitComplete}><i className="bi bi-check-lg" /> Save</button></>}>
          <div className="fs-13 text-muted-c mb-2">
            {completing.followup_type} follow-up scheduled for <b>{fmtDT(completing.next_followup_date || completing.followup_date)}</b>.
            Saving logs it as a completed activity on <b>Activities</b> and the lead's history.
          </div>
          <Field label="Subject" col={12}>
            <input className="form-control" value={cSubject} onChange={(e) => setCSubject(e.target.value)} placeholder="Subject for the activity" />
          </Field>
          <Field label="Outcome" col={12}>
            <textarea className="form-control" rows={3} value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="What was the result of this follow-up?" autoFocus />
          </Field>
        </Modal>
      )}
    </div>
  );
}
