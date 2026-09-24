'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { createAuditLog } from '@/lib/audit';
import { DentalClinicError, RoleAuthorizationError } from '@/errors/domain';
import type { UserProfile, UserRole } from '@/types/domain';

const createUserSchema = z.object({
  fullName: z.string().trim().min(1, 'El nombre completo es obligatorio').max(200, 'El nombre no puede exceder 200 caracteres'),
  email: z.string().trim().email('El correo electrónico no es válido').max(254),
  role: z.enum(['administrador', 'odontologo', 'recepcionista'], {
    message: 'El rol debe ser administrador, odontologo o recepcionista',
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

const updateUserSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  fullName: z.string().trim().min(1, 'El nombre completo es obligatorio').max(200).optional(),
  role: z.enum(['administrador', 'odontologo', 'recepcionista']).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Server Action: Creación de un nuevo usuario en el consultorio.
 * Solo permitido para rol 'administrador'.
 * Requisitos: 2.1, 2.2, 2.3
 */
export async function createUserAction(
  rawInput: CreateUserInput
): Promise<ServerActionResult<UserProfile>> {
  return withErrorHandling(async () => {
    const input = createUserSchema.parse(rawInput);
    const authAdmin = await requireRole(['administrador'], 'usuario', '', 'create');
    const admin = createAdminClient();

    // 1. Invitar al usuario en Supabase Auth
    const { data: authData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      input.email,
      {
        data: {
          clinic_id: authAdmin.clinicId,
          full_name: input.fullName,
          role: input.role,
        },
      }
    );

    if (inviteError || !authData?.user) {
      throw new DentalClinicError(
        inviteError?.message || 'No se pudo invitar al usuario.',
        'USER_INVITE_FAILED',
        400
      );
    }

    const newUserId = authData.user.id;

    // 2. Crear fila en tabla pública `users`
    const { data: newProfile, error: profileError } = await admin
      .from('users')
      .insert({
        id: newUserId,
        clinic_id: authAdmin.clinicId,
        role: input.role,
        full_name: input.fullName,
        is_active: true,
        mfa_enabled: false,
      })
      .select('id, clinic_id, role, full_name, is_active, mfa_enabled, created_at, updated_at')
      .single();

    if (profileError || !newProfile) {
      // Revertir usuario de auth
      await admin.auth.admin.deleteUser(newUserId);
      throw new DentalClinicError(
        'Error al crear el perfil del usuario en la base de datos.',
        'USER_CREATION_FAILED',
        500
      );
    }

    // 3. Auditoría
    await createAuditLog({
      clinic_id: authAdmin.clinicId,
      user_id: authAdmin.userId,
      role: authAdmin.role,
      entity_type: 'usuario',
      entity_id: newUserId,
      action: 'create',
      result: 'success',
      metadata: { created_user_email: input.email, assigned_role: input.role },
    });

    return newProfile as UserProfile;
  });
}

/**
 * Server Action: Actualización de datos de un usuario del consultorio.
 * Solo permitido para rol 'administrador' sobre usuarios de su propio consultorio.
 * Requisitos: 2.2, 2.3
 */
export async function updateUserAction(
  rawInput: UpdateUserInput
): Promise<ServerActionResult<UserProfile>> {
  return withErrorHandling(async () => {
    const input = updateUserSchema.parse(rawInput);
    const authAdmin = await requireRole(['administrador'], 'usuario', input.userId, 'update');
    const supabase = await createServerSupabaseClient();

    // Verificar que el usuario pertenece al mismo consultorio
    const { data: targetUser, error: checkError } = await supabase
      .from('users')
      .select('id, clinic_id, role, is_active')
      .eq('id', input.userId)
      .eq('clinic_id', authAdmin.clinicId)
      .maybeSingle();

    if (checkError || !targetUser) {
      throw new DentalClinicError('Usuario no encontrado en este consultorio.', 'USER_NOT_FOUND', 404);
    }

    // Si se cambia el rol y el usuario era administrador, verificar que no sea el único administrador activo
    if (input.role && input.role !== 'administrador' && targetUser.role === 'administrador') {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', authAdmin.clinicId)
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

    const updates: Record<string, unknown> = {};
    if (input.fullName !== undefined) updates.full_name = input.fullName;
    if (input.role !== undefined) updates.role = input.role;

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', input.userId)
      .eq('clinic_id', authAdmin.clinicId)
      .select('id, clinic_id, role, full_name, is_active, mfa_enabled, created_at, updated_at')
      .single();

    if (updateError || !updatedProfile) {
      throw new DentalClinicError('No se pudo actualizar el usuario.', 'USER_UPDATE_FAILED', 500);
    }

    await createAuditLog({
      clinic_id: authAdmin.clinicId,
      user_id: authAdmin.userId,
      role: authAdmin.role,
      entity_type: 'usuario',
      entity_id: input.userId,
      action: 'update',
      result: 'success',
      metadata: updates,
    });

    return updatedProfile as UserProfile;
  });
}

/**
 * Server Action: Desactivación de un usuario con salvaguarda del último administrador.
 * Requisitos: 2.5, 2.6
 */
export async function deactivateUserAction(
  userId: string
): Promise<ServerActionResult<{ id: string; is_active: boolean }>> {
  return withErrorHandling(async () => {
    z.string().uuid().parse(userId);
    const authAdmin = await requireRole(['administrador'], 'usuario', userId, 'update');
    const supabase = await createServerSupabaseClient();
    const admin = createAdminClient();

    // 1. Obtener usuario a desactivar
    const { data: targetUser, error: checkError } = await supabase
      .from('users')
      .select('id, clinic_id, role, is_active')
      .eq('id', userId)
      .eq('clinic_id', authAdmin.clinicId)
      .maybeSingle();

    if (checkError || !targetUser) {
      throw new DentalClinicError('Usuario no encontrado en este consultorio.', 'USER_NOT_FOUND', 404);
    }

    // 2. Regla de protección del último administrador activo
    if (targetUser.role === 'administrador') {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', authAdmin.clinicId)
        .eq('role', 'administrador')
        .eq('is_active', true);

      if (count !== null && count <= 1) {
        throw new DentalClinicError(
          'el consultorio debe conservar al menos un administrador activo',
          'CANNOT_DEACTIVATE_LAST_ADMIN',
          400
        );
      }
    }

    // 3. Desactivar usuario
    const { error: updateError } = await admin
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      .eq('clinic_id', authAdmin.clinicId);

    if (updateError) {
      throw new DentalClinicError('Error al desactivar el usuario.', 'DEACTIVATION_FAILED', 500);
    }

    // 4. Revocar sesiones activas en Supabase Auth en <= 60s
    try {
      await admin.auth.admin.signOut(userId);
    } catch (signOutErr) {
      console.warn('[Session Revocation Warning]:', signOutErr);
    }

    // 5. Auditoría
    await createAuditLog({
      clinic_id: authAdmin.clinicId,
      user_id: authAdmin.userId,
      role: authAdmin.role,
      entity_type: 'usuario',
      entity_id: userId,
      action: 'update',
      result: 'success',
      metadata: { is_active: false },
    });

    return { id: userId, is_active: false };
  });
}

/**
 * Server Action: Listado de usuarios del consultorio.
 */
export async function listUsersAction(): Promise<ServerActionResult<UserProfile[]>> {
  return withErrorHandling(async () => {
    const authUser = await requireRole(['administrador'], 'usuario');
    const supabase = await createServerSupabaseClient();

    const { data: users, error } = await supabase
      .from('users')
      .select('id, clinic_id, role, full_name, is_active, mfa_enabled, created_at, updated_at')
      .eq('clinic_id', authUser.clinicId)
      .order('full_name', { ascending: true });

    if (error) {
      throw new DentalClinicError('Error al obtener la lista de usuarios.', 'USERS_FETCH_FAILED', 500);
    }

    return (users || []) as UserProfile[];
  });
}
