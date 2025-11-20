import type { JSX } from 'react';
import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Download, MessageSquare } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

type ContractDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  override?: ContractMock;
};

type ContractMock = {
  id: string;
  name: string;
  uploadedAt: string;
  status: 'En revisión' | 'Aprobado' | 'Riesgo alto';
  riskScore: number;
  clauses: string[];
  risks: string[];
  recommendations: string[];
  summary?: string;
};

const items: ContractMock[] = [
  {
    id: '123',
    name: 'Contrato de Servicios',
    uploadedAt: '2025-11-10',
    status: 'En revisión',
    riskScore: 32,
    clauses: ['Alcance de servicios', 'Confidencialidad', 'Propiedad intelectual'],
    risks: ['Ambigüedad en penalizaciones', 'Falta de SLA explícito'],
    recommendations: ['Definir métricas de desempeño', 'Agregar cláusula de resolución de disputas'],
    summary: 'Este acuerdo define el alcance del servicio y la confidencialidad.'
  },
  {
    id: '456',
    name: 'Contrato de Arrendamiento',
    uploadedAt: '2025-11-08',
    status: 'Aprobado',
    riskScore: 8,
    clauses: ['Plazo de arrendamiento', 'Depósito de garantía', 'Mantenimiento'],
    risks: ['Responsabilidad por daños no detallada'],
    recommendations: ['Especificar responsabilidades de mantenimiento']
  },
  {
    id: '789',
    name: 'Contrato de Confidencialidad',
    uploadedAt: '2025-11-06',
    status: 'Riesgo alto',
    riskScore: 78,
    clauses: ['Definición de información confidencial', 'Duración de la obligación'],
    risks: ['Excepciones demasiado amplias', 'Sanciones no definidas'],
    recommendations: ['Restringir excepciones', 'Establecer sanciones claras']
  }
];

export default function ContractDetailModal({ isOpen, onClose, contractId, override }: ContractDetailModalProps): JSX.Element | null {
  const navigate = useNavigate();
  const base = useMemo(() => items.find(x => x.id === contractId) ?? items[0], [contractId]);
  const contract = override ?? base;

  const statusColor = contract.status === 'Aprobado' ? '#22C55E' : contract.status === 'Riesgo alto' ? '#EF4444' : '#3A7BFF';
  const statusBg = contract.status === 'Aprobado' ? 'rgba(34,197,94,0.15)' : contract.status === 'Riesgo alto' ? 'rgba(239,68,68,0.15)' : 'rgba(58,123,255,0.12)';
  const riskBg = contract.riskScore >= 70 ? 'rgba(239,68,68,0.15)' : contract.riskScore >= 40 ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)';
  const riskColor = contract.riskScore >= 70 ? '#EF4444' : contract.riskScore >= 40 ? '#EAB308' : '#22C55E';

  const handleDownload = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${contract.name}</title><style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Helvetica Neue,Arial,sans-serif;background:#0b1220;color:#e5e7eb;padding:32px}h1{font-size:24px;margin:0 0 8px}h2{font-size:18px;margin:24px 0 8px}p,li{font-size:14px;color:#cbd5e1}span.badge{display:inline-block;padding:6px 10px;border-radius:9999px;font-size:12px;margin-right:8px}ul{margin:0;padding-left:18px}div.row{margin-bottom:12px}</style></head><body><h1>Título del contrato</h1><h1>${contract.name}</h1><div class="row"><p>Subido el: ${contract.uploadedAt}</p><span class="badge" style="background:${statusBg};color:${statusColor}">Estado: ${contract.status}</span><span class="badge" style="background:${riskBg};color:${riskColor}">Puntaje de riesgo: ${contract.riskScore}</span></div><h2>Cláusulas detectadas</h2><ul>${contract.clauses.map(c=>`<li>${c}</li>`).join('')}</ul><h2>Riesgos detectados</h2><ul>${contract.risks.map(r=>`<li>${r}</li>`).join('')}</ul><h2>Recomendaciones</h2><ul>${contract.recommendations.map(r=>`<li>${r}</li>`).join('')}</ul><h2>Resumen</h2><p>${contract.summary ?? 'Sin resumen disponible'}</p></body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

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
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 140, damping: 20 }} className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-[80vw] max-w-[80vw] max-h-[75vh] rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
            <div>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">{contract.name}</div>
              <div className="mt-1 text-slate-400 text-sm">Subido el: {contract.uploadedAt}</div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60 text-white flex items-center justify-center">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600/60 scrollbar-track-slate-800/40">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: statusBg, color: statusColor }}>Estado: {contract.status}</span>
              <span className="px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: riskBg, color: riskColor }}>Puntaje de riesgo: {contract.riskScore}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-xl font-semibold mb-3">Cláusulas detectadas</div>
                <ul className="space-y-2">
                  {contract.clauses.map(c => <li key={c} className="text-slate-300">{c}</li>)}
                </ul>
              </Card>
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-xl font-semibold mb-3">Riesgos detectados</div>
                <ul className="space-y-2">
                  {contract.risks.map(r => <li key={r} className="text-slate-300">{r}</li>)}
                </ul>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-xl font-semibold mb-3">Recomendaciones</div>
                <ul className="space-y-2">
                  {contract.recommendations.map(r => <li key={r} className="text-slate-300">{r}</li>)}
                </ul>
              </Card>
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-xl font-semibold mb-3">Resumen</div>
                <div className="text-slate-300">{contract.summary ?? 'Sin resumen disponible'}</div>
              </Card>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800/60">
            <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={handleDownload}>
              <Download className="h-5 w-5 mr-2" />
              Descargar PDF
            </Button>
            <Button variant="outline" className="text-white" style={{ borderColor: 'rgba(58,123,255,0.28)' }} onClick={() => navigate('/dashboard/ai', { state: { contractId: contract.id, contractName: contract.name } })}>
              <MessageSquare className="h-5 w-5 mr-2" />
              Abrir chat sobre este contrato
            </Button>
            <Button variant="outline" className="text-white" style={{ borderColor: 'rgba(58,123,255,0.28)' }} onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
