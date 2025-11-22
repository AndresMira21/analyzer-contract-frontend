import type { JSX, ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import Input from '../ui/input';
import ContractDetailModal from '../contracts/ContractDetailModal';
import UploadContractModal from '../UploadContractModal';
const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

type Contract = {
  id: string;
  name: string;
  date: string;
  status: 'En revisión' | 'Riesgo alto' | 'Aprobado';
  risk: 'Muy bajo' | 'Bajo' | 'Medio' | 'Alto' | 'Muy alto';
  score: number;
};

const data: Contract[] = [];

export default function ContractsPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const contractsKey = user?.email ? `contractsCache:${user.email}` : 'contractsCache:guest';
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [risk, setRisk] = useState('');
  const [dateOrder, setDateOrder] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [override, setOverride] = useState<any | null>(null);
  const [rowsState, setRowsState] = useState<Contract[]>(data);
  const isMountedRef = useRef(true);

  type DeletedNode = { id: string; next: string | null; prev?: string | null; data: Contract & { deletedAt: string } };
  const getDeletedHead = (): string | null => {
    const v = window.localStorage.getItem('deleted:head');
    return v && v !== 'null' ? v : null;
  };
  const setDeletedHead = (id: string | null) => {
    window.localStorage.setItem('deleted:head', id ?? '');
  };
  const getDeletedTail = (): string | null => {
    const v = window.localStorage.getItem('deleted:tail');
    return v && v !== 'null' ? v : null;
  };
  const setDeletedTail = (id: string | null) => {
    window.localStorage.setItem('deleted:tail', id ?? '');
  };
  const getDeletedMap = (): Record<string, DeletedNode> => {
    try { const raw = window.localStorage.getItem('deleted:nodes'); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  };
  const setDeletedMap = (m: Record<string, DeletedNode>) => {
    try { window.localStorage.setItem('deleted:nodes', JSON.stringify(m)); } catch {}
  };
  const appendDeleted = (row: Contract) => {
    const map = getDeletedMap();
    const node: DeletedNode = { id: row.id, next: null, prev: null, data: { ...row, deletedAt: new Date().toISOString() } };
    if (map[row.id]) { map[row.id] = node; }
    const tail = getDeletedTail();
    if (!getDeletedHead()) { setDeletedHead(row.id); }
    if (tail && map[tail]) { map[tail].next = row.id; node.prev = tail; }
    setDeletedTail(row.id);
    map[row.id] = node;
    setDeletedMap(map);
  };

  useEffect(() => {
    setRowsState([]);
  }, [contractsKey]);

  useEffect(() => {
    (async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
        if (!apiBase || !token) return;
        const res = await fetch(`${apiBase}/contracts/user`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const list = await res.json();
          const rows = Array.isArray(list) ? list.map((item: any) => ({
            id: String(item.id ?? ''),
            name: String(item.name ?? ''),
            date: String(item.uploadedAt ?? new Date().toISOString().slice(0, 10)),
            status: 'En revisión' as const,
            risk: String(item.riskScore >= 80 ? 'Muy alto' : item.riskScore >= 60 ? 'Alto' : item.riskScore >= 40 ? 'Medio' : item.riskScore >= 20 ? 'Bajo' : 'Muy bajo') as Contract['risk'],
            score: Number(item.riskScore ?? 0),
          })) : [];
          setRowsState(() => rows);
          try { localStorage.setItem(contractsKey, JSON.stringify(rows)); } catch {}
        }
      } catch {}
    })();
    try {
      const raw = localStorage.getItem(contractsKey);
      if (raw) {
        const arr = JSON.parse(raw) as Contract[];
        setRowsState(prev => {
          const map = new Map<string, Contract>();
          [...prev, ...arr].forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    } catch {}
  }, [contractsKey]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const sseUrl = (process.env.REACT_APP_CONTRACTS_SSE as string | undefined) || '';
    const wsUrl = (process.env.REACT_APP_CONTRACTS_WS as string | undefined) || '';
    let es: EventSource | null = null;
    let ws: WebSocket | null = null;
    let active = true;
    const upsert = (list: Contract[], item: any) => {
      const row: Contract = {
        id: String(item.id ?? ''),
        name: String(item.name ?? ''),
        date: String(item.date ?? item.uploadedAt ?? new Date().toISOString().slice(0, 10)),
        status: (item.status as Contract['status']) ?? 'En revisión',
        risk: String(item.risk ?? (item.riskScore >= 80 ? 'Muy alto' : item.riskScore >= 60 ? 'Alto' : item.riskScore >= 40 ? 'Medio' : item.riskScore >= 20 ? 'Bajo' : 'Muy bajo')) as Contract['risk'],
        score: Number(item.score ?? item.riskScore ?? 0),
      };
      if (!row.id || !row.name) return list;
      const map = new Map(list.map(r => [r.id, r] as const));
      map.set(row.id, row);
      return Array.from(map.values());
    };
    const handle = (raw: any) => {
      if (!active || !isMountedRef.current) return;
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(data)) {
          setRowsState(prev => data.reduce(upsert, prev));
          return;
        }
        if (data && typeof data === 'object') {
          setRowsState(prev => upsert(prev, data));
        }
      } catch {}
    };
    if (sseUrl) {
      try {
        es = new EventSource(sseUrl, { withCredentials: true });
        es.onmessage = (e) => handle(e.data);
      } catch {}
    } else if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => handle(ev.data as string);
      } catch {}
    }
    return () => {
      active = false;
      if (es) try { es.close(); } catch {}
      if (ws) try { ws.close(); } catch {}
    };
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== contractsKey || e.newValue === null) return;
      try {
        const arr = JSON.parse(e.newValue) as Contract[];
        setRowsState(prev => {
          const map = new Map<string, Contract>();
          [...prev, ...arr].forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        });
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [contractsKey]);

  const filtered = useMemo(() => {
    let rows = rowsState;
    if (query) rows = rows.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
    if (status) rows = rows.filter(r => r.status === status);
    if (risk) rows = rows.filter(r => r.risk === risk);
    if (dateOrder === 'asc') rows = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    if (dateOrder === 'desc') rows = [...rows].sort((a, b) => b.date.localeCompare(a.date));
    return rows;
  }, [rowsState, query, status, risk, dateOrder]);

  useEffect(() => {
    const st: any = location.state as any;
    if (st && st.analyzedContract) {
      const ac = st.analyzedContract as {
        id: string; name: string; uploadedAt: string; status: 'En revisión' | 'Aprobado' | 'Riesgo alto'; riskScore: number; clauses: string[]; risks: string[]; recommendations: string[]; summary?: string;
      };
      const riskText = ac.riskScore >= 80 ? 'Muy alto' : ac.riskScore >= 60 ? 'Alto' : ac.riskScore >= 40 ? 'Medio' : ac.riskScore >= 20 ? 'Bajo' : 'Muy bajo';
      const exists = rowsState.some(r => r.id === ac.id);
      if (!exists) {
        const row = { id: ac.id, name: ac.name, date: ac.uploadedAt, status: ac.status, risk: riskText, score: ac.riskScore } as Contract;
        setRowsState(prev => [...prev, row]);
        try {
          const raw = localStorage.getItem(contractsKey);
          const arr = raw ? (JSON.parse(raw) as Contract[]) : [];
          const map = new Map<string, Contract>();
          [...arr, row].forEach(r => map.set(r.id, r));
          localStorage.setItem(contractsKey, JSON.stringify(Array.from(map.values())));
        } catch {}
      }
      setOverride(ac);
      setSelectedId(ac.id);
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, rowsState]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-end gap-4 w-full md:w-auto">
          <div className="space-y-2 w-full md:w-[360px]">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">Mis contratos</h1>
            <Input placeholder="Buscar contrato" value={query} onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const v = e.target.value;
              const trimmedStart = v.replace(/^\s+/, '');
              const noDouble = trimmedStart.replace(/ {2,}/g, ' ');
              const alnum = noDouble.replace(/[^A-Za-z0-9 ]+/g, '');
              const limited = alnum.slice(0, 10);
              setQuery(limited);
            }} />
          </div>
        </motion.div>
        <div className="flex items-center gap-3">
          <Button className="text-white h-10 md:h-11 px-4 md:px-6 rounded-2xl" style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #22D3EE 100%)', boxShadow: '0 14px 34px rgba(34,211,238,0.25)' }} onClick={() => setIsUploadOpen(true)}>Subir contrato</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full flex-wrap">
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-4 py-3 bg-slate-900/80 border border-blue-500/30 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50">
          <option value="">Estado</option>
          <option>En revisión</option>
          <option>Riesgo alto</option>
          <option>Aprobado</option>
        </select>
        <select value={risk} onChange={e => setRisk(e.target.value)} className="px-4 py-3 bg-slate-900/80 border border-blue-500/30 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50">
          <option value="">Riesgo</option>
          <option>Muy bajo</option>
          <option>Bajo</option>
          <option>Medio</option>
          <option>Alto</option>
          <option>Muy alto</option>
        </select>
        <select value={dateOrder} onChange={e => setDateOrder(e.target.value)} className="px-4 py-3 bg-slate-900/80 border border-blue-500/30 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50">
          <option value="">Fecha</option>
          <option value="asc">Más antiguos</option>
          <option value="desc">Más recientes</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} whileHover={{ y: -2 }}>
        <Card className="p-0 overflow-hidden rounded-2xl transition-all" style={{ borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)', borderRadius: '16px' }}>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-slate-300">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Fecha de subida</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Riesgo</th>
                  <th className="px-6 py-3">Puntaje</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
          <tbody>
                        {filtered.length === 0 && (
                          <tr className="border-t border-slate-800/60">
                            <td colSpan={6} className="px-6 py-6 text-slate-400 text-center">No tienes contratos aún</td>
                          </tr>
                        )}
                        {filtered.map((row, idx) => (
                          <motion.tr key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.35, delay: 0.05 * idx }} className="border-t border-slate-800/60 hover:bg-slate-800/40">
                            <td className="px-6 py-4 text-slate-200">{row.name}</td>
                            <td className="px-6 py-4 text-slate-300">{row.date}</td>
                            <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: row.status === 'Aprobado' ? 'rgba(34,197,94,0.15)' : row.status === 'Riesgo alto' ? 'rgba(239,68,68,0.15)' : 'rgba(58,123,255,0.12)', color: row.status === 'Aprobado' ? '#22C55E' : row.status === 'Riesgo alto' ? '#EF4444' : '#3A7BFF' }}>{row.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{row.risk}</td>
                    <td className="px-6 py-4 text-white font-bold">{row.score}</td>
                            <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Button size="lg" className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={async () => { setSelectedId(row.id); let overrideData: any = null; const envDetails = (process.env.REACT_APP_CONTRACT_DETAILS as string | undefined) || ''; try { const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''; const url = envDetails ? (envDetails.includes(':id') ? envDetails.replace(':id', row.id) : `${envDetails}?id=${encodeURIComponent(row.id)}`) : `${backendUrl}/api/contracts/${row.id}`; const res = await fetch(url, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : undefined }); const data = await res.json(); overrideData = { id: String(data.id ?? row.id), name: String(data.name ?? row.name), uploadedAt: String(data.uploadedAt ?? row.date), status: (data.status as 'En revisión' | 'Aprobado' | 'Riesgo alto') ?? row.status, riskScore: Number(data.riskScore ?? row.score), clauses: Array.isArray(data.keyClauses) ? data.keyClauses.map(String) : Array.isArray(data.clauses) ? data.clauses.map(String) : [], risks: Array.isArray(data.risks) ? data.risks.map(String) : [], recommendations: Array.isArray(data.recommendations) ? data.recommendations.map(String) : [], summary: data.summary ? String(data.summary) : undefined }; } catch {} setOverride(overrideData); setIsModalOpen(true); }}>Ver detalles</Button>
                                <Button size="lg" variant="outline" className="text-white" style={{ borderColor: 'rgba(58,123,255,0.28)' }} onClick={() => { const ok = window.confirm('¿Eliminar este contrato?'); if (!ok) return; appendDeleted(row); setRowsState(prev => prev.filter(r => r.id !== row.id)); try { const raw = localStorage.getItem(contractsKey); const arr = raw ? (JSON.parse(raw) as Contract[]) : []; const next = arr.filter(r => r.id !== row.id); localStorage.setItem(contractsKey, JSON.stringify(next)); } catch {} if (selectedId === row.id) { setIsModalOpen(false); setSelectedId(null); } }}>Eliminar</Button>
                              </div>
                            </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="md:hidden p-4 space-y-4">
            {filtered.length === 0 && (
              <div className="text-slate-400 text-center">No tienes contratos aún</div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((row, idx) => (
                <motion.div key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 * idx }} className="rounded-2xl border" style={{ borderColor: 'rgba(58,123,255,0.24)', backgroundColor: 'rgba(20,30,60,0.22)' }}>
                  <div className="p-4 space-y-3">
                    <div className="text-white font-semibold text-lg">{row.name}</div>
                    <div className="text-slate-300 text-sm">Fecha: {row.date}</div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: row.status === 'Aprobado' ? 'rgba(34,197,94,0.15)' : row.status === 'Riesgo alto' ? 'rgba(239,68,68,0.15)' : 'rgba(58,123,255,0.12)', color: row.status === 'Aprobado' ? '#22C55E' : row.status === 'Riesgo alto' ? '#EF4444' : '#3A7BFF' }}>{row.status}</span>
                      <span className="text-slate-200 text-sm">{row.risk}</span>
                      <span className="text-white font-bold">{row.score}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button size="lg" className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={async () => { setSelectedId(row.id); let overrideData: any = null; const envDetails = (process.env.REACT_APP_CONTRACT_DETAILS as string | undefined) || ''; try { const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''; const url = envDetails ? (envDetails.includes(':id') ? envDetails.replace(':id', row.id) : `${envDetails}?id=${encodeURIComponent(row.id)}`) : `${backendUrl}/api/contracts/${row.id}`; const res = await fetch(url, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : undefined }); const data = await res.json(); overrideData = { id: String(data.id ?? row.id), name: String(data.name ?? row.name), uploadedAt: String(data.uploadedAt ?? row.date), status: (data.status as 'En revisión' | 'Aprobado' | 'Riesgo alto') ?? row.status, riskScore: Number(data.riskScore ?? row.score), clauses: Array.isArray(data.keyClauses) ? data.keyClauses.map(String) : Array.isArray(data.clauses) ? data.clauses.map(String) : [], risks: Array.isArray(data.risks) ? data.risks.map(String) : [], recommendations: Array.isArray(data.recommendations) ? data.recommendations.map(String) : [], summary: data.summary ? String(data.summary) : undefined }; } catch {} setOverride(overrideData); setIsModalOpen(true); }}>Ver detalles</Button>
                      <Button size="lg" variant="outline" className="text-white" style={{ borderColor: 'rgba(58,123,255,0.28)' }} onClick={() => { const ok = window.confirm('¿Eliminar este contrato?'); if (!ok) return; appendDeleted(row); setRowsState(prev => prev.filter(r => r.id !== row.id)); try { const raw = localStorage.getItem(contractsKey); const arr = raw ? (JSON.parse(raw) as Contract[]) : []; const next = arr.filter(r => r.id !== row.id); localStorage.setItem(contractsKey, JSON.stringify(next)); } catch {} if (selectedId === row.id) { setIsModalOpen(false); setSelectedId(null); } }}>Eliminar</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
      {isUploadOpen && (
        <UploadContractModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploaded={(file) => {
            try {
              const key = `${user?.email ? `user:${user.email}` : 'user:guest'}:activity`;
              const raw = window.localStorage.getItem(key);
              const arr = raw ? JSON.parse(raw) : [];
              const ev = { id: `EV-${Date.now()}`, title: `Contrato subido: ${file.contractName || file.name}`, ts: new Date().toISOString(), type: 'note' as const };
              const next = [ev, ...arr];
              window.localStorage.setItem(key, JSON.stringify(next));
            } catch {}
            navigate('/dashboard/contracts');
          }}
        />
      )}
      <ContractDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} contractId={selectedId ?? ''} override={override ?? undefined} />
    </div>
  );
}
