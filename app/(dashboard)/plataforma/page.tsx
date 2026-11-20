import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { selectClinicForView } from '@/lib/platform/clinic-selection';
import { hasPlatformAccess } from '@/lib/platform/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { reportCalendarDate } from '@/lib/report-dates';
import { SubscriptionForm, type Subscription } from './subscription-form';

export default async function PlatformPage({ searchParams }: { searchParams: Promise<{ clinic?: string }> }) {
  const [profile, platformAccess] = await Promise.all([getShellProfile(), hasPlatformAccess()]);
  if (!profile || !platformAccess) redirect('/dashboard');

  const { data, error } = await createAdminClient().from('clinics')
    .select('id, name, subscription_plan, subscription_status, subscription_starts_on, subscription_ends_on')
    .order('name');
  if (error) throw new Error('No se pudo cargar la lista de consultorios.');
  const clinics = (data ?? []) as (Subscription & { name: string })[];
  const { clinic: selectedId } = await searchParams;
  const selected = selectClinicForView(clinics, profile.clinicId, selectedId);
  const today = reportCalendarDate(new Date());

  return (
    <div className="space-y-6">
      <PageHeader title="Administración de plataforma" description="Gestiona consultorios, personal y suscripciones."
        action={<Button asChild><Link href="/clinica/nueva"><Building2 className="mr-2 size-4" aria-hidden="true" />Nuevo consultorio</Link></Button>} />
      {selected ? (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(15rem,1fr)_minmax(0,2fr)]">
          <nav aria-label="Consultorios de la plataforma" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
            <ul className="space-y-1">
              {clinics.map((clinic) => (
                <li key={clinic.id}>
                  <Link aria-current={clinic.id === selected.id ? 'page' : undefined}
                    className="flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 aria-[current=page]:bg-cyan-50 aria-[current=page]:text-cyan-900"
                    href={`/plataforma?clinic=${clinic.id}`}>
                    <span className="break-words">{clinic.name}</span>
                    {clinic.subscription_ends_on && clinic.subscription_ends_on < today && <span className="text-xs text-amber-800">Vencida</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>{selected.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline"><Link href={`/dashboard?clinic=${selected.id}`}>Ver dashboard</Link></Button>
                <Button asChild variant="outline"><Link href={`/consultorios?clinic=${selected.id}`}>Datos y personal</Link></Button>
                <Button asChild variant="outline"><Link href={`/consultorios/nuevo-usuario?clinic=${selected.id}`}>Nuevo usuario</Link></Button>
              </div>
            </CardHeader>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Suscripción</h2>
              <SubscriptionForm key={selected.id} clinic={selected} />
            </CardContent>
          </Card>
        </div>
      ) : <p className="text-sm text-slate-600 dark:text-slate-300">Aún no hay consultorios registrados.</p>}
    </div>
  );
}
