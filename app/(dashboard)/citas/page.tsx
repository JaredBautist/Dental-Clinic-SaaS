import { redirect } from 'next/navigation';
import {
  listAppointmentsAction,
} from '@/lib/actions/appointments.actions';
import { listPatientsAction } from '@/lib/actions/patients.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { PageHeader } from '@/components/ui/page-header';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { AppointmentsClient } from './appointments-client';

export const metadata = {
  title: 'Citas',
  description: 'Agenda de citas y control anti-solapamiento',
};

function todayRangeIso(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default async function AppointmentsPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  const range = todayRangeIso();
  const [appointmentsResult, patientsResult, dentistsResult] = await Promise.all([
    listAppointmentsAction({ startDate: range.start, endDate: range.end }),
    listPatientsAction(),
    createServerSupabaseClient().then((supabase) =>
      supabase
        .from('users')
        .select('id, full_name')
        .eq('clinic_id', profile.clinicId)
        .eq('role', 'odontologo')
        .eq('is_active', true)
        .order('full_name', { ascending: true })
    ),
  ]);

  if (!appointmentsResult.success || !patientsResult.success) {
    const firstError = appointmentsResult.error ?? patientsResult.error;
    if (firstError?.statusCode === 401 || firstError?.statusCode === 403) {
      redirect('/dashboard');
    }
    throw new Error(firstError?.message ?? 'Error al cargar la agenda');
  }

  const dentists: Array<{ id: string; name: string }> = (dentistsResult.data ?? []).map((user) => ({
    id: user.id,
    name: user.full_name,
  }));

  return (
    <div>
      <PageHeader
        title="Agenda y Citas"
        description="Calendario de citas y control anti-solapamiento"
      />
      <AppointmentsClient
        role={profile.role}
        initialAppointments={appointmentsResult.data}
        patients={patientsResult.data}
        dentists={dentists}
      />
    </div>
  );
}
