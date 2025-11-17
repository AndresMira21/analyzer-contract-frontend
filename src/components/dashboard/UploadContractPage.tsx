import type { JSX } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export default function UploadContractPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Subir contrato</h2>
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center gap-4">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white">Seleccionar archivo</Button>
          <span className="text-slate-600">Formatos: PDF, DOCX</span>
        </div>
      </Card>
    </div>
  );
}