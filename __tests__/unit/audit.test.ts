import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuditLog } from '@/lib/audit';
import * as adminSupabase from '@/lib/supabase/admin';
import type { AuditRecord } from '@/types/domain';

describe('createAuditLog', () => {
  const insertMock = vi.fn();
  const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(adminSupabase, 'createAdminClient').mockReturnValue({
      from: fromMock,
    } as any);
  });

  it('debe registrar un evento de auditoría con los 9 campos obligatorios', async () => {
    insertMock.mockResolvedValue({ error: null });

    const auditParams: AuditRecord = {
      clinic_id: '11111111-1111-4111-8111-111111111111',
      user_id: '22222222-2222-4222-8222-222222222222',
      role: 'administrador',
      entity_type: 'consultorio',
      entity_id: '11111111-1111-4111-8111-111111111111',
      action: 'update',
      result: 'success',
      metadata: { field: 'name' },
    };

    await createAuditLog(auditParams);

    expect(fromMock).toHaveBeenCalledWith('audit_logs');
    expect(insertMock).toHaveBeenCalledTimes(1);

    const inserted = insertMock.mock.calls[0][0];
    expect(inserted.id).toBeDefined();
    expect(inserted.clinic_id).toBe(auditParams.clinic_id);
    expect(inserted.user_id).toBe(auditParams.user_id);
    expect(inserted.role).toBe('administrador');
    expect(inserted.entity_type).toBe('consultorio');
    expect(inserted.entity_id).toBe(auditParams.entity_id);
    expect(inserted.action).toBe('update');
    expect(inserted.timestamp).toBeDefined();
    expect(inserted.result).toBe('success');
    expect(inserted.metadata).toEqual({ field: 'name' });
  });

  it('debe lanzar un error si la inserción en audit_logs falla', async () => {
    insertMock.mockResolvedValue({ error: { message: 'Database error' } });

    const auditParams: AuditRecord = {
      clinic_id: '11111111-1111-4111-8111-111111111111',
      user_id: '22222222-2222-4222-8222-222222222222',
      role: 'odontologo',
      entity_type: 'historia_clinica',
      entity_id: '33333333-3333-4333-8333-333333333333',
      action: 'create',
      result: 'failure',
    };

    await expect(createAuditLog(auditParams)).rejects.toThrow(
      'No se pudo registrar la entrada de auditoría'
    );
  });
});
