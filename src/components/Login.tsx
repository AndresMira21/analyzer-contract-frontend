import { useState } from 'react';
import type React from 'react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfessionalBackground } from './ProfessionalBackground.jsx';
import { motion, AnimatePresence } from 'motion/react';
import { motion as fmMotion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { LogIn, UserPlus, Home, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { ContractAnimation } from './ContractAnimation';
import { useAuth } from '../context/AuthContext';
import { AnimationFactory } from '../utils/animationFactory';
import bcrypt from 'bcryptjs';

interface LoginFormProps {
  mode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
  onRegisterSuccess?: () => void;
}

export function LoginForm({ mode = 'login', onModeChange, onRegisterSuccess }: LoginFormProps) {
  const { login, register } = useAuth() as any;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  

  const isRegister = mode === 'register';

  const stripAll = (s: string) => s.replace(/\s+/g, '');
  const sanitizeEmail = (s: string) => s.replace(/\s+/g, '');
  const sanitizePassword = (s: string) => stripAll(s).slice(0, 15);
  const sanitizeRegisterName = (s: string) => {
    const trimmed = s.replace(/^\s+/, '');
    const lettersSpaces = trimmed.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]+/g, '');
    const noDouble = lettersSpaces.replace(/ {2,}/g, ' ');
    return noDouble.slice(0, 15);
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const clean = {
      name: sanitizeRegisterName(name),
      email: sanitizeEmail(email),
      password: sanitizePassword(password),
      confirm: sanitizePassword(confirmPassword),
    };

    if (!clean.email) {
      nextErrors.email = 'El correo es obligatorio';
    } else if (!emailRegex.test(clean.email)) {
      nextErrors.email = 'Formato de correo inválido';
    }
    if (email.trim() !== clean.email) {
      nextErrors.email = nextErrors.email ?? 'El correo no puede contener espacios';
    }

    if (!clean.password) {
      nextErrors.password = 'La contraseña es obligatoria';
    }
    if (isRegister) {
      if (clean.password && clean.password.length < 6) {
        nextErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    if (password !== clean.password) {
      nextErrors.password = nextErrors.password ?? 'La contraseña no puede contener espacios';
    }

    if (isRegister) {
      if (!clean.name) {
        nextErrors.name = 'El nombre es obligatorio';
      }
      if (!clean.confirm) {
        nextErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (clean.password && clean.confirm !== clean.password) {
        nextErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
      if (name !== clean.name) {
        nextErrors.name = nextErrors.name ?? 'Nombre inválido';
      }
      if (confirmPassword !== clean.confirm) {
        nextErrors.confirmPassword = nextErrors.confirmPassword ?? 'La confirmación no puede contener espacios';
      }
    }

    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    if (!isValid) return;
    setBackendError(undefined);
    setIsLoading(true);
    try {
      const passwordList: string[] = [];
      passwordList.push(clean.password);
      const rawPassword = passwordList[0] || '';
      const encryptedPassword = bcrypt.hashSync(rawPassword, 10);
      passwordList.length = 0;
      if (isRegister) {
        await register(clean.name, clean.email, clean.password);
        if (onRegisterSuccess) onRegisterSuccess();
        triggerModeChange('login');
      } else {
        await login(clean.email, clean.password, rememberMe);
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setBackendError(err?.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerModeChange = (nextMode: 'login' | 'register') => {
    window.setTimeout(() => {
      onModeChange?.(nextMode);
    }, 450);
  };



  return (
    <fmMotion.div
      key={mode}
      // Animación flip card profesional: rotación suave en eje Y
      // La tarjeta gira 0° → 90° (desaparece) → 0° (aparece el nuevo lado)
      // Con blur y fade durante el giro para efecto pulido tipo SaaS premium
      initial={{ 
        rotateY: isRegister ? -90 : 90,
        opacity: 0,
        scale: 0.95
      }}
      animate={{ 
        rotateY: 0,
        opacity: 1,
        scale: 1
      }}
      exit={{ 
        rotateY: isRegister ? 90 : -90,
        opacity: 0,
        scale: 0.95
      }}
      transition={{ 
        duration: 0.5,
        ease: [0.22, 0.61, 0.36, 1] // Cubic bezier elegante para flip suave
      }}
      style={{
        perspective: 800
      }}
      className="w-full bg-slate-900/90 backdrop-blur-xl p-16 rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden h-full"
    >
      <motion.div
        // Animación del título: aparece con fade-in suave después del flip
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-center mb-8 relative z-10"
      >
        <fmMotion.h2
          className="text-4xl md:text-5xl mb-3 bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent font-extrabold tracking-tight"
          transition={{ duration: 0.3 }}
        >
          {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </fmMotion.h2>
        <p className="text-slate-400 text-lg tracking-wide">
          {isRegister
            ? 'Únete a LegalConnect y analiza tus contratos'
            : 'Accede a tu cuenta de LegalConnect'}
        </p>
      </motion.div>

      <motion.form
        // Los campos del formulario aparecen con fade-in después del flip
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        onSubmit={handleSubmit}
        className="space-y-6 relative z-10"
      >
        {isRegister && (
          <motion.div
            className="space-y-2"
            // Campo de nombre aparece suavemente después del flip
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
          <Label htmlFor="name" className="text-slate-300 text-base font-medium tracking-wide">
            ¿Cómo quieres que te llamemos?
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = sanitizeRegisterName(e.target.value);
              setName(v);
              setErrors((prev) => ({ ...prev, name: undefined }));
              setBackendError(undefined);
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
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              maxLength={50}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const v = sanitizeEmail(e.target.value);
                setEmail(v);
                setErrors((prev) => ({ ...prev, email: undefined }));
                setBackendError(undefined);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === ' ') e.preventDefault();
              }}
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                const v = sanitizeEmail(text).slice(0, 50);
                setEmail(v);
              }}
              required
              autoComplete="email"
              className="pl-10 border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 h-12 text-base transition-all duration-200 hover:bg-slate-800/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
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
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const v = sanitizePassword(e.target.value);
                setPassword(v);
                setErrors((prev) => ({ ...prev, password: undefined }));
                setBackendError(undefined);
              }}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="pl-10 pr-10 border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 h-12 text-base transition-all duration-200 hover:bg-slate-800/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
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
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = sanitizePassword(e.target.value);
                  setConfirmPassword(v);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  setBackendError(undefined);
                }}
                required
                autoComplete="new-password"
                className="pl-10 pr-10 border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-500 h-12 text-base transition-all duration-200 hover:bg-slate-800/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
              <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors">
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
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
            className="w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 hover:from-blue-600 hover:via-indigo-500 hover:to-violet-500 text-white py-7 text-lg gap-2 shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-violet-800/50 transition-all duration-300 relative overflow-hidden group font-semibold tracking-wide"
            disabled={isLoading}
          >
            {/* Efecto de brillo en el botón */}
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

        {backendError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm mt-2">{backendError}</motion.p>
        )}

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
    </fmMotion.div>
  );
}

type LoginProps = {
  goRegister?: () => void;
};

export default function Login({ goRegister }: LoginProps) {
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>('login');
  
  const handleModeChange = (mode: 'login' | 'register') => {
    setCurrentMode(mode);
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
              <LoginForm key={currentMode} mode={currentMode} onModeChange={handleModeChange} />
            </AnimatePresence>
          </div>
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
