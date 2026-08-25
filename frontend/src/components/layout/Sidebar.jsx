import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { PORTAL_ORDER } from '../../config/portals';
import { Avatar } from '../../components/common/Ui';

export default function Sidebar({ collapsed, mobileOpen, onNavigate }) {
  const navigate = useNavigate();
  const { portal, portals, portalId, switchPortal, signOut } = usePortal();
  const { currentUser } = useAuth();
  const crm = useCrm();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switchRef = useRef(null);

  const myCompany = currentUser?.tenant_company_id ? crm.adminCompanies?.find(c => String(c.id) === String(currentUser.tenant_company_id)) : null;

  useEffect(() => {
    const h = (e) => { if (switchRef.current && !switchRef.current.contains(e.target)) setSwitcherOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const changePortal = (id) => {
    setSwitcherOpen(false);
    if (id === portalId) return;
    switchPortal(id);
    navigate(portals[id].home);
    onNavigate?.();
  };

  const logout = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        await fetch('http://127.0.0.1:8000/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch(e) {
      console.error("Logout API failed", e);
    }
    // Clear all auth artifacts so no valid token lingers after logout.
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('ts_user');
    localStorage.removeItem('access_token');
    signOut();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        {myCompany?.logo_url ? (
          <img src={`http://127.0.0.1:8000${myCompany.logo_url}`} alt={myCompany.name} style={{ maxWidth: '140px', maxHeight: '46px', objectFit: 'contain', marginRight: '8px' }} />
        ) : (
          <div className="brand-logo" style={{ background: portal.gradient }}>{myCompany ? myCompany.name.charAt(0).toUpperCase() : 'T'}</div>
        )}
        <div className="brand-text">
          <div className="name" title={myCompany ? myCompany.name : 'Techspire'}>{myCompany ? myCompany.name : 'Techspire'}</div>
          <div className="sub">{portal.short.toUpperCase()}</div>
        </div>
      </div>


      <nav className="sidebar-nav">
        {portal.nav.map((section, idx) => {
          // Filter items based on the user's role matrix for this portal
          const visibleItems = section.items.filter((it) => {
            // Prefer the permission matrix returned at login (authoritative), then the role definition.
            const roleMatrix = (currentUser?.permissions && Object.keys(currentUser.permissions).length)
              ? currentUser.permissions
              : currentUser?.roleDef?.matrix;
            // If no matrix is available yet, allow (avoids a blank sidebar during load)
            if (!roleMatrix || Object.keys(roleMatrix).length === 0) return true;
            return roleMatrix[portal.id]?.[it.label] === true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx}>
              {section.group && <div className="nav-group-label">{collapsed ? '•••' : section.group}</div>}
              {visibleItems.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/dashboard' || it.to === '/masters/dashboard' || it.to === '/activities'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  data-tip={it.label}
                  onClick={onNavigate}
                >
                  {typeof it.icon === 'string' ? (
                    <i className={`bi ${it.icon}`} />
                  ) : (
                    <it.icon size={20} strokeWidth={2} className="nav-icon" />
                  )}
                  <span>{it.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-foot d-flex justify-content-start align-items-center py-3 px-4">
        <button
          onClick={logout}
          title="Log Out"
          className="btn btn-link text-decoration-none p-0 m-0 d-flex align-items-center gap-3 border-0 bg-transparent"
        >
          <i className="bi bi-box-arrow-right text-danger fs-4" />
          {!collapsed && <span className="text-danger fw-6 fs-15">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
