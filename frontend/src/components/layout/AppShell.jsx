import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { portalForPath, PORTALS } from '../../config/portals';
import { allowedPortalsFor } from '../../data/permissionDefaults';

export default function AppShell() {
  const { authed, portal } = usePortal();
  const { currentUser } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // The permission matrix returned at login (authoritative), falling back to the role definition.
  const matrix = (currentUser?.permissions && Object.keys(currentUser.permissions).length)
    ? currentUser.permissions
    : currentUser?.roleDef?.matrix;

  // 1) Portal-level access: block deep links into portals the user has no permission for.
  const allowed = allowedPortalsFor(matrix);
  if (allowed.length > 0) {
    const routePortal = portalForPath(location.pathname);
    if (!allowed.includes(routePortal)) {
      const dest = allowed.includes(portal.id) ? portal.id : allowed[0];
      return <Navigate to={PORTALS[dest].home} replace />;
    }
  }

  // 2) Screen-level access: if the current route maps to a nav screen the role can't
  //    access, redirect to the first screen it CAN access in that portal.
  if (matrix && Object.keys(matrix).length > 0) {
    const routePortalId = portalForPath(location.pathname);
    const pconf = PORTALS[routePortalId];
    if (pconf) {
      let matched = null;
      pconf.nav.forEach((sec) => sec.items.forEach((it) => {
        if (location.pathname === it.to || location.pathname.startsWith(it.to + '/')) {
          if (!matched || it.to.length > matched.to.length) matched = it;
        }
      }));
      if (matched && matrix[routePortalId]?.[matched.label] !== true) {
        let firstAllowed = pconf.home;
        outer: for (const sec of pconf.nav) {
          for (const it of sec.items) {
            if (matrix[routePortalId]?.[it.label] === true) { firstAllowed = it.to; break outer; }
          }
        }
        return <Navigate to={firstAllowed} replace />;
      }
    }
  }

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} style={{ zIndex: 1035 }} />}
      <div className={`main-wrap ${collapsed ? 'collapsed' : ''}`}>
        <Topbar
          onToggleSidebar={() => setCollapsed((c) => !c)}
          onToggleMobile={() => setMobileOpen((m) => !m)}
        />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
