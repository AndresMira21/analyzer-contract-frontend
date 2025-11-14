import React, { createContext, useContext, useMemo, useState } from 'react';

type AuthUser = { name: string; email: string } | null;

type AuthContextValue = {
  user: AuthUser;
  login: (email: string, password: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);

  const login = (email: string, _password: string) => {
    // Simulated login: set a fake user
    setUser({ name: 'Usuario Ejemplo', email });
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = () => !!user;

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout, isAuthenticated }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}