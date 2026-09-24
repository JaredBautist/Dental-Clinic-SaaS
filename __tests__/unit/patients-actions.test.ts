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

import { createPatientAction, searchPatientsAction } from '@/lib/actions/patients.actions';

describe('Patients Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPatientAction', () => {
    it('debe crear un nuevo paciente con documento colombiano válido exitosamente', async () => {
      const mockPatient = {
        id: 'patient-uuid-1',
        clinic_id: 'clinic-uuid-1',
        full_name: 'Ana María Gómez',
        document_type: 'CC',
        document_number: '1090123456',
        birth_date: '1995-04-12',
        biological_sex: 'femenino',
        phone_primary: '3109876543',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
                      full_name: 'Recepcionista Turno',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'patients') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    eq: () => ({
                      maybeSingle: vi.fn().mockResolvedValue({ data: null }), // No existe duplicado
                    }),
                  }),
                }),
              }),
              insert: () => ({
                select: () => ({
                  single: vi.fn().mockResolvedValue({ data: mockPatient, error: null }),
                }),
              }),
            };
          }
          return {};
        },
      });

      const result = await createPatientAction({
        fullName: 'Ana María Gómez',
        documentType: 'CC',
        documentNumber: '1090123456',
        birthDate: '1995-04-12',
        biologicalSex: 'femenino',
        phonePrimary: '3109876543',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.full_name).toBe('Ana María Gómez');
        expect(result.data.document_number).toBe('1090123456');
      }
    });

    it('debe rechazar la creación si el documento ya existe en el consultorio (UNIQUE_DOCUMENT_ERROR / 409)', async () => {
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
                      full_name: 'Recepcionista Turno',
                      is_active: true,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'patients') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    eq: () => ({
                      maybeSingle: vi.fn().mockResolvedValue({
                        data: {
                          id: 'existing-patient-uuid',
                          full_name: 'Carlos Existente',
                          document_type: 'CC',
                          document_number: '1090123456',
                        },
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

      const result = await createPatientAction({
        fullName: 'Otro Paciente',
        documentType: 'CC',
        documentNumber: '1090123456',
        birthDate: '1990-01-01',
        biologicalSex: 'masculino',
        phonePrimary: '3112223344',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(409);
        expect(result.error.code).toBe('UNIQUE_DOCUMENT_ERROR');
      }
    });

    it('debe rechazar fechas de nacimiento futuras', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const result = await createPatientAction({
        fullName: 'Bebé del Futuro',
        documentType: 'RC',
        documentNumber: '12345678',
        birthDate: futureDateStr,
        biologicalSex: 'masculino',
        phonePrimary: '3001234567',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('searchPatientsAction', () => {
    it('debe retornar lista vacía sin consultar base de datos si la búsqueda tiene menos de 2 caracteres', async () => {
      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-uuid-1' } } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'user-uuid-1',
                  clinic_id: 'clinic-uuid-1',
                  role: 'recepcionista',
                  full_name: 'Recepción',
                  is_active: true,
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await searchPatientsAction('a');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });
});
