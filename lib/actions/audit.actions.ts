'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { DentalClinicError } from '@/errors/domain';
import type { AuditEntityType, AuditResult, UserRole } from '@/types/domain';

export interface AuditLogEntry {
  id: string;
  clinic_id: string;
  user_id: string;
  role: UserRole;
  entity_type: AuditEntityType;
  entity_id: string;
  action: string;
  timestamp: string;
  result: AuditResult;
  metadata?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  entityType?: AuditEntityType;
  result?: AuditResult;
  limit?: number;
}

const auditFiltersSchema = z.object({
  entityType: z
    .enum(['consultorio', 'usuario', 'paciente', 'cita', 'historia_clinica', 'odontograma'])
    .optional(),
  result: z.enum(['success', 'failure']).optional(),
  limit: z.number().int().min(1).max(500).default(200),
});

/**
 * Server Action: Consulta de los registros de auditoría del consultorio.
 * Requisitos: 8.4, 8.5 — Solo 'administrador' (RLS audit_logs_select_admin).
 */
export async function getAuditLogsAction(
  filters?: AuditLogFilters
): Promise<ServerActionResult<AuditLogEntry[]>> {
  return withErrorHandling(async () => {
    const input = auditFiltersSchema.parse(filters ?? {});
    const authUser = await requireRole(['administrador'], 'consultorio');
    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('clinic_id', authUser.clinicId)
      .order('timestamp', { ascending: false })
      .limit(input.limit);

    if (input.entityType) {
      query = query.eq('entity_type', input.entityType);
    }
    if (input.result) {
      query = query.eq('result', input.result);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw new DentalClinicError(
        'Error al consultar los registros de auditoría.',
        'AUDIT_LOGS_FETCH_FAILED',
        500
      );
    }

    return (logs ?? []) as AuditLogEntry[];
  });
}
