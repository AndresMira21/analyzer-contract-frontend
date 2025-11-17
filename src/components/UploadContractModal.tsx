import type { JSX, ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import Input from './ui/input';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  if (!isOpen) return null;

  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 20 }} className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md shadow-2xl">
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
                  <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0] ?? null; setSelectedFile(f); setFileName(f ? f.name : ''); setError(''); setSuccess(''); }} />
                  <div className="flex items-center gap-3">
                    <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={() => inputRef.current?.click()}>Elegir archivo</Button>
                    <div className="text-slate-300 text-sm">{fileName || 'Ningún archivo seleccionado'}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-white text-sm">Nombre del contrato (opcional)</div>
                  <Input placeholder="Escribe el nombre" value={contractName} onChange={(e: ChangeEvent<HTMLInputElement>) => setContractName(e.target.value)} />
                </div>
              </div>
            </Card>
            <div className="flex items-center justify-end gap-3">
              <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} disabled={uploading} onClick={() => { if (!selectedFile) { setError('Selecciona un archivo válido'); return; } setError(''); setSuccess(''); setUploading(true); setTimeout(() => { setUploading(false); setSuccess('Contrato subido correctamente'); setTimeout(() => { setSuccess(''); if (onUploaded) onUploaded({ name: selectedFile.name, type: selectedFile.type, size: selectedFile.size, contractName }); onClose(); }, 900); }, 1200); }}>
                {uploading ? 'Subiendo…' : 'Subir contrato'}
              </Button>
            </div>
            {(error || success) && (
              <div className="px-6 pb-2">
                {error && <div className="text-red-400 text-sm">{error}</div>}
                {success && <div className="text-green-400 text-sm">{success}</div>}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}