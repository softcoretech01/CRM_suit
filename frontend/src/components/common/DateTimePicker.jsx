// A 12-hour (AM/PM) date-time picker that works regardless of browser locale.
// value in/out: "YYYY-MM-DDTHH:mm" (24h internal) — same shape as <input type="datetime-local">.
export default function DateTimePicker({ value, onChange }) {
  const parse = (v) => {
    if (!v) return { date: '', h12: 12, min: '00', ap: 'AM' };
    const s = String(v).replace(' ', 'T');
    const date = s.slice(0, 10);
    let hh = parseInt(s.slice(11, 13), 10);
    if (Number.isNaN(hh)) hh = 0;
    const min = s.slice(14, 16) || '00';
    const ap = hh >= 12 ? 'PM' : 'AM';
    let h12 = hh % 12; if (h12 === 0) h12 = 12;
    return { date, h12, min, ap };
  };
  const p = parse(value);

  const emit = (patch) => {
    const { date, h12, min, ap } = { ...p, ...patch };
    if (!date) { onChange(''); return; }
    let h = parseInt(h12, 10) % 12;
    if (ap === 'PM') h += 12;
    onChange(`${date}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  };

  return (
    <div className="d-flex flex-wrap gap-1 align-items-center">
      <input type="date" className="form-control" style={{ minWidth: 140, flex: '1 1 140px' }}
        value={p.date} onChange={(e) => emit({ date: e.target.value })} />
      <select className="form-select" style={{ width: 64 }} value={p.h12} onChange={(e) => emit({ h12: e.target.value })}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="fw-7">:</span>
      <select className="form-select" style={{ width: 70 }} value={p.min} onChange={(e) => emit({ min: e.target.value })}>
        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select className="form-select" style={{ width: 72 }} value={p.ap} onChange={(e) => emit({ ap: e.target.value })}>
        <option value="AM">AM</option><option value="PM">PM</option>
      </select>
    </div>
  );
}
