// ============================================================
// Formatting helpers
// ============================================================

// Indian currency formatting (Lakhs / Crores)
export function formatINR(value, opts = {}) {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  if (opts.compact !== false) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatINRFull(value) {
  if (value == null || value === '') return '—';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export function formatDate(iso, opts = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  if (opts.short) return `${day} ${month}`;
  return `${day} ${month} ${d.getFullYear()}`;
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  if (!h || !m) return timeStr;
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${String(hr12).padStart(2, '0')}:${m} ${ampm}`;
}

export function getTodayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

export function daysFromToday(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Math.round((d - TODAY) / (1000 * 60 * 60 * 24));
}

export function relativeDue(iso) {
  const days = daysFromToday(iso);
  if (days == null) return '—';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;
  return formatDate(iso, { short: true });
}

export function initials(name = '') {
  const parts = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const COLORS = ['#2563eb', '#4f46e5', '#0891b2', '#16a34a', '#d97706', '#be185d', '#7e22ce', '#0e7490', '#b45309', '#475569'];
export function colorFor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export function tempFromScore(score) {
  if (score > 60) return 'Hot';
  if (score >= 21) return 'Warm';
  return 'Cold';
}

export function tempClass(temp) {
  return { Hot: 'temp-hot', Warm: 'temp-warm', Cold: 'temp-cold' }[temp] || 'tone-gray';
}

export function priorityTone(p) {
  return { High: 'tone-red', Medium: 'tone-amber', Low: 'tone-gray' }[p] || 'tone-gray';
}

export function riskTone(r) {
  return { High: 'tone-red', Medium: 'tone-amber', Low: 'tone-green' }[r] || 'tone-gray';
}

export function statusTone(status) {
  const map = {
    New: 'tone-blue', Assigned: 'tone-indigo', Contacted: 'tone-teal', Qualified: 'tone-purple',
    'Follow-up': 'tone-amber', Demo: 'tone-teal', Proposal: 'tone-indigo', Negotiation: 'tone-amber',
    'PO Expected': 'tone-blue', Won: 'tone-green', Lost: 'tone-red',
    Active: 'tone-green', Inactive: 'tone-gray', Prospect: 'tone-blue', Paused: 'tone-amber',
    Completed: 'tone-green', Pending: 'tone-amber', Overdue: 'tone-red',
    Qualification: 'tone-blue', Requirement: 'tone-indigo',
  };
  return map[status] || 'tone-gray';
}

export function activityIcon(type) {
  const map = {
    Call: 'bi-telephone', Email: 'bi-envelope', Meeting: 'bi-people', Visit: 'bi-geo-alt',
    WhatsApp: 'bi-whatsapp', Demo: 'bi-easel', Proposal: 'bi-file-earmark-text',
    Task: 'bi-check2-square', Note: 'bi-sticky',
  };
  return map[type] || 'bi-activity';
}
