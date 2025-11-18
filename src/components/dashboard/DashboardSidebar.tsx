import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Upload, Brain, Settings, LogOut, User, Trash2 } from 'lucide-react';

type Props = {
  userName: string;
  userEmail?: string;
  onLogout: () => void;
};

export default function DashboardSidebar({ userName, userEmail, onLogout }: Props): JSX.Element {
  const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 transition-all';
  const activeBase = 'text-white';

  return (
    <aside className="w-72 border-r backdrop-blur-xl flex flex-col h-full" style={{ backgroundColor: 'rgba(20,30,60,0.28)', borderColor: 'rgba(58, 123, 255, 0.18)' }}>
      <div className="px-6 py-6 space-y-4" style={{ borderBottom: '1px solid rgba(58,123,255,0.18)', backgroundColor: 'rgba(20,30,60,0.22)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: '#3A7BFF' }}>
            <User className="h-5 w-5" />
          </div>
          <div className="text-white font-semibold">{userName}</div>
        </div>
      </div>

      <nav className="px-4 py-6 space-y-1">
        <NavLink to="/dashboard" end className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`} style={({ isActive }) => ({ borderLeft: isActive ? '2px solid #3A7BFF' : '2px solid transparent', backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'transparent' })}>
          <Home className="h-5 w-5" color="#3A7BFF" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dashboard/contracts" className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`} style={({ isActive }) => ({ borderLeft: isActive ? '2px solid #3A7BFF' : '2px solid transparent', backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'transparent' })}>
          <FileText className="h-5 w-5" color="#3A7BFF" />
          <span>Contratos</span>
        </NavLink>
        
        <NavLink to="/dashboard/ai" className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`} style={({ isActive }) => ({ borderLeft: isActive ? '2px solid #3A7BFF' : '2px solid transparent', backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'transparent' })}>
          <Brain className="h-5 w-5" color="#3A7BFF" />
          <span>Chat Legal</span>
        </NavLink>
        <NavLink to="/dashboard/settings" className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`} style={({ isActive }) => ({ borderLeft: isActive ? '2px solid #3A7BFF' : '2px solid transparent', backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'transparent' })}>
          <Settings className="h-5 w-5" color="#3A7BFF" />
          <span>Configuración</span>
        </NavLink>
      </nav>

      <div className="mt-auto px-4 py-6 space-y-3" style={{ borderTop: '1px solid rgba(58,123,255,0.18)' }}>
        <NavLink to="/dashboard/recently-deleted" className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-xl ${isActive ? 'text-white' : 'text-slate-300'}`} style={({ isActive }) => ({ backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'rgba(20,30,60,0.22)' })}>
          <Trash2 className="h-5 w-5" color="#3A7BFF" />
          <span className="text-slate-300">Recientemente Eliminados</span>
        </NavLink>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white transition-all" style={{ backgroundColor: 'rgba(20,30,60,0.35)' }}>
          <LogOut className="h-5 w-5" color="#3A7BFF" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}