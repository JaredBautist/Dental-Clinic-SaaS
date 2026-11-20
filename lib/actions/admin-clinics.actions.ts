'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { hasPlatformAccess, requireClinicAdminScope } from '@/lib/platform/access';
import { requireRole } from '@/lib/auth/require-user';
import { createAuditLog } from '@/lib/audit';
import { DentalClinicError } from '@/errors/domain';
import type { Clinic, UserProfile, UserRole } from '@/types/domain';

const CLINIC_FIELDS = 'id, name, address, phone, email, created_at, updated_at';
const USER_FIELDS = 'id, clinic_id, role, full_name, is_active, mfa_enabled, created_at, updated_at';

export interface AdminClinicDetail {
  clinic: Clinic;
  users: UserProfile[];
}

const clinicIdSchema = z.string().uuid('ID de consultorio inválido');

const clinicDataSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del consultorio es obligatorio').max(120),
  address: z.string().trim().max(255, 'La dirección es demasiado larga').optional().nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/, 'El teléfono debe contener entre 7 y 15 dígitos numéricos')
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email('El formato del correo electrónico es inválido')
    .max(254)
    .optional()
    .nullable(),
});

const updateAdminClinicSchema = clinicDataSchema.extend({ clinicId: clinicIdSchema });
export type UpdateAdminClinicInput = z.infer<typeof updateAdminClinicSchema>;

const createClinicUserSchema = z.object({
  clinicId: clinicIdSchema,
  fullName: z.string().trim().min(1, 'El nombre completo es obligatorio').max(200),
  email: z.string().trim().email('El correo electrónico no es válido').max(254),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  role: z.enum(['administrador', 'odontologo', 'recepcionista']),
});
export type CreateClinicUserInput = z.infer<typeof createClinicUserSchema>;

const updateAdminClinicUserSchema = z.object({
  clinicId: clinicIdSchema,
  userId: z.string().uuid('ID de usuario inválido'),
  role: z.enum(['administrador', 'odontologo', 'recepcionista']).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateAdminClinicUserInput = z.infer<typeof updateAdminClinicUserSchema>;

/** Listado de los consultorios administrados por el usuario administrador. */
export async function listAdminClinicsAction(): Promise<ServerActionResult<Clinic[]>> {
  return withErrorHandling(async () => {
    const actor = await requireRole(['administrador'], 'consultorio');
    const admin = createAdminClient();
    const clinics = admin.from('clinics').select(CLINIC_FIELDS);
    if (!await hasPlatformAccess()) clinics.eq('id', actor.clinicId);
    const { data, error } = await clinics.order('name');

    if (error) {
      throw new DentalClinicError('No se pudieron cargar los consultorios.', 'CLINICS_FETCH_FAILED', 500);
    }

    return (data ?? []) as Clinic[];
  });
}

/** Detalle de un consultorio seleccionado: información y personal, sin datos de pacientes. */
export async function getAdminClinicDetailAction(
  clinicId: string
): Promise<ServerActionResult<AdminClinicDetail>> {
  return withErrorHandling(async () => {
    const id = clinicIdSchema.parse(clinicId);
    const actor = await requireRole(['administrador'], 'consultorio', id);
    await requireClinicAdminScope(actor, id);
    const admin = createAdminClient();

    const [clinicResult, usersResult] = await Promise.all([
      admin.from('clinics').select(CLINIC_FIELDS).eq('id', id).maybeSingle(),
      admin.from('users').select(USER_FIELDS).eq('clinic_id', id).order('full_name'),
    ]);

    if (clinicResult.error || !clinicResult.data) {
      throw new DentalClinicError('El consultorio seleccionado no existe.', 'CLINIC_NOT_FOUND', 404);
    }

    if (usersResult.error) {
      throw new DentalClinicError(
        'No se pudo cargar el personal del consultorio.',
        'CLINIC_USERS_FETCH_FAILED',
        500
      );
    }

    return {
      clinic: clinicResult.data as Clinic,
      users: (usersResult.data ?? []) as UserProfile[],
    };
  });
}

/** Actualiza la información de cualquier consultorio administrado desde este panel. */
export async function updateAdminClinicAction(
  rawInput: UpdateAdminClinicInput
): Promise<ServerActionResult<Clinic>> {
  return withErrorHandling(async () => {
    const input = updateAdminClinicSchema.parse(rawInput);
    const authUser = await requireRole(['administrador'], 'consultorio', input.clinicId, 'update');
    await requireClinicAdminScope(authUser, input.clinicId);
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('clinics')
      .update({
        name: input.name,
        address: input.address || null,
        phone: input.phone || null,
        email: input.email || null,
      })
      .eq('id', input.clinicId)
      .select(CLINIC_FIELDS)
      .single();

    if (error || !data) {
      throw new DentalClinicError('No se pudo actualizar el consultorio.', 'CLINIC_UPDATE_FAILED', 500);
    }

    await createAuditLog({
      clinic_id: input.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'consultorio',
      entity_id: input.clinicId,
      action: 'update',
      result: 'success',
      metadata: { updated_fields: ['name', 'address', 'phone', 'email'] },
    });

    return data as Clinic;
  });
}

/** Crea un odontólogo, recepcionista o administrador dentro del consultorio seleccionado. */
export async function createClinicUserAction(
  rawInput: CreateClinicUserInput
): Promise<ServerActionResult<UserProfile>> {
  return withErrorHandling(async () => {
    const input = createClinicUserSchema.parse(rawInput);
    const authUser = await requireRole(['administrador'], 'consultorio', input.clinicId, 'create');
    await requireClinicAdminScope(authUser, input.clinicId);
    const admin = createAdminClient();

    const { data: clinic, error: clinicError } = await admin
      .from('clinics')
      .select('id, name')
      .eq('id', input.clinicId)
      .maybeSingle();

    if (clinicError || !clinic) {
      throw new DentalClinicError('El consultorio seleccionado no existe.', 'CLINIC_NOT_FOUND', 404);
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        clinic_id: input.clinicId,
        full_name: input.fullName,
        role: input.role,
      },
    });

    if (authError || !authData.user) {
      throw new DentalClinicError(
        authError?.message || 'No se pudo crear el usuario.',
        'USER_CREATION_FAILED',
        400
      );
    }

    const newUserId = authData.user.id;
    const { data: newProfile, error: profileError } = await admin
      .from('users')
      .insert({
        id: newUserId,
        clinic_id: input.clinicId,
        full_name: input.fullName,
        role: input.role,
        is_active: true,
        mfa_enabled: false,
      })
      .select(USER_FIELDS)
      .single();

    if (profileError || !newProfile) {
      await admin.auth.admin.deleteUser(newUserId);
      throw new DentalClinicError('No se pudo crear el perfil del usuario.', 'PROFILE_CREATION_FAILED', 500);
    }

    await createAuditLog({
      clinic_id: input.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'usuario',
      entity_id: newUserId,
      action: 'create',
      result: 'success',
      metadata: { created_user_email: input.email, assigned_role: input.role },
    });

    return newProfile as UserProfile;
  });
}

/** Cambia el rol o habilita/deshabilita a un integrante del consultorio seleccionado. */
export async function updateAdminClinicUserAction(
  rawInput: UpdateAdminClinicUserInput
): Promise<ServerActionResult<UserProfile>> {
  return withErrorHandling(async () => {
    const input = updateAdminClinicUserSchema.parse(rawInput);
    const authUser = await requireRole(['administrador'], 'usuario', input.userId, 'update');
    await requireClinicAdminScope(authUser, input.clinicId);
    const admin = createAdminClient();

    const { data: target, error: targetError } = await admin
      .from('users')
      .select('id, clinic_id, role, is_active')
      .eq('id', input.userId)
      .eq('clinic_id', input.clinicId)
      .maybeSingle();

    if (targetError || !target) {
      throw new DentalClinicError('El usuario no pertenece al consultorio seleccionado.', 'USER_NOT_FOUND', 404);
    }

    const willLoseAdmin =
      target.role === 'administrador' &&
      target.is_active &&
      (input.isActive === false || (!!input.role && input.role !== 'administrador'));

    if (willLoseAdmin) {
      const { count } = await admin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', input.clinicId)
        .eq('role', 'administrador')
        .eq('is_active', true);

      if (count !== null && count <= 1) {
        throw new DentalClinicError(
          'El consultorio debe conservar al menos un administrador activo.',
          'CANNOT_DEMOTE_LAST_ADMIN',
          400
        );
      }
    }

    const updates: { role?: UserRole; is_active?: boolean } = {};
    if (input.role !== undefined) updates.role = input.role;
    if (input.isActive !== undefined) updates.is_active = input.isActive;

    const { data: updatedUser, error: updateError } = await admin
      .from('users')
      .update(updates)
      .eq('id', input.userId)
      .eq('clinic_id', input.clinicId)
      .select(USER_FIELDS)
      .single();

    if (updateError || !updatedUser) {
      throw new DentalClinicError('No se pudo actualizar el usuario.', 'USER_UPDATE_FAILED', 500);
    }

    if (input.isActive === false) {
      try {
        await admin.auth.admin.signOut(input.userId);
      } catch (error) {
        console.warn('[AdminClinicUsers] No se pudieron revocar las sesiones:', error);
      }
    }

    await createAuditLog({
      clinic_id: input.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'usuario',
      entity_id: input.userId,
      action: 'update',
      result: 'success',
      metadata: updates,
    });

    return updatedUser as UserProfile;
  });
}
