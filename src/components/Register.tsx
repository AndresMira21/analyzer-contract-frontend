import React from "react";
import type { ReactElement, MouseEvent } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";

// EventBus local mínimo (Observer) y tipado básico
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
      try { h(payload); } catch (e) { console.error('[EventBus]', e); }
    });
  }
}

const eventBus = new EventBus();

export default function Register(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl mb-4">Crear cuenta</h1>
        <div className="space-y-4">
          <input className="w-full h-10 px-3 rounded-md bg-slate-800/70 border border-slate-700 text-white" placeholder="Nombre" />
          <input className="w-full h-10 px-3 rounded-md bg-slate-800/70 border border-slate-700 text-white" placeholder="Correo electrónico" />
          <input className="w-full h-10 px-3 rounded-md bg-slate-800/70 border border-slate-700 text-white" placeholder="Contraseña" type="password" />
          <Button
            className="w-full bg-blue-700 hover:bg-blue-600"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              // Publicar evento local de intento de registro
              eventBus.publish('auth:register_click', { ts: Date.now() });
              console.log('Registrarme click');
            }}
          >
            Registrarme
          </Button>
        </div>
      </motion.div>
    </div>
  );
}