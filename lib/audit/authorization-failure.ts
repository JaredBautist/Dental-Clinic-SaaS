import { createAdminClient } from '@/lib/supabase/admin';
import type { AuthorizationSecurityContext } from '@/types/domain';

export type { AuthorizationSecurityContext } from '@/types/domain';

export interface AuthorizationFailureEvent extends AuthorizationSecurityContext {
  errorCode: string;
}

export type AuthorizationFailureRecorder = (
  event: AuthorizationFailureEvent
) => Promise<void>;

/** Persiste un rechazo de autorización sin exponer el service role al cliente. */
export const persistAuthorizationFailure: AuthorizationFailureRecorder = async (event) => {
  const admin = createAdminClient();
  const { error } = await admin.from('audit_logs').insert({
    clinic_id: event.clinicId,
    user_id: event.userId,
    role: event.role,
    entity_type: event.entityType,
    entity_id: event.entityId,
    action: event.action,
    result: 'failure',
    metadata: { error_code: event.errorCode },
  });

  if (error) {
    throw new Error('No se pudo persistir el rechazo de autorización');
  }
};
