import { useState } from 'react';
import { initials, colorFor } from '../../utils/format';
import { BACKEND_URL, getMediaUrl } from '../../utils/api';

// ---------- Badge ----------
export function Badge({ tone = 'tone-gray', children, dot = false, icon }) {
  return (
    <span className={`badge-pill ${tone}`}>
      {dot && <span className="dot" />}
      {icon && <i className={`bi ${icon}`} style={{ fontSize: 11 }} />}
      {children}
    </span>
  );
}

// ---------- Avatar ----------
export function Avatar({ name = '', size = 'md', color, src }) {
  if (!name && !src) return null;
  const dims = { sm: 24, md: 36, lg: 48 }[size] || 36;
  const fs = { sm: 11, md: 14, lg: 18 }[size] || 14;
  const bg = color || colorFor(name || '');
  
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    const imgUrl = getMediaUrl(src);
    return (
      <img 
        src={imgUrl} 
        alt={name} 
        className="rounded-circle flex-shrink-0"
        style={{ width: dims, height: dims, objectFit: 'cover' }}
        title={name}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div 
      className="d-flex align-items-center justify-content-center text-white fw-6 rounded-circle flex-shrink-0"
      style={{ width: dims, height: dims, fontSize: fs, background: bg, userSelect: 'none' }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}

export function UserCell({ name, sub, color, size = 'sm', hideAvatar }) {
  if (!name || name === '—') return <span className="text-muted-c">—</span>;
  return (
    <div className="d-flex align-items-center gap-2">
      {!hideAvatar && <Avatar name={name} size={size} color={color} />}
      <div style={{ minWidth: 0 }}>
        <div className="fw-6" style={{ lineHeight: 1.2 }}>{name}</div>
        {sub && <div className="fs-12 text-muted-c text-truncate">{sub}</div>}
      </div>
    </div>
  );
}

// ---------- Section (form group) ----------
export function Section({ title, subtitle, icon, children, right }) {
  return (
    <div className="mb-4">
      {(title || right) && (
        <div className="d-flex align-items-center mb-3">
          {icon && (
            <span className="me-2 d-inline-flex align-items-center justify-content-center"
              style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <i className={`bi ${icon}`} />
            </span>
          )}
          <div>
            {title && <div className="fw-7" style={{ fontSize: 14 }}>{title}</div>}
          </div>
          {right && <div className="ms-auto">{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ---------- Empty state ----------
export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="text-center p-5 surface" style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <i className={`bi ${icon} text-muted-c`} style={{ fontSize: 48, marginBottom: 16 }} />
      <h4 className="fw-6 mb-2">{title}</h4>
      <p className="text-secondary-c mb-4" style={{ maxWidth: 400 }}>{message}</p>
      {action}
    </div>
  );
}

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m of ['00', '15', '30', '45']) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 === 0 ? 12 : h % 12;
    TIME_OPTIONS.push({ 
      val: `${String(h).padStart(2,'0')}:${m}`, 
      label: `${String(hr).padStart(2,'0')}:${m} ${ampm}` 
    });
  }
}

export function TimeSelect({ value, onChange, className = "form-select" }) {
  return (
    <select className={className} value={value} onChange={onChange}>
      <option value="">--:--</option>
      {TIME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
    </select>
  );
}

// ---------- Error state ----------
export function ErrorState({ onRetry, message = "We couldn't load this information." }) {
  return (
    <div className="state-box">
      <div className="sb-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
        <i className="bi bi-exclamation-octagon" />
      </div>
      <h4>Something went wrong</h4>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise" /> Try Again
        </button>
      )}
    </div>
  );
}

// ---------- Skeletons ----------
export function Skeleton({ w = '100%', h = 14, r = 6, className = '', style = {} }) {
  return <div className={`skel ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="p-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="d-flex align-items-center gap-3 py-2">
          <Skeleton w={32} h={32} r={16} />
          {Array.from({ length: cols }).map((__, j) => (
            <Skeleton key={j} w={`${18 + ((i + j) % 4) * 6}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton w={42} h={42} r={11} />
      <Skeleton w="55%" h={24} style={{ marginTop: 14 }} />
      <Skeleton w="40%" h={12} style={{ marginTop: 10 }} />
    </div>
  );
}

// ---------- Tabs ----------
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => {
        const key = typeof t === 'string' ? t : t.key;
        const label = typeof t === 'string' ? t : t.label;
        const count = typeof t === 'object' ? t.count : undefined;
        const icon = typeof t === 'object' ? t.icon : undefined;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active === key}
            className={`tab ${active === key ? 'active' : ''}`}
            onClick={() => onChange(key)}
          >
            {icon && <i className={`bi ${icon}`} />}
            {label}
            {count != null && <span className="tab-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Progress meter ----------
export function Meter({ value, max = 100, tone = 'var(--primary)', height = 8 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ background: '#eef2f7', borderRadius: 999, height, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: tone, borderRadius: 999, transition: 'width 0.4s' }} />
    </div>
  );
}

// ---------- Field (label + control wrapper) ----------
export function Field({ label, required, error, hint, children, col = 12 }) {
  return (
    <div className={`col-md-${col} mb-3`}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {error && <div className="field-error"><i className="bi bi-exclamation-circle" /> {error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  );
}

// ---------- Card ----------
export function Card({ title, children, className = '', noPadding = false, style = {}, right }) {
  return (
    <div className={`surface ${className}`} style={{ ...style, padding: noPadding ? 0 : undefined }}>
      {(title || right) && (
        <div className={`d-flex justify-content-between align-items-center border-bottom ${noPadding ? 'p-4' : 'px-4 pt-4 pb-3 mb-3'}`}>
          {title && <h5 className="mb-0 fw-6 fs-16">{title}</h5>}
          {right && <div>{right}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4 pt-0'}>
        {children}
      </div>
    </div>
  );
}
