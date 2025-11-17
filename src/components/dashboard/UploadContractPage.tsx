import type { JSX } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadContractPage(): JSX.Element {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');

  const onPick = () => {
    inputRef.current?.click();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = [/\.pdf$/i, /\.docx$/i, /\.doc$/i].some((rx) => rx.test(f.name));
    if (!ok) {
      setFileName('Formato no permitido');
      return;
    }
    setFileName(f.name);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Subir contrato</h2>
      <Card className="p-6 bg-white border-slate-200">
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onChange} />
        <div className="flex items-center gap-4">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={onPick}>Seleccionar archivo</Button>
          <span className="text-slate-600">Formatos: PDF, DOCX, DOC</span>
        </div>
        {fileName && (
          <div className="mt-4 text-slate-700">Archivo seleccionado: {fileName}</div>
        )}
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
        </div>
      </Card>
    </div>
  );
}