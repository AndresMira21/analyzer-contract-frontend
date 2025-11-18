import type { JSX } from 'react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import Input from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';

type NotifPrefs = { inApp: boolean; push: boolean };

export default function SettingsPage(): JSX.Element {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState<string>(user?.name ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>({ inApp: true, push: false });
  const [sessions, setSessions] = useState<{ email: string; name?: string; ts: string }[]>([]);
  const cardStyle = useMemo(() => ({ backgroundColor: 'rgba(20,30,60,0.32)', borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)', borderRadius: '16px' }), []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('user:prefs:notifications');
      if (raw) {
        const p = JSON.parse(raw) as Partial<NotifPrefs & { email?: boolean }>;
        setPrefs({ inApp: !!p.inApp, push: !!p.push });
      }
    } catch {}
    try {
      const rawHist = window.localStorage.getItem('auth:sessions_history');
      if (rawHist) {
        const hist = JSON.parse(rawHist) as { email: string; name?: string; ts: string }[];
        setSessions(hist);
      } else if (user?.email) {
        setSessions([{ email: user.email, name: user.name, ts: new Date().toISOString() }]);
      }
    } catch {}
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      updateProfile(name, email);
    } finally {
      setSaving(false);
    }
  };

  const savePrefs = (next: Partial<NotifPrefs>) => {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    try {
      window.localStorage.setItem('user:prefs:notifications', JSON.stringify(merged));
    } catch {}
    const updateUrl = (process.env.REACT_APP_NOTIF_PREFS_UPDATE as string | undefined) || '';
    if (updateUrl) {
      try {
        fetch(updateUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged), credentials: 'include' });
      } catch {}
    }
  };

  useEffect(() => {
    const profileUpdateUrl = (process.env.REACT_APP_PROFILE_UPDATE as string | undefined) || '';
    const handler = window.setTimeout(() => {
      if (profileUpdateUrl) {
        try {
          fetch(profileUpdateUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }), credentials: 'include' })
            .then(() => updateProfile(name, email))
            .catch(() => updateProfile(name, email));
        } catch {
          updateProfile(name, email);
        }
      } else {
        updateProfile(name, email);
      }
    }, 600);
    return () => window.clearTimeout(handler);
  }, [name, email, updateProfile]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">Configuración</h2>

      <Card className="p-6 backdrop-blur transition-all" style={cardStyle}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Tu nombre" className="bg-slate-800/50 text-white placeholder:text-slate-500" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="tu@email.com" className="bg-slate-800/50 text-white placeholder:text-slate-500" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button className="text-white" onClick={saveProfile} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
        </div>
      </Card>

      <Card className="p-6 backdrop-blur transition-all" style={cardStyle}>
        <div className="space-y-4">
          <div className="text-slate-300 font-semibold">Preferencias de notificaciones</div>
          <div className="flex items-center gap-3">
            <Checkbox id="notif-inapp" checked={prefs.inApp} onCheckedChange={(v: boolean) => savePrefs({ inApp: !!v })} />
            <Label htmlFor="notif-inapp">Notificaciones dentro de la app</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="notif-push" checked={prefs.push} onCheckedChange={(v: boolean) => savePrefs({ push: !!v })} />
            <Label htmlFor="notif-push">Notificaciones push</Label>
          </div>
        </div>
      </Card>

      <Card className="p-6 backdrop-blur transition-all" style={cardStyle}>
        <div className="space-y-4">
          <div className="text-slate-300 font-semibold">Historial de sesiones recientes</div>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-slate-500">Sin registros recientes</div>
            ) : (
              sessions.map((s, i) => (
                <div key={`${s.email}-${s.ts}-${i}`} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(20,30,60,0.22)' }}>
                  <div className="text-slate-200">{s.name ?? 'Usuario'} • {s.email}</div>
                  <div className="text-slate-500 text-sm">{new Date(s.ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

    </div>
  );
}