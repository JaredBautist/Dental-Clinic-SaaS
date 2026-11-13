'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { StatsCard } from '@/components/ui/stats-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CalendarDays, TrendingUp, Filter } from 'lucide-react';
import {
  getAttendedPatientsReportAction,
  type AttendedPatientsReportResult,
} from '@/lib/actions/reports.actions';

function toIso(dateValue: string, endOfDay = false): string {
  const date = new Date(`${dateValue}T${endOfDay ? '23:59:59' : '00:00:00'}`);
  return date.toISOString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', { dateStyle: 'medium' });
}

interface AttendedReportClientProps {
  initialReport: AttendedPatientsReportResult;
  dentists: Array<{ id: string; name: string }>;
}

export function AttendedReportClient({ initialReport, dentists }: AttendedReportClientProps) {
  const [report, setReport] = React.useState<AttendedPatientsReportResult>(initialReport);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState(initialReport.startDate.slice(0, 10));
  const [endDate, setEndDate] = React.useState(initialReport.endDate.slice(0, 10));
  const [dentistId, setDentistId] = React.useState('');

  async function runReport(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await getAttendedPatientsReportAction({
      startDate: toIso(startDate),
      endDate: toIso(endDate, true),
      dentistId: dentistId || undefined,
    });
    setIsLoading(false);

    if (result.success) {
      setReport(result.data);
    } else {
      setError(result.error.message);
    }
  }

  const breakdown = report.breakdownByDentist ?? [];
  const maxCount = Math.max(1, ...breakdown.map((row) => row.count));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={runReport} className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
            <div className="space-y-2">
              <Label htmlFor="report-dentist">Odontólogo</Label>
              <Select
                id="report-dentist"
                value={dentistId}
                onChange={(e) => setDentistId(e.target.value)}
                className="min-w-[200px]"
              >
                <option value="">Todos los odontólogos</option>
                {dentists.map((dentist) => (
                  <option key={dentist.id} value={dentist.id}>
                    {dentist.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" isLoading={isLoading} className="sm:mb-0">
              <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
              Generar reporte
            </Button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
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
          title="Pacientes atendidos"
          value={report.totalAttended}
          icon={<Users className="w-6 h-6" aria-hidden="true" />}
        />
        <StatsCard
          title="Desde"
          value={formatDate(report.startDate)}
          icon={<CalendarDays className="w-6 h-6" aria-hidden="true" />}
        />
        <StatsCard
          title="Hasta"
          value={formatDate(report.endDate)}
          icon={<CalendarDays className="w-6 h-6" aria-hidden="true" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
            Desglose por odontólogo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {breakdown.length === 0 ? (
            <EmptyState
              title="Sin datos en el rango"
              description="No hay citas completadas para el rango y filtros seleccionados."
            />
          ) : (
            <div className="space-y-4">
              {breakdown.map((row) => (
                <div key={row.dentistId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <p className="font-medium text-slate-900">{row.dentistName}</p>
                    <p className="tabular-nums text-slate-600">{row.count} pacientes</p>
                  </div>
                  <div
                    className="h-2.5 rounded-full bg-slate-100"
                    role="img"
                    aria-label={`${row.dentistName}: ${row.count} pacientes atendidos`}
                  >
                    <div
                      className="h-2.5 rounded-full bg-cyan-600"
                      style={{ width: `${(row.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {breakdown.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Odontólogo</TableHead>
                    <TableHead className="text-right">Pacientes atendidos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdown.map((row) => (
                    <TableRow key={row.dentistId}>
                      <TableCell className="font-medium text-slate-900">{row.dentistName}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
