import { describe, it, expect } from 'vitest';
import { withErrorHandling } from '@/lib/server-action-wrapper';
import {
  TenantIsolationError,
  RoleAuthorizationError,
  UniqueDocumentError,
  AppointmentConflictError,
  ConcurrencyConflictError,
  ValidationError,
  ReportRangeLimitError,
} from '@/errors/domain';
import { z } from 'zod';

describe('withErrorHandling Server Action Wrapper', () => {
  it('debe retornar éxito cuando la acción se completa sin errores', async () => {
    const result = await withErrorHandling(async () => {
      return { id: '123', name: 'Clínica Dental' };
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ id: '123', name: 'Clínica Dental' });
    }
  });

  it('debe formatear errores de validación de Zod adecuadamente', async () => {
    const schema = z.object({
      email: z.string().email('Email inválido'),
      phone: z.string().min(7, 'Teléfono debe tener al menos 7 dígitos'),
    });

    const result = await withErrorHandling(async () => {
      schema.parse({ email: 'no-es-un-email', phone: '123' });
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.statusCode).toBe(422);
      expect(result.error.details).toBeDefined();
      const details = result.error.details as Record<string, string[]>;
      expect(details['email']).toBeDefined();
      expect(details['phone']).toBeDefined();
    }
  });

  it('debe manejar errores de dominio como TenantIsolationError', async () => {
    const result = await withErrorHandling(async () => {
      throw new TenantIsolationError();
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('TENANT_ISOLATION_ERROR');
      expect(result.error.statusCode).toBe(403);
    }
  });

  it('debe manejar errores de dominio como UniqueDocumentError', async () => {
    const result = await withErrorHandling(async () => {
      throw new UniqueDocumentError(
        'Documento ya existe',
        'Juan Pérez',
        'p-001'
      );
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('UNIQUE_DOCUMENT_ERROR');
      expect(result.error.statusCode).toBe(409);
    }
  });

  it('debe ocultar detalles de errores no controlados (Internal Server Error)', async () => {
    const result = await withErrorHandling(async () => {
      throw new Error('Database connection failed with credentials: secret-pass');
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.error.statusCode).toBe(500);
      expect(result.error.message).not.toContain('secret-pass');
    }
  });
});
