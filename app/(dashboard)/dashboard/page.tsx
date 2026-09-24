import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  UserPlus,
  CalendarPlus,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

// Datos mock - En producción vendrían de Server Actions
const mockStats = {
  totalPatients: 124,
  todayAppointments: 8,
  pendingConfirmations: 3,
  completedToday: 5,
};

const mockTodayAppointments = [
  { id: '1', patient: 'María González', time: '09:00', dentist: 'Dr. Pérez', status: 'confirmada' },
  { id: '2', patient: 'Carlos Rodríguez', time: '10:30', dentist: 'Dr. Pérez', status: 'en_curso' },
  { id: '3', patient: 'Ana Martínez', time: '11:00', dentist: 'Dra. López', status: 'programada' },
  { id: '4', patient: 'Luis Fernández', time: '14:00', dentist: 'Dr. Pérez', status: 'programada' },
  { id: '5', patient: 'Carmen Díaz', time: '15:30', dentist: 'Dra. López', status: 'confirmada' },
];

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'secondary'> = {
  programada: 'secondary',
  confirmada: 'success',
  en_curso: 'warning',
  completada: 'default',
  cancelada: 'danger',
};

const statusLabels: Record<string, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_curso: 'En Curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen operativo del consultorio"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/pacientes/nuevo">
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Paciente
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/citas/nueva">
                <CalendarPlus className="w-4 h-4 mr-2" />
                Nueva Cita
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pacientes Totales"
          value={mockStats.totalPatients}
          icon={<Users className="w-5 h-5" />}
          description="Registrados en el sistema"
        />
        <StatsCard
          title="Citas Hoy"
          value={mockStats.todayAppointments}
          icon={<Calendar className="w-5 h-5" />}
          description="Agendadas para hoy"
        />
        <StatsCard
          title="Pendientes"
          value={mockStats.pendingConfirmations}
          icon={<Clock className="w-5 h-5" />}
          description="Por confirmar"
        />
        <StatsCard
          title="Completadas"
          value={mockStats.completedToday}
          icon={<CheckCircle2 className="w-5 h-5" />}
          description="Atendidas hoy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Citas de Hoy</CardTitle>
              <CardDescription>Agenda del día en curso</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/citas" className="flex items-center gap-1">
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTodayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{apt.patient}</p>
                      <p className="text-xs text-slate-500">{apt.dentist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-slate-600">{apt.time}</span>
                    <Badge variant={statusColors[apt.status]}>
                      {statusLabels[apt.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Operaciones frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/pacientes"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Gestionar Pacientes</p>
                <p className="text-xs text-slate-500">Ver listado completo</p>
              </div>
            </Link>

            <Link
              href="/citas"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Agenda de Citas</p>
                <p className="text-xs text-slate-500">Ver calendario</p>
              </div>
            </Link>

            <Link
              href="/reportes/pacientes-atendidos"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Reportes</p>
                <p className="text-xs text-slate-500">Métricas operativas</p>
              </div>
            </Link>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <AlertCircle className="w-4 h-4" />
                <span>Próxima cita en 25 minutos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
