import { createAdminClient } from '@/lib/supabase/admin';
import type { AuditRecord } from '@/types/domain';

/**
 * Función centralizada para registrar eventos de auditoría inmutables en `audit_logs`.
 * Utiliza el cliente administrativo con `service_role` para asegurar el registro
 * independientemente del contexto RLS del usuario.
 * Garantiza los 9 campos obligatorios del requisito 8.4:
 * id, clinic_id, user_id, role, entity_type, entity_id, action, timestamp, result.
 */
export async function createAuditLog(params: AuditRecord): Promise<void> {
  const admin = createAdminClient();
  const record = {
    id: params.id ?? crypto.randomUUID(),
    clinic_id: params.clinic_id,
    user_id: params.user_id,
    role: params.role,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    action: params.action,
    timestamp: params.timestamp ?? new Date().toISOString(),
    result: params.result,
    metadata: params.metadata ?? {},
  };

  const { error } = await admin.from('audit_logs').insert(record);
  if (error) {
    console.error('[AuditLog Error]:', error);
    throw new Error('No se pudo registrar la entrada de auditoría');
  }
}
