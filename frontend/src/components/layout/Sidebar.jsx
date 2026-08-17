import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { PORTAL_ORDER } from '../../config/portals';
import { Avatar } from '../../components/common/Ui';

export default function Sidebar({ collapsed, mobileOpen, onNavigate }) {
  const navigate = useNavigate();
  const { portal, portals, portalId, switchPortal, signOut } = usePortal();
  const { currentUser } = useAuth();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switchRef = useRef(null);

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

  const logout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo" style={{ background: portal.gradient }}>T</div>
        <div className="brand-text">
          <div className="name">Techspire<span className="text-danger">.</span></div>
          <div className="sub">{portal.short.toUpperCase()} PORTAL</div>
        </div>
      </div>


      <nav className="sidebar-nav">
        {portal.nav.map((section, idx) => {
          // Filter items based on the user's role matrix for this portal
          const visibleItems = section.items.filter((it) => {
            const roleMatrix = currentUser?.roleDef?.matrix;
            if (!roleMatrix || !roleMatrix[portal.id]) return true; // If no matrix, allow by default
            return roleMatrix[portal.id][it.label] === true;
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
