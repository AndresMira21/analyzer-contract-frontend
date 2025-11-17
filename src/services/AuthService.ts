import { authEventBus } from '../utils/eventBus';

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
    // Adapter selection according to "Recordarme"
    const adapter = rememberMe ? this.local : this.session;
    // Persist last email for UX continuity
    adapter.set('auth:last_email', email);
    // Publish login attempt event with strong typing
    const payload: LoginPayload = { email, rememberMe };
    authEventBus.publish('auth:login_attempt', { ts: Date.now(), ...payload });
    // Simulate successful authentication and persist token/user
    const mockToken = `mock-token-${Math.random().toString(36).slice(2)}`;
    const mockUser = { email };
    adapter.set('auth:token', mockToken);
    adapter.set('auth:user', JSON.stringify(mockUser));
  }

  async register(name: string, email: string, password: string): Promise<void> {
    // Keep minimal persistence for register flow (no token until login)
    this.session.set('auth:last_register_name', name);
    const payload: RegisterPayload = { name, email };
    authEventBus.publish('auth:register_click', { ts: Date.now(), ...payload });
  }
}

export const authService = new AuthService();