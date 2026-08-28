import { DentalClinicError } from '@/errors/domain';

interface SignOutResult {
  error: { message?: string } | null;
}

export type SignOutOperation = () => PromiseLike<SignOutResult>;

/**
 * Ejecuta el cierre de sesión y solo retorna cuando el proveedor lo confirma.
 * Lanza SIGN_OUT_FAILED sin exponer detalles internos del proveedor.
 */
export async function terminateSession(
  signOut: SignOutOperation,
  failureMessage: string
): Promise<void> {
  const { error } = await signOut();
  if (error) {
    throw new DentalClinicError(failureMessage, 'SIGN_OUT_FAILED', 503);
  }
}
