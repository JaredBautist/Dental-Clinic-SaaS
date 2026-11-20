'use server';

import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { DentalClinicError } from '@/errors/domain';
import type { AppointmentStatus } from '@/types/domain';
import { reportCalendarDate, reportDateIso } from '@/lib/report-dates';

export interface DashboardTodayAppointment {
  id: string;
  patientName: string;
  dentistName: string;
  scheduledAt: string;
  status: AppointmentStatus;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingConfirmations: number;
  pendingVisits: number;
  completedToday: number;
  todayList: DashboardTodayAppointment[];
  nextAppointmentInMinutes: number | null;
}

/**
 * Server Action: métricas operativas para odontólogo y recepcionista.
 * El administrador solo recibe métricas de consultorio y personal desde su dashboard.
 * El rango del día se calcula en la zona horaria de Colombia (America/Bogota).
 */
export async function getDashboardStatsAction(
  rawInput?: { date?: string; dentistId?: string }
): Promise<ServerActionResult<DashboardStats>> {
  return withErrorHandling(async () => {
    const authUser = await requireRole(
      ['odontologo', 'recepcionista'],
      'consultorio'
    );
    const supabase = await createServerSupabaseClient();

    const date = rawInput?.date ?? reportCalendarDate(new Date());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new DentalClinicError('Fecha inválida para el resumen del dashboard.', 'INVALID_DATE', 400);
    }

    const dayStart = reportDateIso(date);
    const dayEnd = reportDateIso(date, true);

    let appointmentsQuery = supabase
      .from('appointments')
      .select(
        `id, scheduled_at, status,
         patient:patients!appointments_patient_id_fkey(full_name),
         dentist:users!appointments_dentist_id_fkey(full_name)`
      )
      .eq('clinic_id', authUser.clinicId)
      .gte('scheduled_at', dayStart)
      .lte('scheduled_at', dayEnd);

    if (authUser.role === 'odontologo') {
      // El odontólogo solo consulta su propia agenda; no puede consultar la de otro usuario.
      appointmentsQuery = appointmentsQuery.eq('dentist_id', authUser.userId);
    }

    const [patientsResult, appointmentsResult] = await Promise.all([
      supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', authUser.clinicId),
      appointmentsQuery.order('scheduled_at', { ascending: true }),
    ]);

    if (patientsResult.error) {
      console.error('[Dashboard Stats] patients query failed:', patientsResult.error);
      throw new DentalClinicError(
        'Error al consultar el total de pacientes.',
        'DASHBOARD_PATIENTS_FAILED',
        500
      );
    }

    if (appointmentsResult.error) {
      console.error('[Dashboard Stats] appointments query failed:', appointmentsResult.error);
      throw new DentalClinicError(
        'Error al consultar las citas de hoy.',
        'DASHBOARD_APPOINTMENTS_FAILED',
        500
      );
    }

    type AppointmentRow = {
      id: string;
      scheduled_at: string;
      status: string;
      patient: { full_name: string } | { full_name: string }[] | null;
      dentist: { full_name: string } | { full_name: string }[] | null;
    };

    const rows = (appointmentsResult.data ?? []) as AppointmentRow[];

    const todayList: DashboardTodayAppointment[] = rows.map((row) => {
      const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
      const dentist = Array.isArray(row.dentist) ? row.dentist[0] : row.dentist;
      return {
        id: row.id,
        patientName: patient?.full_name?.trim() || 'Paciente',
        dentistName: dentist?.full_name?.trim() || 'Odontólogo',
        scheduledAt: row.scheduled_at,
        status: row.status as AppointmentStatus,
      };
    });

    const pendingConfirmations = todayList.filter(
      (a) => a.status === 'programada' || a.status === 'confirmada'
    ).length;
    const pendingVisits = pendingConfirmations + todayList.filter((a) => a.status === 'en_curso').length;
    const completedToday = todayList.filter((a) => a.status === 'completada').length;

    const now = Date.now();
    const upcoming = todayList.find((a) => {
      const status = a.status;
      if (status === 'completada' || status === 'cancelada') return false;
      return new Date(a.scheduledAt).getTime() > now;
    });
    const nextAppointmentInMinutes = upcoming
      ? Math.max(0, Math.round((new Date(upcoming.scheduledAt).getTime() - now) / 60000))
      : null;

    return {
      totalPatients: patientsResult.count ?? 0,
      todayAppointments: todayList.length,
      pendingConfirmations,
      pendingVisits,
      completedToday,
      todayList,
      nextAppointmentInMinutes,
    };
  });
}
