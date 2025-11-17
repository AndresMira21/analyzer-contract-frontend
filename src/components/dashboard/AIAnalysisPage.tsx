import type { JSX } from 'react';
import { Card } from '../ui/card';

export default function AIAnalysisPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Análisis con IA</h2>
      <Card className="p-6 bg-white border-slate-200">Herramientas de análisis próximamente</Card>
    </div>
  );
}