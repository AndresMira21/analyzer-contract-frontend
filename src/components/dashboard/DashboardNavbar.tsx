import type { JSX } from 'react';
import { NotificationsPanel } from '../notifications/NotificationsPanel';

type Props = {
  userName: string;
};

export default function DashboardNavbar({ userName }: Props): JSX.Element {
  return (
    <header className="h-16 backdrop-blur flex items-center px-6" style={{ backgroundColor: 'rgba(20,30,60,0.35)', borderBottom: '1px solid rgba(58,123,255,0.18)' }}>
      <div className="ml-auto flex items-center gap-6 relative">
        <NotificationsPanel />
      </div>
    </header>
  );
}