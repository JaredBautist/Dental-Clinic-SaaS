import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuditLog } from '@/lib/audit';
import { getPlatformUserEmailAction, updatePlatformCredentialsAction } from '@/lib/platform/user-credentials.actions';

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

describe('platform user credentials', () => {
  const clinicId = '11111111-1111-4111-8111-111111111111';
  const userId = '22222222-2222-4222-8222-222222222222';
  const target = { clinicId, userId };
  const getUserById = vi.fn();
  const updateUserById = vi.fn();
  function setup(member = true, platform = true) {
    mockSignedIn('administrador', platform);
    const filters: Record<string, string> = {};
    const query = {
      select: vi.fn().mockReturnThis(),
      eq(key: string, value: string) { filters[key] = value; return this; },
      maybeSingle: async () => ({ data: member && filters.id === userId && filters.clinic_id === clinicId ? { id: userId } : null }),
    };
    mocks.createAdminClient.mockReturnValue({ from: () => query, auth: { admin: { getUserById, updateUserById } } });
    getUserById.mockResolvedValue({ data: { user: { email: 'old@example.org', privateField: 'private' } } });
    updateUserById.mockResolvedValue({ error: null });
  }
  beforeEach(() => vi.clearAllMocks());
  it('reads only the email of the selected clinic member', async () => {
    setup();
    expect(await getPlatformUserEmailAction(target)).toEqual({ success: true, data: 'old@example.org' });
  });
  it.each([[false,true], [true,false]])('denies both operations for member=%s platform=%s', async (member, platform) => {
    setup(member, platform);
    expect((await getPlatformUserEmailAction(target)).success).toBe(false);
    expect((await updatePlatformCredentialsAction({ ...target, email: 'new@example.org' })).success).toBe(false);
    expect(getUserById).not.toHaveBeenCalled();
    expect(updateUserById).not.toHaveBeenCalled();
  });
  it.each([
    [{ email: 'new@example.org' }, { email: 'new@example.org', email_confirm: true }],
    [{ password: 'synthetic-test' }, { password: 'synthetic-test' }],
    [{ email: 'new@example.org', password: 'synthetic-test' }, { email: 'new@example.org', email_confirm: true, password: 'synthetic-test' }],
  ])('sends exactly the requested credential changes', async (input, expected) => {
    setup();
    expect((await updatePlatformCredentialsAction({ ...target, ...input })).success).toBe(true);
    expect(updateUserById).toHaveBeenCalledWith(userId, expected);
    expect(JSON.stringify(vi.mocked(createAuditLog).mock.calls)).not.toMatch(/synthetic-test|new@example.org/);
  });
  it.each([{}, { password: 'short' }, { email: 'bad' }])('rejects invalid or empty updates', async (input) => {
    setup();
    expect((await updatePlatformCredentialsAction({ ...target, ...input })).success).toBe(false);
    expect(updateUserById).not.toHaveBeenCalled();
  });
  it.each(['odontologo', 'recepcionista'] as const)('blocks credential access for %s', async role => {
    setup();
    mockSignedIn(role);
    expect((await getPlatformUserEmailAction(target)).error?.statusCode).toBe(403);
    expect((await updatePlatformCredentialsAction({ ...target, password: 'synthetic-test' })).error?.statusCode).toBe(403);
    expect(getUserById).not.toHaveBeenCalled();
    expect(updateUserById).not.toHaveBeenCalled();
  });
  it('reports a failed email lookup', async () => {
    setup();
    getUserById.mockResolvedValue({ data: { user: null }, error: { code: 'user_not_found' } });
    expect((await getPlatformUserEmailAction(target)).error?.code).toBe('EMAIL_FETCH_FAILED');
  });
  it('distinguishes a committed update from an audit failure', async () => {
    setup();
    vi.mocked(createAuditLog).mockRejectedValueOnce(new Error('audit unavailable'));
    expect((await updatePlatformCredentialsAction({ ...target, password: 'synthetic-test' })).error?.code).toBe('CREDENTIAL_AUDIT_FAILED');
    expect(updateUserById).toHaveBeenCalledTimes(1);
  });
  it('explains duplicate email without returning provider details', async () => {
    setup();
    updateUserById.mockResolvedValue({ error: { code: 'email_exists', message: 'private detail' } });
    expect((await updatePlatformCredentialsAction({ ...target, email: 'new@example.org' })).error?.code).toBe('EMAIL_IN_USE');
  });
});
