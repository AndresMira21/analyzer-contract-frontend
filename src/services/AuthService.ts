import { authEventBus, type AuthEventTopic } from '../utils/eventBus';

interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  get(key: string) { return window.localStorage.getItem(key); }
  set(key: string, value: string) { window.localStorage.setItem(key, value); }
  remove(key: string) { window.localStorage.removeItem(key); }
}

class SessionStorageAdapter implements StorageAdapter {
  get(key: string) { return window.sessionStorage.getItem(key); }
  set(key: string, value: string) { window.sessionStorage.setItem(key, value); }
  remove(key: string) { window.sessionStorage.removeItem(key); }
}

type LoginPayload = { email: string; rememberMe: boolean };
type RegisterPayload = { name: string; email: string };

// Facade para operaciones de autenticación y almacenamiento
class AuthService {
  private local = new LocalStorageAdapter();
  private session = new SessionStorageAdapter();

  async login(email: string, password: string, rememberMe: boolean): Promise<void> {
    const adapter = rememberMe ? this.local : this.session;
    adapter.set('auth:last_email', email);
    // Emitimos evento usando el EventBus Singleton
    const payload: LoginPayload = { email, rememberMe };
    authEventBus.publish('auth:login_attempt', { ts: Date.now(), ...payload });
    // Simulación: en integración real haríamos peticiones y redirección
  }

  async register(name: string, email: string, password: string): Promise<void> {
    this.session.set('auth:last_register_name', name);
    const payload: RegisterPayload = { name, email };
    authEventBus.publish('auth:register_click', { ts: Date.now(), ...payload });
  }
}

export const authService = new AuthService();