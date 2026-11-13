import { redirect } from 'next/navigation';
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

function monthRangeIso(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default async function AppointmentStatusReportPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'recepcionista') {
    redirect('/dashboard');
  }

  const range = monthRangeIso();
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
        title="Reporte de Estado de Citas"
        description="Distribución de citas por estado en el rango seleccionado (máx. 12 meses)"
      />
      <StatusReportClient initialReport={report} />
    </div>
  );
}
