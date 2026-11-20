import { reportCalendarDate, reportDateIso } from '@/lib/report-dates';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createServerClient,
}));

import {
  getAttendedPatientsReportAction,
  getAppointmentStatusReportAction,
} from '@/lib/actions/reports.actions';

describe('Reports Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('conserva el día de Bogotá al mostrar la hora final en UTC', () => {
    const end = reportDateIso('2026-11-20', true);
    expect(end).toBe('2026-11-21T04:59:59.999Z');
    expect(reportCalendarDate(end)).toBe('2026-11-20');
  });

  describe('Validación de límite de rango (Requisito 9.3)', () => {
    it('debe rechazar rangos mayores a 365 días sin consultar la base de datos', async () => {
      const start = '2025-01-01T00:00:00.000Z';
      const end = '2026-03-01T00:00:00.000Z'; // Más de 1 año (aprox. 424 días)

      const result = await getAttendedPatientsReportAction({
        startDate: start,
        endDate: end,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(400);
        expect(result.error.code).toBe('REPORT_RANGE_LIMIT_ERROR');
        expect(result.error.message).toContain('365 días');
      }
    });

    it('debe procesar reportes para rangos válidos menores o iguales a 365 días', async () => {
      const start = '2026-01-01T00:00:00.000Z';
      const end = '2026-06-30T23:59:59.000Z'; // 6 meses

      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-uuid-1' } } }),
        },
        from: (table: string) => {
          if (table === 'users') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: 'admin-uuid-1',
                      clinic_id: 'clinic-uuid-1',
                      role: 'administrador',
                      full_name: 'Dra. María',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'appointments') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    gte: () => ({
                      lt: vi.fn().mockResolvedValue({
                        data: [
                          { id: 'app-1', status: 'completada' },
                          { id: 'app-2', status: 'completada' },
                        ],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      });

      const result = await getAttendedPatientsReportAction({
        startDate: start,
        endDate: end,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalAttended).toBe(2);
      }
    });

    it('debe retornar la distribución de citas por estado correctamente', async () => {
      const start = '2026-01-01T00:00:00.000Z';
      const end = '2026-01-31T23:59:59.000Z';
      const dentistId = '11111111-1111-4111-8111-111111111111';
      const eqDentist = vi.fn().mockResolvedValue({
        data: [{ status: 'completada' }, { status: 'completada' }, { status: 'programada' }, { status: 'cancelada' }],
        error: null,
      });

      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: dentistId } } }),
        },
        from: (table: string) => {
          if (table === 'users') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: dentistId,
                      clinic_id: 'clinic-uuid-1',
                      role: 'odontologo',
                      full_name: 'Dr. Dentista',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'appointments') {
            return {
              select: () => ({
                eq: () => ({
                  gte: () => ({
                    lt: () => ({ eq: eqDentist }),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      });

      const result = await getAppointmentStatusReportAction({
        startDate: start,
        endDate: end,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalAppointments).toBe(4);
        expect(result.data.statusDistribution.completada).toBe(2);
        expect(result.data.statusDistribution.programada).toBe(1);
        expect(result.data.statusDistribution.cancelada).toBe(1);
        expect(result.data.statusDistribution.en_curso).toBe(0);
      }
      expect(eqDentist).toHaveBeenCalledWith('dentist_id', dentistId);
      const foreign = { startDate: start, endDate: end, dentistId: '22222222-2222-4222-8222-222222222222' };
      expect((await getAppointmentStatusReportAction(foreign)).error?.code).toBe('REPORT_SCOPE_FORBIDDEN');
      expect((await getAttendedPatientsReportAction(foreign)).error?.code).toBe('REPORT_SCOPE_FORBIDDEN');
      expect(eqDentist).toHaveBeenCalledTimes(1);
    });
  });
});
