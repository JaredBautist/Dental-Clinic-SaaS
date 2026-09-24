import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createServerClient,
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import {
  createAppointmentAction,
  cancelAppointmentAction,
} from '@/lib/actions/appointments.actions';

describe('Appointments Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAppointmentAction', () => {
    it('debe crear una cita cuando el odontólogo está disponible', async () => {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 2); // Pasado mañana
      scheduledAt.setHours(10, 0, 0, 0);

      const patientId = '11111111-1111-4111-8111-111111111111';
      const dentistId = '22222222-2222-4222-8222-222222222222';

      const mockAppointment = {
        id: '33333333-3333-4333-8333-333333333333',
        clinic_id: 'clinic-uuid-1',
        patient_id: patientId,
        dentist_id: dentistId,
        scheduled_at: scheduledAt.toISOString(),
        duration_min: 30,
        ends_at: new Date(scheduledAt.getTime() + 30 * 60 * 1000).toISOString(),
        status: 'programada',
        reason: 'Limpieza dental',
        created_by: 'user-uuid-1',
      };

      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-uuid-1' } } }),
        },
        from: (table: string) => {
          if (table === 'users') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: 'user-uuid-1',
                      clinic_id: 'clinic-uuid-1',
                      role: 'recepcionista',
                      full_name: 'Recepcionista',
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
                    in: () => ({
                      lt: () => ({
                        gt: vi.fn().mockResolvedValue({ data: [], error: null }), // No hay conflicto
                      }),
                    }),
                  }),
                }),
              }),
              insert: () => ({
                select: () => ({
                  single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
                }),
              }),
            };
          }
          return {};
        },
      });

      const result = await createAppointmentAction({
        patientId,
        dentistId,
        scheduledAt: scheduledAt.toISOString(),
        durationMin: 30,
        reason: 'Limpieza dental',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('programada');
        expect(result.data.duration_min).toBe(30);
      }
    });

    it('debe detectar conflicto de horario y sugerir 3 franjas alternativas (Requisito 5.2)', async () => {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 2);
      scheduledAt.setHours(10, 0, 0, 0);

      const patientId = '11111111-1111-4111-8111-111111111111';
      const dentistId = '22222222-2222-4222-8222-222222222222';

      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-uuid-1' } } }),
        },
        from: (table: string) => {
          if (table === 'users') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: 'user-uuid-1',
                      clinic_id: 'clinic-uuid-1',
                      role: 'recepcionista',
                      full_name: 'Recepcionista',
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
                    in: () => ({
                      lt: () => ({
                        gt: vi.fn().mockResolvedValue({
                          data: [
                            {
                              id: 'conflict-app-1',
                              scheduled_at: scheduledAt.toISOString(),
                              ends_at: new Date(scheduledAt.getTime() + 60 * 60 * 1000).toISOString(),
                            },
                          ],
                          error: null,
                        }),
                      }),
                      gte: () => ({
                        lte: vi.fn().mockResolvedValue({
                          data: [
                            {
                              scheduled_at: scheduledAt.toISOString(),
                              ends_at: new Date(scheduledAt.getTime() + 60 * 60 * 1000).toISOString(),
                            },
                          ],
                        }),
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

      const result = await createAppointmentAction({
        patientId,
        dentistId,
        scheduledAt: scheduledAt.toISOString(),
        durationMin: 30,
        reason: 'Revisión general',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(409);
        expect(result.error.code).toBe('APPOINTMENT_CONFLICT_ERROR');
        expect(result.error.details).toBeDefined();
        const suggestions = result.error.details as Array<{ start: string; end: string }>;
        expect(suggestions).toHaveLength(3);
      }
    });
  });

  describe('cancelAppointmentAction', () => {
    it('debe cancelar la cita registrando motivo obligatorio', async () => {
      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-uuid-1' } } }),
        },
        from: (table: string) => {
          if (table === 'users') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: 'user-uuid-1',
                      clinic_id: 'clinic-uuid-1',
                      role: 'recepcionista',
                      full_name: 'Recepcionista',
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
                    single: vi.fn().mockResolvedValue({
                      data: { id: 'app-to-cancel', status: 'programada' },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: () => ({
                eq: () => ({
                  eq: () => ({
                    select: () => ({
                      single: vi.fn().mockResolvedValue({
                        data: {
                          id: 'app-to-cancel',
                          status: 'cancelada',
                          cancel_reason: 'Paciente no puede asistir',
                        },
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

      const result = await cancelAppointmentAction({
        appointmentId: '11111111-1111-4111-8111-111111111111',
        cancelReason: 'Paciente no puede asistir',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('cancelada');
      }
    });
  });
});
