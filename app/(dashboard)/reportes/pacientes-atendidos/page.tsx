import { redirect } from 'next/navigation';
import {
  getAttendedPatientsReportAction,
  type AttendedPatientsReportResult,
} from '@/lib/actions/reports.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { PageHeader } from '@/components/ui/page-header';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { AttendedReportClient } from './attended-client';

export const metadata = {
  title: 'Pacientes atendidos',
  description: 'Reporte de pacientes atendidos por odontólogo',
};

function monthRangeIso(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default async function AttendedPatientsReportPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'recepcionista') {
    redirect('/dashboard');
  }

  const range = monthRangeIso();
  const [reportResult, dentistsResult] = await Promise.all([
    getAttendedPatientsReportAction({ startDate: range.start, endDate: range.end }),
    createServerSupabaseClient().then((supabase) =>
      supabase
        .from('users')
        .select('id, full_name')
        .eq('clinic_id', profile.clinicId)
        .eq('role', 'odontologo')
        .order('full_name', { ascending: true })
    ),
  ]);

  if (!reportResult.success) {
    throw new Error(reportResult.error.message);
  }

  const report: AttendedPatientsReportResult = reportResult.data;
  const dentists: Array<{ id: string; name: string }> = (dentistsResult.data ?? []).map((user) => ({
    id: user.id,
    name: user.full_name,
  }));

  return (
    <div>
      <PageHeader
        title="Reporte de Pacientes Atendidos"
        description="Métricas de citas completadas por odontólogo en el rango seleccionado (máx. 12 meses)"
      />
      <AttendedReportClient initialReport={report} dentists={dentists} />
    </div>
  );
}
