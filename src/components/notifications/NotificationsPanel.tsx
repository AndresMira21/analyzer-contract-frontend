import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, AlertTriangle, Info, CheckCircle, X, Check, FileText } from 'lucide-react';

type Tipo = 'nuevo_contrato' | 'contrato_actualizado' | 'recordatorio_vencimiento';
type Estado = 'leida' | 'no_leida';

interface ContractNotification {
  id: string;
  tipo: Tipo;
  titulo: string;
  mensaje: string;
  estado: Estado;
  fecha: string;
  link?: string;
}

function loadContractNotifications(): ContractNotification[] {
  try {
    const raw = window.localStorage.getItem('contractsCache');
    if (!raw) return [];
    const arr = JSON.parse(raw) as { id: string; name: string; date: string; status: string }[];
    const out: ContractNotification[] = arr.map((c) => {
      const dt = new Date(c.date);
      const hours = Math.floor((Date.now() - dt.getTime()) / 3600000);
      const tipo: Tipo = hours < 12 ? 'nuevo_contrato' : 'contrato_actualizado';
      const estado: Estado = hours < 6 ? 'no_leida' : 'leida';
      return {
        id: c.id,
        tipo,
        titulo: tipo === 'nuevo_contrato' ? 'Nuevo contrato' : 'Contrato actualizado',
        mensaje: tipo === 'nuevo_contrato' ? `Se analizó: ${c.name}` : `Cambios en: ${c.name}`,
        estado,
        fecha: dt.toISOString(),
        link: `/dashboard/contracts/${c.id}`,
      };
    });
    return out.sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch {
    return [];
  }
}

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ContractNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const lastIdRef = useRef<string>('');
  const pushEnabledRef = useRef<boolean>(false);

  const refreshPushPref = () => {
    try {
      const raw = window.localStorage.getItem('user:prefs:notifications');
      if (raw) {
        const prefs = JSON.parse(raw) as { push?: boolean };
        pushEnabledRef.current = !!prefs.push;
      } else {
        pushEnabledRef.current = false;
      }
    } catch {
      pushEnabledRef.current = false;
    }
  };

  const tryShowBrowserNotification = (n: ContractNotification) => {
    if (!pushEnabledRef.current) return;
    if (!('Notification' in window)) return;
    const title = n.titulo || 'Notificación';
    const body = n.mensaje || '';
    const icon = undefined;
    const openLink = () => { if (n.link) window.open(n.link, '_blank'); };
    if (Notification.permission === 'granted') {
      const noti = new Notification(title, { body, icon });
      noti.onclick = openLink;
      return;
    }
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          const noti = new Notification(title, { body, icon });
          noti.onclick = openLink;
        }
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setNotifications(loadContractNotifications());
  }, [isOpen]);

  useEffect(() => {
    setNotifications(loadContractNotifications());
    refreshPushPref();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'contractsCache' || e.newValue === null) return;
      setNotifications(loadContractNotifications());
      refreshPushPref();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const sseUrl = (process.env.REACT_APP_NOTIFICATIONS_SSE as string | undefined) || '';
    const wsUrl = (process.env.REACT_APP_NOTIFICATIONS_WS as string | undefined) || '';
    let es: EventSource | null = null;
    let ws: WebSocket | null = null;

    const upsert = (list: ContractNotification[], item: ContractNotification) => {
      const map = new Map(list.map((n) => [n.id, n] as const));
      const prev = map.get(item.id) || null;
      map.set(item.id, { ...(prev || {} as ContractNotification), ...item });
      const next = Array.from(map.values()).sort((a, b) => b.fecha.localeCompare(a.fecha));
      const newest = next[0];
      if (newest && newest.id !== lastIdRef.current) {
        lastIdRef.current = newest.id;
        if (newest.estado === 'no_leida') tryShowBrowserNotification(newest);
      }
      return next;
    };

    const parse = (raw: any): ContractNotification | null => {
      if (!raw) return null;
      const id = String(raw.id ?? '');
      const tipo = (raw.tipo ?? '') as Tipo;
      const titulo = String(raw.titulo ?? raw.title ?? '');
      const mensaje = String(raw.mensaje ?? raw.message ?? '');
      const estado = ((raw.estado as Estado) ?? (raw.read === false ? 'no_leida' : 'leida')) as Estado;
      const fecha = String(raw.fecha ?? raw.createdAt ?? new Date().toISOString());
      const link = raw.link ?? raw.url ?? undefined;
      if (!id || !titulo || !mensaje || !fecha || (tipo !== 'nuevo_contrato' && tipo !== 'contrato_actualizado' && tipo !== 'recordatorio_vencimiento')) return null;
      return { id, tipo, titulo, mensaje, estado, fecha, link };
    };

    if (sseUrl) {
      try {
        es = new EventSource(sseUrl, { withCredentials: true });
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            const item = parse(data);
            if (!item) return;
            setNotifications((prev) => upsert(prev, item));
            refreshPushPref();
          } catch {}
        };
      } catch {}
    } else if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data as string);
            const item = parse(data);
            if (!item) return;
            setNotifications((prev) => upsert(prev, item));
            refreshPushPref();
          } catch {}
        };
      } catch {}
    }

    return () => {
      if (es) try { es.close(); } catch {}
      if (ws) try { ws.close(); } catch {}
    };
  }, []);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = 420;
    const gap = 8;
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - (width + 8)));
    const top = rect.bottom + gap;
    setPos({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.estado === 'no_leida').length;

  const handleMarkAll = () => {
    setNotifications(notifications.map((n) => ({ ...n, estado: 'leida' })));
  };

  const handleDeleteRead = () => {
    setNotifications(notifications.filter((n) => n.estado !== 'leida'));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, estado: 'leida' } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (tipo: Tipo) => {
    switch (tipo) {
      case 'nuevo_contrato':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'contrato_actualizado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'recordatorio_vencimiento':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && pos && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[1100] w-[420px] bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: pos.top,
            left: pos.left,
            boxShadow: '0 8px 22px rgba(0, 0, 0, 0.45)',
            maxHeight: '520px',
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1E293B] bg-[#0F172A]">
            <h3 className="text-slate-100 mb-3">Notificaciones</h3>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAll}
                className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Marcar todas
              </button>
              <button
                onClick={handleDeleteRead}
                className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Eliminar leídas
              </button>
              <button
                onClick={() => alert('Ver todas las notificaciones')}
                className="px-3 py-1.5 text-xs text-blue-400 bg-blue-950 hover:bg-blue-900 rounded-lg transition-colors ml-auto"
              >
                Ver todas
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto" style={{ maxHeight: '400px', backgroundColor: '#0F172A' }}>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[#1E293B] hover:bg-slate-800 transition-colors ${
                    notification.estado === 'no_leida' ? 'bg-slate-800' : 'bg-[#0F172A]'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getIcon(notification.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm text-slate-100">{notification.titulo}</h4>
                        {notification.estado === 'no_leida' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{notification.mensaje}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{formatDate(notification.fecha)}</span>
                        <div className="flex gap-2">
                          {notification.estado === 'no_leida' && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1 text-slate-400 hover:text-green-400 hover:bg-green-950 rounded transition-colors"
                              title="Marcar como leída"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950 rounded transition-colors"
                            title="Eliminar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
