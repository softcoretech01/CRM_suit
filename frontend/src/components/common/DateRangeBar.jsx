import { useState, useEffect } from 'react';

// True if `dateVal` (any date/datetime string) falls within the applied range.
export function inRange(dateVal, range) {
  if (!range || (!range.from && !range.to)) return true;
  const d = dateVal ? String(dateVal).replace('T', ' ').slice(0, 10) : '';
  if (!d) return false;
  if (range.from && d < range.from) return false;
  if (range.to && d > range.to) return false;
  return true;
}

const pad = (n) => String(n).padStart(2, '0');
// Default filter window: 1st of the current month → today.
export function defaultRange() {
  const d = new Date();
  const from = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
  const to = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { from, to };
}

/**
 * A reusable From/To date filter bar with Search + Cancel buttons.
 * Defaults to the current month (1st → today) and applies it on mount.
 * Calls onApply({ from, to }) when Search/Cancel is pressed (and once on mount).
 */
export default function DateRangeBar({ onApply, autoApply = true }) {
  const def = defaultRange();
  const [from, setFrom] = useState(autoApply ? def.from : '');
  const [to, setTo] = useState(autoApply ? def.to : '');

  // Apply the default window once when the bar mounts.
  useEffect(() => {
    if (autoApply) onApply({ from: def.from, to: def.to });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="d-flex flex-wrap align-items-center gap-3 bg-white p-2 border rounded shadow-sm mb-3">
      <div className="d-flex align-items-center gap-2">
        <span className="fs-13 fw-6 text-secondary-c">From</span>
        <input type="date" className="form-control form-control-sm" style={{ width: 160 }} value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="d-flex align-items-center gap-2">
        <span className="fs-13 fw-6 text-secondary-c">To</span>
        <input type="date" className="form-control form-control-sm" style={{ width: 160 }} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="d-flex align-items-center gap-2 border-start ps-3">
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => onApply({ from, to })}>
          <i className="bi bi-search" /> Search
        </button>
        <button className="btn btn-light btn-sm d-flex align-items-center gap-1" onClick={() => { setFrom(''); setTo(''); onApply({ from: '', to: '' }); }}>
          <i className="bi bi-x-circle" /> Cancel
        </button>
      </div>
    </div>
  );
}
