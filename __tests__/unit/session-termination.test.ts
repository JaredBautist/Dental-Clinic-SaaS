import { describe, expect, it, vi } from 'vitest';
import { terminateSession } from '@/lib/auth/session-termination';

describe('terminateSession', () => {
  it('completa únicamente cuando el proveedor confirma el cierre de sesión', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });

    await expect(terminateSession(signOut, 'No fue posible cerrar la sesión.')).resolves.toBe(
      undefined
    );
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('falla explícitamente cuando el proveedor no cierra la sesión', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: { message: 'network error' } });

    await expect(terminateSession(signOut, 'No fue posible cerrar la sesión.')).rejects.toMatchObject({
      code: 'SIGN_OUT_FAILED',
      statusCode: 503,
    });
  });
});
