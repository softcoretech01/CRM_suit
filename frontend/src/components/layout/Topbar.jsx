import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { Avatar } from '../common/Ui';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useCrm } from '../../context/CrmContext';
import { getTodayISO } from '../../utils/format';

const TITLES = {
  dashboard: 'Dashboard', leads: 'Leads', companies: 'Companies', contacts: 'Contacts',
  opportunities: 'Opportunities', proposals: 'Proposals', documents: 'Documents',
  'email-campaigns': 'Email Campaigns', 'email-templates': 'Email Templates',
  whatsapp: 'WhatsApp', 'whatsapp-campaigns': 'WhatsApp Campaigns',
  'marketing-automation': 'Marketing Automation', approvals: 'Approvals',
  notifications: 'Notifications', reports: 'Reports & Analytics',
  activities: 'Activities', pipeline: 'Sales Pipeline',
  masters: 'Masters', users: 'Users', roles: 'Roles', permissions: 'Permissions',
  profile: 'My Profile', new: 'Create', 'followups': 'Follow-ups',
};

function crumbLabel(seg) {
  return TITLES[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return { open, setOpen, ref };
}

export default function Topbar({ onToggleSidebar, onToggleMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { portal, portalId, signOut } = usePortal();
  const crm = useCrm();
  const notif = useDropdown();
  const segments = location.pathname.split('/').filter(Boolean);
  const module = segments[0] ? crumbLabel(segments[0]) : 'Dashboard';

  const TODAY = getTodayISO();
  const fuDay = (f) => { const v = f.next_followup_date || f.followup_date; return v ? String(v).replace('T', ' ').slice(0, 10) : ''; };
  const fuName = (f) => f.lead_name || f.opportunity_name || f.company_name || 'Follow-up';
  const fuSubject = (f) => f.activity || f.followup_type || 'Follow-up';
  // Notifications = pending follow-ups that are due now — today or overdue (not future ones), soonest first.
  const pendingFollowups = (crm?.followUps || [])
    .filter((f) => f.status !== 'Completed' && f.status !== 'Done' && fuDay(f) && fuDay(f) <= TODAY)
    .sort((a, b) => (fuDay(a) < fuDay(b) ? -1 : 1));
  const notifCount = pendingFollowups.length;

  const quickItems = [
    { icon: 'bi-lightning-charge', label: 'New Lead', to: '/leads/new' },
    { icon: 'bi-building-add', label: 'New Company', to: '/companies?new=1' },
    { icon: 'bi-person-plus', label: 'New Contact', to: '/contacts?new=1' },
    { icon: 'bi-graph-up-arrow', label: 'New Opportunity', to: '/opportunities?new=1' },
    { divider: true },
    { icon: 'bi-file-earmark-check', label: 'New Proposal', to: '/proposals/new' },
    { icon: 'bi-cloud-arrow-up', label: 'Upload Document', to: '/documents?upload=1' },
    { divider: true },
    { icon: 'bi-envelope-paper', label: 'New Email Campaign', to: '/email-campaigns/new' },
    { icon: 'bi-megaphone', label: 'New WA Campaign', to: '/whatsapp-campaigns/new' },
    { icon: 'bi-robot', label: 'New Automation', to: '/marketing-automation/new' },
    { divider: true },
    { icon: 'bi-telephone', label: 'Log Call', to: '/activities?new=Call' },
    { icon: 'bi-people', label: 'Schedule Meeting', to: '/activities?new=Meeting' },
    { icon: 'bi-bell', label: 'Schedule Follow-up', to: '/activities?new=Task' },
    { icon: 'bi-sticky', label: 'Add Note', to: '/activities?new=Note' },
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn desktop-only" onClick={onToggleSidebar} aria-label="Toggle sidebar" title="Toggle sidebar">
          <i className="bi bi-list" />
        </button>
        <button className="icon-btn mobile-only" onClick={onToggleMobile} aria-label="Open menu">
          <i className="bi bi-list" />
        </button>
        <div className="crumb desktop-only">
          <span className="crumb-portal"><i className={`bi ${portal.icon}`} /> {currentUser?.tenant_company_name || portal.short}</span>
          <i className="bi bi-chevron-right" />
          <span className="cur">{module}</span>
        </div>
      </div>

      <div className="topbar-right d-flex align-items-center gap-3">
        {portalId === 'crm' && (
          <div className="position-relative" ref={notif.ref}>
            <button 
              className="icon-btn position-relative" 
              onClick={() => notif.setOpen(!notif.open)}
              aria-label="Pending Follow-ups"
              title="Pending Follow-ups"
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-hover)', border: 'none', color: 'var(--text-color)' }}
            >
              <i className="bi bi-bell" />
              {notifCount > 0 && (
                <span className="badge bg-danger rounded-pill position-absolute" style={{ top: '0', right: '0', fontSize: '10px', padding: '3px 5px', transform: 'translate(30%, -30%)' }}>
                  {notifCount}
                </span>
              )}
            </button>
            
            {notif.open && (
              <div className="dropdown-menu show dropdown-menu-end shadow" style={{ position: 'absolute', top: '100%', right: 0, width: '320px', padding: 0, marginTop: '8px' }}>
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                  <span className="fw-7">Pending Follow-ups</span>
                  <span className="badge bg-danger rounded-pill">{notifCount} pending</span>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {pendingFollowups.length > 0 ? pendingFollowups.map(f => (
                    <div key={f.id} className="p-3 border-bottom hover-bg-light cursor-pointer" onClick={() => { navigate('/activities/followups'); notif.setOpen(false); }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="bi bi-clock-history text-primary-c" />
                        <span className="fw-6 fs-13 text-truncate">{fuName(f)}</span>
                      </div>
                      <div className="fs-12 text-muted-c d-flex justify-content-between">
                        <span className="text-truncate" style={{ maxWidth: '58%' }}>{fuSubject(f)}</span>
                        <span className={fuDay(f) < TODAY ? 'text-danger fw-6' : fuDay(f) === TODAY ? 'text-primary fw-6' : 'text-secondary-c fw-6'}>
                          {fuDay(f) < TODAY ? 'Overdue' : fuDay(f) === TODAY ? 'Due Today' : fuDay(f)}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-muted-c fs-13">You're all caught up! 🎉</div>
                  )}
                </div>
                <div className="p-2 border-top text-center bg-light">
                  <button className="btn btn-link btn-sm text-decoration-none w-100" onClick={() => { navigate('/activities/followups'); notif.setOpen(false); }}>View all follow-ups</button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="user-chip ms-2" style={{ cursor: 'pointer' }}>
          <Avatar name={currentUser.name} src={currentUser.profile_pic} size="md" color={currentUser.avatarColor} />
          <div className="desktop-only">
            <div className="u-name">{currentUser.name}</div>
            <div className="u-role">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
