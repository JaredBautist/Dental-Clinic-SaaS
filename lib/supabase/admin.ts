import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente de administración de Supabase con service_role_key.
 * ATENCIÓN: Solo debe utilizarse en Server Actions, Route Handlers o procesos del servidor.
 * NUNCA exponer ni importar en componentes cliente.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient solo puede ejecutarse en el entorno del servidor.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Faltan variables de entorno para inicializar el cliente administrador de Supabase (NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY).'
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
