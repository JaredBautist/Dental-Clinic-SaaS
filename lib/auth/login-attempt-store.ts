import { createHash } from 'node:crypto';

interface RpcError {
  message: string;
}

interface RpcResult {
  data: unknown;
  error: RpcError | null;
}

export type RpcInvoker = (
  functionName: string,
  parameters: Record<string, unknown>
) => PromiseLike<RpcResult>;

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
}

export interface FailedAttemptStatus extends LockoutStatus {
  attemptsLeft: number;
  triggeredLockout: boolean;
}

interface LockoutRow {
  is_locked: boolean;
  remaining_seconds: number;
}

interface FailedAttemptRow extends LockoutRow {
  attempts_left: number;
  triggered_lockout: boolean;
}

function firstRow<T>(data: unknown, operation: string): T {
  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error(`Respuesta inválida al ${operation}`);
  }
  return data[0] as T;
}

function assertRpcSucceeded(result: RpcResult, operation: string): void {
  if (result.error) {
    throw new Error(`No se pudo ${operation}`);
  }
}

/** Convierte un email normalizado en un identificador irreversible para el rate limit. */
export function hashLoginIdentifier(identifier: string): string {
  return createHash('sha256').update(identifier.trim().toLowerCase(), 'utf8').digest('hex');
}

/** Adapter de persistencia para las RPC atómicas de intentos de login. */
export function createLoginAttemptStore(rpc: RpcInvoker) {
  return {
    async check(identifier: string): Promise<LockoutStatus> {
      const result = await rpc('check_login_lockout', {
        p_identifier_hash: hashLoginIdentifier(identifier),
      });
      assertRpcSucceeded(result, 'verificar el límite de intentos de autenticación');
      const row = firstRow<LockoutRow>(
        result.data,
        'verificar el límite de intentos de autenticación'
      );
      return {
        isLocked: row.is_locked,
        remainingSeconds: row.remaining_seconds,
      };
    },

    async recordFailure(identifier: string): Promise<FailedAttemptStatus> {
      const result = await rpc('record_failed_login_attempt', {
        p_identifier_hash: hashLoginIdentifier(identifier),
      });
      assertRpcSucceeded(result, 'registrar el intento fallido de autenticación');
      const row = firstRow<FailedAttemptRow>(
        result.data,
        'registrar el intento fallido de autenticación'
      );
      return {
        isLocked: row.is_locked,
        attemptsLeft: row.attempts_left,
        remainingSeconds: row.remaining_seconds,
        triggeredLockout: row.triggered_lockout,
      };
    },

    async clear(identifier: string): Promise<void> {
      const result = await rpc('clear_login_attempts', {
        p_identifier_hash: hashLoginIdentifier(identifier),
      });
      assertRpcSucceeded(result, 'limpiar los intentos fallidos de autenticación');
    },

    async enqueueLockoutNotification(identifier: string): Promise<void> {
      const result = await rpc('enqueue_login_lockout_notification', {
        p_target_email: identifier.trim().toLowerCase(),
      });
      assertRpcSucceeded(result, 'encolar la notificación de bloqueo');
    },
  };
}
