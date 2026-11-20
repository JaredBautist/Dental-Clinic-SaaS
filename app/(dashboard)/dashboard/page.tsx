import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
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
  UserCog,
  ScrollText,
  Settings,
  FileText,
  Info,
  Building2,
} from 'lucide-react';
import { getDashboardStatsAction } from '@/lib/actions/dashboard.actions';
import { getAdminClinicDetailAction } from '@/lib/actions/admin-clinics.actions';
import { listClinicsForView } from '@/lib/platform/clinic-view-data';
import { selectClinicForView } from '@/lib/platform/clinic-selection';
import { getShellProfile } from '@/lib/auth/shell-profile';
import type { AppointmentStatus, Clinic, UserProfile, UserRole } from '@/types/domain';

const statusColors: Record<
  string,
  'default' | 'success' | 'warning' | 'danger' | 'secondary'
> = {
  programada: 'secondary',
  confirmada: 'success',
  en_curso: 'warning',
  completada: 'default',
  cancelada: 'danger',
  reprogramada: 'warning',
};

const statusLabels: Record<AppointmentStatus, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_curso: 'En Curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  reprogramada: 'Reprogramada',
};

const roleLabels: Record<UserRole, string> = {
  administrador: 'Administrador',
  odontologo: 'Odontólogo',
  recepcionista: 'Recepcionista',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Bogota',
  });
}

interface QuickLink {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: string;
}

function quickLinksForRole(role: UserRole): QuickLink[] {
  switch (role) {
    case 'administrador':
      return [
        {
          href: '/consultorios',
          icon: <Building2 className="w-5 h-5" aria-hidden="true" />,
          title: 'Administrar consultorios',
          description: 'Ver detalle y gestionar cada consultorio',
          tone: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
        },
        {
          href: '/usuarios',
          icon: <UserCog className="w-5 h-5" aria-hidden="true" />,
          title: 'Gestionar usuarios',
          description: 'Odontólogos y recepcionistas',
          tone: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
        },
        {
          href: '/auditoria',
          icon: <ScrollText className="w-5 h-5" aria-hidden="true" />,
          title: 'Registro de auditoría',
          description: 'Trazabilidad de administración',
          tone: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
        },
        {
          href: '/clinica/configuracion',
          icon: <Settings className="w-5 h-5" aria-hidden="true" />,
          title: 'Configuración',
          description: 'Datos del consultorio actual',
          tone: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200',
        },
      ];
    case 'odontologo':
      return [
        {
          href: '/pacientes',
          icon: <FileText className="w-5 h-5" aria-hidden="true" />,
          title: 'Historias clínicas',
          description: 'Consultar pacientes y registrar atención',
          tone: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
        },
        {
          href: '/citas',
          icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
          title: 'Agenda de consulta',
          description: 'Ver el calendario del consultorio',
          tone: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
        },
        {
          href: '/reportes/pacientes-atendidos',
          icon: <BarChart3 className="w-5 h-5" aria-hidden="true" />,
          title: 'Pacientes atendidos',
          description: 'Consultar métricas clínicas',
          tone: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
        },
      ];
    case 'recepcionista':
      return [
        {
          href: '/pacientes',
          icon: <Users className="w-5 h-5" aria-hidden="true" />,
          title: 'Gestionar pacientes',
          description: 'Registrar y actualizar información',
          tone: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
        },
        {
          href: '/citas',
          icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
          title: 'Gestión de citas',
          description: 'Agendar, reprogramar y cancelar',
          tone: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
        },
      ];
  }
}

interface AgendaAppointment {
  id: string;
  patientName: string;
  dentistName: string;
  scheduledAt: string;
  status: AppointmentStatus;
}

function AgendaList({
  appointments,
  emptyTitle,
  emptyDescription,
}: {
  appointments: AgendaAppointment[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Calendar className="h-10 w-10 text-slate-300" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{emptyTitle}</p>
        <p className="mt-1 text-xs text-slate-400">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Stethoscope className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{apt.patientName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{apt.dentistName}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-mono text-sm tabular-nums text-slate-600 dark:text-slate-300">
              {formatTime(apt.scheduledAt)}
            </span>
            <Badge variant={statusColors[apt.status] ?? 'secondary'}>
              {statusLabels[apt.status] ?? apt.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickLinks({ role }: { role: UserRole }) {
  return (
    <div className="space-y-3">
      {quickLinksForRole(role).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3 transition-all hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${link.tone}`}
          >
            {link.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{link.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{link.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function AdminDashboard({ clinic, users, clinics }: {
  clinic: Clinic;
  users: UserProfile[];
  clinics: Clinic[];
}) {
  const canSwitchClinic = clinics.length > 1;
  const managementHref = `/consultorios?clinic=${clinic.id}`;
  const staffHref = canSwitchClinic ? managementHref : '/usuarios';
  const activeUsers = users.filter((user) => user.is_active);
  const activeByRole = (role: UserRole) =>
    activeUsers.filter((user) => user.role === role).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administración de consultorios"
        description={`Vista administrativa de ${clinic.name}`}
        action={
          <Button asChild>
            <Link href={managementHref}>
              <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Gestionar consultorio
            </Link>
          </Button>
        }
      />

      {canSwitchClinic && (
        <form action="/dashboard" method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="min-w-0 flex-1 space-y-2 sm:max-w-sm">
            <Label htmlFor="dashboard-clinic">Consultorio que estás consultando</Label>
            <Select id="dashboard-clinic" name="clinic" defaultValue={clinic.id} key={clinic.id} className="min-h-11">
              {clinics.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </Select>
          </div>
          <Button type="submit" variant="outline">Ver dashboard</Button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Personal activo"
          value={activeUsers.length}
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          description={`Usuarios de ${clinic.name}`}
        />
        <StatsCard
          title="Administradores"
          value={activeByRole('administrador')}
          icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
          description="Gestión del consultorio"
        />
        <StatsCard
          title="Odontólogos"
          value={activeByRole('odontologo')}
          icon={<Stethoscope className="h-5 w-5" aria-hidden="true" />}
          description="Profesionales activos"
        />
        <StatsCard
          title="Recepcionistas"
          value={activeByRole('recepcionista')}
          icon={<UserCog className="h-5 w-5" aria-hidden="true" />}
          description="Usuarios de recepción"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Consultorio seleccionado</CardTitle>
            <CardDescription>Información administrativa, sin datos clínicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Nombre</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{clinic.name}</p>
            </div>
            <dl className="grid grid-cols-1 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Dirección</dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-100">{clinic.address || 'Sin configurar'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Teléfono</dt>
                <dd className="mt-1 text-slate-900 dark:text-slate-100">{clinic.phone || 'Sin configurar'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Correo</dt>
                <dd className="mt-1 break-words text-slate-900 dark:text-slate-100">{clinic.email || 'Sin configurar'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones administrativas</CardTitle>
            <CardDescription>Funciones exclusivas de este rol</CardDescription>
          </CardHeader>
          <CardContent>
            {canSwitchClinic ? (
              <div className="flex flex-col items-start gap-3">
                <Button asChild variant="outline">
                  <Link href={`/consultorios/nuevo-usuario?clinic=${clinic.id}`}>Nuevo usuario</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/plataforma?clinic=${clinic.id}`}>Administrar suscripción</Link>
                </Button>
              </div>
            ) : <QuickLinks role="administrador" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Personal del consultorio</CardTitle>
            <CardDescription>Odontólogos y recepcionistas creados por el administrador</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={staffHref} className="flex items-center gap-1">
              Ver todos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Aún no hay usuarios registrados en este consultorio. Gestiona el personal desde «Ver todos».
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.slice(0, 5).map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                      aria-hidden="true"
                    >
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[user.role]}</p>
                    </div>
                  </div>
                  <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReceptionDashboard({
  stats,
}: {
  stats: import('@/lib/actions/dashboard.actions').DashboardStats;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recepción"
        description="Gestiona pacientes, citas, reprogramaciones y cancelaciones"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/pacientes">
                <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Nuevo paciente
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/citas">
                <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Nueva cita
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pacientes totales"
          value={stats.totalPatients}
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          description="Registrados en recepción"
        />
        <StatsCard
          title="Citas hoy"
          value={stats.todayAppointments}
          icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
          description="Agenda del consultorio"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendingConfirmations}
          icon={<Clock className="h-5 w-5" aria-hidden="true" />}
          description="Por atender o en curso"
        />
        <StatsCard
          title="Completadas"
          value={stats.completedToday}
          icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          description="Atendidas hoy"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Citas de hoy</CardTitle>
              <CardDescription>Agenda del día en curso</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/citas" className="flex items-center gap-1">
                Ver todas
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AgendaList
              appointments={stats.todayList}
              emptyTitle="Sin citas para hoy"
              emptyDescription="Usa «Nueva cita» para agendar a un paciente."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de recepción</CardTitle>
            <CardDescription>Pacientes y agenda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickLinks role="recepcionista" />
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              {stats.nextAppointmentInMinutes !== null ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                  <span>
                    Próxima cita en {stats.nextAppointmentInMinutes}{' '}
                    {stats.nextAppointmentInMinutes === 1 ? 'minuto' : 'minutos'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span>Sin más citas pendientes hoy</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DentistDashboard({
  stats,
}: {
  stats: import('@/lib/actions/dashboard.actions').DashboardStats;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi consulta"
        description="Consulta tu agenda e información de pacientes y registra su historia clínica"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Mis citas hoy"
          value={stats.todayAppointments}
          icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
          description="Asignadas por recepción"
        />
        <StatsCard
          title="Citas pendientes"
          value={stats.pendingVisits}
          icon={<Clock className="h-5 w-5" aria-hidden="true" />}
          description="Por atender o en curso"
        />
        <StatsCard
          title="Atenciones completadas"
          value={stats.completedToday}
          icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
          description="Finalizadas hoy"
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
        <Stethoscope className="h-5 w-5 shrink-0 text-cyan-600" aria-hidden="true" />
        <p>
          Desde el expediente de cada paciente puedes consultar sus datos, registrar evoluciones y
          actualizar el odontograma. Recepción administra la agenda y los datos de registro.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mis citas de hoy</CardTitle>
              <CardDescription>Pacientes programados por recepción</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/citas" className="flex items-center gap-1">
                Ver todas
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AgendaList
              appointments={stats.todayList}
              emptyTitle="Sin pacientes asignados para hoy"
              emptyDescription="La recepcionista asignará tus próximas citas."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consulta clínica</CardTitle>
            <CardDescription>Pacientes e historia clínica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickLinks role="odontologo" />
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              {stats.nextAppointmentInMinutes !== null ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                  <span>
                    Tu próxima cita en {stats.nextAppointmentInMinutes}{' '}
                    {stats.nextAppointmentInMinutes === 1 ? 'minuto' : 'minutos'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span>Sin más citas pendientes hoy</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: { searchParams: Promise<{ clinic?: string | string[] }> }) {
  const profile = await getShellProfile();

  if (!profile) {
    throw new Error('No se pudo obtener el perfil del usuario');
  }

  if (profile.role === 'administrador') {
    const [{ clinic: requestedClinicId }, clinicsResult] = await Promise.all([
      searchParams,
      listClinicsForView(),
    ]);
    if (!clinicsResult.success) throw new Error(clinicsResult.error.message);

    const clinics = clinicsResult.data;
    const selectedClinic = selectClinicForView(clinics, profile.clinicId, requestedClinicId);
    if (!selectedClinic) throw new Error('No hay consultorios disponibles para tu cuenta.');

    const detail = await getAdminClinicDetailAction(selectedClinic.id);
    if (!detail.success) throw new Error(detail.error.message);

    return <AdminDashboard clinic={detail.data.clinic} users={detail.data.users} clinics={clinics} />;
  }

  const statsResult = await getDashboardStatsAction({
    includePatientCount: profile.role === 'recepcionista',
  });

  if (!statsResult.success) {
    throw new Error(statsResult.error.message);
  }

  if (profile.role === 'odontologo') {
    return <DentistDashboard stats={statsResult.data} />;
  }

  return <ReceptionDashboard stats={statsResult.data} />;
}
