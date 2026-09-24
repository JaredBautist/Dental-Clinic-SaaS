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
  saveToothStateAction,
  createCustomToothStatusAction,
} from '@/lib/actions/odontogram.actions';

describe('Odontogram Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveToothStateAction', () => {
    it('debe rechazar un código dental que no pertenezca a la nomenclatura FDI de 32 piezas', async () => {
      const result = await saveToothStateAction({
        patientId: '11111111-1111-4111-8111-111111111111',
        toothCode: '99' as any, // Inválido
        surface: 'oclusal',
        status: 'caries',
        expectedVersion: 1,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('debe registrar un estado dental append-only exitosamente', async () => {
      const mockState = {
        id: 'odontogram-state-1',
        clinic_id: 'clinic-uuid-1',
        patient_id: '11111111-1111-4111-8111-111111111111',
        dentist_id: 'dentist-uuid-1',
        tooth_code: '16',
        surface: 'oclusal',
        status: 'caries',
        proposed_treatment: 'Obturación con resina',
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
                      full_name: 'Dr. Dentista',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'odontogram_states') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    eq: () => ({
                      eq: () => ({
                        order: () => ({
                          limit: () => ({
                            maybeSingle: vi.fn().mockResolvedValue({ data: null }), // No hay versión previa
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
              insert: () => ({
                select: () => ({
                  single: vi.fn().mockResolvedValue({ data: mockState, error: null }),
                }),
              }),
            };
          }
          return {};
        },
      });

      const result = await saveToothStateAction({
        patientId: '11111111-1111-4111-8111-111111111111',
        toothCode: '16',
        surface: 'oclusal',
        status: 'caries',
        proposedTreatment: 'Obturación con resina',
        expectedVersion: 1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state.tooth_code).toBe('16');
        expect(result.data.state.status).toBe('caries');
        expect(result.data.newVersion).toBe(1);
      }
    });
  });

  describe('createCustomToothStatusAction', () => {
    it('debe rechazar la creación si el consultorio ya alcanzó los 20 estados personalizados (Requisito 7.3)', async () => {
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
                      full_name: 'Dr. Dentista',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'custom_tooth_statuses') {
            return {
              select: (fields: string, opts?: any) => ({
                eq: vi.fn().mockResolvedValue({ count: 20, error: null }), // 20 estados existentes
              }),
            };
          }
          return {};
        },
      });

      const result = await createCustomToothStatusAction({
        name: 'Incrustación metálica',
        colorHex: '#AABBCC',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(400);
        expect(result.error.code).toBe('CUSTOM_STATUS_LIMIT_REACHED');
      }
    });
  });
});
