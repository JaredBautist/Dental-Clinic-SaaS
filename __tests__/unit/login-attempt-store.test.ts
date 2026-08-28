import { describe, expect, it, vi } from 'vitest';
import {
  createLoginAttemptStore,
  hashLoginIdentifier,
} from '@/lib/auth/login-attempt-store';

describe('PostgresLoginAttemptStore', () => {
  it('normaliza y protege el email antes de persistirlo', () => {
    const first = hashLoginIdentifier('  USER@Example.COM ');
    const second = hashLoginIdentifier('user@example.com');

    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(first).not.toContain('user@example.com');
  });

  it('mapea el estado persistente de bloqueo', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ is_locked: true, remaining_seconds: 599 }],
      error: null,
    });
    const store = createLoginAttemptStore(rpc);

    await expect(store.check('user@example.com')).resolves.toEqual({
      isLocked: true,
      remainingSeconds: 599,
    });
    expect(rpc).toHaveBeenCalledWith('check_login_lockout', {
      p_identifier_hash: hashLoginIdentifier('user@example.com'),
    });
  });

  it('registra atómicamente el quinto fallo y reporta el lockout', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          is_locked: true,
          attempts_left: 0,
          remaining_seconds: 900,
          triggered_lockout: true,
        },
      ],
      error: null,
    });
    const store = createLoginAttemptStore(rpc);

    await expect(store.recordFailure('user@example.com')).resolves.toEqual({
      isLocked: true,
      attemptsLeft: 0,
      remainingSeconds: 900,
      triggeredLockout: true,
    });
  });

  it('falla cerrado cuando PostgreSQL no responde', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'database unavailable' },
    });
    const store = createLoginAttemptStore(rpc);

    await expect(store.check('user@example.com')).rejects.toThrow(
      'No se pudo verificar el límite de intentos de autenticación'
    );
  });
});
