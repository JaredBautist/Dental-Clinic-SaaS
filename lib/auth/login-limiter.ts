export interface LockoutStatus {
  isLocked: boolean;
  remainingMinutes?: number;
  attemptsLeft?: number;
}

interface AttemptRecord {
  count: number;
  lockedUntil?: number; // timestamp ms
  lastAttempt: number;
}

// Almacén en memoria de intentos fallidos por identificador (email normalizado)
// En arquitecturas distribuidas puede respaldarse en Redis/BD, pero para Next.js / Server Actions
// mantenemos una estructura con expiración automática de 15 minutos (900_000 ms).
const attemptsStore = new Map<string, AttemptRecord>();

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Normaliza el identificador de cuenta para el control de intentos
 */
function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

/**
 * Verifica si una cuenta está actualmente bloqueada
 */
export function checkLockout(identifier: string): LockoutStatus {
  const key = normalizeIdentifier(identifier);
  const record = attemptsStore.get(key);
  const now = Date.now();

  if (!record) {
    return { isLocked: false, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }

  // Si estaba bloqueado y el tiempo ya expiró, restablecer
  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingMs = record.lockedUntil - now;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return { isLocked: true, remainingMinutes, attemptsLeft: 0 };
    } else {
      // Bloqueo expirado
      attemptsStore.delete(key);
      return { isLocked: false, attemptsLeft: MAX_FAILED_ATTEMPTS };
    }
  }

  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return { isLocked: false, attemptsLeft };
}

/**
 * Registra un intento fallido para la cuenta.
 * Si alcanza 5 intentos, bloquea por 15 minutos y retorna triggeredLockout = true.
 */
export function recordFailedAttempt(identifier: string): {
  isLocked: boolean;
  attemptsLeft: number;
  triggeredLockout: boolean;
  remainingMinutes?: number;
} {
  const key = normalizeIdentifier(identifier);
  const now = Date.now();
  let record = attemptsStore.get(key);

  if (!record) {
    record = { count: 0, lastAttempt: now };
    attemptsStore.set(key, record);
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    return {
      isLocked: true,
      attemptsLeft: 0,
      triggeredLockout: true,
      remainingMinutes: 15,
    };
  }

  return {
    isLocked: false,
    attemptsLeft: MAX_FAILED_ATTEMPTS - record.count,
    triggeredLockout: false,
  };
}

/**
 * Restablece los intentos fallidos tras un inicio de sesión exitoso
 */
export function clearFailedAttempts(identifier: string): void {
  const key = normalizeIdentifier(identifier);
  attemptsStore.delete(key);
}
