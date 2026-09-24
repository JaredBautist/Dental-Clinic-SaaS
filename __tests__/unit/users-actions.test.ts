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

import { createUserAction, deactivateUserAction } from '@/lib/actions/users.actions';

describe('Users Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserAction', () => {
    it('debe permitir crear un nuevo usuario si quien ejecuta es administrador', async () => {
      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '11111111-1111-4111-8111-111111111111' } } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: '11111111-1111-4111-8111-111111111111',
                  clinic_id: 'clinic-uuid-1',
                  role: 'administrador',
                  full_name: 'Dra. María',
                  is_active: true,
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const inviteUserByEmailMock = vi.fn().mockResolvedValue({
        data: { user: { id: '22222222-2222-4222-8222-222222222222' } },
        error: null,
      });

      const insertMock = vi.fn().mockReturnValue({
        select: () => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '22222222-2222-4222-8222-222222222222',
              clinic_id: 'clinic-uuid-1',
              role: 'odontologo',
              full_name: 'Dr. Roberto Gómez',
              is_active: true,
              mfa_enabled: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      mocks.createAdminClient.mockReturnValue({
        auth: {
          admin: {
            inviteUserByEmail: inviteUserByEmailMock,
          },
        },
        from: () => ({
          insert: insertMock,
        }),
      });

      const result = await createUserAction({
        fullName: 'Dr. Roberto Gómez',
        email: 'roberto@sanjosedental.co',
        role: 'odontologo',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('odontologo');
        expect(result.data.full_name).toBe('Dr. Roberto Gómez');
      }
    });

    it('debe rechazar roles inválidos con error de validación', async () => {
      const result = await createUserAction({
        fullName: 'Prueba',
        email: 'test@example.com',
        role: 'superadmin' as any,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('deactivateUserAction', () => {
    it('debe rechazar la desactivación si es el único administrador activo del consultorio', async () => {
      const adminId = '11111111-1111-4111-8111-111111111111';

      mocks.createAdminClient.mockReturnValue({
        auth: { admin: { signOut: vi.fn() } },
        from: () => ({ update: () => ({ eq: () => ({ eq: vi.fn() }) }) }),
      });

      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: adminId } } }),
        },
        from: () => ({
          select: (fields: string, opts?: any) => {
            if (opts?.count === 'exact') {
              const chain: any = {
                eq: vi.fn().mockImplementation(() => chain),
                then: (resolve: any) => resolve({ count: 1, error: null }),
              };
              return chain;
            }
            const chain: any = {
              eq: vi.fn().mockImplementation(() => chain),
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: adminId,
                  clinic_id: 'clinic-uuid-1',
                  role: 'administrador',
                  full_name: 'Dra. María',
                  is_active: true,
                },
                error: null,
              }),
            };
            return chain;
          },
        }),
      });

      const result = await deactivateUserAction(adminId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(400);
        expect(result.error.message).toContain('el consultorio debe conservar al menos un administrador activo');
      }
    });

    it('debe permitir la desactivación si existen otros administradores activos', async () => {
      const admin1Id = '11111111-1111-4111-8111-111111111111';
      const admin2Id = '22222222-2222-4222-8222-222222222222';
      const signOutMock = vi.fn().mockResolvedValue({ error: null });
      const updateEq2Mock = vi.fn().mockResolvedValue({ error: null });
      const updateEq1Mock = vi.fn().mockReturnValue({ eq: updateEq2Mock });
      const updateMock = vi.fn().mockReturnValue({ eq: updateEq1Mock });

      mocks.createAdminClient.mockReturnValue({
        auth: {
          admin: {
            signOut: signOutMock,
          },
        },
        from: () => ({
          update: updateMock,
        }),
      });

      mocks.createServerClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: admin1Id } } }),
        },
        from: () => ({
          select: (fields: string, opts?: any) => {
            if (opts?.count === 'exact') {
              const chain: any = {
                eq: vi.fn().mockImplementation(() => chain),
                then: (resolve: any) => resolve({ count: 2, error: null }),
              };
              return chain;
            }
            let callCount = 0;
            const chain: any = {
              eq: vi.fn().mockImplementation(() => chain),
              maybeSingle: vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                  // Primera llamada: requireAuthUser (admin1)
                  return Promise.resolve({
                    data: {
                      id: admin1Id,
                      clinic_id: 'clinic-uuid-1',
                      role: 'administrador',
                      full_name: 'Dra. María',
                      is_active: true,
                    },
                    error: null,
                  });
                }
                // Segunda llamada: targetUser (admin2)
                return Promise.resolve({
                  data: {
                    id: admin2Id,
                    clinic_id: 'clinic-uuid-1',
                    role: 'administrador',
                    full_name: 'Dr. Segundo Admin',
                    is_active: true,
                  },
                  error: null,
                });
              }),
            };
            return chain;
          },
        }),
      });

      const result = await deactivateUserAction(admin2Id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_active).toBe(false);
      }
      expect(signOutMock).toHaveBeenCalledWith(admin2Id);
    });
  });
});
