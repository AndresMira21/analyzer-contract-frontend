import React from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";

export default function Register() {
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
          <Button className="w-full bg-blue-700 hover:bg-blue-600">Registrarme</Button>
        </div>
      </motion.div>
    </div>
  );
}