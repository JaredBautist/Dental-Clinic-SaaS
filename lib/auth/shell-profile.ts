import { cache } from 'react';
import { requireAuthUser } from '@/lib/auth/require-user';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/domain';

export interface ShellProfile {
  userId: string;
  clinicId: string;
  role: UserRole;
  userName: string;
  clinicName: string;
  mfaEnabled: boolean;
}

/**
 * Obtiene el perfil mínimo para el shell del dashboard (sidebar + layout).
 * Devuelve null si la sesión o el perfil no son utilizables.
 * React reutiliza el resultado entre el layout y la página del mismo render.
 */
export const getShellProfile = cache(async (): Promise<ShellProfile | null> => {
  try {
    const authUser = await requireAuthUser();
    const supabase = await createServerSupabaseClient();

    const { data: clinic } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', authUser.clinicId)
      .maybeSingle();

    return {
      userId: authUser.userId,
      clinicId: authUser.clinicId,
      role: authUser.role,
      userName: authUser.fullName?.trim() || 'Usuario',
      clinicName: clinic?.name?.trim() || 'Consultorio',
      mfaEnabled: authUser.mfaEnabled,
    };
  } catch {
    return null;
  }
});
