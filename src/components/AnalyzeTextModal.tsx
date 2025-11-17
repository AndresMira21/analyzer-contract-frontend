import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

type UploadedInfo = { name: string; type: string; size: number; contractName?: string };
type AnalyzeTextModalProps = {
  isOpen: boolean;
  onClose: () => void;
  files?: UploadedInfo[];
  onAnalyzed?: (file: UploadedInfo) => void;
  onRemove?: (file: UploadedInfo) => void;
};

export default function AnalyzeTextModal({ isOpen, onClose, files = [], onAnalyzed, onRemove }: AnalyzeTextModalProps): JSX.Element | null {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= files.length) {
      setSelectedIndex(files.length ? 0 : null);
    }
  }, [files, selectedIndex]);

  if (!isOpen) return null;

  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 20 }} className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
            <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">Analizar texto</div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60 text-white flex items-center justify-center">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
              <div className="text-white text-sm mb-3">Selecciona un documento para analizar</div>
              <div className="space-y-2">
                {files.length === 0 && (
                  <div className="text-slate-500 text-sm">No hay documentos pendientes</div>
                )}
                {files.map((f, idx) => (
                  <button key={f.name + idx} onClick={() => setSelectedIndex(idx)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left" style={{ borderColor: selectedIndex === idx ? 'rgba(79,140,255,0.55)' : 'rgba(58,123,255,0.24)', backgroundColor: selectedIndex === idx ? 'rgba(79,140,255,0.10)' : 'rgba(20,30,60,0.22)' }}>
                    <div>
                      <div className="text-slate-200 text-sm">{f.contractName || f.name}</div>
                      <div className="text-slate-500 text-xs">{f.type || 'Sin tipo'} · {(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedIndex === idx ? 'rgba(79,140,255,0.85)' : 'rgba(148,163,184,0.45)' }} />
                      <span
                        onClick={(e) => { e.stopPropagation(); if (onRemove) onRemove(f); }}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ border: '1px solid rgba(58,123,255,0.28)', color: '#FFFFFF', backgroundColor: 'rgba(20,30,60,0.22)' }}
                      >
                        Eliminar
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
            <div className="flex items-center justify-end gap-3">
              <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} disabled={analyzing || selectedIndex === null || files.length === 0} onClick={() => { if (selectedIndex === null) return; const file = files[selectedIndex]; setAnalyzing(true); setProgress(0); const t = setInterval(() => { setProgress(p => { const np = Math.min(100, p + 14); if (np >= 100) { clearInterval(t); setTimeout(() => { setAnalyzing(false); setProgress(0); if (onAnalyzed) onAnalyzed(file); }, 500); } return np; }); }, 180); }}>
                {analyzing ? 'Analizando…' : 'Analizar'}
              </Button>
            </div>
            {analyzing && (
              <div className="mt-2 w-full h-2 bg-slate-800/60 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${progress}%`, transition: 'width 180ms ease' }} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}