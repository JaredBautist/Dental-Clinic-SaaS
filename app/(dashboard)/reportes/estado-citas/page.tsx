import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { currentReportMonth } from '@/lib/report-dates';
import {
  getAppointmentStatusReportAction,
  type AppointmentStatusReportResult,
} from '@/lib/actions/reports.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { PageHeader } from '@/components/ui/page-header';
import { StatusReportClient } from './status-client';

export const metadata = {
  title: 'Estado de citas',
  description: 'Distribución de citas por estado',
};

export default async function AppointmentStatusReportPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'recepcionista') {
    redirect('/dashboard');
  }

  const range = currentReportMonth();
  const reportResult = await getAppointmentStatusReportAction({
    startDate: range.start,
    endDate: range.end,
  });

  if (!reportResult.success) {
    throw new Error(reportResult.error.message);
  }

  const report: AppointmentStatusReportResult = reportResult.data;

  return (
    <div>
      <PageHeader
        action={<Button asChild variant="outline"><Link href="/reportes/pacientes-atendidos">Pacientes atendidos</Link></Button>}
        title="Reporte de Estado de Citas"
        description="Distribución de citas por estado en el rango seleccionado (máx. 12 meses)"
      />
      <StatusReportClient initialReport={report} dentistName={profile.role === 'odontologo' ? profile.userName : undefined} />
    </div>
  );
}
