import type { JSX } from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

type ContractRow = { id: string; name: string; date: string; status: 'En revisión' | 'Riesgo alto' | 'Aprobado'; risk: 'Muy bajo' | 'Bajo' | 'Medio' | 'Alto' | 'Muy alto'; score: number };
type DeletedNode = { id: string; next: string | null; prev?: string | null; data: ContractRow & { deletedAt: string } };

export default function RecentlyDeleted(): JSX.Element {
  const [items, setItems] = useState<DeletedNode[]>([]);
  const cardStyle = useMemo(() => ({ backgroundColor: 'rgba(20,30,60,0.32)', borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)', borderRadius: '16px' }), []);
  const isMountedRef = useRef(true);
  const { user } = useAuth();
  const contractsKey = user?.email ? `contractsCache:${user.email}` : 'contractsCache:guest';

  const getHead = (): string | null => {
    const v = window.localStorage.getItem('deleted:head');
    return v && v !== 'null' && v !== '' ? v : null;
  };
  const getTail = (): string | null => {
    const v = window.localStorage.getItem('deleted:tail');
    return v && v !== 'null' && v !== '' ? v : null;
  };
  const getMap = (): Record<string, DeletedNode> => {
    try { const raw = window.localStorage.getItem('deleted:nodes'); return raw ? JSON.parse(raw) as Record<string, DeletedNode> : {}; } catch { return {}; }
  };
  const setMap = (m: Record<string, DeletedNode>) => {
    try { window.localStorage.setItem('deleted:nodes', JSON.stringify(m)); } catch {}
  };
  const toArray = useCallback((): DeletedNode[] => {
    const map = getMap();
    const head = getHead();
    const linear: DeletedNode[] = [];
    let cur = head ? map[head] : undefined;
    while (cur) { linear.push(cur); cur = cur.next ? map[cur.next] : undefined; }
    if (linear.length <= 1) return linear;
    const first = linear[0];
    const last = linear[linear.length - 1];
    last.next = first.id;
    first.prev = last.id;
    const out: DeletedNode[] = [];
    let node = first;
    let count = 0;
    while (node && count < linear.length) { out.push(node); node = node.next ? map[node.next] : null as any; count++; }
    last.next = linear.length > 1 ? linear[1]?.id ?? null : null;
    if (first.prev) first.prev = undefined;
    return out;
  }, []);

  useEffect(() => {
    setItems(toArray());
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, [toArray]);

  const persist = () => {
    setItems(toArray());
  };

  const restore = async (id: string) => {
    const head = getHead();
    const map = getMap();
    if (!head) return;
    let prev: DeletedNode | null = null;
    let cur: DeletedNode | null = map[head] || null;
    while (cur && cur.id !== id) { prev = cur; cur = cur.next ? map[cur.next] || null : null; }
    if (!cur) return;
    try {
      const raw = window.localStorage.getItem(contractsKey);
      const arr = raw ? JSON.parse(raw) : [];
      const m2 = new Map<string, any>();
      [...arr, { id: cur.data.id, name: cur.data.name, date: cur.data.date, status: cur.data.status, risk: cur.data.risk, score: cur.data.score }].forEach((r: any) => m2.set(r.id, r));
      window.localStorage.setItem(contractsKey, JSON.stringify(Array.from(m2.values())));
    } catch {}
    const tail = getTail();
    if (!prev) {
      const nextId = cur.next;
      window.localStorage.setItem('deleted:head', nextId ?? '');
      if (tail === cur.id) window.localStorage.setItem('deleted:tail', nextId ?? '');
    } else {
      prev.next = cur.next;
      map[prev.id] = prev;
      if (tail === cur.id) window.localStorage.setItem('deleted:tail', prev.id);
    }
    delete map[cur.id];
    setMap(map);
    persist();
  };

  const removeForever = async (id: string) => {
    const backendUrl = (process.env.REACT_APP_BACKEND_URL as string | undefined) || '';
    if (backendUrl) {
      try { await fetch(`${backendUrl}/api/contracts/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' }); } catch {}
    }
    const head = getHead();
    const map = getMap();
    if (!head) return;
    let prev: DeletedNode | null = null;
    let cur: DeletedNode | null = map[head] || null;
    while (cur && cur.id !== id) { prev = cur; cur = cur.next ? map[cur.next] || null : null; }
    if (!cur) return;
    const tail = getTail();
    if (!prev) {
      const nextId = cur.next;
      window.localStorage.setItem('deleted:head', nextId ?? '');
      if (tail === cur.id) window.localStorage.setItem('deleted:tail', nextId ?? '');
    } else {
      prev.next = cur.next;
      map[prev.id] = prev;
      if (tail === cur.id) window.localStorage.setItem('deleted:tail', prev.id);
    }
    delete map[cur.id];
    setMap(map);
    persist();
  };

  useEffect(() => {
    const sseUrl = (process.env.REACT_APP_DELETED_SSE as string | undefined) || '';
    const wsUrl = (process.env.REACT_APP_DELETED_WS as string | undefined) || '';
    let es: EventSource | null = null;
    let ws: WebSocket | null = null;

    const appendNode = (n: DeletedNode) => {
      const map = getMap();
      const head = getHead();
      const tail = getTail();
      if (!head) window.localStorage.setItem('deleted:head', n.id);
      if (tail && map[tail]) { map[tail].next = n.id; n.prev = tail; }
      window.localStorage.setItem('deleted:tail', n.id);
      map[n.id] = n;
      setMap(map);
    };

    const apply = (raw: any) => {
      if (!isMountedRef.current) return;
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(data)) {
          for (const d of data) {
            const id = String(d.id ?? '');
            const name = String(d.title ?? d.name ?? '');
            if (!id || !name) continue;
            const node: DeletedNode = { id, next: null, data: { id, name, date: String(d.date ?? new Date().toISOString().slice(0, 10)), status: 'En revisión', risk: 'Medio', score: Number(d.score ?? 0), deletedAt: String(d.deletedAt ?? new Date().toISOString()) } };
            appendNode(node);
          }
          setItems(toArray());
          return;
        }
        if (data && typeof data === 'object') {
          const id = String(data.id ?? '');
          const name = String(data.title ?? data.name ?? '');
          if (!id || !name) return;
          const node: DeletedNode = { id, next: null, data: { id, name, date: String(data.date ?? new Date().toISOString().slice(0, 10)), status: 'En revisión', risk: 'Medio', score: Number(data.score ?? 0), deletedAt: String(data.deletedAt ?? new Date().toISOString()) } };
          appendNode(node);
          setItems(toArray());
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
            items.map((node) => (
              <div key={node.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(20,30,60,0.22)' }}>
                <div>
                  <div className="text-slate-200">{node.data.name}</div>
                  <div className="text-slate-500 text-sm">{new Date(node.data.deletedAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button className="text-white" onClick={() => restore(node.id)}>Restaurar</Button>
                  <Button variant="outline" className="text-white" onClick={() => removeForever(node.id)}>Eliminar permanentemente</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}