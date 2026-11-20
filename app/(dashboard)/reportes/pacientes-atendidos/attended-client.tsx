'use client';

import * as React from 'react';
import { reportCalendarDate, reportDateIso, formatReportDate } from '@/lib/report-dates';
import { ReportDownload } from '@/components/ui/report-download';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { StatsCard } from '@/components/ui/stats-card';
import { Users, CalendarDays, Filter } from 'lucide-react';
import {
  getAttendedPatientsReportAction,
  type AttendedPatientsReportResult,
} from '@/lib/actions/reports.actions';

interface AttendedReportClientProps {
  initialReport: AttendedPatientsReportResult;
  dentistName?: string;
}

export function AttendedReportClient({ initialReport, dentistName }: AttendedReportClientProps) {
  const [report, setReport] = React.useState<AttendedPatientsReportResult>(initialReport);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState(reportCalendarDate(initialReport.startDate));
  const [endDate, setEndDate] = React.useState(reportCalendarDate(initialReport.endDate));

  async function runReport(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await getAttendedPatientsReportAction({
      startDate: reportDateIso(startDate),
      endDate: reportDateIso(endDate, true),
    });
    setIsLoading(false);

    if (result.success) {
      setReport(result.data);
    } else {
      setError(result.error.message);
    }
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {dentistName && <p className="mb-4 text-sm font-medium">Odontólogo: {dentistName}</p>}
          <form onSubmit={runReport} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="report-start">Fecha inicial</Label>
              <Input
                id="report-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-end">Fecha final</Label>
              <Input
                id="report-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="sm:mb-0">
              <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
              Generar reporte
            </Button>
            <ReportDownload filename="pacientes-atendidos.csv" rows={[['Desde', 'Hasta', 'Citas completadas'], [reportCalendarDate(report.startDate), reportCalendarDate(report.endDate), report.totalAttended]]} />
          </form>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Rango permitido: hasta 12 meses (365 días) entre fechas.
          </p>
        </CardContent>
      </Card>

      {error && (
        <Alert tone="danger" title="No se pudo generar el reporte">
          {error}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Citas completadas"
          value={report.totalAttended}
          icon={<Users className="w-6 h-6" aria-hidden="true" />}
        />
        <StatsCard
          title="Desde"
          value={formatReportDate(report.startDate)}
          icon={<CalendarDays className="w-6 h-6" aria-hidden="true" />}
        />
        <StatsCard
          title="Hasta"
          value={formatReportDate(report.endDate)}
          icon={<CalendarDays className="w-6 h-6" aria-hidden="true" />}
        />
      </div>

    </div>
  );
}
