import { describe, expect, it } from 'vitest';
import { decideAccess } from '@/lib/auth/access-policy';

const activeAdmin = {
  id: '11111111-1111-4111-8111-111111111111',
  clinicId: '22222222-2222-4222-8222-222222222222',
  role: 'administrador' as const,
  isActive: true,
  mfaEnabled: true,
};

describe('decideAccess', () => {
  it('falla cerrado cuando falta configuración de Supabase', () => {
    expect(
      decideAccess({
        configurationReady: false,
        pathname: '/dashboard',
        userId: null,
        profile: null,
        currentAal: null,
      })
    ).toEqual({ kind: 'unavailable', status: 503 });
  });

  it('protege APIs distintas del health check', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/api/storage/signed-url',
        userId: null,
        profile: null,
        currentAal: null,
      })
    ).toEqual({ kind: 'redirect', location: '/login' });
  });

  it('envía a setup cuando un rol clínico todavía no configuró MFA', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/dashboard',
        userId: activeAdmin.id,
        profile: { ...activeAdmin, mfaEnabled: false },
        currentAal: 'aal1',
      })
    ).toEqual({ kind: 'redirect', location: '/setup-mfa' });
  });

  it('exige verificación cuando un rol clínico tiene MFA pero la sesión está en AAL1', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/dashboard',
        userId: activeAdmin.id,
        profile: activeAdmin,
        currentAal: 'aal1',
      })
    ).toEqual({ kind: 'redirect', location: '/verify-mfa' });
  });

  it('permite una ruta protegida únicamente después de alcanzar AAL2', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/dashboard',
        userId: activeAdmin.id,
        profile: activeAdmin,
        currentAal: 'aal2',
      })
    ).toEqual({ kind: 'allow' });
  });

  it('rechaza perfiles inactivos aunque exista una sesión válida', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/dashboard',
        userId: activeAdmin.id,
        profile: { ...activeAdmin, isActive: false },
        currentAal: 'aal2',
      })
    ).toEqual({ kind: 'redirect', location: '/login' });
  });
});
