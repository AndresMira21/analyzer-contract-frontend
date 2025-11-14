import React from 'react';
import type { JSX } from 'react';
import { useAuth } from '../context/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-6">
        <p className="text-slate-300 text-center">No tienes acceso. Inicia sesión para continuar.</p>
      </div>
    );
  }

  return <>{children}</>;
}