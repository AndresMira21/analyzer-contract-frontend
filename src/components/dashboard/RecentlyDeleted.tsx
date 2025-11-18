import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

type DeletedContract = { id: string; title: string; type: string; deletedAt: string };

export default function RecentlyDeleted(): JSX.Element {
  const [items, setItems] = useState<DeletedContract[]>([]);
  const cardStyle = useMemo(() => ({ backgroundColor: 'rgba(20,30,60,0.32)', borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)', borderRadius: '16px' }), []);
  const isMountedRef = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('contractsDeleted');
      const arr = raw ? JSON.parse(raw) as DeletedContract[] : [];
      setItems(arr);
    } catch {
      setItems([]);
    }
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const persist = (list: DeletedContract[]) => {
    setItems(list);
    try { window.localStorage.setItem('contractsDeleted', JSON.stringify(list)); } catch {}
  };

  const restore = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const restoreUrl = (process.env.REACT_APP_DELETED_RESTORE as string | undefined) || '';
    if (restoreUrl) {
      try {
        await fetch(restoreUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }), credentials: 'include' });
      } catch {}
    } else {
      try {
        const raw = window.localStorage.getItem('contractsCache');
        const arr = raw ? JSON.parse(raw) : [];
        const row = { id: item.id, name: item.title, date: new Date().toISOString().slice(0, 10), status: 'En revisión', risk: 'Bajo', score: 0 };
        const map = new Map<string, any>();
        [...arr, row].forEach((r: any) => map.set(r.id, r));
        window.localStorage.setItem('contractsCache', JSON.stringify(Array.from(map.values())));
      } catch {}
    }
    persist(items.filter(i => i.id !== id));
  };

  const removeForever = async (id: string) => {
    const removeUrl = (process.env.REACT_APP_DELETED_REMOVE as string | undefined) || '';
    if (removeUrl) {
      try { await fetch(removeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }), credentials: 'include' }); } catch {}
    }
    persist(items.filter(i => i.id !== id));
  };

  useEffect(() => {
    const sseUrl = (process.env.REACT_APP_DELETED_SSE as string | undefined) || '';
    const wsUrl = (process.env.REACT_APP_DELETED_WS as string | undefined) || '';
    let es: EventSource | null = null;
    let ws: WebSocket | null = null;

    const upsert = (list: DeletedContract[], item: DeletedContract) => {
      const map = new Map(list.map((n) => [n.id, n] as const));
      map.set(item.id, item);
      return Array.from(map.values()).sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
    };

    const apply = (raw: any) => {
      if (!isMountedRef.current) return;
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(data)) {
          const arr: DeletedContract[] = data.map((d) => ({ id: String(d.id ?? ''), title: String(d.title ?? d.name ?? ''), type: String(d.type ?? d.contractType ?? 'Desconocido'), deletedAt: String(d.deletedAt ?? d.date ?? new Date().toISOString()) })).filter((x) => x.id && x.title);
          setItems(arr.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt)));
          return;
        }
        if (data && typeof data === 'object') {
          const item: DeletedContract = { id: String(data.id ?? ''), title: String(data.title ?? data.name ?? ''), type: String(data.type ?? data.contractType ?? 'Desconocido'), deletedAt: String(data.deletedAt ?? data.date ?? new Date().toISOString()) };
          if (!item.id || !item.title) return;
          setItems((prev) => upsert(prev, item));
        }
      } catch {}
    };

    if (sseUrl) {
      try {
        es = new EventSource(sseUrl, { withCredentials: true });
        es.onmessage = (e) => apply(e.data);
      } catch {}
    } else if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => apply(ev.data as string);
      } catch {}
    }
    return () => {
      if (es) try { es.close(); } catch {}
      if (ws) try { ws.close(); } catch {}
    };
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">Recientemente Eliminados</h2>

      <Card className="p-6 backdrop-blur transition-all" style={cardStyle}>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-slate-500">No hay contratos eliminados recientemente</div>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(20,30,60,0.22)' }}>
                <div>
                  <div className="text-slate-200">{it.title}</div>
                  <div className="text-slate-500 text-sm">{new Date(it.deletedAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} • {it.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button className="text-white" onClick={() => restore(it.id)}>Restaurar</Button>
                  <Button variant="outline" className="text-white" onClick={() => removeForever(it.id)}>Eliminar permanentemente</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}