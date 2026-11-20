'use client';

import * as React from 'react';
import { reportCalendarDate, reportDateIso, formatReportDate } from '@/lib/report-dates';
import { ReportDownload } from '@/components/ui/report-download';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { StatsCard } from '@/components/ui/stats-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, CalendarDays, Filter } from 'lucide-react';
import {
  getAppointmentStatusReportAction,
  type AppointmentStatusReportResult,
} from '@/lib/actions/reports.actions';
import type { AppointmentStatus } from '@/types/domain';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  reprogramada: 'Reprogramada',
};

const STATUS_ORDER: AppointmentStatus[] = [
  'programada',
  'confirmada',
  'en_curso',
  'completada',
  'cancelada',
  'reprogramada',
];

interface StatusReportClientProps {
  initialReport: AppointmentStatusReportResult;
  dentistName?: string;
}

export function StatusReportClient({ initialReport, dentistName }: StatusReportClientProps) {
  const [report, setReport] = React.useState<AppointmentStatusReportResult>(initialReport);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState(reportCalendarDate(initialReport.startDate));
  const [endDate, setEndDate] = React.useState(reportCalendarDate(initialReport.endDate));

  async function runReport(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await getAppointmentStatusReportAction({
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

  const total = report.totalAppointments || 0;
  const maxCount = Math.max(
    1,
    ...STATUS_ORDER.map((status) => report.statusDistribution[status] ?? 0)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {dentistName && <p className="mb-4 text-sm font-medium">Odontólogo: {dentistName}</p>}
          <form onSubmit={runReport} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="status-start">Fecha inicial</Label>
              <Input
                id="status-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-end">Fecha final</Label>
              <Input
                id="status-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" isLoading={isLoading}>
              <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
              Generar reporte
            </Button>
            <ReportDownload filename="estado-citas.csv" rows={[['Desde', 'Hasta', 'Estado', 'Cantidad'], ...STATUS_ORDER.map((status) => [reportCalendarDate(report.startDate), reportCalendarDate(report.endDate), STATUS_LABELS[status], report.statusDistribution[status]])]} />
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
          title="Total de citas"
          value={total}
          icon={<BarChart3 className="w-6 h-6" aria-hidden="true" />}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" aria-hidden="true" />
            Distribución por estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <EmptyState
              title="Sin datos en el rango"
              description="No hay citas registradas para el rango de fechas seleccionado."
            />
          ) : (
            <div className="space-y-4">
              {STATUS_ORDER.map((status) => {
                const count = report.statusDistribution[status] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{STATUS_LABELS[status]}</p>
                      <p className="tabular-nums text-slate-600 dark:text-slate-300">
                        {count} ({pct}%)
                      </p>
                    </div>
                    <div
                      className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800"
                      role="img"
                      aria-label={`${STATUS_LABELS[status]}: ${count} citas, ${pct} del total`}
                    >
                      <div
                        className="h-2.5 rounded-full bg-slate-900"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {total > 0 && (
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-950">
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Citas</TableHead>
                    <TableHead className="text-right">Porcentaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STATUS_ORDER.map((status) => {
                    const count = report.statusDistribution[status] ?? 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <TableRow key={status}>
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          {STATUS_LABELS[status]}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{count}</TableCell>
                        <TableCell className="text-right tabular-nums">{pct}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
