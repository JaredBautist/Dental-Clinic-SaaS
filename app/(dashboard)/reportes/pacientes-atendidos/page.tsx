import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { currentReportMonth } from '@/lib/report-dates';
import {
  getAttendedPatientsReportAction,
  type AttendedPatientsReportResult,
} from '@/lib/actions/reports.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { PageHeader } from '@/components/ui/page-header';
import { AttendedReportClient } from './attended-client';

export const metadata = {
  title: 'Pacientes atendidos',
  description: 'Reporte de pacientes atendidos por odontólogo',
};

export default async function AttendedPatientsReportPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'recepcionista') {
    redirect('/dashboard');
  }

  const range = currentReportMonth();
  const reportResult = await getAttendedPatientsReportAction({
    startDate: range.start,
    endDate: range.end,
  });

  if (!reportResult.success) {
    throw new Error(reportResult.error.message);
  }

  const report: AttendedPatientsReportResult = reportResult.data;
  return (
    <div>
      <PageHeader
        action={<Button asChild variant="outline"><Link href="/reportes/estado-citas">Estado de citas</Link></Button>}
        title="Reporte de Pacientes Atendidos"
        description="Citas completadas en el rango seleccionado"
      />
      <AttendedReportClient initialReport={report} dentistName={profile.role === 'odontologo' ? profile.userName : undefined} />
    </div>
  );
}
