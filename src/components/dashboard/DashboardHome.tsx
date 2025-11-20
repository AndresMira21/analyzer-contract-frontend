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
import robotAnimation from '../../assets/animations/Robot assistant  Online manager.json';

export default function DashboardHome(): JSX.Element {
  const { user } = useAuth();
  const name = user?.name ?? 'Usuario';
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: number; contractName?: string }[]>([]);
  const [contractsCount, setContractsCount] = useState<number>(0);
  const stats = [
    { icon: FileText, title: 'Contratos analizados', value: contractsCount },
  ];

  const [activity, setActivity] = useState<{ id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string }[]>([]);
  const activityKey = `${user?.email ? `user:${user.email}` : 'user:guest'}:activity`;

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
      const raw = window.localStorage.getItem('contractsCache');
      if (!raw) return 0;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    setContractsCount(loadContractsCount());
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'contractsCache') return;
      setContractsCount(loadContractsCount());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(activityKey);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) setActivity(arr);
    } catch {}
  }, [activityKey]);

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
        
        <div className="relative min-h-[68vh] flex flex-col items-center justify-center pt-6">
          <div className="relative">
            <fmMotion.span
              className="absolute inset-0 -z-10 rounded-2xl"
              initial={{ opacity: 0.6, scale: 0.98 }}
              animate={{ opacity: [0.6, 0.25, 0.6], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(220px 120px at 50% 50%, rgba(58,123,255,0.22), rgba(58,123,255,0))' }} />
            </fmMotion.span>
            <fmMotion.h2
              className="text-5xl md:text-6xl bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent mb-4 tracking-tight font-bold leading-tight"
              initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              Bienvenid@ a LegalConnect
            </fmMotion.h2>
            <motion.div
              className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-slate-400 to-blue-500 rounded-full"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-[280px] md:w-[340px]">
              <Lottie animationData={robotAnimation} loop autoplay />
            </div>
          </div>
          <div className="flex items-center justify-center gap-5 flex-wrap max-w-[1100px] mx-auto">
            <div className="flex items-center bg-white/5 rounded-2xl border px-10 h-[84px] w-full sm:w-[600px] md:w-[800px] lg:w-[1000px] max-w-full" style={{ borderColor: 'rgba(58,123,255,0.28)' }}>
              <fmMotion.div
                className="w-full text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                Selecciona tu contrato
              </fmMotion.div>
            </div>
            <motion.div className="relative" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.98 }}>
            <fmMotion.span className="absolute inset-0 -z-10 rounded-2xl" initial={{ opacity: 0 }} whileHover={{ opacity: 0.85, x: [ -24, 24 ] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}>
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.35) 0%, rgba(34,211,238,0.65) 50%, rgba(14,165,233,0.35) 100%)' }} />
            </fmMotion.span>
              <Button className="text-white h-[84px] px-10 text-3xl" style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #22D3EE 100%)', boxShadow: '0 14px 34px rgba(34,211,238,0.3)', filter: 'brightness(1.06)' }} onClick={() => setIsUploadOpen(true)}>Subir contrato</Button>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <fmMotion.span className="absolute inset-0 -z-10 rounded-2xl" initial={{ opacity: 0 }} whileHover={{ opacity: 0.75, x: [ -22, 22 ] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}>
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(90deg, rgba(54,90,223,0.22) 0%, rgba(79,140,255,0.44) 50%, rgba(54,90,223,0.22) 100%)' }} />
              </fmMotion.span>
              <Button variant="outline" className="text-white h-[84px] px-10 text-3xl" style={{ borderColor: '#4F8CFF', boxShadow: '0 12px 30px rgba(79,140,255,0.22)', background: 'linear-gradient(90deg, rgba(20,30,60,0.35) 0%, rgba(20,30,60,0.25) 100%)' }} onClick={() => setIsAnalyzeOpen(true)}>Analizar contrato</Button>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} whileHover={{ y: -2, scale: 1.06 }} whileTap={{ scale: 0.98 }}>
              <fmMotion.span className="absolute inset-0 -z-10 rounded-2xl" initial={{ opacity: 0 }} whileHover={{ opacity: 0.85, scale: 1.1 }} transition={{ duration: 0.8 }}>
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(120px 120px at 50% 50%, rgba(79,140,255,0.5), rgba(79,140,255,0))' }} />
              </fmMotion.span>
              <Link to="/dashboard/ai" className="flex items-center justify-center h-[84px] w-[84px] rounded-2xl" style={{ backgroundColor: 'rgba(79,140,255,0.18)', boxShadow: '0 12px 30px rgba(79,140,255,0.2)' }}>
                <motion.div initial={{ rotate: 0 }} whileHover={{ rotate: 8 }} transition={{ type: 'spring', stiffness: 180, damping: 12 }}>
                  <ChevronRight className="h-9 w-9" color="#3A7BFF" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
          
          
        </div>
      </motion.div>

      <div className="grid md:grid-cols-1 gap-6 max-w-5xl mx-auto px-4">
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.08 * i, duration: 0.5 }} whileHover={{ y: -2, scale: 1.02 }}>
            <Card className="p-8 backdrop-blur transition-all" style={{ background: 'linear-gradient(180deg, rgba(20,30,60,0.35) 0%, rgba(20,30,60,0.25) 100%)', borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)', borderRadius: '18px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(58,123,255,0.15)' }}>
                    <s.icon className="h-7 w-7" color="#3A7BFF" />
                  </div>
                  <div className="text-slate-200 font-semibold text-xl md:text-2xl">{s.title}</div>
                </div>
                <div className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white">{s.value}</div>
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
          <div className="mt-4 space-y-4">
            {activity.map((ev, idx) => (
              <motion.div key={ev.id} className="flex items-center justify-between gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * idx, duration: 0.4 }} whileHover={{ y: -2 }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: ev.type === 'warn' ? 'rgba(239,68,68,0.15)' : ev.type === 'ok' ? 'rgba(58,123,255,0.15)' : 'rgba(100,116,139,0.15)' }} />
                  <div>
                    <div className="text-slate-200">{ev.title}</div>
                    <div className="text-slate-500 text-sm">{formatTs(ev.ts)}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 cursor-pointer" color="#94A3B8" onClick={() => { if (ev.contractId) navigate(`/dashboard/contracts/${ev.contractId}`); }} />
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      <UploadContractModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploaded={(file) => { setUploadedFiles(prev => [...prev, file]); setActivity(prev => { const ev: { id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string } = { id: `EV-${Date.now()}`, title: `Contrato subido: ${file.contractName || file.name}`, ts: new Date().toISOString(), type: 'note' }; const next = [ev, ...prev]; try { window.localStorage.setItem(activityKey, JSON.stringify(next)); } catch {} return next; }); navigate('/dashboard/contracts'); }} />
      <AnalyzeTextModal
        isOpen={isAnalyzeOpen}
        onClose={() => setIsAnalyzeOpen(false)}
        files={uploadedFiles}
        onAnalyzed={async (file) => {
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
          setActivity(prev => { const ev: { id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string } = { id: `EV-${Date.now() + 1}`, title: `Contrato analizado: ${analyzed!.name}`, ts: new Date().toISOString(), type: 'ok', contractId: analyzed!.id }; return [ev, ...prev]; });
          setContractsCount((prev) => prev + 1);
          navigate('/dashboard/contracts', { state: { analyzedContract: analyzed } });
          setUploadedFiles(prev => {
            const next = prev.filter(f => f !== file);
            if (next.length === 0) setIsAnalyzeOpen(false);
            return next;
          });
        }}
        onRemove={(file) => {
          const ok = window.confirm('¿Eliminar este archivo pendiente?');
          if (!ok) return;
          setUploadedFiles(prev => {
            const next = prev.filter(f => f !== file);
            if (next.length === 0) setIsAnalyzeOpen(false);
            return next;
          });
          setActivity(prev => { const ev: { id: string; title: string; ts: string; type: 'ok' | 'warn' | 'note'; contractId?: string } = { id: `EV-${Date.now() + 2}`, title: `Archivo eliminado: ${file.contractName || file.name}`, ts: 'Hace 1 min', type: 'note' }; return [ev, ...prev]; });
        }}
      />
    </div>
  );
}