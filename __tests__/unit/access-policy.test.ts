import { describe, expect, it } from 'vitest';
import { decideAccess, isRoleAllowedForPath } from '@/lib/auth/access-policy';

const activeAdmin = {
  id: '11111111-1111-4111-8111-111111111111',
  clinicId: '22222222-2222-4222-8222-222222222222',
  role: 'administrador' as const,
  isActive: true,
  mfaEnabled: true,
};

const activeReceptionist = {
  ...activeAdmin,
  role: 'recepcionista' as const,
};

const activeDentist = {
  ...activeAdmin,
  role: 'odontologo' as const,
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

  it('redirige a una sesión activa desde /login al dashboard para los tres roles', () => {
    for (const [profile, currentAal] of [
      [activeAdmin, 'aal2'],
      [activeDentist, 'aal2'],
      [activeReceptionist, null],
    ] as const) {
      expect(
        decideAccess({
          configurationReady: true,
          pathname: '/login',
          userId: profile.id,
          profile,
          currentAal,
        })
      ).toEqual({ kind: 'redirect', location: '/dashboard' });
    }
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

  it('permite /usuarios solo al administrador', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/usuarios',
        userId: activeAdmin.id,
        profile: activeAdmin,
        currentAal: 'aal2',
      })
    ).toEqual({ kind: 'allow' });

    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/usuarios',
        userId: activeDentist.id,
        profile: activeDentist,
        currentAal: 'aal2',
      })
    ).toEqual({ kind: 'redirect', location: '/dashboard' });
  });

  it('bloquea /reportes al recepcionista pero permite admin y odontólogo', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/reportes/pacientes-atendidos',
        userId: activeReceptionist.id,
        profile: activeReceptionist,
        currentAal: null,
      })
    ).toEqual({ kind: 'redirect', location: '/dashboard' });

    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/reportes',
        userId: activeDentist.id,
        profile: activeDentist,
        currentAal: 'aal2',
      })
    ).toEqual({ kind: 'allow' });
  });

  it('protege la historia clínica del recepcionista', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/pacientes/33333333-3333-4333-8333-333333333333/historia',
        userId: activeReceptionist.id,
        profile: activeReceptionist,
        currentAal: null,
      })
    ).toEqual({ kind: 'redirect', location: '/dashboard' });

    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/pacientes/33333333-3333-4333-8333-333333333333/historia',
        userId: activeDentist.id,
        profile: activeDentist,
        currentAal: 'aal2',
      })
    ).toEqual({ kind: 'allow' });
  });
});

describe('isRoleAllowedForPath', () => {
  it('permite rutas comunes a todos los roles', () => {
    expect(isRoleAllowedForPath('/dashboard', 'recepcionista')).toBe(true);
    expect(isRoleAllowedForPath('/pacientes', 'recepcionista')).toBe(true);
    expect(isRoleAllowedForPath('/citas', 'odontologo')).toBe(true);
  });

  it('restringe configuración y creación de consultorios al administrador', () => {
    expect(isRoleAllowedForPath('/clinica/configuracion', 'administrador')).toBe(true);
    expect(isRoleAllowedForPath('/clinica/nueva', 'administrador')).toBe(true);
    expect(isRoleAllowedForPath('/consultorios', 'administrador')).toBe(true);
    expect(isRoleAllowedForPath('/consultorios', 'odontologo')).toBe(false);
    expect(isRoleAllowedForPath('/consultorios', 'recepcionista')).toBe(false);
    expect(isRoleAllowedForPath('/clinica/configuracion', 'odontologo')).toBe(false);
    expect(isRoleAllowedForPath('/clinica/nueva', 'odontologo')).toBe(false);
    expect(isRoleAllowedForPath('/clinica/configuracion', 'recepcionista')).toBe(false);
    expect(isRoleAllowedForPath('/clinica/nueva', 'recepcionista')).toBe(false);
  });

  it('no aplica reglas a rutas públicas ni auth', () => {
    expect(isRoleAllowedForPath('/login', 'recepcionista')).toBe(true);
    expect(isRoleAllowedForPath('/setup-mfa', 'odontologo')).toBe(true);
  });

  it('redirige la antigua ruta /registro al login si no hay sesión', () => {
    expect(
      decideAccess({
        configurationReady: true,
        pathname: '/registro',
        userId: null,
        profile: null,
        currentAal: null,
      })
    ).toEqual({ kind: 'redirect', location: '/login' });
  });
});
