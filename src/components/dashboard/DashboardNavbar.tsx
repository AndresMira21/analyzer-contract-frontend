import type { JSX } from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';
import { Input } from '../ui/input';

type Props = {
  userName: string;
};

export default function DashboardNavbar({ userName }: Props): JSX.Element {
  return (
    <header className="h-16 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur flex items-center px-6">
      <div className="flex-1 flex items-center gap-3">
        <Search className="h-5 w-5 text-slate-400" />
        <Input placeholder="Buscar contratos..." className="h-10 bg-slate-800/60 border-slate-700/60 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500" />
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-slate-300 hover:text-blue-300">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-2 inline-block w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 text-slate-200">
          <UserCircle className="h-7 w-7 text-blue-400" />
          <span className="font-medium">{userName}</span>
        </div>
      </div>
    </header>
  );
}