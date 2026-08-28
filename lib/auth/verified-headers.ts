import type { UserRole } from '@/types/domain';

interface VerifiedClaims {
  clinicId: string;
  userId: string;
  role: UserRole;
}

const AUTH_CONTEXT_HEADERS = ['x-clinic-id', 'x-user-id', 'x-user-role'] as const;

/** Elimina cualquier contexto de autorización suministrado por el cliente. */
export function stripUntrustedAuthHeaders(incomingHeaders: Headers): Headers {
  const sanitizedHeaders = new Headers(incomingHeaders);
  for (const header of AUTH_CONTEXT_HEADERS) {
    sanitizedHeaders.delete(header);
  }
  return sanitizedHeaders;
}

/** Clona los headers entrantes y reemplaza cualquier claim inyectado por el cliente. */
export function buildVerifiedRequestHeaders(
  incomingHeaders: Headers,
  claims: VerifiedClaims
): Headers {
  const verifiedHeaders = stripUntrustedAuthHeaders(incomingHeaders);
  verifiedHeaders.set('x-clinic-id', claims.clinicId);
  verifiedHeaders.set('x-user-id', claims.userId);
  verifiedHeaders.set('x-user-role', claims.role);
  return verifiedHeaders;
}
