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

import {
  getAdminClinicDetailAction,
  listAdminClinicsAction,
  updateAdminClinicUserAction,
} from '@/lib/actions/admin-clinics.actions';

function mockSignedIn(role: 'administrador' | 'odontologo' | 'recepcionista', platform = true) {
  mocks.createServerClient.mockResolvedValue({
    rpc: vi.fn().mockResolvedValue({ data: platform, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'actor-uuid-1' } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'actor-uuid-1',
              clinic_id: 'actor-clinic-uuid-1',
              role,
              full_name: 'Actor de prueba',
              is_active: true,
              mfa_enabled: true,
            },
            error: null,
          }),
        }),
      }),
    }),
  });
}

describe('Administración de consultorios y su personal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista los consultorios existentes para el administrador', async () => {
    mockSignedIn('administrador');
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'clinic-uuid-1',
          name: 'Clínica Dental Central',
          address: 'Calle 1',
          phone: '3100000000',
          email: 'central@example.com',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
      error: null,
    });
    mocks.createAdminClient.mockReturnValue({
      from: () => ({ select: () => ({ order }) }),
    });

    const result = await listAdminClinicsAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('Clínica Dental Central');
    }
    expect(order).toHaveBeenCalledWith('name');
  });

  it('limita el listado de un administrador local a su consultorio', async () => {
    mockSignedIn('administrador', false);
    const eq = vi.fn().mockReturnThis();
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    mocks.createAdminClient.mockReturnValue({ from: () => ({ select: () => ({ eq, order }) }) });
    expect((await listAdminClinicsAction()).success).toBe(true);
    expect(eq).toHaveBeenCalledWith('id', 'actor-clinic-uuid-1');
    const detail = await getAdminClinicDetailAction('11111111-1111-4111-8111-111111111111');
    expect(detail.error?.code).toBe('CLINIC_SCOPE_FORBIDDEN');
  });

  it('impide a otros roles consultar el detalle administrativo', async () => {
    mockSignedIn('recepcionista');

    const result = await getAdminClinicDetailAction('11111111-1111-4111-8111-111111111111');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.statusCode).toBe(403);
      expect(result.error.code).toBe('ROLE_AUTHORIZATION_ERROR');
    }
  });

  it('no permite desactivar al último administrador activo del consultorio', async () => {
    mockSignedIn('administrador');
    const clinicId = '11111111-1111-4111-8111-111111111111';
    const userId = '22222222-2222-4222-8222-222222222222';

    mocks.createAdminClient.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: userId,
                  clinic_id: clinicId,
                  role: 'administrador',
                  is_active: true,
                },
                error: null,
              }),
              eq: () => Promise.resolve({ count: 1, error: null }),
            }),
          }),
        }),
      }),
    });

    const result = await updateAdminClinicUserAction({
      clinicId,
      userId,
      isActive: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.statusCode).toBe(400);
      expect(result.error.code).toBe('CANNOT_DEMOTE_LAST_ADMIN');
    }
  });
});
