import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { JSX } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfessionalBackground } from './ProfessionalBackground.jsx';
import { LoginForm } from './Login';
import { Home } from 'lucide-react';
import { ContractAnimation } from './ContractAnimation';
import { AnimationFactory } from '../utils/animationFactory';

export default function Register() {
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>('register');
  
  const handleModeChange = (mode: 'login' | 'register') => {
    setCurrentMode(mode);
    if (mode === 'login') {
      navigate('/login');
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-6 relative font-sans antialiased tracking-wide">
      <ProfessionalBackground />

      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 px-6 py-3 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 text-white rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 group z-50 font-medium tracking-wide"
      >
        <Home className="h-5 w-5 group-hover:text-blue-400 transition-colors" />
        <span className="font-medium">Volver al inicio</span>
      </motion.button>

      <div className="w-full h-full max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-2 gap-0 h-full min-h-[700px]">
          {/* Ilustración con fade sutil al cambiar de modo */}
          <motion.div
            key={`illustration-${currentMode}`}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          >
          <ContractAnimation />
          </motion.div>
          
          {/* Contenedor con perspectiva para el efecto flip card */}
          <div style={{ perspective: '800px' }} className="flex items-center justify-center">
            <AnimatePresence mode="wait">
              <LoginForm 
                key={currentMode} 
                mode={currentMode} 
                onModeChange={handleModeChange} 
                onRegisterSuccess={() => navigate('/login')} 
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterContent(): JSX.Element {
  const navigate = useNavigate();
  const handleModeChange = (mode: 'login' | 'register') => {
    if (mode === 'login') {
      navigate('/login');
      return;
    }
  };
  const { initial, animate, transition } = AnimationFactory.getPanelSlide('register');
  return (
    <motion.div initial={initial} animate={animate} transition={transition}>
      <LoginForm mode="register" onModeChange={handleModeChange} />
    </motion.div>
  );
}