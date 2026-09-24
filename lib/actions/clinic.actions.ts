'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { DentalClinicError } from '@/errors/domain';
import type { Clinic } from '@/types/domain';

const clinicSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(120),
  address: z.string().max(255).optional().or(z.literal('')),
  phone: z.string().max(15).optional().or(z.literal('')),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
});

export async function getClinicAction(): Promise<ServerActionResult<Clinic>> {
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
      .from('clinics')
      .select('*')
      .eq('id', profile.clinic_id)
      .single();

    if (error) {
      throw new DentalClinicError('Error al obtener consultorio.', 'GET_CLINIC_ERROR', 500);
    }

    return data as Clinic;
  });
}

export async function updateClinicAction(
  formData: z.infer<typeof clinicSchema>
): Promise<ServerActionResult<Clinic>> {
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
        'Solo el administrador puede modificar el consultorio.',
        'ROLE_AUTHORIZATION_ERROR',
        403
      );
    }

    const validated = clinicSchema.parse(formData);

    const { data, error } = await supabase
      .from('clinics')
      .update(validated)
      .eq('id', profile.clinic_id)
      .select()
      .single();

    if (error) {
      throw new DentalClinicError('Error al actualizar consultorio.', 'UPDATE_CLINIC_ERROR', 500);
    }

    return data as Clinic;
  });
}
