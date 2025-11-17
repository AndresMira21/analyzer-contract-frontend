import { useState } from 'react';
import type React from 'react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfessionalBackground } from './ProfessionalBackground.jsx';
import { motion } from 'motion/react';
import { motion as fmMotion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { LogIn, UserPlus, Home } from 'lucide-react';
import { ContractIllustration } from './ContractIllustration';
import { authService } from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import { AnimationFactory } from '../utils/animationFactory';

interface LoginFormProps {
  mode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
  onRegisterSuccess?: () => void;
}

export function LoginForm({ mode = 'login', onModeChange, onRegisterSuccess }: LoginFormProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const [isExiting, setIsExiting] = useState(false);
  const [flipDir, setFlipDir] = useState<1 | -1>(1);

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      nextErrors.email = 'El correo es obligatorio';
    } else if (!emailRegex.test(email)) {
      nextErrors.email = 'Formato de correo inválido';
    }

    if (!password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria';
    }

    if (isRegister) {
      if (!name.trim()) {
        nextErrors.name = 'El nombre es obligatorio';
      }
      if (password.trim() && password.length < 6) {
        nextErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (!confirmPassword.trim()) {
        nextErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (password.trim() && confirmPassword !== password) {
        nextErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    if (!isValid) return;
    setIsLoading(true);
    try {
      if (isRegister) {
        await authService.register(name, email, password);
        const result = register(name, email, password);
        await Promise.resolve(result);
        if (onRegisterSuccess) onRegisterSuccess();
        triggerModeChange('login');
      } else {
        await authService.login(email, password, rememberMe);
        login(email, password, rememberMe);
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const triggerModeChange = (nextMode: 'login' | 'register') => {
    setFlipDir(nextMode === 'register' ? 1 : -1);
    setIsExiting(true);
    window.setTimeout(() => {
      onModeChange?.(nextMode);
      setIsExiting(false);
    }, 450);
  };

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, rotateY: -8, scale: 0.98, transformPerspective: 1000 }}
      animate={
        isExiting
          ? { opacity: 1, rotateY: 12 * flipDir, scale: 0.99, transformPerspective: 1000 }
          : { opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1000 }
      }
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="w-full bg-slate-900/90 backdrop-blur-xl p-16 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-8 relative z-10"
      >
        <motion.h2
          className="text-4xl md:text-5xl mb-3 bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent font-extrabold tracking-tight"
          animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ backgroundSize: '200% auto' }}
        >
          {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </motion.h2>
        <p className="text-slate-400 text-lg tracking-wide">
          {isRegister
            ? 'Únete a LegalConnect y analiza tus contratos'
            : 'Accede a tu cuenta de LegalConnect'}
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-6 relative z-10"
      >
        {isRegister && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="name" className="text-slate-300 text-base font-medium tracking-wide">
              Nombre completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              required
              className="border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
            />
            {errors.name && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm mt-1">{errors.name}</motion.p>
            )}
          </motion.div>
        )}

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: isRegister ? 0.2 : 0.1 }}
        >
          <Label htmlFor="email" className="text-slate-300 text-base font-medium tracking-wide">
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            required
            className="border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
          />
          {errors.email && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm mt-1">{errors.email}</motion.p>
          )}
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: isRegister ? 0.3 : 0.2 }}
        >
          <Label htmlFor="password" className="text-slate-300 text-base font-medium tracking-wide">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            required
            className="border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
          />
          {errors.password && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm mt-1">{errors.password}</motion.p>
          )}
        </motion.div>

        {isRegister && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label htmlFor="confirmPassword" className="text-slate-300 text-base font-medium tracking-wide">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              required
              className="border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 h-12 text-base"
            />
            {errors.confirmPassword && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm mt-1">{errors.confirmPassword}</motion.p>
            )}
          </motion.div>
        )}

        {!isRegister && (
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked: boolean) => setRememberMe(checked)}
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-300 cursor-pointer select-none tracking-wide"
              >
                Recordarme
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors tracking-wide"
              onClick={() => console.log('Forgot password')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white py-7 text-lg gap-2 shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-800/50 transition-all duration-300 relative overflow-hidden group font-semibold tracking-wide"
            disabled={isLoading}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
            {isLoading && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isRegister ? (
              <>
                <UserPlus className="h-6 w-6 relative z-10" />
                <span className="relative z-10">Crear cuenta</span>
              </>
            ) : (
              <>
                <LogIn className="h-6 w-6 relative z-10" />
                <span className="relative z-10">Iniciar sesión</span>
              </>
            )}
          </Button>
        </motion.div>

        <motion.div
          className="text-center text-base text-slate-400 pt-6 border-t border-slate-700/50 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {isRegister ? (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors tracking-wide"
                onClick={() => triggerModeChange('login')}
              >
                Inicia sesión
              </button>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors tracking-wide"
                onClick={() => triggerModeChange('register')}
              >
                Regístrate gratis
              </button>
            </>
          )}
        </motion.div>
      </motion.form>
      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <button
          type="button"
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors tracking-wide"
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </button>
      </motion.div>
    </motion.div>
  );
}

type LoginProps = {
  goRegister?: () => void;
};

export default function Login({ goRegister }: LoginProps) {
  const navigate = useNavigate();
  const handleModeChange = (mode: 'login' | 'register') => {
    if (mode === 'register') {
      if (goRegister) {
        goRegister();
        return;
      }
      navigate('/register');
      return;
    }
  };

  return (
    <fmMotion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-6 relative font-sans antialiased tracking-wide"
    >
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
          <ContractIllustration />

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <LoginForm mode="login" onModeChange={handleModeChange} />
          </motion.div>
        </div>
      </div>
    </fmMotion.div>
  );
}

export function LoginContent(): JSX.Element {
  const navigate = useNavigate();
  const handleModeChange = (mode: 'login' | 'register') => {
    if (mode === 'register') {
      navigate('/register');
      return;
    }
  };
  const { initial, animate, transition } = AnimationFactory.getPanelSlide('login');
  return (
    <motion.div initial={initial} animate={animate} transition={transition}>
      <LoginForm mode="login" onModeChange={handleModeChange} />
    </motion.div>
  );
}