import { describe, it, expect, vi } from 'vitest';
import { withErrorHandling } from '@/lib/server-action-wrapper';
import {
  TenantIsolationError,
  RoleAuthorizationError,
  UniqueDocumentError,
  InvalidCredentialsError,
  AccountLockedError,
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

  it('debe auditar exactamente una vez los errores de autorización HTTP 403', async () => {
    const recordAuthorizationFailure = vi.fn().mockResolvedValue(undefined);

    const result = await withErrorHandling(
      async () => {
        throw new RoleAuthorizationError();
      },
      {
        securityContext: {
          clinicId: '11111111-1111-4111-8111-111111111111',
          userId: '22222222-2222-4222-8222-222222222222',
          role: 'recepcionista',
          entityType: 'usuario',
          entityId: '33333333-3333-4333-8333-333333333333',
          action: 'update',
        },
        recordAuthorizationFailure,
      }
    );

    expect(result.success).toBe(false);
    expect(recordAuthorizationFailure).toHaveBeenCalledTimes(1);
    expect(recordAuthorizationFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'ROLE_AUTHORIZATION_ERROR',
        action: 'update',
      })
    );
  });

  it('audita automáticamente el contexto transportado por el error 403', async () => {
    const recordAuthorizationFailure = vi.fn().mockResolvedValue(undefined);
    const securityContext = {
      clinicId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
      role: 'recepcionista' as const,
      entityType: 'usuario' as const,
      entityId: '22222222-2222-4222-8222-222222222222',
      action: 'access_denied' as const,
    };
    const authorizationError = Reflect.construct(RoleAuthorizationError, [
      'Acceso denegado',
      securityContext,
    ]) as RoleAuthorizationError;

    const result = await withErrorHandling(
      async () => {
        throw authorizationError;
      },
      { recordAuthorizationFailure }
    );

    expect(result.success).toBe(false);
    expect(recordAuthorizationFailure).toHaveBeenCalledTimes(1);
    expect(recordAuthorizationFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        ...securityContext,
        errorCode: 'ROLE_AUTHORIZATION_ERROR',
      })
    );
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

  it('debe conservar el envelope tipado de credenciales inválidas sin filtrar existencia', async () => {
    const result = await withErrorHandling(async () => {
      throw new InvalidCredentialsError(2);
    });

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Credenciales inválidas. Verifique los datos e intente nuevamente. Quedan 2 intentos.',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
        details: undefined,
      },
    });
  });

  it('debe representar un bloqueo de cuenta como error 423', async () => {
    const result = await withErrorHandling(async () => {
      throw new AccountLockedError(15);
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ACCOUNT_LOCKED');
      expect(result.error.statusCode).toBe(423);
    }
  });
});
