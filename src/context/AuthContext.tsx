import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  name?: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: () => boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const SESSION_KEY = 'auth:session';
const REGISTERED_KEY = 'auth:registeredUser';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed && parsed.email) setUser(parsed);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const login = async (email: string, _password: string, _rememberMe: boolean = true) => {
    // Simulated login: accept any credentials, persist session in localStorage
    // If a registered user exists and matches email, attach its name
    let name: string | undefined;
    try {
      const rawReg = window.localStorage.getItem(REGISTERED_KEY);
      if (rawReg) {
        const reg = JSON.parse(rawReg) as { name?: string; email?: string };
        if (reg && reg.email === email) name = reg.name;
      }
    } catch {
      // ignore
    }
    const session: AuthUser = { email, name };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const register = async (name: string, email: string, _password: string) => {
    // Simulated register: save a test user in localStorage
    const registered = { name, email };
    window.localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered));
    // Not auto-logging in; login remains explicit via login()
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const isAuthenticated = () => {
    if (user) return true;
    try {
      return !!window.localStorage.getItem(SESSION_KEY);
    } catch {
      return false;
    }
  };

  const value = useMemo<AuthContextValue>(() => ({ user, login, register, logout, isAuthenticated }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}