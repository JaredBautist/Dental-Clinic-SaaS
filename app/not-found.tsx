import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">404</p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        La ruta que buscas no existe o fue movida. Verifica la dirección o vuelve al panel.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}
