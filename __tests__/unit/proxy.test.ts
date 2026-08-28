import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { proxy } from '@/proxy';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

const mockedCreateServerClient = vi.mocked(createServerClient);

function mockGetUserResult(error: { name: string; status: number } | null) {
  mockedCreateServerClient.mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error,
      }),
    },
  } as never);
}

describe('proxy de autenticación', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('permite abrir login cuando Supabase informa que no existe sesión', async () => {
    mockGetUserResult({ name: 'AuthSessionMissingError', status: 400 });

    const response = await proxy(new NextRequest('http://localhost/login'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirige una ruta protegida cuando la sesión expiró o fue revocada', async () => {
    mockGetUserResult({ name: 'AuthApiError', status: 403 });

    const response = await proxy(new NextRequest('http://localhost/dashboard'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost/login?redirectTo=%2Fdashboard'
    );
  });

  it('falla cerrado con 503 ante una caída real del servicio de autenticación', async () => {
    mockGetUserResult({ name: 'AuthRetryableFetchError', status: 0 });

    const response = await proxy(new NextRequest('http://localhost/dashboard'));

    expect(response.status).toBe(503);
  });
});
