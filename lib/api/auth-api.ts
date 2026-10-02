import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/domain';

/**
 * Cliente HTTP del módulo de autenticación/MFA en Python (FastAPI).
 *
 * Mantiene el mismo contrato que las antiguas Server Actions
 * (ServerActionResult) y sincroniza la sesión del navegador vía supabase-js
 * para que el middleware (proxy.ts) siga leyendo las cookies de Supabase.
 *
 * Flujo de sesión:
 * 1. La API devuelve tokens tras login/verify → se persisten con setSession().
 * 2. Tras verify MFA, la sesión nueva ya trae AAL2 (clave para proxy.ts).
 * 3. Si la API confirma cierre de sesión (MFA_VERIFICATION_FAILED, logout,
 *    cancel), el navegador también limpia su sesión local.
 */

const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:8000';

export type ApiResult<T> =
  | { success: true; data: T; error?: never }
  | {
      success: false;
      error: { message: string; code: string; statusCode: number };
      data?: never;
    };

interface SessionPayload {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  redirectTo: string;
  role: UserRole;
  clinicId: string;
  userId: string;
  fullName: string;
  mfaRequired: boolean;
  session?: SessionPayload | null;
}

export interface EnrollMfaResult {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
}

export interface MfaVerifyResult {
  success: boolean;
  redirectTo: string;
  session?: SessionPayload | null;
}

async function callApi<T>(
  path: string,
  body: unknown,
  withSession: boolean
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (withSession) {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return {
        success: false,
        error: {
          message: 'Debe iniciar sesión nuevamente.',
          code: 'AUTHENTICATION_REQUIRED',
          statusCode: 401,
        },
      };
    }
    headers['Authorization'] = `Bearer ${session.access_token}`;
    headers['x-refresh-token'] = session.refresh_token;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    return {
      success: false,
      error: {
        message: 'No fue posible conectar con el servidor de autenticación.',
        code: 'NETWORK_ERROR',
        statusCode: 503,
      },
    };
  }

  const payload = (await response.json().catch(() => null)) as ApiResult<T> | null;
  if (!payload || typeof payload.success !== 'boolean') {
    return {
      success: false,
      error: {
        message: 'Respuesta inválida del servidor de autenticación.',
        code: 'INVALID_RESPONSE',
        statusCode: 502,
      },
    };
  }
  return payload;
}

/** Persiste los tokens devueltos por la API en la sesión del navegador (cookies). */
async function syncBrowserSession(session?: SessionPayload | null): Promise<void> {
  if (!session) return;
  const supabase = createClient();
  await supabase.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
}

/** La API ya cerró la sesión en el servidor; el navegador limpia la suya. */
async function clearBrowserSession(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function loginAction(formData: {
  email: string;
  password: string;
}): Promise<ApiResult<LoginResult>> {
  const result = await callApi<LoginResult>('/auth/login', formData, false);
  if (result.success) {
    await syncBrowserSession(result.data.session);
  }
  return result;
}

export async function logoutAction(): Promise<ApiResult<{ success: boolean }>> {
  const result = await callApi<{ success: boolean }>('/auth/logout', {}, true);
  if (result.success) {
    await clearBrowserSession();
  }
  return result;
}

export async function enrollMfaAction(): Promise<ApiResult<EnrollMfaResult>> {
  return callApi<EnrollMfaResult>('/mfa/enroll', {}, true);
}

export async function verifyMfaSetupAction(formData: {
  factorId: string;
  code: string;
}): Promise<ApiResult<MfaVerifyResult>> {
  const result = await callApi<MfaVerifyResult>('/mfa/verify-setup', formData, true);
  if (result.success) {
    await syncBrowserSession(result.data.session);
  } else if (result.error.code === 'MFA_VERIFICATION_FAILED') {
    await clearBrowserSession();
  }
  return result;
}

export async function verifyMfaLoginAction(formData: {
  code: string;
}): Promise<ApiResult<MfaVerifyResult>> {
  const result = await callApi<MfaVerifyResult>('/mfa/verify-login', formData, true);
  if (result.success) {
    await syncBrowserSession(result.data.session);
  } else if (result.error.code === 'MFA_VERIFICATION_FAILED') {
    await clearBrowserSession();
  }
  return result;
}

export async function cancelMfaAction(): Promise<ApiResult<{ success: boolean }>> {
  const result = await callApi<{ success: boolean }>('/mfa/cancel', {}, true);
  await clearBrowserSession();
  return result;
}
