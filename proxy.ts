import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  decideAccess,
  isUnauthenticatedError,
  type AccessProfile,
  type AuthenticatorAssuranceLevel,
} from '@/lib/auth/access-policy';
import {
  buildVerifiedRequestHeaders,
  stripUntrustedAuthHeaders,
} from '@/lib/auth/verified-headers';
import type { UserRole } from '@/types/domain';

const USER_ROLES = new Set<UserRole>(['administrador', 'odontologo', 'recepcionista']);

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.has(value as UserRole);
}

function copyResponseCookies(source: NextResponse, target: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}

function createRedirect(
  request: NextRequest,
  location: '/login' | '/dashboard' | '/setup-mfa' | '/verify-mfa',
  cookieSource: NextResponse
): NextResponse {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = location;
  redirectUrl.search = '';
  if (location === '/login' && request.nextUrl.pathname !== '/login') {
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
  }
  return copyResponseCookies(cookieSource, NextResponse.redirect(redirectUrl));
}

function unavailableResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: 'AUTH_CONFIGURATION_UNAVAILABLE',
        message: 'El servicio de autenticación no está disponible temporalmente.',
      },
    },
    { status: 503 }
  );
}

/**
 * Actualiza la sesión Supabase y aplica autorización por perfil activo y AAL.
 * Nunca usa user_metadata como fuente de tenant, rol o estado MFA.
 */
export async function proxy(request: NextRequest) {
  const sanitizedHeaders = stripUntrustedAuthHeaders(request.headers);

  // El health check mide disponibilidad del proceso web, no de Supabase Auth.
  if (request.nextUrl.pathname === '/api/health') {
    return NextResponse.next({ request: { headers: sanitizedHeaders } });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configurationReady = Boolean(supabaseUrl && supabaseAnonKey);

  if (!configurationReady || !supabaseUrl || !supabaseAnonKey) {
    return unavailableResponse();
  }

  let sessionResponse = NextResponse.next({
    request: { headers: sanitizedHeaders },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        sessionResponse = NextResponse.next({
          request: { headers: sanitizedHeaders },
        });
        for (const { name, value, options } of cookiesToSet) {
          sessionResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError && !isUnauthenticatedError(userError)) {
    return copyResponseCookies(sessionResponse, unavailableResponse());
  }

  let profile: AccessProfile | null = null;
  let currentAal: AuthenticatorAssuranceLevel = null;

  if (user) {
    const { data: rawProfile, error: profileError } = await supabase
      .from('users')
      .select('id, clinic_id, role, is_active, mfa_enabled')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return copyResponseCookies(sessionResponse, unavailableResponse());
    }

    if (
      rawProfile &&
      typeof rawProfile.id === 'string' &&
      typeof rawProfile.clinic_id === 'string' &&
      isUserRole(rawProfile.role)
    ) {
      profile = {
        id: rawProfile.id,
        clinicId: rawProfile.clinic_id,
        role: rawProfile.role,
        isActive: rawProfile.is_active === true,
        mfaEnabled: rawProfile.mfa_enabled === true,
      };
    }

    const { data: aal, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalError) {
      return copyResponseCookies(sessionResponse, unavailableResponse());
    }
    const aalValue: unknown = aal.currentLevel;
    currentAal = aalValue === 'aal1' || aalValue === 'aal2' ? aalValue : null;
  }

  const decision = decideAccess({
    configurationReady,
    pathname: request.nextUrl.pathname,
    userId: user?.id ?? null,
    profile,
    currentAal,
  });

  if (decision.kind === 'unavailable') {
    return copyResponseCookies(sessionResponse, unavailableResponse());
  }

  if (decision.kind === 'redirect') {
    if (user && (!profile || !profile.isActive)) {
      await supabase.auth.signOut();
    }
    return createRedirect(request, decision.location, sessionResponse);
  }

  const requestHeaders = profile
    ? buildVerifiedRequestHeaders(sanitizedHeaders, {
        clinicId: profile.clinicId,
        userId: profile.id,
        role: profile.role,
      })
    : sanitizedHeaders;

  return copyResponseCookies(
    sessionResponse,
    NextResponse.next({ request: { headers: requestHeaders } })
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
