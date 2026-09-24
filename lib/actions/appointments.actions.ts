'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { DentalClinicError } from '@/errors/domain';
import type { Appointment, AppointmentStatus } from '@/types/domain';

const appointmentSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido'),
  dentist_id: z.string().uuid('ID de odontólogo inválido'),
  scheduled_at: z.string().min(1, 'La fecha y hora son obligatorias'),
  duration_min: z.number().min(15, 'Mínimo 15 minutos').max(480, 'Máximo 480 minutos'),
  reason: z.string().min(1, 'El motivo es obligatorio').max(500),
});

export async function createAppointmentAction(
  formData: z.infer<typeof appointmentSchema>
): Promise<ServerActionResult<Appointment>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new DentalClinicError('Perfil no encontrado.', 'PROFILE_NOT_FOUND', 404);
    }

    const validated = appointmentSchema.parse(formData);

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        clinic_id: profile.clinic_id,
        ...validated,
        created_by: user.id,
        status: 'programada',
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('no_overlap_appointments')) {
        throw new DentalClinicError(
          'Conflicto de horario: El odontólogo ya tiene una cita en ese intervalo.',
          'APPOINTMENT_CONFLICT_ERROR',
          409
        );
      }
      throw new DentalClinicError('Error al agendar cita.', 'CREATE_APPOINTMENT_ERROR', 500);
    }

    return data as Appointment;
  });
}

export async function listAppointmentsAction(
  filters?: {
    dentist_id?: string;
    status?: AppointmentStatus;
    date_from?: string;
    date_to?: string;
  }
): Promise<ServerActionResult<Appointment[]>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new DentalClinicError('Perfil no encontrado.', 'PROFILE_NOT_FOUND', 404);
    }

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .order('scheduled_at', { ascending: true });

    if (filters?.dentist_id) {
      query = query.eq('dentist_id', filters.dentist_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.date_from) {
      query = query.gte('scheduled_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('scheduled_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new DentalClinicError('Error al listar citas.', 'LIST_APPOINTMENTS_ERROR', 500);
    }

    return data as Appointment[];
  });
}

export async function cancelAppointmentAction(
  id: string,
  cancel_reason: string
): Promise<ServerActionResult<Appointment>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new DentalClinicError('Perfil no encontrado.', 'PROFILE_NOT_FOUND', 404);
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelada',
        cancel_reason,
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .neq('status', 'completada')
      .select()
      .single();

    if (error) {
      throw new DentalClinicError('Error al cancelar cita.', 'CANCEL_APPOINTMENT_ERROR', 500);
    }

    return data as Appointment;
  });
}
