import { ZodError } from 'zod';
import { DentalClinicError, ValidationError } from '@/errors/domain';
import {
  persistAuthorizationFailure,
  type AuthorizationFailureRecorder,
  type AuthorizationSecurityContext,
} from '@/lib/audit/authorization-failure';

export type ServerActionResult<T> =
  | { success: true; data: T; error?: never }
  | {
      success: false;
      error: {
        message: string;
        code: string;
        statusCode: number;
        details?: unknown;
      };
      data?: never;
    };

export interface ErrorHandlingOptions {
  securityContext?: AuthorizationSecurityContext;
  recordAuthorizationFailure?: AuthorizationFailureRecorder;
}

/**
 * Wrapper de alto orden para Server Actions con manejo robusto y seguro de errores.
 * Garantiza que nunca se expongan stack traces o errores internos no controlados al cliente.
 */
export async function withErrorHandling<T>(
  action: () => Promise<T>,
  options?: ErrorHandlingOptions
): Promise<ServerActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (err: unknown) {
    // Manejo de errores de validación de Zod
    if (err instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const field = issue.path.join('.') || 'root';
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      }

      const validationErr = new ValidationError('Los datos enviados no son válidos', fieldErrors);
      return {
        success: false,
        error: {
          message: validationErr.message,
          code: validationErr.code,
          statusCode: validationErr.statusCode,
          details: fieldErrors,
        },
      };
    }

    // Manejo de errores de dominio conocidos
    if (err instanceof DentalClinicError) {
      const securityContext = options?.securityContext ?? err.authorizationContext;
      if (err.statusCode === 403 && securityContext) {
        const recorder = options?.recordAuthorizationFailure ?? persistAuthorizationFailure;
        try {
          await recorder({
            ...securityContext,
            errorCode: err.code,
          });
        } catch (auditError: unknown) {
          console.error('[Authorization Audit Error]:', auditError);
        }
      }

      return {
        success: false,
        error: {
          message: err.message,
          code: err.code,
          statusCode: err.statusCode,
          details:
            'validationErrors' in err
              ? (err as ValidationError).validationErrors
              : 'suggestedSlots' in err
              ? (err as { suggestedSlots?: unknown }).suggestedSlots
              : 'currentVersion' in err
              ? { currentVersion: (err as { currentVersion?: unknown }).currentVersion }
              : undefined,
        },
      };
    }

    // Error interno inesperado (no exponer detalles al cliente)
    console.error('[Unhandled Server Action Error]:', err);
    return {
      success: false,
      error: {
        message: 'Ocurrió un error inesperado al procesar la solicitud en el servidor.',
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
      },
    };
  }
}
