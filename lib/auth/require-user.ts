import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { DentalClinicError, RoleAuthorizationError } from '@/errors/domain';
import type { UserRole, AuditEntityType, AuditAction } from '@/types/domain';

export interface AuthenticatedUserContext {
  userId: string;
  clinicId: string;
  role: UserRole;
  fullName: string;
  isActive: boolean;
}

const VALID_ROLES = new Set<UserRole>(['administrador', 'odontologo', 'recepcionista']);

/**
 * Obtiene el usuario autenticado actual y su perfil en la base de datos.
 * Lanza error 401 si no hay sesión o el perfil no es válido.
 */
export async function requireAuthUser(): Promise<AuthenticatedUserContext> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new DentalClinicError('Debe iniciar sesión nuevamente.', 'AUTHENTICATION_REQUIRED', 401);
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, clinic_id, role, full_name, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (
    error ||
    !profile ||
    typeof profile.id !== 'string' ||
    typeof profile.clinic_id !== 'string' ||
    !VALID_ROLES.has(profile.role as UserRole)
  ) {
    throw new DentalClinicError('Perfil de usuario no encontrado o inválido.', 'INVALID_USER_PROFILE', 401);
  }

  if (!profile.is_active) {
    throw new DentalClinicError('La cuenta de usuario está desactivada.', 'USER_INACTIVE', 403);
  }

  return {
    userId: profile.id,
    clinicId: profile.clinic_id,
    role: profile.role as UserRole,
    fullName: profile.full_name ?? '',
    isActive: profile.is_active,
  };
}

/**
 * Valida que el usuario autenticado posea uno de los roles permitidos (RBAC).
 * En caso contrario, lanza RoleAuthorizationError con contexto de auditoría para registro automático.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  entityType: AuditEntityType = 'usuario',
  entityId: string = '',
  action: AuditAction = 'access_denied'
): Promise<AuthenticatedUserContext> {
  const authUser = await requireAuthUser();

  if (!allowedRoles.includes(authUser.role)) {
    throw new RoleAuthorizationError(
      `Acceso denegado: El rol '${authUser.role}' no tiene permisos para realizar esta operación`,
      {
        clinicId: authUser.clinicId,
        userId: authUser.userId,
        role: authUser.role,
        entityType,
        entityId: entityId || authUser.userId,
        action,
      }
    );
  }

  return authUser;
}
