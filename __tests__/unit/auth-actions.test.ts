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

import { logoutAction, verifyMfaLoginAction } from '@/lib/actions/auth.actions';

function createMfaClient(signOutError: { message: string } | null) {
  const signOut = vi.fn().mockResolvedValue({ error: signOutError });
  const maybeSingle = vi.fn().mockResolvedValue({
    data: {
      id: '10000000-0000-4000-8000-000000000001',
      clinic_id: '00000000-0000-4000-8000-000000000001',
      role: 'odontologo',
      is_active: true,
    },
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });

  return {
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: '10000000-0000-4000-8000-000000000001' } },
          error: null,
        }),
        signOut,
        mfa: {
          listFactors: vi.fn().mockResolvedValue({
            data: { totp: [{ id: 'factor-1' }] },
            error: null,
          }),
          challenge: vi.fn().mockResolvedValue({
            data: { id: 'challenge-1' },
            error: null,
          }),
          verify: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'invalid totp' },
          }),
        },
      },
      from: vi.fn().mockReturnValue({ select }),
    },
    signOut,
  };
}

describe('acciones de autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rechaza en el boundary un código MFA de seis caracteres no numéricos', async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: { getUser: vi.fn() },
    });

    const result = await verifyMfaLoginAction({ code: 'abcdef' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
    expect(mocks.createServerClient).not.toHaveBeenCalled();
  });

  it('cierra la sesión cuando Supabase rechaza un código TOTP', async () => {
    const { client, signOut } = createMfaClient(null);
    mocks.createServerClient.mockResolvedValue(client);

    const result = await verifyMfaLoginAction({ code: '123456' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('MFA_VERIFICATION_FAILED');
      expect(result.error.statusCode).toBe(401);
    }
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('no afirma que el flujo MFA fue cancelado si Supabase no confirma el sign-out', async () => {
    const { client, signOut } = createMfaClient({ message: 'network error' });
    mocks.createServerClient.mockResolvedValue(client);

    const result = await verifyMfaLoginAction({ code: '123456' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('SIGN_OUT_FAILED');
      expect(result.error.statusCode).toBe(503);
    }
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('no afirma un logout exitoso cuando el proveedor devuelve error', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: { message: 'network error' } });
    mocks.createServerClient.mockResolvedValue({ auth: { signOut } });

    const result = await logoutAction();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('SIGN_OUT_FAILED');
    }
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
