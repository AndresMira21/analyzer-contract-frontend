import type { JSX } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, AlertTriangle, FileText, Info } from 'lucide-react';
import type { Notification } from '../../hooks/useNotifications';

type Props = {
  item: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function NotificationItem({ item, onRead, onDelete }: Props): JSX.Element {
  const icon = item.type === 'risk' ? AlertTriangle : item.type === 'contract' ? FileText : item.type === 'alert' ? AlertCircle : Info;
  const Icon = icon;
  const bg = 'rgba(20,30,60,0.32)';
  const border = 'rgba(58,123,255,0.24)';

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.35 }}>
      <Card className="p-4 rounded-2xl" style={{ backgroundColor: bg, borderColor: border }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(58,123,255,0.15)' }}>
              <Icon className="h-6 w-6" color="#3A7BFF" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-white font-semibold">{item.title}</div>
                {!item.read && <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#3A7BFF' }} />}
              </div>
              <div className="text-slate-300 text-sm">{item.message}</div>
              <div className="text-slate-500 text-xs mt-1">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!item.read && (
              <Button variant="outline" className="text-white" style={{ borderColor: 'rgba(58,123,255,0.28)' }} onClick={() => onRead(item.id)}>Marcar leída</Button>
            )}
            <Button variant="outline" className="text-white" style={{ borderColor: 'rgba(58,123,255,0.28)' }} onClick={() => onDelete(item.id)}>Eliminar</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}