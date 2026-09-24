'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { DentalClinicError } from '@/errors/domain';
import type { UserProfile, UserRole } from '@/types/domain';

const userSchema = z.object({
  full_name: z.string().min(1, 'El nombre es obligatorio').max(200),
  email: z.string().email('Correo inválido'),
  role: z.enum(['administrador', 'odontologo', 'recepcionista']),
  phone: z.string().max(15).optional().or(z.literal('')),
});

export async function createUserAction(
  formData: z.infer<typeof userSchema>
): Promise<ServerActionResult<UserProfile>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'administrador') {
      throw new DentalClinicError(
        'Solo el administrador puede crear usuarios.',
        'ROLE_AUTHORIZATION_ERROR',
        403
      );
    }

    const validated = userSchema.parse(formData);
    const admin = createAdminClient();

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: validated.email,
      email_confirm: true,
      user_metadata: {
        full_name: validated.full_name,
      },
    });

    if (authError || !authData.user) {
      throw new DentalClinicError(
        'Error al crear usuario en autenticación.',
        'CREATE_AUTH_USER_ERROR',
        500
      );
    }

    // Crear perfil en tabla users
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        clinic_id: profile.clinic_id,
        role: validated.role,
        full_name: validated.full_name,
        is_active: true,
        mfa_enabled: false,
      })
      .select()
      .single();

    if (error) {
      // Rollback: eliminar usuario de Auth si falla la creación del perfil
      await admin.auth.admin.deleteUser(authData.user.id);
      throw new DentalClinicError('Error al crear perfil de usuario.', 'CREATE_USER_ERROR', 500);
    }

    return data as UserProfile;
  });
}

export async function listUsersAction(): Promise<ServerActionResult<UserProfile[]>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new DentalClinicError('Perfil no encontrado.', 'PROFILE_NOT_FOUND', 404);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DentalClinicError('Error al listar usuarios.', 'LIST_USERS_ERROR', 500);
    }

    return data as UserProfile[];
  });
}

export async function updateUserAction(
  id: string,
  formData: Partial<z.infer<typeof userSchema>>
): Promise<ServerActionResult<UserProfile>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'administrador') {
      throw new DentalClinicError(
        'Solo el administrador puede modificar usuarios.',
        'ROLE_AUTHORIZATION_ERROR',
        403
      );
    }

    const validated = userSchema.partial().parse(formData);

    const { data, error } = await supabase
      .from('users')
      .update(validated)
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .select()
      .single();

    if (error) {
      throw new DentalClinicError('Error al actualizar usuario.', 'UPDATE_USER_ERROR', 500);
    }

    return data as UserProfile;
  });
}

export async function deactivateUserAction(id: string): Promise<ServerActionResult<UserProfile>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'administrador') {
      throw new DentalClinicError(
        'Solo el administrador puede desactivar usuarios.',
        'ROLE_AUTHORIZATION_ERROR',
        403
      );
    }

    // Verificar que no sea el último administrador activo
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('clinic_id', profile.clinic_id)
      .eq('role', 'administrador')
      .eq('is_active', true);

    if (admins && admins.length <= 1) {
      const { data: targetUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', id)
        .single();

      if (targetUser?.role === 'administrador') {
        throw new DentalClinicError(
          'No se puede desactivar al último administrador activo.',
          'LAST_ADMIN_ERROR',
          400
        );
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .select()
      .single();

    if (error) {
      throw new DentalClinicError('Error al desactivar usuario.', 'DEACTIVATE_USER_ERROR', 500);
    }

    // Revocar sesión en Supabase Auth
    const admin = createAdminClient();
    await admin.auth.admin.signOut(id);

    return data as UserProfile;
  });
}
