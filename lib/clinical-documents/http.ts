import { z } from 'zod';
import { DentalClinicError } from '@/errors/domain';

export function documentError(error: unknown) {
  if (error instanceof DentalClinicError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.statusCode });
  }
  if (error instanceof z.ZodError || error instanceof SyntaxError) {
    return Response.json({ error: { code: 'INVALID_INPUT', message: 'Revisa los datos de la solicitud.' } }, { status: 422 });
  }
  return Response.json({ error: { code: 'DOCUMENT_REQUEST_FAILED', message: 'No se pudo completar la solicitud.' } }, { status: 500 });
}
