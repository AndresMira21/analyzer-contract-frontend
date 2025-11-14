import { useState, useEffect, type FormEvent, type ChangeEvent, type ReactElement } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


class EventBus {
  private topics: Map<string, Set<(payload: unknown) => void>> = new Map();
  subscribe(topic: string, handler: (payload: unknown) => void): () => void {
    const handlers = this.topics.get(topic) ?? new Set<(payload: unknown) => void>();
    handlers.add(handler);
    this.topics.set(topic, handlers);
    return () => handlers.delete(handler);
  }
  publish(topic: string, payload: unknown): void {
    const handlers = this.topics.get(topic);
    if (!handlers) return;
    handlers.forEach((h) => {
      try {
        h(payload);
      } catch (e) {
        console.error('[EventBus]', e);
      }
    });
  }
}

const eventBus = new EventBus();

type LoginResult = { token: string; user: { email: string } };

function validateEmail(email: string): boolean {
  return /.+@.+\..+/.test(email);
}

async function loginApi(email: string, password: string): Promise<LoginResult> {
  
  await new Promise((r) => setTimeout(r, 500));
  if (!validateEmail(email)) throw new Error('Correo inválido');
  if (!password || password.length < 6) throw new Error('Contraseña demasiado corta');
  return { token: `fake-${btoa(email)}`, user: { email } };
}

type AuthMode = 'login' | 'register';
type FormErrors = { email?: string; password?: string; confirmPassword?: string };
function LoginForm({
  mode = 'login',
  onModeChange,
}: {
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}): ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  // Estado de carga para deshabilitar el submit y mostrar spinner durante la "API" local
  const [loading, setLoading] = useState(false);
  // Estado de errores por campo; se actualiza en submit y se limpia/valida en onChange
  const [errors, setErrors] = useState<FormErrors>({});

  const isRegister = mode === 'register';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validaciones previas con actualización de mensajes de error
    const nextErrors: FormErrors = {};
    if (!validateEmail(email)) nextErrors.email = 'Ingrese un correo válido.';
    if (!password || password.length < 6) nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (isRegister && confirmPassword !== password) nextErrors.confirmPassword = 'La confirmación no coincide con la contraseña.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return; // Evitar enviar si hay errores
    }

    setLoading(true);
    if (isRegister) {
      // Publicar evento local de intento de registro (sin enviar contraseña)
      eventBus.publish('auth:register_attempt', { name, email });
      console.log('Register attempt:', { name, email, password });
    } else {
      // Publicar evento local de intento de login (sin enviar contraseña)
      eventBus.publish('auth:login_attempt', { email, rememberMe });
      console.log('Login attempt:', { email, password, rememberMe });
      try {
        const res = await loginApi(email, password);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', res.token);
        storage.setItem('authUser', JSON.stringify(res.user));
        eventBus.publish('auth:login_success', { email: res.user.email });
        console.log('Login success:', res);
      } catch (err) {
        eventBus.publish('auth:login_error', { message: (err as Error).message });
        console.error('Login failed:', err);
      } finally {
        // Fin de la simulación; reactivamos el botón
        setLoading(false);
      }
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const v = e.target.value;
              setEmail(v);
              // Limpiar/actualizar error de email en tiempo real
              setErrors((prev) => {
                const valid = validateEmail(v);
                return { ...prev, email: valid ? undefined : (prev.email ? 'Ingrese un correo válido.' : undefined) };
              });
            }}
            required
            className={`border-slate-300 focus:border-blue-600 focus:ring-blue-600 bg-white ${errors.email ? 'border-red-500 focus:border-red-600 focus:ring-red-600' : ''}`}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const v = e.target.value;
              setPassword(v);
              // Limpiar/actualizar error de contraseña
              setErrors((prev) => {
                const valid = v.length >= 6;
                const next: FormErrors = { ...prev, password: valid ? undefined : (prev.password ? 'La contraseña debe tener al menos 6 caracteres.' : undefined) };
                // También revalidar confirmación si estamos registrando
                if (isRegister) {
                  next.confirmPassword = (confirmPassword && confirmPassword === v) ? undefined : (prev.confirmPassword ? 'La confirmación no coincide con la contraseña.' : undefined);
                }
                return next;
              });
            }}
            required
            className={`border-slate-300 focus:border-blue-600 focus:ring-blue-600 bg-white ${errors.password ? 'border-red-500 focus:border-red-600 focus:ring-red-600' : ''}`}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const v = e.target.value;
                setConfirmPassword(v);
                // Limpiar/actualizar error de confirmación
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: (v && v === password) ? undefined : (prev.confirmPassword ? 'La confirmación no coincide con la contraseña.' : undefined),
                }));
              }}
              required
              className={`border-slate-300 focus:border-blue-600 focus:ring-blue-600 bg-white ${errors.confirmPassword ? 'border-red-500 focus:border-red-600 focus:ring-red-600' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        {!isRegister && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked: boolean | 'indeterminate') => setRememberMe(checked === true)}
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
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white py-6 gap-2 shadow-lg hover:shadow-blue-900/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : isRegister ? (
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

export default function Login(): ReactElement {
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = eventBus.subscribe('auth:login_success', () => {
      navigate('/');
    });
    return unsub;
  }, [navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-6">
      <div className="container mx-auto max-w-md">
        <LoginForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
}