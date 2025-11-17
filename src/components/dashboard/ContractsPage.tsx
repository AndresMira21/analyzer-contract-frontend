import type { JSX, ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import Input from '../ui/input';
import ContractDetailModal from '../contracts/ContractDetailModal';

type Contract = {
  id: string;
  name: string;
  date: string;
  status: 'En revisión' | 'Riesgo alto' | 'Aprobado';
  risk: 'Muy bajo' | 'Bajo' | 'Medio' | 'Alto' | 'Muy alto';
  score: number;
};

const data: Contract[] = [
  { id: '123', name: 'Contrato de Servicios', date: '2025-11-10', status: 'En revisión', risk: 'Bajo', score: 32 },
  { id: '456', name: 'Contrato de Arrendamiento', date: '2025-11-08', status: 'Aprobado', risk: 'Muy bajo', score: 8 },
  { id: '789', name: 'Contrato de Confidencialidad', date: '2025-11-06', status: 'Riesgo alto', risk: 'Alto', score: 78 },
];

export default function ContractsPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [risk, setRisk] = useState('');
  const [dateOrder, setDateOrder] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [override, setOverride] = useState<any | null>(null);
  const [rowsState, setRowsState] = useState<Contract[]>(data);

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
      if (!exists) setRowsState(prev => [...prev, { id: ac.id, name: ac.name, date: ac.uploadedAt, status: ac.status, risk: riskText, score: ac.riskScore }]);
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
            <Input placeholder="Buscar contrato" value={query} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
          </div>
        </motion.div>
        
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="p-0 overflow-hidden" style={{ borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)' }}>
          <div className="overflow-x-auto">
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
                {filtered.map((row, idx) => (
                  <motion.tr key={row.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 * idx }} className="border-t border-slate-800/60">
                    <td className="px-6 py-4 text-slate-200">{row.name}</td>
                    <td className="px-6 py-4 text-slate-300">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: row.status === 'Aprobado' ? 'rgba(34,197,94,0.15)' : row.status === 'Riesgo alto' ? 'rgba(239,68,68,0.15)' : 'rgba(58,123,255,0.12)', color: row.status === 'Aprobado' ? '#22C55E' : row.status === 'Riesgo alto' ? '#EF4444' : '#3A7BFF' }}>{row.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{row.risk}</td>
                    <td className="px-6 py-4 text-white font-bold">{row.score}</td>
                    <td className="px-6 py-4">
                    <Button size="lg" className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={() => { setSelectedId(row.id); setIsModalOpen(true); }}>Ver detalles</Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      </motion.div>
      <ContractDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} contractId={selectedId ?? ''} override={override ?? undefined} />
    </div>
  );
}