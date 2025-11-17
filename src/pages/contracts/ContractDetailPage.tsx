import type { JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

type ContractView = {
  name: string;
  uploadedAt: string;
  status: 'En revisión' | 'Riesgo alto' | 'Aprobado';
  riskScore: number;
  clauses: string[];
  risks: string[];
  recommendations: string[];
};

const mock: ContractView = {
  name: 'Contrato de Servicios',
  uploadedAt: '2025-11-10',
  status: 'En revisión',
  riskScore: 32,
  clauses: ['Alcance de servicios', 'Confidencialidad', 'Propiedad intelectual'],
  risks: ['Ambigüedad en penalizaciones', 'Falta de SLA explícito'],
  recommendations: ['Definir métricas de desempeño', 'Agregar cláusula de resolución de disputas'],
};

export default function ContractDetailPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();

  const statusColor = mock.status === 'Aprobado' ? '#22C55E' : mock.status === 'Riesgo alto' ? '#EF4444' : '#3A7BFF';
  const statusBg = mock.status === 'Aprobado' ? 'rgba(34,197,94,0.15)' : mock.status === 'Riesgo alto' ? 'rgba(239,68,68,0.15)' : 'rgba(58,123,255,0.12)';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">{mock.name}</h1>
        <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={() => navigate('/contracts')}>Volver</Button>
      </div>

      <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)' }}>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="text-slate-400">Fecha de subida</div>
            <div className="text-slate-200">{mock.uploadedAt}</div>
          </div>
          <div>
            <div className="text-slate-400">Estado</div>
            <div>
              <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: statusBg, color: statusColor }}>{mock.status}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400">Puntaje de riesgo</div>
            <div className="text-white font-bold text-2xl">{mock.riskScore}</div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
          <div className="text-white font-semibold mb-3">Cláusulas detectadas</div>
          <ul className="space-y-2">
            {mock.clauses.map((c) => (
              <li key={c} className="text-slate-300">{c}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
          <div className="text-white font-semibold mb-3">Riesgos detectados</div>
          <ul className="space-y-2">
            {mock.risks.map((r) => (
              <li key={r} className="text-slate-300">{r}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
          <div className="text-white font-semibold mb-3">Recomendaciones</div>
          <ul className="space-y-2">
            {mock.recommendations.map((r) => (
              <li key={r} className="text-slate-300">{r}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}