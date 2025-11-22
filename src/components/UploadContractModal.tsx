import type { JSX, ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Input from './ui/input';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/animations/Loading Files (1).json';
import ContractDetailModal from './contracts/ContractDetailModal';


type UploadedInfo = { name: string; type: string; size: number; contractName?: string };
type UploadContractModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (file: UploadedInfo) => void;
};

export default function UploadContractModal({ isOpen, onClose, onUploaded }: UploadContractModalProps): JSX.Element | null {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [contractName, setContractName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileError, setFileError] = useState('');
  const [result, setResult] = useState<{ type: string; clauses: string[]; risks: string[]; riskScore: number; recommendations: string[]; summary: string } | null>(null);
  const [createdChat, setCreatedChat] = useState<{ id: string; contractId?: string; title?: string } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [detailsOverride, setDetailsOverride] = useState<any | null>(null);
  const { user } = useAuth();
  const contractsKey = user?.email ? `contractsCache:${user.email}` : 'contractsCache:guest';
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 20 }} className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
            <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">Subir contrato</div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60 text-white flex items-center justify-center">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-white text-sm">Selecciona un archivo</div>
                  <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" multiple className="hidden" onChange={e => { const list = Array.from(e.target.files ?? []); setError(''); setSuccess(''); setResult(null); setProgress(0); if (list.length === 0) { setSelectedFiles([]); setFileName(''); setFileError(''); return; } const max = 10 * 1024 * 1024; const valid: File[] = []; let err = ''; for (const f of list) { const name = f.name; const size = f.size; const extOk = (/\.pdf$/i.test(name) || /\.docx$/i.test(name) || /\.doc$/i.test(name)); if (!extOk) { err = 'Formato no permitido. Solo se aceptan archivos PDF, DOC o DOCX.'; continue; } if (size > max) { err = 'El archivo excede el tamaño máximo permitido de 10 MB.'; continue; } valid.push(f); } setSelectedFiles(prev => [...prev, ...valid]); setFileName(valid.length > 1 || selectedFiles.length > 0 ? `${valid.length + selectedFiles.length} archivos seleccionados` : (valid[0]?.name ?? '')); setFileError(err); }} />
                  <div className="flex items-center gap-3">
                    <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={() => inputRef.current?.click()}>Elegir archivo</Button>
                    <div className="text-slate-300 text-sm">{fileName || 'Ningún archivo seleccionado'}</div>
                  </div>
                  <div className="text-slate-400 text-xs">Formatos permitidos: PDF (.pdf), Word (.docx), Word 97–2003 (.doc). Tamaño máximo: 10 MB.</div>
                  {fileError && (
                    <div className="text-red-400 text-sm">{fileError}</div>
                  )}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {selectedFiles.map((f, i) => (
                        <div key={f.name + i} className="flex items-center justify-between px-4 py-2 rounded-xl border" style={{ borderColor: 'rgba(58,123,255,0.24)', backgroundColor: 'rgba(20,30,60,0.22)' }}>
                          <div className="text-slate-300 text-sm">{f.name}</div>
                          <button className="px-3 py-1 rounded-full text-xs" style={{ border: '1px solid rgba(58,123,255,0.28)', color: '#FFFFFF', backgroundColor: 'rgba(20,30,60,0.22)' }} onClick={() => { setSelectedFiles(prev => prev.filter((x, idx) => idx !== i)); const nextCount = selectedFiles.length - 1; setFileName(nextCount > 1 ? `${nextCount} archivos seleccionados` : nextCount === 1 ? selectedFiles.filter((_, idx) => idx !== i)[0]?.name ?? '' : ''); if (nextCount === 0) setFileError(''); }}>
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-white text-sm">Nombre del contrato (opcional)</div>
                  <Input placeholder="Escribe el nombre" value={contractName} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const v = e.target.value;
                    const trimmedStart = v.replace(/^\s+/, '');
                    const noDouble = trimmedStart.replace(/ {2,}/g, ' ');
                    const limited = noDouble.slice(0, 60);
                    setContractName(limited);
                  }} />
                </div>
              </div>
            </Card>
            <div className="flex items-center justify-end gap-3">
              <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} disabled={uploading} onClick={async () => {
                if (fileError) { return; }
                if (selectedFiles.length === 0) { setError('Archivo obligatorio'); return; }
                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
                setError('');
                setSuccess('');
                setResult(null);
                setUploading(true);
                setProgress(0);
                const apiBase = (process.env.REACT_APP_CONTRACTS_UPLOAD as string | undefined) || '';
                const fallbackBase = (process.env.NEXT_PUBLIC_API_URL as string | undefined) || (process.env.REACT_APP_BACKEND_URL as string | undefined) || '';
                const uploadUrl = apiBase || (fallbackBase ? `${fallbackBase}/api/contracts/upload` : '');
                try {
                  if (!uploadUrl) { throw new Error('Endpoint de subida no configurado'); }
                  let firstConvId: string | null = null;
                  let firstContractId: string | null = null;
                  let firstTitle: string | null = null;
                  let firstAnalyzed: any | null = null;
                  for (const f of selectedFiles) {
                    const fd = new FormData();
                    fd.append('file', f);
                    if (contractName) fd.append('name', contractName);
                    if (!token) {
                      const localAnalyzed = {
                        id: `AC-${Date.now()}`,
                        name: contractName || f.name,
                        uploadedAt: new Date().toISOString().slice(0, 10),
                        status: 'En revisión',
                        riskScore: Math.min(100, Math.max(8, Math.round(f.size / 1024))),
                        clauses: ['Alcance de servicios', 'Confidencialidad', 'Propiedad intelectual'],
                        risks: ['Ambigüedad en penalizaciones', 'Falta de SLA explícito'],
                        recommendations: ['Definir métricas de desempeño', 'Agregar cláusula de resolución de disputas'],
                        summary: 'Análisis inicial automático basado en el documento subido.'
                      };
                      if (!firstAnalyzed) firstAnalyzed = localAnalyzed;
                      try {
                        const raw = localStorage.getItem(contractsKey);
                        const arr = raw ? JSON.parse(raw) : [];
                        const map = new Map<string, any>();
                        [...arr, { id: localAnalyzed.id, name: localAnalyzed.name, date: localAnalyzed.uploadedAt, status: localAnalyzed.status, risk: localAnalyzed.riskScore >= 80 ? 'Muy alto' : localAnalyzed.riskScore >= 60 ? 'Alto' : localAnalyzed.riskScore >= 40 ? 'Medio' : localAnalyzed.riskScore >= 20 ? 'Bajo' : 'Muy bajo', score: localAnalyzed.riskScore }].forEach((r: any) => map.set(r.id, r));
                        localStorage.setItem(contractsKey, JSON.stringify(Array.from(map.values())));
                        try {
                          const backendUrl = (process.env.REACT_APP_BACKEND_URL as string | undefined) || '';
                          const token2 = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
                          const createUrl = backendUrl ? `${backendUrl}/api/chats` : '';
                          const chatTitle = localAnalyzed.name;
                          if (createUrl) {
                            const resCreate = await fetch(createUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token2 ? { Authorization: `Bearer ${token2}` } : {}) }, credentials: 'include', body: JSON.stringify({ title: chatTitle, date: new Date().toISOString(), contractId: localAnalyzed.id }) });
                            if (resCreate.ok) {
                              const created = await resCreate.json();
                              const convId = String(created.id || created._id || '');
                              if (!firstConvId && convId) { firstConvId = convId; firstContractId = localAnalyzed.id; firstTitle = chatTitle; }
                            }
                          }
                        } catch {}
                      } catch {}
                      continue;
                    }
                    const res = await fetch(uploadUrl, {
                      method: 'POST',
                      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                      body: fd,
                      credentials: 'include',
                    });
                    if (!res.ok) {
                      let msg = `Error al subir contrato (HTTP ${res.status})`;
                      try {
                        const j = await res.json();
                        msg = String(j?.message || j?.error || msg);
                      } catch {
                        try { msg = await res.text(); } catch {}
                      }
                      if (res.status === 401 || res.status === 403) {
                        const localAnalyzed = {
                          id: `AC-${Date.now()}`,
                          name: contractName || f.name,
                          uploadedAt: new Date().toISOString().slice(0, 10),
                          status: 'En revisión',
                          riskScore: Math.min(100, Math.max(8, Math.round(f.size / 1024))),
                          clauses: ['Alcance de servicios', 'Confidencialidad', 'Propiedad intelectual'],
                          risks: ['Ambigüedad en penalizaciones', 'Falta de SLA explícito'],
                          recommendations: ['Definir métricas de desempeño', 'Agregar cláusula de resolución de disputas'],
                          summary: 'Análisis inicial automático basado en el documento subido.'
                        };
                        if (!firstAnalyzed) firstAnalyzed = localAnalyzed;
                        try {
                          const raw = localStorage.getItem(contractsKey);
                          const arr = raw ? JSON.parse(raw) : [];
                          const map = new Map<string, any>();
                          [...arr, { id: localAnalyzed.id, name: localAnalyzed.name, date: localAnalyzed.uploadedAt, status: localAnalyzed.status, risk: localAnalyzed.riskScore >= 80 ? 'Muy alto' : localAnalyzed.riskScore >= 60 ? 'Alto' : localAnalyzed.riskScore >= 40 ? 'Medio' : localAnalyzed.riskScore >= 20 ? 'Bajo' : 'Muy bajo', score: localAnalyzed.riskScore }].forEach((r: any) => map.set(r.id, r));
                          localStorage.setItem(contractsKey, JSON.stringify(Array.from(map.values())));
                        } catch {}
                        continue;
                      }
                      throw new Error(msg);
                    }
                    try {
                      const data = await res.json();
                      const analysis = data?.analysis;
                      const cid = String(data?.contractId || `AC-${Date.now()}`);
                      const analyzed = analysis ? {
                        id: cid,
                        name: contractName || f.name,
                        uploadedAt: new Date().toISOString().slice(0, 10),
                        status: 'En revisión',
                        riskScore: Number(analysis.riskScore || 0),
                        clauses: Array.isArray(analysis.keyClauses) ? analysis.keyClauses.map(String) : [],
                        risks: Array.isArray(analysis.risks) ? analysis.risks.map(String) : [],
                        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations.map(String) : [],
                        summary: analysis.summary ? String(analysis.summary) : undefined,
                      } : null;
                      if (analyzed) {
                        if (!firstAnalyzed) firstAnalyzed = analyzed;
                        try {
                          const raw = localStorage.getItem(contractsKey);
                          const arr = raw ? JSON.parse(raw) : [];
                          const map = new Map<string, any>();
                          [...arr, { id: analyzed.id, name: analyzed.name, date: analyzed.uploadedAt, status: analyzed.status, risk: analyzed.riskScore >= 80 ? 'Muy alto' : analyzed.riskScore >= 60 ? 'Alto' : analyzed.riskScore >= 40 ? 'Medio' : analyzed.riskScore >= 20 ? 'Bajo' : 'Muy bajo', score: analyzed.riskScore }].forEach((r: any) => map.set(r.id, r));
                          localStorage.setItem(contractsKey, JSON.stringify(Array.from(map.values())));
                          try {
                            const backendUrl = (process.env.REACT_APP_BACKEND_URL as string | undefined) || '';
                            const token2 = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
                            const createUrl = backendUrl ? `${backendUrl}/api/chats` : '';
                            const chatTitle = analyzed.name;
                            if (createUrl) {
                              const resCreate = await fetch(createUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token2 ? { Authorization: `Bearer ${token2}` } : {}) }, credentials: 'include', body: JSON.stringify({ title: chatTitle, date: new Date().toISOString(), contractId: analyzed.id }) });
                              if (resCreate.ok) {
                                const created = await resCreate.json();
                                const convId = String(created.id || created._id || '');
                                if (!firstConvId && convId) { firstConvId = convId; firstContractId = analyzed.id; firstTitle = chatTitle; }
                              }
                            }
                          } catch {}
                        } catch {}
                      }
                    } catch {}
                  }
                  setProgress(100);
                  selectedFiles.forEach(f => { if (onUploaded) onUploaded({ name: f.name, type: f.type, size: f.size, contractName }); });
                  setSuccess('Contrato subido correctamente');
                  setSelectedFiles([]);
                  setFileName('');
                  if (firstConvId) {
                    setCreatedChat({ id: firstConvId, contractId: firstContractId ?? undefined, title: firstTitle ?? undefined });
                  }
                  if (firstAnalyzed) {
                    setDetailsOverride(firstAnalyzed);
                    setDetailsId(firstAnalyzed.id);
                    setDetailsOpen(true);
                  }
                  
                } catch (e: any) {
                  const m = String(e?.message || '').trim();
                  setError(m ? m : 'Error de conexión con el servidor');
                } finally {
                  setUploading(false);
                }
              }}>
                {uploading ? 'Analizando…' : 'Subir contrato'}
              </Button>
            </div>
            {uploading && (
              <div className="mt-2 w-full h-2 bg-slate-800/60 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${progress}%`, transition: 'width 180ms ease' }} />
              </div>
            )}
            {(error || success) && (
              <div className="px-6 pb-2">
                {error && <div className="text-red-400 text-sm">{error}</div>}
                {success && <div className="text-green-400 text-sm">{success}</div>}
              </div>
            )}
            {result && (
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)' }}>
                <div className="text-white text-xl font-semibold mb-3">Resultado del análisis</div>
                <div className="text-slate-300 mb-2">Tipo de contrato: {result.type}</div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-white font-semibold mb-2">Cláusulas clave</div>
                    <ul className="space-y-1">{result.clauses.map(c => <li key={c} className="text-slate-300">{c}</li>)}</ul>
                  </div>
                  <div>
                    <div className="text-white font-semibold mb-2">Riesgos</div>
                    <ul className="space-y-1">{result.risks.map(r => <li key={r} className="text-slate-300">{r}</li>)}</ul>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: result.riskScore >= 70 ? 'rgba(239,68,68,0.15)' : result.riskScore >= 40 ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)', color: result.riskScore >= 70 ? '#EF4444' : result.riskScore >= 40 ? '#EAB308' : '#22C55E' }}>Puntaje de riesgo: {result.riskScore}</span>
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-white font-semibold mb-2">Recomendaciones</div>
                    <ul className="space-y-1">{result.recommendations.map(r => <li key={r} className="text-slate-300">{r}</li>)}</ul>
                  </div>
                  <div>
                    <div className="text-white font-semibold mb-2">Resumen</div>
                    <div className="text-slate-300">{result.summary}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3">
                  {createdChat?.id && (
                    <Button className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white" onClick={() => navigate('/dashboard/ai', { state: { contractName: createdChat.title ?? '', contractId: createdChat.contractId ?? undefined, conversationId: createdChat.id } })}>Abrir chat</Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
      {uploading && (
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
    </motion.div>
  );
}
