import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

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
  updateProfile: (name?: string, email?: string) => void;
};

const SESSION_KEY = 'auth:session';
const REGISTERED_KEY = 'auth:registeredUser';
const HISTORY_KEY = 'auth:sessions_history';

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

  const login = useCallback(async (email: string, _password: string, _rememberMe: boolean = true) => {
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
    if (!name && email) {
      const local = email.split('@')[0] || '';
      name = local ? local.charAt(0).toUpperCase() + local.slice(1) : undefined;
    }
    const session: AuthUser = { email, name };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    try {
      const rawHist = window.localStorage.getItem(HISTORY_KEY);
      const hist = rawHist ? JSON.parse(rawHist) as { email: string; name?: string; ts: string }[] : [];
      const entry = { email, name, ts: new Date().toISOString() };
      const nextHist = [entry, ...hist].slice(0, 10);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHist));
    } catch {}
    setUser(session);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const registered = { name, email, password };
    window.localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered));
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback((name?: string, email?: string) => {
    const next: AuthUser = { name: name ?? user?.name, email: email ?? user?.email ?? '' };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    try {
      const rawHist = window.localStorage.getItem(HISTORY_KEY);
      const hist = rawHist ? JSON.parse(rawHist) as { email: string; name?: string; ts: string }[] : [];
      const entry = { email: next.email, name: next.name, ts: new Date().toISOString() };
      const nextHist = [entry, ...hist].slice(0, 10);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHist));
    } catch {}
    setUser(next);
  }, [user]);

  const isAuthenticated = useCallback(() => {
    if (user) return true;
    try {
      return !!window.localStorage.getItem(SESSION_KEY);
    } catch {
      return false;
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({ user, login, register, logout, updateProfile, isAuthenticated }), [user, login, register, logout, updateProfile, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}