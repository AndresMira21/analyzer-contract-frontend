import type { JSX } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import { ProfessionalBackground } from '../ProfessionalBackground.jsx';

export default function DashboardLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-blue-950 text-white relative">
      <ProfessionalBackground />
      <div className="flex h-screen relative z-10">
        <DashboardSidebar userName={user?.name ?? 'Usuario'} userEmail={user?.email ?? ''} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <DashboardNavbar userName={user?.name ?? 'Usuario'} />
          <main className="flex-1 overflow-y-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}