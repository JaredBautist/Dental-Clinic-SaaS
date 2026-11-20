'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Stethoscope,
  CalendarPlus,
  CalendarOff,
  CalendarClock,
  Users,
} from 'lucide-react';
import {
  createAppointmentAction,
  cancelAppointmentAction,
  rescheduleAppointmentAction,
  listAppointmentsAction,
} from '@/lib/actions/appointments.actions';
import type { Appointment, AppointmentStatus, UserRole } from '@/types/domain';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  reprogramada: 'Reprogramada',
};

const STATUS_BADGE: Record<AppointmentStatus, 'secondary' | 'success' | 'warning' | 'danger' | 'outline'> = {
  programada: 'secondary',
  confirmada: 'success',
  en_curso: 'warning',
  completada: 'outline',
  cancelada: 'danger',
  reprogramada: 'outline',
};

interface SuggestedSlot {
  start: string;
  end: string;
}

function isSlotSuggestion(details: unknown): details is SuggestedSlot[] {
  return (
    Array.isArray(details) &&
    details.length > 0 &&
    typeof details[0] === 'object' &&
    details[0] !== null &&
    'start' in details[0] &&
    'end' in details[0]
  );
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function rangeForDay(date: Date): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface AppointmentsClientProps {
  role: UserRole;
  initialPatientId?: string;
  initialAppointments: Appointment[];
  patients: Array<Pick<import('@/types/domain').Patient, 'id' | 'full_name' | 'document_number'>>;
  dentists: Array<{ id: string; name: string }>;
}

export function AppointmentsClient({ role, initialAppointments, patients, dentists, initialPatientId }: AppointmentsClientProps) {
  const isRecepcionista = role === 'recepcionista';
  const [currentDate, setCurrentDate] = React.useState(() => new Date());
  const [appointments, setAppointments] = React.useState<Appointment[]>(initialAppointments);
  const [isRefetching, setIsRefetching] = React.useState(false);
  const [pageError, setPageError] = React.useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = React.useState(!!initialPatientId);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [suggestedSlots, setSuggestedSlots] = React.useState<SuggestedSlot[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);

  const [cancelTarget, setCancelTarget] = React.useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = React.useState('');
  const [cancelError, setCancelError] = React.useState<string | null>(null);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const [rescheduleTarget, setRescheduleTarget] = React.useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState('');
  const [rescheduleTime, setRescheduleTime] = React.useState('');
  const [rescheduleDuration, setRescheduleDuration] = React.useState('30');
  const [rescheduleError, setRescheduleError] = React.useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = React.useState(false);

  const [createPatientId, setCreatePatientId] = React.useState(initialPatientId ?? '');
  const [createDentistId, setCreateDentistId] = React.useState('');
  const [createDate, setCreateDate] = React.useState(toLocalInputValue(new Date()).slice(0, 10));
  const [createTime, setCreateTime] = React.useState('');
  const [createDuration, setCreateDuration] = React.useState('30');
  const [createReason, setCreateReason] = React.useState('');

  const patientNames = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const patient of patients) map[patient.id] = patient.full_name;
    return map;
  }, [patients]);

  const dentistNames = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const dentist of dentists) map[dentist.id] = dentist.name;
    return map;
  }, [dentists]);

  async function loadDay(date: Date) {
    setIsRefetching(true);
    setPageError(null);
    const range = rangeForDay(date);
    const result = await listAppointmentsAction({ startDate: range.start, endDate: range.end });
    setIsRefetching(false);
    if (result.success) {
      setAppointments(result.data);
    } else {
      setPageError(result.error.message);
    }
  }

  function navigate(direction: 'prev' | 'next') {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(next);
    void loadDay(next);
  }

  function goToday() {
    const today = new Date();
    setCurrentDate(today);
    void loadDay(today);
  }

  function openCreate() {
    setCreatePatientId('');
    setCreateDentistId('');
    setCreateDate(toLocalInputValue(new Date()).slice(0, 10));
    setCreateTime('');
    setCreateDuration('30');
    setCreateReason('');
    setCreateError(null);
    setSuggestedSlots([]);
    setIsCreateOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    setSuggestedSlots([]);

    const scheduledAt = new Date(`${createDate}T${createTime}`);
    const result = await createAppointmentAction({
      patientId: createPatientId,
      dentistId: createDentistId,
      scheduledAt: scheduledAt.toISOString(),
      durationMin: Number(createDuration),
      reason: createReason.trim(),
    });
    setIsCreating(false);

    if (result.success) {
      const created = result.data;
      if (dayKey(new Date(created.scheduled_at)) === dayKey(currentDate)) {
        setAppointments((prev) => [...prev, created].sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        ));
      }
      setIsCreateOpen(false);
    } else {
      setCreateError(result.error.message);
      if (isSlotSuggestion(result.error.details)) {
        setSuggestedSlots(result.error.details);
      }
    }
  }

  async function applySuggestedSlot(slot: SuggestedSlot) {
    const slotDate = new Date(slot.start);
    setCreateDate(toLocalInputValue(slotDate).slice(0, 10));
    setCreateTime(toLocalInputValue(slotDate).slice(11, 16));
    setSuggestedSlots([]);
    setCreateError(null);
  }

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault();
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError(null);

    const result = await cancelAppointmentAction({
      appointmentId: cancelTarget.id,
      cancelReason: cancelReason.trim(),
    });
    setIsCancelling(false);

    if (result.success) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === cancelTarget.id
            ? { ...apt, status: 'cancelada' as AppointmentStatus, cancel_reason: cancelReason.trim() }
            : apt
        )
      );
      setCancelTarget(null);
      setCancelReason('');
    } else {
      setCancelError(result.error.message);
    }
  }

  async function handleReschedule(e: React.FormEvent) {
    e.preventDefault();
    if (!rescheduleTarget) return;
    setIsRescheduling(true);
    setRescheduleError(null);

    const newScheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`);
    const result = await rescheduleAppointmentAction({
      appointmentId: rescheduleTarget.id,
      newScheduledAt: newScheduledAt.toISOString(),
      newDurationMin: Number(rescheduleDuration),
    });
    setIsRescheduling(false);

    if (result.success) {
      const updated = result.data;
      setAppointments((prev) => {
        const withoutMoved = prev.filter((apt) => apt.id !== updated.id);
        if (dayKey(new Date(updated.scheduled_at)) !== dayKey(currentDate)) {
          return withoutMoved.map((apt) =>
            apt.id === updated.id
              ? { ...apt, status: 'reprogramada' as AppointmentStatus }
              : apt
          );
        }
        return [...withoutMoved, updated].sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );
      });
      setRescheduleTarget(null);
    } else {
      setRescheduleError(result.error.message);
    }
  }

  function openCancel(apt: Appointment) {
    setCancelReason('');
    setCancelError(null);
    setCancelTarget(apt);
  }

  function openReschedule(apt: Appointment) {
    const start = new Date(apt.scheduled_at);
    setRescheduleDate(toLocalInputValue(start).slice(0, 10));
    setRescheduleTime(toLocalInputValue(start).slice(11, 16));
    setRescheduleDuration(String(apt.duration_min));
    setRescheduleError(null);
    setRescheduleTarget(apt);
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 7);
  const dayAppointments = appointments.filter(
    (apt) => dayKey(new Date(apt.scheduled_at)) === dayKey(currentDate)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')} aria-label="Día anterior">
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <p className="min-w-[220px] text-center text-sm font-medium capitalize text-slate-900">
            {formatDayLabel(currentDate)}
          </p>
          <Button variant="outline" size="icon" onClick={() => navigate('next')} aria-label="Día siguiente">
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            Hoy
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {isRefetching && (
            <span className="text-xs text-slate-400" aria-live="polite">
              Actualizando…
            </span>
          )}
          {isRecepcionista ? (
            <Button onClick={openCreate}>
              <CalendarPlus className="w-4 h-4 mr-2" aria-hidden="true" />
              Nueva cita
            </Button>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              La recepcionista se encarga de agendar las citas
            </p>
          )}
        </div>
      </div>

      {pageError && (
        <Alert tone="danger" title="No se pudo cargar la agenda">
          {pageError}
        </Alert>
      )}

      {/* Vista de agenda del día */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Agenda del día</h2>
        <div className="space-y-1">
          {hours.map((hour) => {
            const hourAppointments = dayAppointments.filter(
              (apt) => new Date(apt.scheduled_at).getHours() === hour
            );
            return (
              <div key={hour} className="group flex gap-4">
                <p className="w-16 py-3 text-right font-mono text-sm tabular-nums text-slate-500">
                  {String(hour).padStart(2, '0')}:00
                </p>
                <div
                  className={cn(
                    'min-h-[60px] flex-1 border-l-2 py-1 pl-4 transition-colors',
                    hourAppointments.length > 0 ? 'border-slate-300' : 'border-slate-100'
                  )}
                >
                  {hourAppointments.length === 0 ? (
                    <div className="flex h-full items-center text-xs text-slate-300">Disponible</div>
                  ) : (
                    hourAppointments.map((apt) => (
                      <article
                        key={apt.id}
                        className="mb-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">
                            {patientNames[apt.patient_id] ?? `Paciente ${apt.patient_id.slice(0, 8)}`}
                          </p>
                          <Badge variant={STATUS_BADGE[apt.status]}>
                            {STATUS_LABELS[apt.status]}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {formatTime(apt.scheduled_at)} – {formatTime(apt.ends_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" aria-hidden="true" />
                            {dentistNames[apt.dentist_id] ?? 'Odontólogo'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{apt.reason}</p>
                        {apt.status !== 'cancelada' && apt.status !== 'completada' && isRecepcionista && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReschedule(apt)}
                            >
                              <CalendarClock className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                              Reprogramar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50"
                              onClick={() => openCancel(apt)}
                            >
                              <CalendarOff className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {dayAppointments.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title="No hay citas para este día"
              description="Todas las franjas horarias están libres. Agenda una cita para empezar."
            />
          </div>
        )}
      </div>

      {/* Modal: nueva cita */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Agendar nueva cita"
        description="El sistema detecta solapamientos y sugiere las próximas franjas disponibles"
        size="lg"
      >
        <form onSubmit={handleCreate} className="min-w-0 space-y-4">
          {createError && (
            <Alert tone="danger" title="No se pudo agendar">
              <p>{createError}</p>
            </Alert>
          )}

          {suggestedSlots.length > 0 && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
              <p className="text-sm font-medium text-cyan-900">
                Franjas disponibles más próximas para este odontólogo:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedSlots.map((slot) => (
                  <Button
                    key={slot.start}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void applySuggestedSlot(slot)}
                  >
                    {formatTime(slot.start)} – {formatTime(slot.end)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="apt-patient">Paciente</Label>
              <Select
                id="apt-patient"
                value={createPatientId}
                onChange={(e) => setCreatePatientId(e.target.value)}
                required
              >
                <option value="">Seleccionar paciente…</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} — {patient.document_number}
                  </option>
                ))}
              </Select>
              {patients.length === 0 && (
                <p className="text-xs text-amber-700">
                  No hay pacientes registrados. Crea uno primero desde la sección Pacientes.
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="apt-dentist">Odontólogo</Label>
              <Select
                id="apt-dentist"
                value={createDentistId}
                onChange={(e) => setCreateDentistId(e.target.value)}
                required
              >
                <option value="">Seleccionar odontólogo…</option>
                {dentists.map((dentist) => (
                  <option key={dentist.id} value={dentist.id}>
                    {dentist.name}
                  </option>
                ))}
              </Select>
              {dentists.length === 0 && (
                <p className="text-xs text-amber-700">
                  No hay odontólogos activos. Contacta al administrador.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apt-date">Fecha</Label>
              <Input
                id="apt-date"
                type="date"
                value={createDate}
                min={dayKey(new Date())}
                onChange={(e) => setCreateDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apt-time">Hora</Label>
              <Input
                id="apt-time"
                type="time"
                value={createTime}
                onChange={(e) => setCreateTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apt-duration">Duración</Label>
              <Select
                id="apt-duration"
                value={createDuration}
                onChange={(e) => setCreateDuration(e.target.value)}
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
                <option value="120">120 minutos</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="apt-reason">Motivo de la cita</Label>
              <Textarea
                id="apt-reason"
                value={createReason}
                onChange={(e) => setCreateReason(e.target.value)}
                placeholder="Describa el motivo de la consulta…"
                required
                maxLength={500}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Agendar cita
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: cancelar cita */}
      <Modal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancelar cita"
        description="El motivo queda registrado en el historial de la cita"
      >
        <form onSubmit={handleCancel} className="space-y-4">
          {cancelError && (
            <Alert tone="danger" title="No se pudo cancelar">
              {cancelError}
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo de cancelación</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              required
              maxLength={255}
              rows={3}
              placeholder="Ej.: El paciente no podrá asistir por motivos personales"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setCancelTarget(null)}>
              Volver
            </Button>
            <Button type="submit" variant="danger" isLoading={isCancelling}>
              Confirmar cancelación
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: reprogramar cita */}
      <Modal
        isOpen={rescheduleTarget !== null}
        onClose={() => setRescheduleTarget(null)}
        title="Reprogramar cita"
        description="Elige la nueva fecha y hora; se validará el solapamiento"
      >
        <form onSubmit={handleReschedule} className="space-y-4">
          {rescheduleError && (
            <Alert tone="danger" title="No se pudo reprogramar">
              {rescheduleError}
            </Alert>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reschedule-date">Nueva fecha</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                min={dayKey(new Date())}
                onChange={(e) => setRescheduleDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">Hora</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-duration">Duración</Label>
              <Select
                id="reschedule-duration"
                value={rescheduleDuration}
                onChange={(e) => setRescheduleDuration(e.target.value)}
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
                <option value="120">120 minutos</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setRescheduleTarget(null)}>
              Volver
            </Button>
            <Button type="submit" isLoading={isRescheduling}>
              Confirmar nueva fecha
            </Button>
          </div>
        </form>
      </Modal>

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Users className="w-3.5 h-3.5" aria-hidden="true" />
        Las citas quedan registradas en el sistema de trazabilidad del consultorio.
      </p>
    </div>
  );
}
