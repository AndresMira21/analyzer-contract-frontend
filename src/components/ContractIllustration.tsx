import { motion } from 'motion/react';
import { Shield, Search, CheckCircle, Zap, Sparkles } from 'lucide-react';

// Ilustración compartida del panel izquierdo (contratos/AI) usada en Login y Register
// Comentario: Mantiene idénticos estilos y animaciones para garantizar consistencia visual.
export function ContractIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative flex items-center justify-center p-12 h-full"
    >
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#3b82f6' : '#93c5fd',
          }}
          animate={{ y: [0, -40, 0], x: [0, Math.random() * 20 - 10, 0], opacity: [0.1, 0.6, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-600/5 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 mb-8 text-blue-400 relative">
          <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <Zap className="h-5 w-5" />
          </motion.div>
          <span className="text-sm font-bold tracking-widest">AI POWERED ANALYSIS</span>
          <motion.div animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <Sparkles className="h-4 w-4 text-blue-300" />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mb-6 relative">
          <motion.div
            animate={{ boxShadow: ['0 10px 30px rgba(37, 99, 235, 0.3)', '0 10px 40px rgba(37, 99, 235, 0.5)', '0 10px 30px rgba(37, 99, 235, 0.3)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-center font-bold text-lg relative overflow-hidden"
          >
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
            <span className="relative z-10">CONTRATO LEGAL</span>
          </motion.div>
        </motion.div>

        <div className="space-y-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <motion.div key={i} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }} className="h-1 bg-slate-700 rounded-full" />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="relative">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring', stiffness: 200 }} className="absolute -left-12 top-8 bg-blue-600 rounded-full p-3 shadow-lg shadow-blue-600/50">
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3 }} className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <CheckCircle className="h-4 w-4 text-white" />
              </motion.div>
            </motion.div>
            <motion.div className="absolute inset-0 rounded-full border-2 border-blue-400" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }} className="bg-white rounded-lg p-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} initial={{ width: 0 }} animate={{ width: i === 2 ? '60%' : '100%' }} transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }} className={`h-2 rounded-full ${i === 2 ? 'bg-blue-400' : 'bg-slate-300'}`} />
              ))}
            </div>

            <div className="absolute bottom-4 left-8 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + i * 0.1 }} className="w-2 h-2 bg-blue-400 rounded-full" />
              ))}
            </div>

            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: [0, -5, 0], rotate: [0, 5, -5, 0] }} transition={{ delay: 1.7, type: 'spring', y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }} className="absolute bottom-6 left-1/3">
              <Search className="h-12 w-12 text-blue-600" strokeWidth={2.5} />
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.9, type: 'spring' }} className="absolute bottom-6 right-8 bg-blue-600 rounded-full p-2 relative">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              <motion.div className="absolute inset-0 rounded-full border-2 border-blue-400" animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} />
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0, y: [0, -8, 0] }} transition={{ delay: 1.1, y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }} className="absolute -top-4 -right-8 bg-slate-800 border-2 border-blue-500 rounded-full p-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}