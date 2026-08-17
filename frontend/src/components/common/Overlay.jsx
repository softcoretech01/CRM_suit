import { useEffect } from 'react';

function useEsc(onClose) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
}

// ---------- Right-side Drawer ----------
export function Drawer({ open, onClose, title, subtitle, icon, children, footer, width = 520 }) {
  useEsc(onClose);
  if (!open) return null;
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <aside className="drawer" style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-header">
          {icon && (
            <span className="d-inline-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <i className={`bi ${icon}`} style={{ fontSize: 18 }} />
            </span>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="fw-7" style={{ fontSize: 16 }}>{title}</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg" style={{ fontSize: 16 }} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </aside>
    </>
  );
}

// ---------- Centered Modal ----------
export function Modal({ open, onClose, title, subtitle, icon, children, footer, width = 560, tone = 'primary' }) {
  useEsc(onClose);
  if (!open) return null;
  const toneMap = {
    primary: ['var(--primary-soft)', 'var(--primary)'],
    danger: ['var(--danger-soft)', 'var(--danger)'],
    success: ['var(--success-soft)', 'var(--success)'],
    warning: ['var(--warning-soft)', 'var(--warning)'],
  };
  const [bg, fg] = toneMap[tone] || toneMap.primary;
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="modal-shell">
        <div className="modal-card" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
          <div className="mc-header">
            {icon && (
              <span className="d-inline-flex align-items-center justify-content-center"
                style={{ width: 38, height: 38, borderRadius: 10, background: bg, color: fg }}>
                <i className={`bi ${icon}`} style={{ fontSize: 19 }} />
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="fw-7" style={{ fontSize: 16 }}>{title}</div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg" style={{ fontSize: 16 }} /></button>
          </div>
          <div className="mc-body">{children}</div>
          {footer && <div className="mc-footer">{footer}</div>}
        </div>
      </div>
    </>
  );
}

// ---------- Confirm dialog ----------
export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm', tone = 'danger' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={tone === 'danger' ? 'bi-exclamation-triangle' : 'bi-question-circle'}
      tone={tone}
      width={440}
      footer={
        <>
          <button className="btn btn-light" onClick={onClose}>Cancel</button>
          <button className={`btn btn-${tone === 'danger' ? 'danger' : 'primary'}`} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-secondary-c mb-0">{message}</p>
    </Modal>
  );
}
