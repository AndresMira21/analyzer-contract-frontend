import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent tracking-tight">Detalle del Contrato</h1>
        <Button className="text-white" style={{ backgroundColor: '#3A7BFF' }} onClick={() => navigate('/contracts')}>Volver</Button>
      </div>

      <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)', boxShadow: '0 18px 40px rgba(58,123,255,0.10)' }}>
        <div className="text-slate-300">Detalle del contrato: {id}</div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
          <div className="text-white font-semibold mb-3">Cláusulas detectadas</div>
          <div className="text-slate-500 text-sm">Sin datos</div>
        </Card>
        <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
          <div className="text-white font-semibold mb-3">Riesgos detectados</div>
          <div className="text-slate-500 text-sm">Sin datos</div>
        </Card>
        <Card className="p-6" style={{ borderColor: 'rgba(58,123,255,0.24)' }}>
          <div className="text-white font-semibold mb-3">Recomendaciones</div>
          <div className="text-slate-500 text-sm">Sin datos</div>
        </Card>
      </div>
    </div>
  );
}