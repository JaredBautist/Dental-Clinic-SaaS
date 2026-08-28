import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/setup-mfa') ||
    pathname.startsWith('/verify-mfa');
  const isApiRoute = pathname.startsWith('/api/');
  const isPublicRoute = isAuthRoute || isApiRoute || pathname === '/';

  // Si no hay usuario autenticado y trata de acceder a una ruta protegida
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si hay usuario autenticado, procesar claims y MFA
  if (user) {
    // Si ya está autenticado e intenta entrar a /login, redirigir a /dashboard
    if (pathname === '/login') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    const appMetadata = user.app_metadata || {};
    const userMetadata = user.user_metadata || {};
    const clinicId = (appMetadata.clinic_id || userMetadata.clinic_id || '') as string;
    const role = (appMetadata.role || userMetadata.role || 'recepcionista') as string;
    const mfaCompleted = Boolean(appMetadata.mfa_completed ?? userMetadata.mfa_completed);
    const mfaRequired = role === 'administrador' || role === 'odontologo';

    // Inyectar claims verificables en headers para Server Components
    response.headers.set('x-clinic-id', clinicId);
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', role);

    // Validación de MFA obligatoria para admin y odontólogo
    if (mfaRequired && !mfaCompleted && !isAuthRoute && !isApiRoute) {
      const mfaSetupUrl = request.nextUrl.clone();
      mfaSetupUrl.pathname = '/setup-mfa';
      return NextResponse.redirect(mfaSetupUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     * - extensiones de imágenes o estáticos comunes (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
