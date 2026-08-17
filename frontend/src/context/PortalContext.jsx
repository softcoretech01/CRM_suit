import { createContext, useContext, useState, useCallback } from 'react';
import { PORTALS, portalForPath } from '../config/portals';

const PortalContext = createContext(null);

const AUTH_KEY = 'ts_authed';
const PORTAL_KEY = 'ts_portal';

export function PortalProvider({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [portalId, setPortalId] = useState(() => {
    const stored = sessionStorage.getItem(PORTAL_KEY);
    if (stored && PORTALS[stored]) return stored;
    return portalForPath(window.location.pathname);
  });

  const signIn = useCallback((pid = 'crm') => {
    const id = PORTALS[pid] ? pid : 'crm';
    setPortalId(id);
    setAuthed(true);
    sessionStorage.setItem(AUTH_KEY, '1');
    sessionStorage.setItem(PORTAL_KEY, id);
  }, []);

  const signOut = useCallback(() => {
    setAuthed(false);
    sessionStorage.removeItem(AUTH_KEY);
  }, []);

  const switchPortal = useCallback((pid) => {
    if (!PORTALS[pid]) return;
    setPortalId(pid);
    sessionStorage.setItem(PORTAL_KEY, pid);
  }, []);

  const value = {
    authed,
    portalId,
    portal: PORTALS[portalId] || PORTALS.crm,
    portals: PORTALS,
    signIn,
    signOut,
    switchPortal,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within PortalProvider');
  return ctx;
}
