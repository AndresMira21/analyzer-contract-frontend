import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase, supabaseConfigured, profileTable } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

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
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error('Credenciales inválidas');
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
      const rawHist = window.localStorage.getItem(HISTORY_KEY);
      const hist = rawHist ? (JSON.parse(rawHist) as { email: string; name?: string; ts: string }[]) : [];
      const entry = { email: session.email, name: session.name, ts: new Date().toISOString() };
      const nextHist = [entry, ...hist].slice(0, 10);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHist));
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
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: name, email, password }) });
    if (!res.ok) throw new Error('Registro inválido');
    if (supabaseConfigured && supabase) {
      try {
        const redirectTo = (process.env.REACT_APP_EMAIL_REDIRECT_TO as string | undefined) || undefined;
        await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: redirectTo } });
        const hashed = await bcrypt.hash(password, 10);
        await supabase.from(profileTable).upsert({ email, full_name: name, password: hashed, role: 'user' }, { onConflict: 'email' });
      } catch {}
    }
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
      const rawHist = window.localStorage.getItem(HISTORY_KEY);
      const hist = rawHist ? (JSON.parse(rawHist) as { email: string; name?: string; ts: string }[]) : [];
      const entry = { email: next.email, name: next.name, ts: new Date().toISOString() };
      const nextHist = [entry, ...hist].slice(0, 10);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHist));
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