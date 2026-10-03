'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react';

// Datos mock
const mockStatusData = [
  { status: 'completada', count: 105, color: 'bg-blue-500', label: 'Completadas' },
  { status: 'confirmada', count: 28, color: 'bg-emerald-500', label: 'Confirmadas' },
  { status: 'programada', count: 15, color: 'bg-slate-400', label: 'Programadas' },
  { status: 'en_curso', count: 3, color: 'bg-amber-500', label: 'En Curso' },
  { status: 'cancelada', count: 10, color: 'bg-rose-500', label: 'Canceladas' },
  { status: 'reprogramada', count: 5, color: 'bg-violet-500', label: 'Reprogramadas' },
];

const totalAppointments = mockStatusData.reduce((acc, curr) => acc + curr.count, 0);

const statusIcons: Record<string, React.ReactNode> = {
  completada: <CheckCircle2 className="w-4 h-4" />,
  confirmada: <CheckCircle2 className="w-4 h-4" />,
  programada: <Clock className="w-4 h-4" />,
  en_curso: <RefreshCcw className="w-4 h-4" />,
  cancelada: <XCircle className="w-4 h-4" />,
  reprogramada: <AlertCircle className="w-4 h-4" />,
};

export default function AppointmentStatusReportPage() {
  const [dateRange, setDateRange] = React.useState('month');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Distribución de Citas"
        description="Métricas de estados de citas en el rango de fechas seleccionado"
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
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockStatusData.map((item) => (
          <Card key={item.status}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-lg ${item.color} bg-opacity-10 flex items-center justify-center mb-2`}>
                  <span className={item.color.replace('bg-', 'text-')}>
                    {statusIcons[item.status]}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.round((item.count / totalAppointments) * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Distribución Visual
            </CardTitle>
            <CardDescription>Proporción de estados de citas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {mockStatusData.map((item, index) => {
                    const percentage = (item.count / totalAppointments) * 100;
                    const previousPercentages = mockStatusData
                      .slice(0, index)
                      .reduce((acc, curr) => acc + (curr.count / totalAppointments) * 100, 0);
                    
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const strokeDashoffset = -previousPercentages;
                    
                    const colorMap: Record<string, string> = {
                      'bg-blue-500': '#3b82f6',
                      'bg-emerald-500': '#10b981',
                      'bg-slate-400': '#94a3b8',
                      'bg-amber-500': '#f59e0b',
                      'bg-rose-500': '#f43f5e',
                      'bg-violet-500': '#8b5cf6',
                    };

                    return (
                      <circle
                        key={item.status}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={colorMap[item.color]}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{totalAppointments}</p>
                    <p className="text-xs text-slate-500">Total Citas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mockStatusData.map((item) => (
                <div key={item.status} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-slate-600">{item.label}</span>
                  <span className="text-slate-400 ml-auto">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Estados</CardTitle>
            <CardDescription>Indicadores clave de rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Tasa de Completitud
                </div>
                <p className="text-2xl font-bold text-emerald-900 mt-2">
                  {Math.round((mockStatusData.find(s => s.status === 'completada')?.count || 0) / totalAppointments * 100)}%
                </p>
                <p className="text-sm text-emerald-700 mt-1">
                  {mockStatusData.find(s => s.status === 'completada')?.count} de {totalAppointments} citas completadas exitosamente
                </p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 text-amber-800 font-medium">
                  <Clock className="w-5 h-5" />
                  Pendientes de Atención
                </div>
                <p className="text-2xl font-bold text-amber-900 mt-2">
                  {(mockStatusData.find(s => s.status === 'programada')?.count || 0) + 
                   (mockStatusData.find(s => s.status === 'confirmada')?.count || 0)}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Citas programadas y confirmadas esperando atención
                </p>
              </div>

              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2 text-rose-800 font-medium">
                  <XCircle className="w-5 h-5" />
                  Tasa de Cancelación
                </div>
                <p className="text-2xl font-bold text-rose-900 mt-2">
                  {Math.round((mockStatusData.find(s => s.status === 'cancelada')?.count || 0) / totalAppointments * 100)}%
                </p>
                <p className="text-sm text-rose-700 mt-1">
                  {mockStatusData.find(s => s.status === 'cancelada')?.count} citas canceladas en el período
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Estado</CardTitle>
          <CardDescription>Desglose completo de la distribución</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Estado</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-500">Cantidad</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-500">Porcentaje</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Distribución</th>
                </tr>
              </thead>
              <tbody>
                {mockStatusData.map((item) => (
                  <tr key={item.status} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium text-slate-900">{item.label}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="secondary">{item.count}</Badge>
                    </td>
                    <td className="text-center py-3 px-4 font-medium">
                      {Math.round((item.count / totalAppointments) * 100)}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${(item.count / totalAppointments) * 100}%` }}
                        />
                      </div>
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
