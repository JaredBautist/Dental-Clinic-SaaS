import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createServerClient,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mocks.createAdminClient,
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

import { registerClinicAction, updateClinicAction, getClinicAction } from '@/lib/actions/clinic.actions';

describe('Clinic Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerClinicAction', () => {
    it('debe registrar un consultorio y crear el administrador inicial exitosamente', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const deleteMock = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      const inviteUserByEmailMock = vi.fn().mockResolvedValue({
        data: { user: { id: 'admin-user-uuid-1' } },
        error: null,
      });

      mocks.createAdminClient.mockReturnValue({
        from: (table: string) => ({
          insert: insertMock,
          delete: deleteMock,
        }),
        auth: {
          admin: {
            inviteUserByEmail: inviteUserByEmailMock,
          },
        },
      });

      const result = await registerClinicAction({
        name: 'Clínica Dental San José',
        address: 'Calle 10 # 5-20, Cúcuta',
        phone: '3123456789',
        email: 'contacto@sanjosedental.co',
        adminName: 'Dra. María González',
        adminEmail: 'maria@sanjosedental.co',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Clínica Dental San José');
        expect(result.data.adminEmail).toBe('maria@sanjosedental.co');
        expect(result.data.clinicId).toBeDefined();
      }
      expect(inviteUserByEmailMock).toHaveBeenCalledWith('maria@sanjosedental.co', expect.anything());
    });

    it('debe rechazar datos obligatorios ausentes o inválidos', async () => {
      const result = await registerClinicAction({
        name: '', // Inválido: vacío
        adminName: '',
        adminEmail: 'email-invalido',
      } as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
        expect(result.error.statusCode).toBe(422);
      }
    });
  });

  describe('updateClinicAction', () => {
    it('debe permitir la actualización a un usuario con rol administrador', async () => {
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
          if (table === 'clinics') {
            return {
              update: (updates: any) => ({
                eq: () => ({
                  select: () => ({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: 'clinic-uuid-1',
                        name: updates.name,
                        address: updates.address,
                        phone: updates.phone,
                        email: updates.email,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
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

      const result = await updateClinicAction({
        name: 'Clínica Dental San José Renovada',
        phone: '3159998877',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Clínica Dental San José Renovada');
      }
    });

    it('debe rechazar la actualización si el usuario es recepcionista (HTTP 403)', async () => {
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
                  full_name: 'Carlos Recepción',
                  is_active: true,
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await updateClinicAction({
        name: 'Intento no autorizado',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(403);
        expect(result.error.code).toBe('ROLE_AUTHORIZATION_ERROR');
      }
    });
  });
});
