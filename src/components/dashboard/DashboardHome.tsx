import type { JSX } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHome(): JSX.Element {
  const { user } = useAuth();
  const name = user?.name ?? 'Usuario';

  const stats = [
    { icon: FileText, title: 'Contratos creados', value: 12 },
    { icon: CheckCircle, title: 'Contratos por revisar', value: 5 },
    { icon: AlertTriangle, title: 'Contratos en riesgo', value: 2 },
  ];

  const recent = [
    { id: 'CNT-001', name: 'Contrato de Servicios', status: 'En revisión', date: '2025-11-10' },
    { id: 'CNT-002', name: 'Contrato de Arrendamiento', status: 'Aprobado', date: '2025-11-08' },
    { id: 'CNT-003', name: 'Contrato de Confidencialidad', status: 'Riesgo alto', date: '2025-11-06' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">Hola, {name} 👋</h1>
        <p className="text-slate-300">Bienvenido a tu panel de LegalConnect</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
            <Card className="p-6 bg-slate-900/60 border-slate-700/50 backdrop-blur hover:shadow-2xl hover:shadow-blue-600/20 transition-all">
              <div className="flex items-center gap-3">
                <s.icon className="h-6 w-6 text-blue-400" />
                <div className="text-slate-200 font-medium">{s.title}</div>
              </div>
              <div className="mt-4 text-4xl font-extrabold text-white">{s.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-6 bg-slate-900/60 border-slate-700/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Contratos recientes</h2>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">Ver todos</Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-slate-300">
                  <th className="py-3">Contrato</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Fecha</th>
                  <th className="py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-slate-700/50">
                    <td className="py-3 text-slate-200">{r.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-sm bg-slate-800 text-slate-200">{r.status}</span>
                    </td>
                    <td className="py-3 text-slate-300">{r.date}</td>
                    <td className="py-3">
                      <Button variant="outline" className="border-slate-700 text-white">Ver detalles</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}