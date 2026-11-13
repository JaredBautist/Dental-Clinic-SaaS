import type { UserRole } from '@/types/domain';

export type AuthenticatorAssuranceLevel = 'aal1' | 'aal2' | null;

interface AuthenticationErrorLike {
  name?: string;
  status?: number;
}

export interface AccessProfile {
  id: string;
  clinicId: string;
  role: UserRole;
  isActive: boolean;
  mfaEnabled: boolean;
}

export interface AccessInput {
  configurationReady: boolean;
  pathname: string;
  userId: string | null;
  profile: AccessProfile | null;
  currentAal: AuthenticatorAssuranceLevel;
}

export type AccessDecision =
  | { kind: 'allow' }
  | { kind: 'redirect'; location: '/login' | '/dashboard' | '/setup-mfa' | '/verify-mfa' }
  | { kind: 'unavailable'; status: 503 };

const PUBLIC_PATHS = new Set(['/', '/login', '/api/health']);

interface RouteRoleRule {
  match: (pathname: string) => boolean;
  roles: UserRole[];
}

/**
 * Reglas de autorización por ruta (menor privilegio).
 * Se evalúan después de autenticación y MFA; una violación redirige a /dashboard.
 */
const ROUTE_ROLE_RULES: RouteRoleRule[] = [
  {
    match: (p) => p === '/usuarios' || p.startsWith('/usuarios/'),
    roles: ['administrador'],
  },
  {
    match: (p) => p === '/clinica' || p.startsWith('/clinica/'),
    roles: ['administrador'],
  },
  {
    match: (p) => p === '/consultorios' || p.startsWith('/consultorios/'),
    roles: ['administrador'],
  },
  {
    match: (p) => p === '/auditoria' || p.startsWith('/auditoria/'),
    roles: ['administrador'],
  },
  {
    match: (p) => p === '/reportes' || p.startsWith('/reportes/'),
    roles: ['administrador', 'odontologo'],
  },
  {
    match: (p) => /^\/pacientes\/[^/]+\/historia(\/|$)/.test(p),
    roles: ['administrador', 'odontologo'],
  },
];

/** Indica si el rol puede acceder a la ruta según las reglas del sistema. */
export function isRoleAllowedForPath(pathname: string, role: UserRole): boolean {
  for (const rule of ROUTE_ROLE_RULES) {
    if (rule.match(pathname) && !rule.roles.includes(role)) {
      return false;
    }
  }
  return true;
}

/** Distingue una sesión ausente/inválida de una indisponibilidad de Supabase Auth. */
export function isUnauthenticatedError(error: AuthenticationErrorLike | null): boolean {
  if (!error) return false;
  if (error.name === 'AuthSessionMissingError') return true;
  return error.status === 400 || error.status === 401 || error.status === 403;
}

function isClinicalRole(role: UserRole): boolean {
  return role === 'administrador' || role === 'odontologo';
}

function clinicalMfaDestination(
  profile: AccessProfile,
  currentAal: AuthenticatorAssuranceLevel
): '/setup-mfa' | '/verify-mfa' | null {
  if (!isClinicalRole(profile.role)) return null;
  if (!profile.mfaEnabled) return '/setup-mfa';
  if (currentAal !== 'aal2') return '/verify-mfa';
  return null;
}

/**
 * Decide el acceso observable para una ruta sin depender de Next.js ni Supabase.
 * Los perfiles inactivos, inconsistentes o sin configuración fallan de forma cerrada.
 */
export function decideAccess(input: AccessInput): AccessDecision {
  if (!input.configurationReady) {
    return { kind: 'unavailable', status: 503 };
  }

  const isPublicPath = PUBLIC_PATHS.has(input.pathname);
  if (
    input.userId === null ||
    input.profile === null ||
    input.profile.id !== input.userId ||
    !input.profile.isActive
  ) {
    return isPublicPath
      ? { kind: 'allow' }
      : { kind: 'redirect', location: '/login' };
  }

  const profile = input.profile;
  const mfaDestination = clinicalMfaDestination(profile, input.currentAal);

  if (input.pathname === '/setup-mfa') {
    if (!isClinicalRole(profile.role)) {
      return { kind: 'redirect', location: '/dashboard' };
    }
    if (!profile.mfaEnabled) return { kind: 'allow' };
    return input.currentAal === 'aal2'
      ? { kind: 'redirect', location: '/dashboard' }
      : { kind: 'redirect', location: '/verify-mfa' };
  }

  if (input.pathname === '/verify-mfa') {
    if (!isClinicalRole(profile.role)) {
      return { kind: 'redirect', location: '/dashboard' };
    }
    if (!profile.mfaEnabled) {
      return { kind: 'redirect', location: '/setup-mfa' };
    }
    return input.currentAal === 'aal2'
      ? { kind: 'redirect', location: '/dashboard' }
      : { kind: 'allow' };
  }

  if (input.pathname === '/' || input.pathname === '/login') {
    return {
      kind: 'redirect',
      location: mfaDestination ?? '/dashboard',
    };
  }

  if (mfaDestination) {
    return { kind: 'redirect', location: mfaDestination };
  }

  if (!isRoleAllowedForPath(input.pathname, profile.role)) {
    return { kind: 'redirect', location: '/dashboard' };
  }

  return { kind: 'allow' };
}
