import { DentalClinicError } from '@/errors/domain';
import { requireRole, type AuthenticatedUserContext } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export async function hasPlatformAccess(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('has_platform_access');
  return !error && data === true;
}

export async function requirePlatformAccess(): Promise<AuthenticatedUserContext> {
  const actor = await requireRole(['administrador'], 'consultorio');
  if (!await hasPlatformAccess()) {
    throw new DentalClinicError('Se requiere acceso de plataforma con MFA.', 'PLATFORM_ACCESS_REQUIRED', 403);
  }
  return actor;
}

export async function requireClinicAdminScope(actor: AuthenticatedUserContext, clinicId: string) {
  if (actor.clinicId !== clinicId && !await hasPlatformAccess()) {
    throw new DentalClinicError('Ese consultorio está fuera de tu alcance.', 'CLINIC_SCOPE_FORBIDDEN', 403);
  }
}
