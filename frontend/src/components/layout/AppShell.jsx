import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { usePortal } from '../../context/PortalContext';

export default function AppShell() {
  const { authed } = usePortal();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
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
