import type { JSX } from 'react';
import { Bell, UserCircle } from 'lucide-react';

type Props = {
  userName: string;
};

export default function DashboardNavbar({ userName }: Props): JSX.Element {
  return (
    <header className="h-16 backdrop-blur flex items-center px-6" style={{ backgroundColor: 'rgba(20,30,60,0.35)', borderBottom: '1px solid rgba(58,123,255,0.18)' }}>
      <div className="ml-auto flex items-center gap-6">
        <button className="relative text-slate-300">
          <Bell className="h-5 w-5" color="#3A7BFF" />
          <span className="absolute -top-1 -right-2 inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#3A7BFF' }} />
        </button>
      </div>
    </header>
  );
}