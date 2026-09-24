'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { createAuditLog } from '@/lib/audit';
import { AppointmentConflictError, DentalClinicError } from '@/errors/domain';
import type { Appointment, AppointmentStatus } from '@/types/domain';

const appointmentSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido'),
  dentistId: z.string().uuid('ID de odontólogo inválido'),
  scheduledAt: z
    .string()
    .datetime({ message: 'La fecha y hora programada debe ser un formato ISO 8601 válido' })
    .refine((dateStr) => {
      const scheduled = new Date(dateStr);
      // Permitir citas a partir del inicio del día de hoy
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return scheduled >= startOfToday;
    }, 'La fecha de la cita no puede ser anterior al día de hoy'),
  durationMin: z
    .number()
    .int('La duración debe ser un número entero')
    .min(15, 'La duración mínima es de 15 minutos')
    .max(480, 'La duración máxima es de 480 minutos (8 horas)'),
  reason: z
    .string()
    .trim()
    .min(1, 'El motivo de la cita es obligatorio')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
});

export type CreateAppointmentInput = z.infer<typeof appointmentSchema>;

const rescheduleSchema = z.object({
  appointmentId: z.string().uuid('ID de cita inválido'),
  newScheduledAt: z.string().datetime({ message: 'La nueva fecha/hora debe ser ISO 8601' }),
  newDurationMin: z.number().int().min(15).max(480).optional(),
});

export type RescheduleAppointmentInput = z.infer<typeof rescheduleSchema>;

const cancelSchema = z.object({
  appointmentId: z.string().uuid('ID de cita inválido'),
  cancelReason: z
    .string()
    .trim()
    .min(1, 'El motivo de cancelación es obligatorio')
    .max(255, 'El motivo no puede exceder 255 caracteres'),
});

export type CancelAppointmentInput = z.infer<typeof cancelSchema>;

/**
 * Función auxiliar para calcular las próximas 3 franjas horarias disponibles
 * para un odontólogo ante un conflicto de agenda.
 */
function calculateSuggestedSlots(
  requestedStart: Date,
  durationMin: number,
  existingAppointments: Array<{ scheduled_at: string; ends_at: string }>
): Array<{ start: string; end: string }> {
  const suggestions: Array<{ start: string; end: string }> = [];
  const durationMs = durationMin * 60 * 1000;

  // Ordenar citas existentes por inicio
  const sorted = [...existingAppointments].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );

  let candidateStart = new Date(requestedStart.getTime() + 30 * 60 * 1000); // Empezar 30 mins después

  while (suggestions.length < 3) {
    const candidateEnd = new Date(candidateStart.getTime() + durationMs);

    // Verificar si candidateStart .. candidateEnd choca con alguna cita
    const hasCollision = sorted.some((app) => {
      const appStart = new Date(app.scheduled_at).getTime();
      const appEnd = new Date(app.ends_at).getTime();
      return candidateStart.getTime() < appEnd && candidateEnd.getTime() > appStart;
    });

    if (!hasCollision) {
      suggestions.push({
        start: candidateStart.toISOString(),
        end: candidateEnd.toISOString(),
      });
    }

    // Avanzar 30 minutos
    candidateStart = new Date(candidateStart.getTime() + 30 * 60 * 1000);
  }

  return suggestions;
}

/**
 * Server Action: Creación de cita con detección proactiva de solapamiento.
 * Requisitos: 5.1, 5.2, 5.3, 5.10
 */
export async function createAppointmentAction(
  rawInput: CreateAppointmentInput
): Promise<ServerActionResult<Appointment>> {
  return withErrorHandling(async () => {
    const input = appointmentSchema.parse(rawInput);
    const authUser = await requireRole(
      ['administrador', 'odontologo', 'recepcionista'],
      'cita',
      '',
      'create'
    );
    const supabase = await createServerSupabaseClient();

    const scheduledDate = new Date(input.scheduledAt);
    const endsDate = new Date(scheduledDate.getTime() + input.durationMin * 60 * 1000);
    const scheduledAtIso = scheduledDate.toISOString();
    const endsAtIso = endsDate.toISOString();

    // 1. Consultar citas activas que se solapan con la franja solicitada para ese odontólogo
    const { data: overlappingAppointments, error: overlapQueryError } = await supabase
      .from('appointments')
      .select('id, scheduled_at, ends_at')
      .eq('clinic_id', authUser.clinicId)
      .eq('dentist_id', input.dentistId)
      .in('status', ['programada', 'confirmada', 'en_curso'])
      .lt('scheduled_at', endsAtIso)
      .gt('ends_at', scheduledAtIso);

    if (overlapQueryError) {
      throw new DentalClinicError('Error al verificar disponibilidad de agenda.', 'AGENDA_CHECK_FAILED', 500);
    }

    if (overlappingAppointments && overlappingAppointments.length > 0) {
      // Obtener citas del día para calcular sugerencias de 3 franjas libres
      const dayStart = new Date(scheduledDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(scheduledDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: dayAppointments } = await supabase
        .from('appointments')
        .select('scheduled_at, ends_at')
        .eq('clinic_id', authUser.clinicId)
        .eq('dentist_id', input.dentistId)
        .in('status', ['programada', 'confirmada', 'en_curso'])
        .gte('scheduled_at', dayStart.toISOString())
        .lte('scheduled_at', dayEnd.toISOString());

      const suggestions = calculateSuggestedSlots(
        scheduledDate,
        input.durationMin,
        dayAppointments || []
      );

      throw new AppointmentConflictError(
        'Conflicto de horario: El odontólogo ya tiene una cita asignada en ese intervalo',
        suggestions
      );
    }

    // 2. Insertar cita en base de datos
    const { data: createdAppointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        clinic_id: authUser.clinicId,
        patient_id: input.patientId,
        dentist_id: input.dentistId,
        scheduled_at: scheduledAtIso,
        duration_min: input.durationMin,
        status: 'programada',
        reason: input.reason,
        created_by: authUser.userId,
      })
      .select('*')
      .single();

    if (insertError || !createdAppointment) {
      // Manejar violación de la constraint de PostgreSQL de exclusión btree_gist
      if (insertError?.code === '23P01') {
        throw new AppointmentConflictError(
          'Conflicto de horario concurrente: El intervalo ya ha sido ocupado.'
        );
      }
      throw new DentalClinicError('No se pudo registrar la cita.', 'APPOINTMENT_CREATION_FAILED', 500);
    }

    // 3. Auditoría
    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'cita',
      entity_id: createdAppointment.id,
      action: 'create',
      result: 'success',
      metadata: { dentist_id: input.dentistId, scheduled_at: scheduledAtIso },
    });

    return createdAppointment as Appointment;
  });
}

/**
 * Server Action: Reprogramación de cita.
 * Requisitos: 5.4, 5.5, 5.10
 */
export async function rescheduleAppointmentAction(
  rawInput: RescheduleAppointmentInput
): Promise<ServerActionResult<Appointment>> {
  return withErrorHandling(async () => {
    const input = rescheduleSchema.parse(rawInput);
    const authUser = await requireRole(
      ['administrador', 'odontologo', 'recepcionista'],
      'cita',
      input.appointmentId,
      'reschedule'
    );
    const supabase = await createServerSupabaseClient();

    // 1. Obtener cita existente
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', input.appointmentId)
      .eq('clinic_id', authUser.clinicId)
      .single();

    if (fetchError || !currentAppointment) {
      throw new DentalClinicError('Cita no encontrada.', 'APPOINTMENT_NOT_FOUND', 404);
    }

    if (!['programada', 'confirmada'].includes(currentAppointment.status)) {
      throw new DentalClinicError(
        `No se puede reprogramar una cita con estado '${currentAppointment.status}'. Solo citas programadas o confirmadas pueden ser reprogramadas.`,
        'INVALID_APPOINTMENT_STATUS',
        400
      );
    }

    const durationMin = input.newDurationMin ?? currentAppointment.duration_min;
    const newScheduledDate = new Date(input.newScheduledAt);
    const newEndsDate = new Date(newScheduledDate.getTime() + durationMin * 60 * 1000);
    const newScheduledAtIso = newScheduledDate.toISOString();
    const newEndsAtIso = newEndsDate.toISOString();

    // 2. Verificar disponibilidad de horario excluyendo la cita actual
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('clinic_id', authUser.clinicId)
      .eq('dentist_id', currentAppointment.dentist_id)
      .neq('id', input.appointmentId)
      .in('status', ['programada', 'confirmada', 'en_curso'])
      .lt('scheduled_at', newEndsAtIso)
      .gt('ends_at', newScheduledAtIso);

    if (conflicts && conflicts.length > 0) {
      throw new AppointmentConflictError('La nueva franja seleccionada genera conflicto con otra cita.');
    }

    // 3. Actualizar cita
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        scheduled_at: newScheduledAtIso,
        duration_min: durationMin,
        status: 'reprogramada',
        rescheduled_from: currentAppointment.id,
      })
      .eq('id', input.appointmentId)
      .eq('clinic_id', authUser.clinicId)
      .select('*')
      .single();

    if (updateError || !updatedAppointment) {
      throw new DentalClinicError('Error al reprogramar la cita.', 'RESCHEDULE_FAILED', 500);
    }

    // 4. Auditoría
    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'cita',
      entity_id: input.appointmentId,
      action: 'reschedule',
      result: 'success',
      metadata: { previous_scheduled_at: currentAppointment.scheduled_at, new_scheduled_at: newScheduledAtIso },
    });

    return updatedAppointment as Appointment;
  });
}

/**
 * Server Action: Cancelación de cita con motivo obligatorio.
 * Requisitos: 5.6, 5.10
 */
export async function cancelAppointmentAction(
  rawInput: CancelAppointmentInput
): Promise<ServerActionResult<Appointment>> {
  return withErrorHandling(async () => {
    const input = cancelSchema.parse(rawInput);
    const authUser = await requireRole(
      ['administrador', 'odontologo', 'recepcionista'],
      'cita',
      input.appointmentId,
      'cancel'
    );
    const supabase = await createServerSupabaseClient();

    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', input.appointmentId)
      .eq('clinic_id', authUser.clinicId)
      .single();

    if (fetchError || !currentAppointment) {
      throw new DentalClinicError('Cita no encontrada.', 'APPOINTMENT_NOT_FOUND', 404);
    }

    if (currentAppointment.status === 'cancelada') {
      throw new DentalClinicError('La cita ya se encuentra cancelada.', 'ALREADY_CANCELLED', 400);
    }

    const { data: cancelledAppointment, error: cancelError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelada',
        cancel_reason: input.cancelReason,
        cancelled_by: authUser.userId,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', input.appointmentId)
      .eq('clinic_id', authUser.clinicId)
      .select('*')
      .single();

    if (cancelError || !cancelledAppointment) {
      throw new DentalClinicError('Error al cancelar la cita.', 'CANCEL_FAILED', 500);
    }

    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'cita',
      entity_id: input.appointmentId,
      action: 'cancel',
      result: 'success',
      metadata: { cancel_reason: input.cancelReason },
    });

    return cancelledAppointment as Appointment;
  });
}

/**
 * Server Action: Consulta de citas filtrable por fecha y odontólogo.
 */
export async function listAppointmentsAction(filters?: {
  dentistId?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ServerActionResult<Appointment[]>> {
  return withErrorHandling(async () => {
    const authUser = await requireRole(['administrador', 'odontologo', 'recepcionista'], 'cita');
    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', authUser.clinicId)
      .order('scheduled_at', { ascending: true });

    if (filters?.dentistId) {
      query = query.eq('dentist_id', filters.dentistId);
    }
    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }
    if (filters?.startDate) {
      query = query.gte('scheduled_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('scheduled_at', filters.endDate);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new DentalClinicError('Error al consultar las citas.', 'APPOINTMENTS_FETCH_FAILED', 500);
    }

    return (appointments || []) as Appointment[];
  });
}
