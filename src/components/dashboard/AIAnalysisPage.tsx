import type { JSX } from 'react';
import { Card } from '../ui/card';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';

export default function AIAnalysisPage(): JSX.Element {
  const location = useLocation();
  const state = (location.state ?? {}) as { contractId?: string; contractName?: string };
  const title = state.contractName ? `Chat legal sobre: ${state.contractName}` : 'Análisis con IA';
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <Card className="p-6 bg-white border-slate-200">
        {state.contractId ? `Contrato seleccionado: ${state.contractId}` : 'Herramientas de análisis próximamente'}
      </Card>
      {state.contractId && (
        <div className="flex items-center gap-3">
          <Button onClick={() => window.history.back()}>Volver</Button>
        </div>
      )}
    </div>
  );
}