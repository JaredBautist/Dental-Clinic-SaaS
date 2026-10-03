'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Filter,
} from 'lucide-react';

// Datos mock
const mockReportData = [
  { dentist: 'Dr. Juan Pérez', completed: 45, cancelled: 3, total: 48 },
  { dentist: 'Dra. María López', completed: 38, cancelled: 5, total: 43 },
  { dentist: 'Dr. Carlos Ruiz', completed: 22, cancelled: 2, total: 24 },
];

const mockMonthlyData = [
  { month: 'Enero', completed: 32 },
  { month: 'Febrero', completed: 28 },
  { month: 'Marzo', completed: 45 },
];

export default function AttendedPatientsReportPage() {
  const [dateRange, setDateRange] = React.useState('month');
  const [selectedDentist, setSelectedDentist] = React.useState('all');

  const totalCompleted = mockReportData.reduce((acc, curr) => acc + curr.completed, 0);
  const totalCancelled = mockReportData.reduce((acc, curr) => acc + curr.cancelled, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Pacientes Atendidos"
        description="Métricas de citas completadas por odontólogo en el rango seleccionado"
        action={
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-48"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select
                value={selectedDentist}
                onChange={(e) => setSelectedDentist(e.target.value)}
                className="w-48"
              >
                <option value="all">Todos los odontólogos</option>
                <option value="dentist-1">Dr. Juan Pérez</option>
                <option value="dentist-2">Dra. María López</option>
                <option value="dentist-3">Dr. Carlos Ruiz</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalCompleted}</p>
                <p className="text-xs text-slate-500">Pacientes Atendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalCancelled}</p>
                <p className="text-xs text-slate-500">Citas Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalCompleted > 0 ? Math.round((totalCompleted / (totalCompleted + totalCancelled)) * 100) : 0}%
                </p>
                <p className="text-xs text-slate-500">Tasa de Asistencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Dentist */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes por Odontólogo</CardTitle>
            <CardDescription>Comparativa de citas completadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReportData.map((item) => (
                <div key={item.dentist} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{item.dentist}</span>
                    <span className="text-slate-500">{item.completed} completadas</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(item.completed / totalCompleted) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Canceladas: {item.cancelled}</span>
                    <span>Total: {item.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
            <CardDescription>Pacientes atendidos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMonthlyData.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-slate-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-lg flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${(item.completed / 50) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">{item.completed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Odontólogo</CardTitle>
          <CardDescription>Desglose completo de actividad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Odontólogo</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-500">Completadas</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-500">Canceladas</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-500">Total</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-500">Tasa Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {mockReportData.map((item) => (
                  <tr key={item.dentist} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.dentist}</td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="success">{item.completed}</Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="danger">{item.cancelled}</Badge>
                    </td>
                    <td className="text-center py-3 px-4 font-medium">{item.total}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-semibold ${
                        (item.completed / item.total) >= 0.9 ? 'text-emerald-600' :
                        (item.completed / item.total) >= 0.8 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {Math.round((item.completed / item.total) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
