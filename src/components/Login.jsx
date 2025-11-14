import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { LogIn, UserPlus } from 'lucide-react';

function LoginForm({ mode = 'login', onModeChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      console.log('Register attempt:', { name, email, password });
    } else {
      console.log('Login attempt:', { email, password, rememberMe });
    }
  };

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
          {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        <p className="text-lg md:text-xl text-slate-600">
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
        className="space-y-5"
      >
        {isRegister && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">
              Nombre completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 bg-white"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-medium">
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 font-medium">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 bg-white"
          />
        </div>

        {isRegister && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 bg-white"
            />
          </div>
        )}

        {!isRegister && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-700 cursor-pointer select-none"
              >
                Recordarme
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-blue-700 hover:text-blue-800 hover:underline"
              onClick={() => console.log('Forgot password')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-600 text-white py-6 gap-2 shadow-lg hover:shadow-blue-900/30 transition-all duration-300"
          >
            {isRegister ? (
              <>
                <UserPlus className="h-5 w-5" />
                Crear cuenta
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </>
            )}
          </Button>
        </motion.div>

        <div className="text-center text-sm text-slate-600 pt-4 border-t border-slate-200">
          {isRegister ? (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                className="text-blue-700 hover:text-blue-800 hover:underline"
                onClick={() => onModeChange?.('login')}
              >
                Inicia sesión
              </button>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className="text-blue-700 hover:text-blue-800 hover:underline"
                onClick={() => onModeChange?.('register')}
              >
                Regístrate gratis
              </button>
            </>
          )}
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function Login() {
  const [mode, setMode] = useState('login');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-6">
      <div className="container mx-auto max-w-md">
        <LoginForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
}