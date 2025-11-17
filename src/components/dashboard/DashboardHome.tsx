import type { JSX } from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
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
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; size: number; contractName?: string }[]>([]);

  const stats = [
    { icon: FileText, title: 'Contratos analizados', value: 124 },
  ];

  

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.5 }}>
        <motion.h1
          className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight"
          style={{ backgroundSize: '200% auto' }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          Hola, {name} 👋
        </motion.h1>
        
        <div className="relative min-h-[68vh] flex flex-col items-center justify-center">
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight mb-4"
            style={{ backgroundSize: '200% auto' }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            Bienvenid@ a LegalConnect
          </motion.h2>
          <div className="flex justify-center mb-4">
            <div className="w-[280px] md:w-[340px]">
              <Lottie animationData={robotAnimation} loop autoplay />
            </div>
          </div>
          <div className="flex items-center justify-center gap-5 flex-wrap max-w-[1100px] mx-auto">
            <div className="flex items-center bg-white/5 rounded-2xl border px-10 h-[84px] w-full sm:w-[600px] md:w-[800px] lg:w-[1000px] max-w-full" style={{ borderColor: 'rgba(58,123,255,0.28)' }}>
              <input placeholder="Selecciona tu contrato..." className="w-full bg-transparent text-slate-200 placeholder-slate-400 outline-none text-3xl" />
            </div>
            <motion.div className="relative" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.98 }}>
            <motion.span className="absolute inset-0 -z-10 rounded-2xl" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.35) 0%, rgba(34,211,238,0.65) 50%, rgba(14,165,233,0.35) 100%)' }} initial={{ opacity: 0 }} whileHover={{ opacity: 0.85, x: [ -24, 24 ] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }} />
              <Button className="text-white h-[84px] px-10 text-3xl" style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #22D3EE 100%)', boxShadow: '0 14px 34px rgba(34,211,238,0.3)', filter: 'brightness(1.06)' }} onClick={() => setIsUploadOpen(true)}>Subir contrato</Button>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <motion.span className="absolute inset-0 -z-10 rounded-2xl" style={{ background: 'linear-gradient(90deg, rgba(54,90,223,0.22) 0%, rgba(79,140,255,0.44) 50%, rgba(54,90,223,0.22) 100%)' }} initial={{ opacity: 0 }} whileHover={{ opacity: 0.75, x: [ -22, 22 ] }} transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }} />
              <Button variant="outline" className="text-white h-[84px] px-10 text-3xl" style={{ borderColor: '#4F8CFF', boxShadow: '0 12px 30px rgba(79,140,255,0.22)', background: 'linear-gradient(90deg, rgba(20,30,60,0.35) 0%, rgba(20,30,60,0.25) 100%)' }} onClick={() => setIsAnalyzeOpen(true)}>Analizar contrato</Button>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} whileHover={{ y: -2, scale: 1.06 }} whileTap={{ scale: 0.98 }}>
              <motion.span className="absolute inset-0 -z-10 rounded-2xl" style={{ background: 'radial-gradient(120px 120px at 50% 50%, rgba(79,140,255,0.5), rgba(79,140,255,0))' }} initial={{ opacity: 0 }} whileHover={{ opacity: 0.85, scale: 1.1 }} transition={{ duration: 0.8 }} />
              <Link to="/dashboard/ai" className="flex items-center justify-center h-[84px] w-[84px] rounded-2xl" style={{ backgroundColor: 'rgba(79,140,255,0.18)', boxShadow: '0 12px 30px rgba(79,140,255,0.2)' }}>
                <motion.div initial={{ rotate: 0 }} whileHover={{ rotate: 8 }} transition={{ type: 'spring', stiffness: 180, damping: 12 }}>
                  <ChevronRight className="h-9 w-9" color="#3A7BFF" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
          
          <div className="mt-4 text-slate-400 text-sm md:text-base text-center">
            Formatos soportados: PDF, DOCX, TXT
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
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">Actividad reciente</h2>
          <div className="mt-4 space-y-4">
            {[
              { id: 'EV-001', title: 'Contrato de Servicios revisado', ts: 'Hace 5 min', type: 'ok' },
              { id: 'EV-002', title: 'Riesgo alto detectado', ts: 'Hace 1 h', type: 'warn' },
              { id: 'EV-003', title: 'Nuevo comentario del cliente', ts: 'Ayer', type: 'note' },
            ].map((ev, idx) => (
              <motion.div key={ev.id} className="flex items-center justify-between gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * idx, duration: 0.4 }} whileHover={{ y: -2 }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: ev.type === 'warn' ? 'rgba(239,68,68,0.15)' : ev.type === 'ok' ? 'rgba(58,123,255,0.15)' : 'rgba(100,116,139,0.15)' }} />
                  <div>
                    <div className="text-slate-200">{ev.title}</div>
                    <div className="text-slate-500 text-sm">{ev.ts}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" color="#94A3B8" />
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      <UploadContractModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploaded={(file) => { setUploadedFiles(prev => [...prev, file]); setIsAnalyzeOpen(true); }} />
      <AnalyzeTextModal
        isOpen={isAnalyzeOpen}
        onClose={() => setIsAnalyzeOpen(false)}
        files={uploadedFiles}
        onAnalyzed={(file) => {
          const analyzed = {
            id: `AC-${Date.now()}`,
            name: file.contractName || file.name,
            uploadedAt: new Date().toISOString().slice(0, 10),
            status: 'En revisión' as const,
            riskScore: Math.min(100, Math.max(8, Math.round(file.size / 1024))),
            clauses: ['Alcance de servicios', 'Confidencialidad', 'Propiedad intelectual'],
            risks: ['Ambigüedad en penalizaciones', 'Falta de SLA explícito'],
            recommendations: ['Definir métricas de desempeño', 'Agregar cláusula de resolución de disputas'],
            summary: 'Análisis inicial automático basado en el documento subido.'
          };
          navigate('/dashboard/contracts', { state: { analyzedContract: analyzed } });
          setUploadedFiles(prev => {
            const next = prev.filter(f => f !== file);
            if (next.length === 0) setIsAnalyzeOpen(false);
            return next;
          });
        }}
      />
    </div>
  );
}