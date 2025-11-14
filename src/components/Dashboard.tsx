import type { JSX } from 'react';
import { FileSignature, FileText, Settings } from 'lucide-react';

export function Dashboard(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Panel principal</h1>
          <p className="mt-2 text-slate-400 text-sm md:text-base">Bienvenido a tu espacio de gestión de contratos</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md p-6 shadow-2xl transition-colors hover:border-blue-500/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <FileSignature className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Crear nuevo contrato</h2>
            </div>
            <p className="text-slate-400 text-sm">Genera borradores y documentos con plantillas profesionales.</p>
          </div>

          <div className="group rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md p-6 shadow-2xl transition-colors hover:border-blue-500/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Mis contratos</h2>
            </div>
            <p className="text-slate-400 text-sm">Consulta, organiza y analiza tus contratos existentes.</p>
          </div>

          <div className="group rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md p-6 shadow-2xl transition-colors hover:border-blue-500/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Perfil y configuración</h2>
            </div>
            <p className="text-slate-400 text-sm">Administra tu perfil, preferencias y seguridad.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
