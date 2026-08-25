import { useState, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Badge, Field } from '../../components/common/Ui';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

// All available report columns (user can choose which to show)
const ALL_COLUMNS = [
  { key: 'lead_name', label: 'Client' },
  { key: 'company_name', label: 'Company' },
  { key: 'contact_name', label: 'Contact' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'requirement', label: 'Requirement' },
  { key: 'temperature', label: 'Status' },
  { key: 'closure_status', label: 'Closure' },
  { key: 'value', label: 'Value' },
  { key: 'followup_count', label: 'Follow-ups' },
  { key: 'last_followup', label: 'Last Follow-up' },
  { key: 'registration_no', label: 'Reg. No' },
  { key: 'registration_amount', label: 'Reg. Amount' },
  { key: 'feedback_rating', label: 'Feedback' },
  { key: 'created_at', label: 'Created' },
];
const DEFAULT_COLS = ['lead_name', 'company_name', 'contact_name', 'phone', 'temperature', 'closure_status', 'value', 'followup_count', 'feedback_rating'];

const fmt = (key, v) => {
  if (v === null || v === undefined || v === '') return '—';
  if (key === 'value' || key === 'registration_amount') return `₹${Number(v).toLocaleString('en-IN')}`;
  if (key === 'feedback_rating') return `${v} ★`;
  if (key === 'created_at' || key === 'last_followup') return String(v).slice(0, 16);
  return String(v);
};

export default function LeadReports() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [colMenu, setColMenu] = useState(false);
  const [search, setSearch] = useState('');

  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const [filters, setFilters] = useState({ from: monthStart, to: today, company_id: '', temperature: '', closure_status: '' });

  useEffect(() => { apiFetch('/crm/companies').then((r) => setCompanies(r.data || [])).catch(() => {}); }, []);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filters.from) qs.set('from_date', filters.from);
      if (filters.to) qs.set('to_date', filters.to);
      if (filters.company_id) qs.set('company_id', filters.company_id);
      if (filters.temperature) qs.set('temperature', filters.temperature);
      if (filters.closure_status) qs.set('closure_status', filters.closure_status);
      const res = await apiFetch(`/crm/reports/leads?${qs.toString()}`);
      setRows(res.data || []);
    } catch { toast.error('Error', 'Failed to run report'); }
    finally { setLoading(false); }
  }, [filters, toast]);

  useEffect(() => { run(); }, []); // initial load with defaults

  const visibleCols = ALL_COLUMNS.filter((c) => cols.includes(c.key));
  const shown = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => visibleCols.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q)));
  }, [rows, search, visibleCols]);

  const exportCsv = () => {
    const header = visibleCols.map((c) => c.label).join(',');
    const body = shown.map((r) => visibleCols.map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `lead-report-${today}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  };

  const print = () => {
    const head = visibleCols.map((c) => `<th style="text-align:left;border-bottom:2px solid #333;padding:6px">${c.label}</th>`).join('');
    const body = shown.map((r) => `<tr>${visibleCols.map((c) => `<td style="padding:6px;border-bottom:1px solid #ddd">${fmt(c.key, r[c.key])}</td>`).join('')}</tr>`).join('');
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Lead Report</title></head><body style="font-family:Arial;font-size:12px">
      <h2>Lead Report</h2><div>From ${filters.from || 'any'} to ${filters.to || 'any'} · ${shown.length} records</div>
      <table style="width:100%;border-collapse:collapse;margin-top:12px"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 250);
  };

  const toggleCol = (k) => setCols((c) => (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]));

  return (
    <div className="page">
      <PageHeader title="Lead Report" subtitle="Filter, view, export and print your leads" icon="bi-file-earmark-bar-graph" />

      {/* Filter bar */}
      <div className="surface p-3 mb-3">
        <div className="row g-2 align-items-end">
          <Field label="From" col={2}><input type="date" className="form-control form-control-sm" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></Field>
          <Field label="To" col={2}><input type="date" className="form-control form-control-sm" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></Field>
          <Field label="Customer" col={3}><select className="form-select form-select-sm" value={filters.company_id} onChange={(e) => setFilters({ ...filters, company_id: e.target.value })}><option value="">All Customers</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Status" col={2}><select className="form-select form-select-sm" value={filters.temperature} onChange={(e) => setFilters({ ...filters, temperature: e.target.value })}><option value="">All</option>{['Hot', 'Warm', 'Cold'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Closure" col={2}><select className="form-select form-select-sm" value={filters.closure_status} onChange={(e) => setFilters({ ...filters, closure_status: e.target.value })}><option value="">All</option>{['Open', 'Closed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <div className="col-1 d-grid"><button className="btn btn-primary btn-sm" onClick={run}><i className="bi bi-search" /></button></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-2 gap-2">
        <input className="form-control form-control-sm" style={{ maxWidth: 260 }} placeholder="Search in results..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="d-flex align-items-center gap-2">
          <span className="fs-13 text-muted-c">{shown.length} records</span>
          <div className="position-relative">
            <button className="btn btn-light btn-sm" onClick={() => setColMenu((v) => !v)}><i className="bi bi-layout-three-columns" /> Columns</button>
            {colMenu && (
              <div className="surface p-2 shadow position-absolute end-0 mt-1" style={{ zIndex: 20, width: 220, maxHeight: 320, overflow: 'auto' }}>
                {ALL_COLUMNS.map((c) => (
                  <label key={c.key} className="d-flex align-items-center gap-2 py-1 px-1 fs-13" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={cols.includes(c.key)} onChange={() => toggleCol(c.key)} />{c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-light btn-sm" onClick={exportCsv}><i className="bi bi-download" /> Export</button>
          <button className="btn btn-light btn-sm" onClick={print}><i className="bi bi-printer" /> Print</button>
        </div>
      </div>

      {/* Grid */}
      <div className="surface" style={{ overflow: 'auto' }}>
        <table className="table table-hover align-middle mb-0">
          <thead><tr>{visibleCols.map((c) => <th key={c.key} className="text-nowrap fs-13">{c.label}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={visibleCols.length} className="text-center py-4 text-muted-c">Loading…</td></tr>
              : shown.length === 0 ? <tr><td colSpan={visibleCols.length} className="text-center py-4 text-muted-c">No records match the filters.</td></tr>
                : shown.map((r) => (
                  <tr key={r.id}>{visibleCols.map((c) => (
                    <td key={c.key} className="fs-13 text-nowrap">
                      {c.key === 'temperature' ? <Badge tone={{ Hot: 'tone-red', Warm: 'tone-amber', Cold: 'tone-blue' }[r.temperature] || 'tone-gray'} dot>{r.temperature || '—'}</Badge>
                        : c.key === 'closure_status' ? <Badge tone={{ Open: 'tone-blue', Closed: 'tone-green', Cancelled: 'tone-gray' }[r.closure_status] || 'tone-gray'}>{r.closure_status || 'Open'}</Badge>
                          : fmt(c.key, r[c.key])}
                    </td>))}</tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
