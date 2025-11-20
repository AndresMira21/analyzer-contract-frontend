import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, supabaseConfigured, profileTable } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
const backendUrl = process.env.REACT_APP_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';

type AuthUser = {
  name?: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: () => boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name?: string, email?: string) => Promise<void>;
};

const HISTORY_KEY = 'auth:sessions_history';
const HISTORY_PREFIX = 'auth:sessions_history:';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const name = window.localStorage.getItem('auth:name') || undefined;
        const email = window.localStorage.getItem('auth:email') || '';
        const token = window.localStorage.getItem('authToken') || window.sessionStorage.getItem('authToken') || '';
        if (token && email) {
          setUser({ email, name });
          return;
        }
        if (supabaseConfigured && supabase) {
          const { data } = await supabase.auth.getUser();
          const u = data.user;
          if (u && active) {
            const nm = (u.user_metadata as any)?.name as string | undefined;
            setUser({ email: u.email || '', name: nm });
          }
        }
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  const login = useCallback(async (email: string, password: string, _rememberMe: boolean = true) => {
    const url = backendUrl ? `${backendUrl}/api/auth/login` : '/api/auth/login';
    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
    } catch {
      throw new Error('No se pudo conectar con el servidor');
    }
    if (!res.ok) {
      let errorBody: any = null;
      try { errorBody = await res.json(); } catch {}
      const msg = String(errorBody?.message || errorBody?.error || '');
      const userExists = errorBody?.userExists;
      if (res.status === 404 || userExists === false || /no\s+registrado|no\s+existe|not\s+registered|user\s+not\s+found/i.test(msg)) {
        throw new Error('El usuario no está registrado.');
      }
      throw new Error(msg || 'Credenciales inválidas');
    }
    const data = await res.json();
    const token = String(data.token || '');
    const fullName = String(data.fullName || '');
    const session: AuthUser = { email: String(data.email || email), name: fullName || undefined };
    if (_rememberMe) {
      window.localStorage.setItem('authToken', token);
      window.localStorage.setItem('auth:name', session.name || '');
      window.localStorage.setItem('auth:email', session.email);
    } else {
      window.sessionStorage.setItem('authToken', token);
      window.sessionStorage.setItem('auth:name', session.name || '');
      window.sessionStorage.setItem('auth:email', session.email);
    }
    try {
      const key = `${HISTORY_PREFIX}${session.email}`;
      const rawUser = window.localStorage.getItem(key);
      const rawGlobal = window.localStorage.getItem(HISTORY_KEY);
      const userArr = rawUser ? (JSON.parse(rawUser) as { email: string; name?: string; ts: string }[]) : [];
      const globalArr = rawGlobal ? (JSON.parse(rawGlobal) as { email: string; name?: string; ts: string }[]) : [];
      const base = [...userArr, ...globalArr.filter((h) => h.email === session.email)];
      const entry = { email: session.email, name: session.name, ts: new Date().toISOString() };
      const mk = entry.ts.slice(0, 16);
      const exists = base.some((h) => h.email === entry.email && String(h.ts).slice(0, 16) === mk);
      const mergedIn = exists ? base : [entry, ...base];
      const seen = new Set<string>();
      const deduped: { email: string; name?: string; ts: string }[] = [];
      for (const h of mergedIn) {
        const k = `${String(h.email)}:${String(h.ts).slice(0, 16)}`;
        if (!seen.has(k)) { seen.add(k); deduped.push(h); }
      }
      const nextHist = deduped.slice(0, 20);
      window.localStorage.setItem(key, JSON.stringify(nextHist));
    } catch {}
    if (supabaseConfigured && supabase) {
      try {
        const hashed = await bcrypt.hash(password, 10);
        await supabase.from(profileTable).upsert({ email: session.email, full_name: session.name, password: hashed, role: 'user' }, { onConflict: 'email' });
      } catch {}
    }
    setUser(session);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const url = backendUrl ? `${backendUrl}/api/auth/register` : '/api/auth/register';
    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, credentials: 'include', body: JSON.stringify({ fullName: name, email, password }) });
    } catch {
      throw new Error('No se pudo conectar con el servidor');
    }
    if (!res.ok) throw new Error('Registro inválido');
    try {
      if (supabaseConfigured && supabase) {
        const hashed = await bcrypt.hash(password, 10);
        await supabase.from(profileTable).upsert({ email, full_name: name, password: hashed, role: 'user' }, { onConflict: 'email' });
      }
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    try { if (supabaseConfigured && supabase) await supabase.auth.signOut(); } catch {}
    try { window.localStorage.removeItem('authToken'); window.sessionStorage.removeItem('authToken'); window.localStorage.removeItem('auth:name'); window.localStorage.removeItem('auth:email'); window.sessionStorage.removeItem('auth:name'); window.sessionStorage.removeItem('auth:email'); } catch {}
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (name?: string, email?: string) => {
    const payload: { data?: Record<string, any>; email?: string } = {};
    if (name !== undefined) payload.data = { name };
    if (email && email !== user?.email) payload.email = email;
    try { if (supabaseConfigured && supabase) await supabase.auth.updateUser(payload); } catch {}
    const next: AuthUser = { name: name ?? user?.name, email: email ?? user?.email ?? '' };
    try {
      if (supabaseConfigured && supabase) {
        await supabase.from(profileTable).upsert({ email: next.email, full_name: next.name }, { onConflict: 'email' });
      }
    } catch {}
    try {
      const key = `${HISTORY_PREFIX}${next.email}`;
      const rawUser = window.localStorage.getItem(key);
      const rawGlobal = window.localStorage.getItem(HISTORY_KEY);
      const userArr = rawUser ? (JSON.parse(rawUser) as { email: string; name?: string; ts: string }[]) : [];
      const globalArr = rawGlobal ? (JSON.parse(rawGlobal) as { email: string; name?: string; ts: string }[]) : [];
      const base = [...userArr, ...globalArr.filter((h) => h.email === next.email)];
      const updated = base.map((h) => h.email === next.email ? { ...h, name: next.name } : h);
      const seen = new Set<string>();
      const deduped: { email: string; name?: string; ts: string }[] = [];
      for (const h of updated) {
        const k = `${String(h.email)}:${String(h.ts).slice(0, 16)}`;
        if (!seen.has(k)) { seen.add(k); deduped.push(h); }
      }
      const trimmed = deduped.slice(0, 20);
      window.localStorage.setItem(key, JSON.stringify(trimmed));
    } catch {}
    setUser(next);
  }, [user]);

  const isAuthenticated = useCallback(() => {
    if (user) return true;
    const token = window.localStorage.getItem('authToken') || window.sessionStorage.getItem('authToken');
    return !!token;
  }, [user]);


  const value = useMemo<AuthContextValue>(() => ({ user, login, register, logout, updateProfile, isAuthenticated }), [user, login, register, logout, updateProfile, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
