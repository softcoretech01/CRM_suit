import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useCrm } from './CrmContext';

const AuthContext = createContext(null);
const USER_KEY = 'ts_user';
const TOKEN_KEY = 'token';

export function AuthProvider({ children }) {
  const { roles } = useCrm() || {};

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const userWithRole = currentUser ? {
    ...currentUser,
    roleDef: roles?.find((r) => r.id === currentUser.role_id) || { matrix: {} }
  } : null;

  const login = useCallback((user, token) => {
    setCurrentUser(user);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    // Ideally redirect to login page here if managed by router, but simple reload works too
    window.location.reload();
  }, []);

  const value = {
    currentUser: userWithRole,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
