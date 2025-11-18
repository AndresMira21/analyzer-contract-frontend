import type { JSX } from 'react';
import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Brain, Settings, LogOut, User, Trash2, Menu } from 'lucide-react';

type Props = {
  userName: string;
  userEmail?: string;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onItemSelected: () => void;
};

export default function DashboardSidebar({ userName, userEmail, onLogout, collapsed, onToggleCollapsed, onItemSelected }: Props): JSX.Element {
  const linkBase = useMemo(() => (
    collapsed
      ? 'flex items-center justify-center px-4 py-3 rounded-xl text-slate-300 transition-all hover:bg-slate-800/40'
      : 'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 transition-all hover:bg-slate-800/40'
  ), [collapsed]);
  const activeBase = 'text-white';

  return (
    <aside className="border-r backdrop-blur-xl flex flex-col h-full" style={{ backgroundColor: 'rgba(20,30,60,0.28)', borderColor: 'rgba(58, 123, 255, 0.18)', width: collapsed ? 80 : 288, transition: 'width 220ms ease' }}>
      <div className="px-4 py-4 space-y-4" style={{ borderBottom: '1px solid rgba(58,123,255,0.18)', backgroundColor: 'rgba(20,30,60,0.22)' }}>
        <div className="flex items-center gap-3">
          <button aria-label="Abrir menú" onClick={onToggleCollapsed} className="p-2 rounded-lg hover:bg-slate-800 transition-colors" title={collapsed ? 'Expandir' : 'Plegar'}>
            <Menu className="h-5 w-5" color="#3A7BFF" />
          </button>
          {!collapsed && (
            <div className="w-9 h-9 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: '#3A7BFF' }}>
              <User className="h-5 w-5" />
            </div>
          )}
          {!collapsed && (
            <div className="text-white font-semibold" style={{ transition: 'opacity 180ms ease' }}>{userName}</div>
          )}
        </div>
      </div>

      <nav className="px-4 py-6 space-y-1">
        <NavLink to="/dashboard" end title={collapsed ? 'Dashboard' : undefined} onClick={onItemSelected} className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`} style={({ isActive }) => ({ borderLeft: isActive ? '2px solid #3A7BFF' : '2px solid transparent', backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'transparent' })}>
          <Home className="h-5 w-5" color="#3A7BFF" />
          {!collapsed && <span style={{ transition: 'opacity 180ms ease' }}>Dashboard</span>}
        </NavLink>
        <NavLink to="/dashboard/contracts" title={collapsed ? 'Contratos' : undefined} onClick={onItemSelected} className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`} style={({ isActive }) => ({ borderLeft: isActive ? '2px solid #3A7BFF' : '2px solid transparent', backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'transparent' })}>
          <FileText className="h-5 w-5" color="#3A7BFF" />
          {!collapsed && <span>Contratos</span>}
        </NavLink>
        <NavLink to="/dashboard/ai" title={collapsed ? 'Chat Legal' : undefined} onClick={onItemSelected} className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`} style={({ isActive }) => ({ borderLeft: isActive ? '2px solid #3A7BFF' : '2px solid transparent', backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'transparent' })}>
          <Brain className="h-5 w-5" color="#3A7BFF" />
          {!collapsed && <span>Chat Legal</span>}
        </NavLink>
        <NavLink to="/dashboard/settings" title={collapsed ? 'Configuración' : undefined} onClick={onItemSelected} className={({ isActive }) => `${linkBase} ${isActive ? activeBase : ''}`} style={({ isActive }) => ({ borderLeft: isActive ? '2px solid #3A7BFF' : '2px solid transparent', backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'transparent' })}>
          <Settings className="h-5 w-5" color="#3A7BFF" />
          {!collapsed && <span>Configuración</span>}
        </NavLink>
      </nav>

      <div className="mt-auto px-4 py-6 space-y-3" style={{ borderTop: '1px solid rgba(58,123,255,0.18)' }}>
        <NavLink to="/dashboard/recently-deleted" title={collapsed ? 'Recientemente Eliminados' : undefined} onClick={onItemSelected} className={({ isActive }) => `${collapsed ? 'flex items-center justify-center px-3 py-3 rounded-xl' : 'flex items-center gap-3 px-3 py-3 rounded-xl'} ${isActive ? 'text-white' : 'text-slate-300'}`} style={({ isActive }) => ({ backgroundColor: isActive ? 'rgba(58,123,255,0.12)' : 'rgba(20,30,60,0.22)' })}>
          <Trash2 className="h-5 w-5" color="#3A7BFF" />
          {!collapsed && <span className="text-slate-300">Recientemente Eliminados</span>}
        </NavLink>
        <button onClick={onLogout} title={collapsed ? 'Cerrar sesión' : undefined} className={`${collapsed ? 'w-full flex items-center justify-center px-4 py-3' : 'w-full flex items-center gap-3 px-4 py-3'} rounded-xl text-white transition-all`} style={{ backgroundColor: 'rgba(20,30,60,0.35)' }}>
          <LogOut className="h-5 w-5" color="#3A7BFF" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}