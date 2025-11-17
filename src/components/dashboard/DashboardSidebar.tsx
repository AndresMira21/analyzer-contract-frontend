import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Upload, Brain, Settings, LogOut, User } from 'lucide-react';

type Props = {
  userName: string;
  userEmail?: string;
  onLogout: () => void;
};

export default function DashboardSidebar({ userName, userEmail, onLogout }: Props): JSX.Element {
  const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-blue-300 hover:bg-slate-800/60 transition-all';
  const activeBase = 'bg-blue-900/40 text-blue-200';

  return (
    <aside className="w-72 border-r border-slate-700/50 bg-slate-900/60 backdrop-blur-xl">
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="text-white font-semibold">{userName}</div>
            {userEmail && <div className="text-slate-400 text-sm">{userEmail}</div>}
          </div>
        </div>
      </div>

      <nav className="px-4 py-6 space-y-1">
        <NavLink to="/dashboard" end className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`}>
          <Home className="h-5 w-5 text-blue-400" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/dashboard/contracts" className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`}>
          <FileText className="h-5 w-5 text-blue-400" />
          <span>Mis contratos</span>
        </NavLink>
        <NavLink to="/dashboard/upload" className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`}>
          <Upload className="h-5 w-5 text-blue-400" />
          <span>Subir contrato</span>
        </NavLink>
        <NavLink to="/dashboard/ai" className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`}>
          <Brain className="h-5 w-5 text-blue-400" />
          <span>Análisis con IA</span>
        </NavLink>
        <NavLink to="/dashboard/settings" className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`}>
          <Settings className="h-5 w-5 text-blue-400" />
          <span>Configuración</span>
        </NavLink>
      </nav>

      <div className="mt-auto px-4 py-6 border-t border-slate-700/50">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all">
          <LogOut className="h-5 w-5 text-blue-400" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}