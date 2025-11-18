import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element | null {
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    (async () => {
      setAllowed(isAuthenticated());
      if (active) setChecked(true);
    })();
    return () => { active = false; };
  }, [isAuthenticated]);

  if (!checked) return null;
  if (!allowed) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}