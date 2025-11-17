import type { JSX } from 'react';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Download, MessageSquare } from 'lucide-react';

type ContractData = {
  id: string;
  nombreDelContrato: string;
  fechaSubida: string;
  estado: 'En revisión' | 'Riesgo alto' | 'Aprobado';
  riskScore: number;
  keyClauses: string[];
  risks: string[];
  analysis: { recommendations: string[]; summary?: string };
};

const items: ContractData[] = [
  {
    id: '123',
    nombreDelContrato: 'Contrato de Servicios',
    fechaSubida: '2025-11-10',
    estado: 'En revisión',
    riskScore: 32,
    keyClauses: ['Alcance de servicios', 'Confidencialidad', 'Propiedad intelectual'],
    risks: ['Ambigüedad en penalizaciones', 'Falta de SLA explícito'],
    analysis: { recommendations: ['Definir métricas de desempeño', 'Agregar cláusula de resolución de disputas'], summary: 'Documento orientado a prestación de servicios.' },
  },
  {
    id: '456',
    nombreDelContrato: 'Contrato de Arrendamiento',
    fechaSubida: '2025-11-08',
    estado: 'Aprobado',
    riskScore: 8,
    keyClauses: ['Plazo de arrendamiento', 'Depósito de garantía', 'Mantenimiento'],
    risks: ['Responsabilidad por daños no detallada'],
    analysis: { recommendations: ['Especificar responsabilidades de mantenimiento'] },
  },
  {
    id: '789',
    nombreDelContrato: 'Contrato de Confidencialidad',
    fechaSubida: '2025-11-06',
    estado: 'Riesgo alto',
    riskScore: 78,
    keyClauses: ['Definición de información confidencial', 'Duración de la obligación'],
    risks: ['Excepciones demasiado amplias', 'Sanciones no definidas'],
    analysis: { recommendations: ['Restringir excepciones', 'Establecer sanciones claras'], summary: 'Acuerdo para protección de información sensible.' },
  },
];

export default function ContractDetails(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();

  const contract = useMemo(() => items.find(x => x.id === id) ?? items[0], [id]);

  const estadoColor = contract.estado === 'Aprobado' ? '#22C55E' : contract.estado === 'Riesgo alto' ? '#EF4444' : '#3A7BFF';
  const estadoBg = contract.estado === 'Aprobado' ? 'rgba(34,197,94,0.15)' : contract.estado === 'Riesgo alto' ? 'rgba(239,68,68,0.15)' : 'rgba(58,123,255,0.12)';
  const riskBg = contract.riskScore >= 70 ? 'rgba(239,68,68,0.15)' : contract.riskScore >= 40 ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)';
  const riskColor = contract.riskScore >= 70 ? '#EF4444' : contract.riskScore >= 40 ? '#EAB308' : '#22C55E';

  const handleDownload = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${contract.nombreDelContrato}</title><style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Helvetica Neue,Arial,sans-serif;background:#0b1220;color:#e5e7eb;padding:32px}h1{font-size:24px;margin:0 0 8px}h2{font-size:18px;margin:24px 0 8px}p,li{font-size:14px;color:#cbd5e1}span.badge{display:inline-block;padding:6px 10px;border-radius:9999px;font-size:12px;margin-right:8px}ul{margin:0;padding-left:18px}div.row{margin-bottom:12px}</style></head><body><h1>Título del contrato</h1><h1>${contract.nombreDelContrato}</h1><div class="row"><p>Subido el: ${contract.fechaSubida}</p><span class="badge" style="background:${estadoBg};color:${estadoColor}">Estado: ${contract.estado}</span><span class="badge" style="background:${riskBg};color:${riskColor}">Puntaje de riesgo: ${contract.riskScore}</span></div><h2>Cláusulas detectadas</h2><ul>${contract.keyClauses.map(c=>`<li>${c}</li>`).join('')}</ul><h2>Riesgos detectados</h2><ul>${contract.risks.map(r=>`<li>${r}</li>`).join('')}</ul><h2>Recomendaciones</h2><ul>${contract.analysis.recommendations.map(r=>`<li>${r}</li>`).join('')}</ul><h2>Resumen</h2><p>${contract.analysis.summary ?? 'Sin resumen disponible'}</p></body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate(-1); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [navigate]);

  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => navigate(-1)} />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl rounded-[20px] border border-slate-700/50 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-800/60">
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-semibold text-white">Título del contrato</div>
              <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">{contract.nombreDelContrato}</div>
            </div>
            <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/60 text-white flex items-center justify-center">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-lg font-semibold">Descripción superior</div>
                <div className="mt-1 text-slate-300">Subido el: {contract.fechaSubida}</div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: estadoBg, color: estadoColor }}>Estado: {contract.estado}</span>
                  <span className="px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: riskBg, color: riskColor }}>Puntaje de riesgo: {contract.riskScore}</span>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-xl font-semibold mb-3">📄 Cláusulas detectadas</div>
                <ul className="space-y-2">
                  {contract.keyClauses.map(c => <li key={c} className="text-slate-300">{c}</li>)}
                </ul>
              </Card>
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-xl font-semibold mb-3">⚠️ Riesgos detectados</div>
                <ul className="space-y-2">
                  {contract.risks.map(r => <li key={r} className="text-slate-300">{r}</li>)}
                </ul>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-xl font-semibold mb-3">💡 Recomendaciones</div>
                <ul className="space-y-2">
                  {contract.analysis.recommendations.map(r => <li key={r} className="text-slate-300">{r}</li>)}
                </ul>
              </Card>
              <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
                <div className="text-white text-xl font-semibold mb-3">📝 Resumen</div>
                <div className="text-slate-300">{contract.analysis.summary ?? 'Sin resumen disponible'}</div>
              </Card>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={handleDownload}>
                <Download className="h-5 w-5 mr-2" />
                Descargar PDF
              </Button>
              <Button variant="outline" className="text-white" style={{ borderColor: 'rgba(58,123,255,0.28)' }} onClick={() => navigate('/dashboard/ai', { state: { contractId: contract.id, contractName: contract.nombreDelContrato } })}>
                <MessageSquare className="h-5 w-5 mr-2" />
                Abrir chat sobre este contrato
              </Button>
              <Button variant="outline" className="text-white" style={{ borderColor: 'rgba(58,123,255,0.28)' }} onClick={() => navigate(-1)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}