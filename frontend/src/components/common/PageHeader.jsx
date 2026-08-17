import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, subtitle, actions, back, icon }) {
  const navigate = useNavigate();
  return (
    <div className="page-header">
      {back && (
        <button className="btn btn-light btn-icon" onClick={() => navigate(back === true ? -1 : back)} aria-label="Back" style={{ marginTop: 2 }}>
          <i className="bi bi-arrow-left" />
        </button>
      )}
      {icon && (
        <span className="d-inline-flex align-items-center justify-content-center"
          style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)', flexShrink: 0 }}>
          <i className={`bi ${icon}`} style={{ fontSize: 22 }} />
        </span>
      )}
      <div style={{ minWidth: 0 }}>
        <div className="ph-title">{title}</div>
      </div>
      {actions && <div className="ph-actions">{actions}</div>}
    </div>
  );
}
