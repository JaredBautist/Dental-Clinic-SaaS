'use server';

import { z } from 'zod';
import { DentalClinicError } from '@/errors/domain';
import { createAuditLog } from '@/lib/audit';
import { requirePlatformAccess } from '@/lib/platform/access';
import { withErrorHandling } from '@/lib/server-action-wrapper';
import { createAdminClient } from '@/lib/supabase/admin';

const targetSchema = z.object({ clinicId: z.uuid(), userId: z.uuid() });
type Target = z.infer<typeof targetSchema>;

const credentialsSchema = targetSchema.extend({
  email: z.email().max(254).optional(),
  password: z.string().min(8).max(72).refine(value => Buffer.byteLength(value, 'utf8') <= 72).optional(),
}).refine(value => value.email !== undefined || value.password !== undefined);

async function requireTarget({ clinicId, userId }: Target) {
  const actor = await requirePlatformAccess();
  const admin = createAdminClient();
  const { data, error } = await admin.from('users').select('id')
    .eq('id', userId).eq('clinic_id', clinicId).maybeSingle();
  if (error) throw new DentalClinicError('No se pudo verificar el consultorio.', 'MEMBERSHIP_CHECK_FAILED', 500);
  if (!data) throw new DentalClinicError('El usuario no pertenece a este consultorio.', 'USER_NOT_FOUND', 404);
  return { admin, actor };
}

export async function getPlatformUserEmailAction(input: Target) {
  return withErrorHandling(async () => {
    const target = targetSchema.parse(input);
    const { admin } = await requireTarget(target);
    const { data, error } = await admin.auth.admin.getUserById(target.userId);
    if (error || !data.user?.email) {
      throw new DentalClinicError('No se pudo cargar el correo del usuario.', 'EMAIL_FETCH_FAILED', 502);
    }
    return data.user.email;
  });
}

export async function updatePlatformCredentialsAction(input: z.infer<typeof credentialsSchema>) {
  return withErrorHandling(async () => {
    const { clinicId, userId, email, password } = credentialsSchema.parse(input);
    const { admin, actor } = await requireTarget({ clinicId, userId });
    const changes = {
      ...(email !== undefined && { email, email_confirm: true }),
      ...(password !== undefined && { password }),
    };
    const { error } = await admin.auth.admin.updateUserById(userId, changes);
    if (error) {
      if (error.code === 'email_exists' || error.code === 'user_already_exists') {
        throw new DentalClinicError('Ese correo ya pertenece a otra cuenta.', 'EMAIL_IN_USE', 409);
      }
      if (error.code === 'weak_password' || error.code === 'same_password') {
        throw new DentalClinicError('Elige otra contraseña que cumpla la política de seguridad.', 'PASSWORD_REJECTED', 400);
      }
      throw new DentalClinicError('No se pudo guardar el cambio de credenciales.', 'CREDENTIAL_UPDATE_FAILED', 502);
    }
    try {
      await createAuditLog({
        clinic_id: clinicId, user_id: actor.userId, role: actor.role,
        entity_type: 'usuario', entity_id: userId, action: 'update', result: 'success',
        metadata: { changed_email: email !== undefined, changed_password: password !== undefined },
      });
    } catch {
      throw new DentalClinicError('Las credenciales se guardaron, pero falló la auditoría. Vuelve a abrir el editor para verificar.', 'CREDENTIAL_AUDIT_FAILED', 500);
    }
    return null;
  });
}
