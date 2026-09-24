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

import { saveClinicalEntryAction, getClinicalHistoryAction } from '@/lib/actions/clinical.actions';

describe('Clinical Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveClinicalEntryAction', () => {
    it('debe rechazar a usuarios con rol recepcionista (Requisito 6.9 / HTTP 403)', async () => {
      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'recep-uuid-1' } } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'recep-uuid-1',
                  clinic_id: 'clinic-uuid-1',
                  role: 'recepcionista',
                  full_name: 'Recepcionista',
                  is_active: true,
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await saveClinicalEntryAction({
        patientId: '11111111-1111-4111-8111-111111111111',
        entryType: 'motivo_consulta',
        content: 'Dolor en molar superior',
        expectedVersion: 1,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(403);
        expect(result.error.code).toBe('ROLE_AUTHORIZATION_ERROR');
      }
    });

    it('debe detectar conflicto de concurrencia optimista si la versión esperada no coincide (Requisito 6.11 / HTTP 409)', async () => {
      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'dentist-uuid-1' } } }),
        },
        from: (table: string) => {
          if (table === 'users') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: 'dentist-uuid-1',
                      clinic_id: 'clinic-uuid-1',
                      role: 'odontologo',
                      full_name: 'Dr. Odontólogo',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'clinical_records') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: {
                        id: 'record-uuid-1',
                        version: 5, // Versión actual en BD es 5
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      });

      const result = await saveClinicalEntryAction({
        patientId: '11111111-1111-4111-8111-111111111111',
        entryType: 'evolucion',
        content: 'Paciente refiere mejoría',
        expectedVersion: 3, // Usuario cree que va por la 3
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(409);
        expect(result.error.code).toBe('CONCURRENCY_CONFLICT_ERROR');
      }
    });

    it('debe registrar entrada exitosamente e incrementar versión a la siguiente', async () => {
      const mockInsertedEntry = {
        id: 'entry-uuid-1',
        clinic_id: 'clinic-uuid-1',
        record_id: 'record-uuid-1',
        patient_id: '11111111-1111-4111-8111-111111111111',
        dentist_id: 'dentist-uuid-1',
        entry_type: 'evolucion',
        content: 'Limpieza realizada sin novedades',
        version: 1,
        created_at: new Date().toISOString(),
      };

      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'dentist-uuid-1' } } }),
        },
        from: (table: string) => {
          if (table === 'users') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: 'dentist-uuid-1',
                      clinic_id: 'clinic-uuid-1',
                      role: 'odontologo',
                      full_name: 'Dr. Odontólogo',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'clinical_records') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: { id: 'record-uuid-1', version: 1 },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: () => ({
                eq: () => ({
                  eq: vi.fn().mockResolvedValue({ error: null }),
                }),
              }),
            };
          }
          if (table === 'clinical_entries') {
            return {
              insert: () => ({
                select: () => ({
                  single: vi.fn().mockResolvedValue({ data: mockInsertedEntry, error: null }),
                }),
              }),
            };
          }
          return {};
        },
      });

      const result = await saveClinicalEntryAction({
        patientId: '11111111-1111-4111-8111-111111111111',
        entryType: 'evolucion',
        content: 'Limpieza realizada sin novedades',
        expectedVersion: 1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.newVersion).toBe(2);
        expect(result.data.entry.content).toBe('Limpieza realizada sin novedades');
      }
    });
  });
});
