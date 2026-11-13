'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
        <AlertCircle className="h-7 w-7 text-rose-600" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        Algo salió mal al cargar esta sección
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Ocurrió un error inesperado. Puedes intentar de nuevo; si el problema persiste,
        cierra sesión y vuelve a ingresar.
      </p>
      <Button className="mt-5" onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
        Reintentar
      </Button>
    </div>
  );
}
