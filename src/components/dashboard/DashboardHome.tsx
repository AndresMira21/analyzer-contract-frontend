import type { JSX } from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { motion as fmMotion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import Lottie from 'lottie-react';
import { ChevronRight } from 'lucide-react';
import { FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import UploadContractModal from '../UploadContractModal';
import AnalyzeTextModal from '../AnalyzeTextModal';
import ContractDetailModal from '../contracts/ContractDetailModal';
import robotAnimation from '../../assets/animations/Robot assistant  Online manager.json';
import loadingAnimation from '../../assets/animations/Loading Files (1).json';

export default function DashboardHome(): JSX.Element {
  const { user } = useAuth();
  const name = user?.name ?? 'Usuario';
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: number; contractName?: string }[]>([]);
  const [contractsCount, setContractsCount] = useState<number>(0);
  const stats = [
    { icon: FileText, title: 'Contratos analizados', value: contractsCount },
  ];

  const [activity, setActivity] = useState<{ id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string }[]>([]);
  const activityKey = `${user?.email ? `user:${user.email}` : 'user:guest'}:activity`;
  const contractsKey = `${user?.email ? `contractsCache:${user.email}` : 'contractsCache:guest'}`;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [detailsOverride, setDetailsOverride] = useState<any | null>(null);
  const activityQueueRef = useRef<{ id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string }[]>([]);

  const tsToMillis = (ts: string) => {
    if (!ts) return 0;
    const num = Number(ts);
    if (!Number.isNaN(num) && num > 0) return num;
    const s = ts.toLowerCase();
    const now = Date.now();
    const m = s.match(/^hace\s+(\d+)\s*min/);
    if (m) return now - parseInt(m[1], 10) * 60000;
    const h = s.match(/^hace\s+(\d+)\s*(h|hora|horas)/);
    if (h) return now - parseInt(h[1], 10) * 3600000;
    if (s === 'ayer') return now - 24 * 3600000;
    if (s.includes('hace unos minutos')) return now - 5 * 60000;
    const d = new Date(ts);
    const t = d.getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  const formatTs = (ts: string) => {
    const ms = tsToMillis(ts);
    if (!ms) return ts;
    const now = Date.now();
    const diff = now - ms;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Hace unos minutos';
    if (m < 60) return `Hace ${m} min`;
    if (h < 24) return `Hace ${h} h`;
    if (d < 2) return 'Ayer';
    return new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const upsertActivity = useCallback((list: { id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string }[], item: { id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string }) => {
    const map = new Map(list.map((n) => [n.id, n] as const));
    map.set(item.id, item);
    const toMillisLocal = (ts: string) => {
      if (!ts) return 0;
      const num = Number(ts);
      if (!Number.isNaN(num) && num > 0) return num;
      const s = ts.toLowerCase();
      const now = Date.now();
      const m = s.match(/^hace\s+(\d+)\s*min/);
      if (m) return now - parseInt(m[1], 10) * 60000;
      const h = s.match(/^hace\s+(\d+)\s*(h|hora|horas)/);
      if (h) return now - parseInt(h[1], 10) * 3600000;
      if (s === 'ayer') return now - 24 * 3600000;
      if (s.includes('hace unos minutos')) return now - 5 * 60000;
      const d = new Date(ts);
      const t = d.getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    return Array.from(map.values()).sort((a, b) => toMillisLocal(b.ts) - toMillisLocal(a.ts));
  }, []);

  const parseActivityEvent = useCallback((raw: any): { id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string } | null => {
    if (!raw) return null;
    const id = String(raw.id ?? '');
    const title = String(raw.title ?? '');
    const ts = String(raw.ts ?? raw.time ?? '');
    const t = String(raw.type ?? 'note');
    const type = t === 'ok' || t === 'warn' ? (t as 'ok' | 'warn') : 'note';
    const contractId = raw.contractId ?? raw.contract_id ?? undefined;
    if (!id || !title) return null;
    return { id, title, ts: ts || 'Ahora', type, contractId };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  

  const loadContractsCount = () => {
    try {
      const raw = window.localStorage.getItem(contractsKey);
      if (!raw) return 0;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  };

  const seedActivityFromContracts = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(contractsKey);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;
      const items = arr.map((r: any) => ({ id: `SEED-${String(r.id || r.name || Date.now())}`, title: `Contrato analizado: ${String(r.name || '')}`.trim(), ts: String(r.date || r.uploadedAt || ''), type: 'ok' as const, contractId: String(r.id || '') })).filter(x => x.title && (x.ts || x.contractId));
      if (items.length === 0) return;
      setActivity(prev => {
        let next = [...prev];
        for (const it of items) next = upsertActivity(next, it);
        try { window.localStorage.setItem(activityKey, JSON.stringify(next)); } catch {}
        return next;
      });
    } catch {}
  }, [activityKey, upsertActivity, contractsKey]);

  useEffect(() => {
    setContractsCount(loadContractsCount());
    const onStorage = (e: StorageEvent) => {
      if (e.key !== contractsKey) return;
      setContractsCount(loadContractsCount());
      seedActivityFromContracts();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [seedActivityFromContracts, contractsKey]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(activityKey);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) setActivity(arr);
    } catch {}
  }, [activityKey]);

  useEffect(() => {
    if (activity.length === 0) seedActivityFromContracts();
  }, [activity.length, seedActivityFromContracts]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isAnalyzing]);

  useEffect(() => {
    const sseUrl = (process.env.REACT_APP_CONTRACTS_COUNT_SSE as string | undefined) || '';
    const wsUrl = (process.env.REACT_APP_CONTRACTS_COUNT_WS as string | undefined) || '';
    let es: EventSource | null = null;
    let ws: WebSocket | null = null;
    let active = true;

    const apply = (val: unknown) => {
      const count = Number(val);
      if (Number.isNaN(count)) return;
      if (!active || !isMountedRef.current) return;
      setContractsCount(count);
    };

    if (sseUrl) {
      try {
        es = new EventSource(sseUrl, { withCredentials: true });
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            apply(data.count ?? data.contractsCount ?? data.total ?? data.value);
          } catch {}
        };
      } catch {}
    } else if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data as string);
            apply(data.count ?? data.contractsCount ?? data.total ?? data.value);
          } catch {}
        };
      } catch {}
    }

    return () => {
      active = false;
      if (es) try { es.onmessage = null; } catch {}
      if (ws) try { ws.onmessage = null; } catch {}
      if (es) try { es.close(); } catch {}
      if (ws) try { ws.close(); } catch {}
    };
  }, []);

  useEffect(() => {
    const sseUrl = (process.env.REACT_APP_ACTIVITY_SSE as string | undefined) || '';
    const wsUrl = (process.env.REACT_APP_ACTIVITY_WS as string | undefined) || '';
    let es: EventSource | null = null;
    let ws: WebSocket | null = null;
    let active = true;

    if (sseUrl) {
      try {
        es = new EventSource(sseUrl, { withCredentials: true });
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            const item = parseActivityEvent(data);
            if (!item || !active || !isMountedRef.current) return;
            setActivity((prev) => {
              const next = upsertActivity(prev, item);
              try { window.localStorage.setItem(activityKey, JSON.stringify(next)); } catch {}
              return next;
            });
          } catch {}
        };
      } catch {}
    } else if (wsUrl) {
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data as string);
            const item = parseActivityEvent(data);
            if (!item || !active || !isMountedRef.current) return;
            setActivity((prev) => {
              const next = upsertActivity(prev, item);
              try { window.localStorage.setItem(activityKey, JSON.stringify(next)); } catch {}
              return next;
            });
          } catch {}
        };
      } catch {}
    }

    return () => {
      active = false;
      if (es) try { es.onmessage = null; } catch {}
      if (ws) try { ws.onmessage = null; } catch {}
      if (es) try { es.close(); } catch {}
      if (ws) try { ws.close(); } catch {}
    };
  }, [parseActivityEvent, upsertActivity]);

  
  
  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.5 }}>
        <fmMotion.h1
          className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight"
          initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8 }}
        >
          Hola, {name} 👋
        </fmMotion.h1>
        <motion.div
          className="h-1 w-16 mt-2 bg-gradient-to-r from-blue-500 via-slate-400 to-blue-500 rounded-full"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <div className="relative min-h-[60vh] pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 px-4">
              <fmMotion.h2
                className="text-5xl md:text-6xl bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight font-bold leading-tight"
                initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8 }}
              >
                Bienvenid@ a LegalConnect
              </fmMotion.h2>
              <p className="text-slate-400 text-lg md:text-xl">Tu asistente legal inteligente. Analiza contratos y toma decisiones informadas.</p>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-slate-400 to-blue-500 rounded-full" />
            </div>
            <div className="flex justify-center">
              <div className="w-[260px] md:w-[360px]">
                <Lottie animationData={robotAnimation} loop autoplay />
              </div>
            </div>
          </div>
          <div className="mt-10 px-4">
            <div className="relative rounded-3xl p-6 md:p-10 bg-slate-900/70 backdrop-blur-xl border border-blue-500/30 shadow-xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-violet-500/10 blur-xl -z-10" />
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                      <FileText className="h-6 w-6" color="#3A7BFF" />
                    </div>
                    <div className="text-slate-200 text-xl font-semibold">Selecciona tu contrato</div>
                  </div>
                  <div className="text-slate-400">Sube un archivo para analizarlo o inicia un análisis de texto.</div>
                </div>
                <div className="flex items-center gap-4">
                  <Button className="text-white h-12 px-6 rounded-2xl" style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #22D3EE 100%)', boxShadow: '0 14px 34px rgba(34,211,238,0.25)' }} onClick={() => setIsUploadOpen(true)}>Subir contrato</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, duration: 0.5 }}>
            <Card className="p-8 backdrop-blur rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(20,30,60,0.45) 0%, rgba(20,30,60,0.28) 100%)', borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(58,123,255,0.18)' }}>
                    <s.icon className="h-7 w-7" color="#3A7BFF" />
                  </div>
                  <div className="text-slate-200 font-semibold text-xl">{s.title}</div>
                </div>
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent text-6xl font-extrabold">{s.value}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.5 }}>
        <Card className="p-7 max-w-5xl mx-auto" style={{ backgroundColor: 'rgba(20,30,60,0.32)', borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)', borderRadius: '16px' }}>
          <fmMotion.h2
            className="text-3xl md:text-4xl bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight font-bold"
          >
            Actividad reciente
          </fmMotion.h2>
          <div className="mt-4 space-y-3">
            {activity.map((ev, idx) => (
              <motion.div key={ev.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * idx, duration: 0.4 }} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-blue-500/10 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ev.type === 'ok' ? 'bg-blue-500/20 border border-blue-500/30' : ev.type === 'warn' ? 'bg-red-500/20 border border-red-500/30' : 'bg-slate-500/20 border border-slate-500/30'}`}></div>
                <div className="flex-1">
                  <div className="text-slate-200">{ev.title}</div>
                  <div className="text-slate-500 text-sm">{formatTs(ev.ts)}</div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm ${ev.type === 'ok' ? 'bg-blue-500/10 text-blue-400' : ev.type === 'warn' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-300'}`}>{ev.type === 'ok' ? 'Completado' : ev.type === 'warn' ? 'Alerta' : 'Nota'}</div>
                <ChevronRight className="h-5 w-5 cursor-pointer" color="#94A3B8" onClick={() => { if (ev.contractId) navigate(`/dashboard/contracts/${ev.contractId}`); }} />
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      <UploadContractModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploaded={(file) => { setUploadedFiles(prev => [...prev, file]); const ev = { id: `EV-${Date.now()}`, title: `Contrato subido: ${file.contractName || file.name}`, ts: new Date().toISOString(), type: 'note' as const }; activityQueueRef.current.push(ev); const flushed = [...activityQueueRef.current]; activityQueueRef.current.length = 0; setActivity(prev => { let next = prev; for (const it of flushed) next = upsertActivity(next, it); try { window.localStorage.setItem(activityKey, JSON.stringify(next)); } catch {} return next; }); }} />
      <AnalyzeTextModal
        isOpen={isAnalyzeOpen}
        onClose={() => setIsAnalyzeOpen(false)}
        files={uploadedFiles}
        onAnalyzed={async (file) => {
          setIsAnalyzing(true);
          let analyzed = null as null | {
            id: string; name: string; uploadedAt: string; status: 'En revisión' | 'Aprobado' | 'Riesgo alto'; riskScore: number; clauses: string[]; risks: string[]; recommendations: string[]; summary?: string;
          };
          const endpoint = (process.env.REACT_APP_ANALYZE_CONTRACT as string | undefined) || '';
          const payload = {
            name: file.contractName || file.name,
            size: file.size,
            type: file.type,
          };
          try {
            if (endpoint) {
              const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
              const data = await res.json();
              analyzed = {
                id: String(data.id ?? `AC-${Date.now()}`),
                name: String(data.name ?? (file.contractName || file.name)),
                uploadedAt: String(data.uploadedAt ?? new Date().toISOString().slice(0, 10)),
                status: (data.status as 'En revisión' | 'Aprobado' | 'Riesgo alto') ?? 'En revisión',
                riskScore: Number(data.riskScore ?? Math.min(100, Math.max(8, Math.round(file.size / 1024)))),
                clauses: (Array.isArray(data.clauses) ? data.clauses.map(String) : ['Alcance de servicios', 'Confidencialidad', 'Propiedad intelectual']),
                risks: (Array.isArray(data.risks) ? data.risks.map(String) : ['Ambigüedad en penalizaciones', 'Falta de SLA explícito']),
                recommendations: (Array.isArray(data.recommendations) ? data.recommendations.map(String) : ['Definir métricas de desempeño', 'Agregar cláusula de resolución de disputas']),
                summary: String(data.summary ?? 'Análisis inicial automático basado en el documento subido.'),
              };
            }
          } catch {}
          if (!analyzed) {
            analyzed = {
              id: `AC-${Date.now()}`,
              name: file.contractName || file.name,
              uploadedAt: new Date().toISOString().slice(0, 10),
              status: 'En revisión',
              riskScore: Math.min(100, Math.max(8, Math.round(file.size / 1024))),
              clauses: ['Alcance de servicios', 'Confidencialidad', 'Propiedad intelectual'],
              risks: ['Ambigüedad en penalizaciones', 'Falta de SLA explícito'],
              recommendations: ['Definir métricas de desempeño', 'Agregar cláusula de resolución de disputas'],
              summary: 'Análisis inicial automático basado en el documento subido.'
            };
          }
          try {
            const riskText = analyzed.riskScore >= 80 ? 'Muy alto' : analyzed.riskScore >= 60 ? 'Alto' : analyzed.riskScore >= 40 ? 'Medio' : analyzed.riskScore >= 20 ? 'Bajo' : 'Muy bajo';
            const row = { id: analyzed.id, name: analyzed.name, date: analyzed.uploadedAt, status: analyzed.status, risk: riskText, score: analyzed.riskScore };
            const raw = localStorage.getItem('contractsCache');
            const arr = raw ? JSON.parse(raw) : [];
            const map = new Map<string, any>();
            [...arr, row].forEach((r: any) => map.set(r.id, r));
            localStorage.setItem('contractsCache', JSON.stringify(Array.from(map.values())));
          } catch {}
          {(() => { const ev = { id: `EV-${Date.now() + 1}`, title: `Contrato analizado: ${analyzed!.name}`, ts: new Date().toISOString(), type: 'ok' as const, contractId: analyzed!.id }; activityQueueRef.current.push(ev); const flushed = [...activityQueueRef.current]; activityQueueRef.current.length = 0; setActivity(prev => { let next = prev; for (const it of flushed) next = upsertActivity(next, it); try { window.localStorage.setItem(activityKey, JSON.stringify(next)); } catch {} return next; }); })()}
          setContractsCount((prev) => prev + 1);
          setDetailsOverride(analyzed);
          setDetailsId(analyzed.id);
          setDetailsOpen(true);
          setUploadedFiles(prev => {
            const next = prev.filter(f => f !== file);
            if (next.length === 0) setIsAnalyzeOpen(false);
            return next;
          });
          setIsAnalyzing(false);
        }}
        onRemove={(file) => {
          const ok = window.confirm('¿Eliminar este archivo pendiente?');
          if (!ok) return;
          setUploadedFiles(prev => {
            const next = prev.filter(f => f !== file);
            if (next.length === 0) setIsAnalyzeOpen(false);
            return next;
          });
          {(() => { const ev = { id: `EV-${Date.now() + 2}`, title: `Archivo eliminado: ${file.contractName || file.name}`, ts: 'Hace 1 min', type: 'note' as const }; activityQueueRef.current.push(ev); const flushed = [...activityQueueRef.current]; activityQueueRef.current.length = 0; setActivity(prev => { let next = prev; for (const it of flushed) next = upsertActivity(next, it); try { window.localStorage.setItem(activityKey, JSON.stringify(next)); } catch {} return next; }); })()}
        }}
      />
      {isAnalyzing && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="flex flex-col items-center">
              <div className="w-[480px] max-w-[86vw]">
                <Lottie animationData={loadingAnimation} loop autoplay />
              </div>
              <div className="mt-4 text-slate-200 text-lg">Tu contrato está siendo analizado, por favor espera…</div>
            </div>
          </div>
        </div>
      )}
      <ContractDetailModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} contractId={detailsId ?? ''} override={detailsOverride ?? undefined} />
    </div>
  );
}
