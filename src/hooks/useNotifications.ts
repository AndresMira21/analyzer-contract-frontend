import { useEffect, useMemo, useState } from 'react';

export type NotificationType = 'info' | 'risk' | 'contract' | 'alert';

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
};

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const now = new Date();
      const data: Notification[] = [
        { id: 'N-' + now.getTime(), title: 'Nuevo contrato analizado', message: 'Tu documento ha sido procesado', type: 'contract', read: false, createdAt: new Date(now.getTime() - 5 * 60000).toISOString() },
        { id: 'N-' + (now.getTime() + 1), title: 'Se detectaron riesgos altos', message: 'Revisión recomendada', type: 'risk', read: false, createdAt: new Date(now.getTime() - 60 * 60000).toISOString() },
        { id: 'N-' + (now.getTime() + 2), title: 'Tienes una nueva recomendación legal', message: 'Consulta el panel de contratos', type: 'info', read: true, createdAt: new Date(now.getTime() - 2 * 24 * 3600000).toISOString() },
        { id: 'N-' + (now.getTime() + 3), title: 'Tu contrato fue marcado como revisado', message: 'Estatus actualizado', type: 'contract', read: true, createdAt: new Date(now.getTime() - 3 * 24 * 3600000).toISOString() },
      ];
      setItems(data);
      setLoading(false);
    }, 800);
  };

  const markRead = (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteOne = (id: string) => {
    setItems(prev => prev.filter(n => n.id !== id));
  };

  const deleteRead = () => {
    setItems(prev => prev.filter(n => !n.read));
  };

  useEffect(() => {
    const t = setTimeout(() => {}, 0);
    return () => clearTimeout(t);
  }, []);

  return { items, loading, error, fetchNotifications, markRead, markAllRead, deleteOne, deleteRead };
}