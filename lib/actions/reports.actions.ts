'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { ReportRangeLimitError, DentalClinicError } from '@/errors/domain';
import type { AppointmentStatus } from '@/types/domain';

const reportFilterSchema = z
  .object({
    startDate: z.string().datetime({ message: 'Fecha de inicio inválida (ISO 8601)' }),
    endDate: z.string().datetime({ message: 'Fecha de fin inválida (ISO 8601)' }),
    dentistId: z.string().uuid('ID de odontólogo inválido').optional().nullable(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      return end >= start;
    },
    {
      message: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
      path: ['endDate'],
    }
  );

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;

/**
 * Valida la regla de negocio crítica: el rango de consulta no puede superar 365 días (12 meses).
 * Si excede, rechaza la solicitud de inmediato antes de consultar la base de datos.
 * Requisito 9.3
 */
function validateDateRangeLimit(startDateIso: string, endDateIso: string): void {
  const start = new Date(startDateIso).getTime();
  const end = new Date(endDateIso).getTime();
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);

  if (diffDays > 365) {
    throw new ReportRangeLimitError('El rango de fechas de consulta no puede superar los 12 meses (365 días).');
  }
}

export interface AttendedPatientsReportResult {
  totalAttended: number;
  startDate: string;
  endDate: string;
  dentistId?: string | null;
  breakdownByDentist?: Array<{ dentistId: string; dentistName: string; count: number }>;
}

export interface AppointmentStatusReportResult {
  statusDistribution: Record<AppointmentStatus, number>;
  totalAppointments: number;
  startDate: string;
  endDate: string;
}

/**
 * Server Action: Reporte de pacientes atendidos (citas con estado 'completada').
 * Requisitos: 9.1, 9.3, 9.5, 9.6
 * Acceso: Solo 'administrador' y 'odontologo'. Recepcionista recibe 403.
 */
export async function getAttendedPatientsReportAction(
  rawInput: ReportFilterInput
): Promise<ServerActionResult<AttendedPatientsReportResult>> {
  return withErrorHandling(async () => {
    const input = reportFilterSchema.parse(rawInput);
    validateDateRangeLimit(input.startDate, input.endDate);

    const authUser = await requireRole(['administrador', 'odontologo'], 'cita');
    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('appointments')
      .select('id, dentist_id, scheduled_at, status')
      .eq('clinic_id', authUser.clinicId)
      .eq('status', 'completada')
      .gte('scheduled_at', input.startDate)
      .lte('scheduled_at', input.endDate);

    if (input.dentistId) {
      query = query.eq('dentist_id', input.dentistId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new DentalClinicError('Error al generar el reporte de pacientes atendidos.', 'REPORT_QUERY_FAILED', 500);
    }

    const totalAttended = appointments ? appointments.length : 0;

    return {
      totalAttended,
      startDate: input.startDate,
      endDate: input.endDate,
      dentistId: input.dentistId || null,
    };
  });
}

/**
 * Server Action: Reporte de distribución de citas por estado.
 * Requisitos: 9.2, 9.3, 9.5, 9.6
 * Acceso: Solo 'administrador' y 'odontologo'.
 */
export async function getAppointmentStatusReportAction(
  rawInput: ReportFilterInput
): Promise<ServerActionResult<AppointmentStatusReportResult>> {
  return withErrorHandling(async () => {
    const input = reportFilterSchema.parse(rawInput);
    validateDateRangeLimit(input.startDate, input.endDate);

    const authUser = await requireRole(['administrador', 'odontologo'], 'cita');
    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('appointments')
      .select('status')
      .eq('clinic_id', authUser.clinicId)
      .gte('scheduled_at', input.startDate)
      .lte('scheduled_at', input.endDate);

    if (input.dentistId) {
      query = query.eq('dentist_id', input.dentistId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw new DentalClinicError('Error al generar el reporte de distribución de citas.', 'REPORT_QUERY_FAILED', 500);
    }

    const distribution: Record<AppointmentStatus, number> = {
      programada: 0,
      confirmada: 0,
      en_curso: 0,
      completada: 0,
      cancelada: 0,
      reprogramada: 0,
    };

    if (appointments) {
      for (const app of appointments) {
        const status = app.status as AppointmentStatus;
        if (distribution[status] !== undefined) {
          distribution[status]++;
        }
      }
    }

    const totalAppointments = appointments ? appointments.length : 0;

    return {
      statusDistribution: distribution,
      totalAppointments,
      startDate: input.startDate,
      endDate: input.endDate,
    };
  });
}
