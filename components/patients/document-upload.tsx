'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DocumentReceipt } from '@/lib/clinical-documents/service';

export function DocumentUpload({ patientId }: { patientId: string }) {
  const requestId = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<DocumentReceipt | null>(null);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new FormData(form);
    requestId.current ??= crypto.randomUUID();
    body.set('patientId', patientId);
    body.set('requestId', requestId.current);
    setPending(true);
    setError('');
    setReceipt(null);
    try {
      const response = await fetch('/api/clinical-documents', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Revisa el archivo e intenta de nuevo.');
      setReceipt(result);
      form.reset();
      requestId.current = null;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo cargar el PDF.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={upload} className="space-y-4" aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="history-pdf">Historia clínica en PDF</Label>
        <Input id="history-pdf" name="file" type="file" accept=".pdf,application/pdf" required
          disabled={pending} aria-describedby="history-pdf-limit" onChange={() => {
            requestId.current = null;
            setReceipt(null);
            setError('');
          }} />
        <p id="history-pdf-limit" className="text-sm text-slate-600 dark:text-slate-300">Tamaño máximo: 20 MB.</p>
      </div>
      <Button type="submit" isLoading={pending}>Cargar PDF</Button>
      {error && <Alert tone="danger" title="No se pudo cargar el PDF">{error}</Alert>}
      {receipt && <p role="status" className="break-all text-sm">Documento recibido: {receipt.file_name}</p>}
    </form>
  );
}
