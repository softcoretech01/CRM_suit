import { createContext, useContext, useState, useCallback } from 'react';
import { currentUser as defaultUser } from '../data/mockData';
import { useCrm } from './CrmContext';

const AuthContext = createContext(null);
const USER_KEY = 'ts_user';

export function AuthProvider({ children }) {
  const { roles } = useCrm();

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    return defaultUser;
  });

  // Ensure currentUser has the up-to-date role definition from CrmContext
  const userWithRole = {
    ...currentUser,
    roleDef: roles?.find((r) => r.name === currentUser.role) || { matrix: {} }
  };

  const login = useCallback((user) => {
    setCurrentUser(user);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(defaultUser);
    sessionStorage.removeItem(USER_KEY);
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
