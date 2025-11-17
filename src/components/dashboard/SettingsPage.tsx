import type { JSX } from 'react';
import { Card } from '../ui/card';

export default function SettingsPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Configuración</h2>
      <Card className="p-6 bg-white border-slate-200">Preferencias del usuario próximamente</Card>
    </div>
  );
}