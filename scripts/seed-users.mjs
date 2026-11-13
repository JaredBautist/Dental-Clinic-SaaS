import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

/** Carga únicamente las variables necesarias desde .env.local sin imprimir secretos. */
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      process.env[match[1]] ??= match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_USERS = [
  {
    role: 'odontologo',
    email: 'odontologo@clinicadental.com',
    password: 'Odonto2026!',
    fullName: 'Dr. Carlos Rodríguez',
  },
  {
    role: 'recepcionista',
    email: 'recepcionista@clinicadental.com',
    password: 'Recepcion2026!',
    fullName: 'Laura Martínez',
  },
];

async function getTargetClinic() {
  let query = admin.from('clinics').select('id, name').order('created_at', { ascending: true });
  if (process.env.SEED_CLINIC_ID) {
    query = query.eq('id', process.env.SEED_CLINIC_ID);
  }

  const { data: clinics, error } = await query;
  if (error) throw new Error(`No se pudo consultar el consultorio: ${error.message}`);
  if (!clinics.length) {
    throw new Error('No existe un consultorio para asociar los usuarios de prueba.');
  }

  if (process.env.SEED_CLINIC_ID) return clinics[0];

  if (clinics.length > 1) {
    const ids = clinics.map((clinic) => `${clinic.name}: ${clinic.id}`).join('\n');
    throw new Error(
      `Hay varios consultorios. Define SEED_CLINIC_ID con el UUID deseado:\n${ids}`
    );
  }

  return clinics[0];
}

async function main() {
  const clinic = await getTargetClinic();
  const { data: authUsersData, error: listError } = await admin.auth.admin.listUsers({
    perPage: 200,
  });
  if (listError) throw new Error(`No se pudieron consultar los usuarios: ${listError.message}`);

  const authByEmail = new Map(
    (authUsersData.users ?? []).map((user) => [user.email?.toLowerCase(), user])
  );

  console.log(`Consultorio: ${clinic.name}`);

  for (const seed of SEED_USERS) {
    let authUser = authByEmail.get(seed.email.toLowerCase());
    let isNew = false;

    if (!authUser) {
      const { data, error } = await admin.auth.admin.createUser({
        email: seed.email,
        password: seed.password,
        email_confirm: true,
        user_metadata: {
          clinic_id: clinic.id,
          full_name: seed.fullName,
          role: seed.role,
        },
      });
      if (error || !data.user) {
        throw new Error(`No se pudo crear ${seed.email}: ${error?.message ?? 'sin usuario'}`);
      }
      authUser = data.user;
      isNew = true;
    }

    const { data: profile, error: profileError } = await admin
      .from('users')
      .select('id, clinic_id, role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`No se pudo consultar el perfil de ${seed.email}: ${profileError.message}`);
    }

    if (profile && profile.clinic_id !== clinic.id) {
      throw new Error(
        `${seed.email} pertenece a otro consultorio. No se reasignó ni modificó su perfil.`
      );
    }

    const { error: saveError } = profile
      ? await admin
          .from('users')
          .update({
            clinic_id: clinic.id,
            role: seed.role,
            full_name: seed.fullName,
            is_active: true,
          })
          .eq('id', authUser.id)
      : await admin.from('users').insert({
          id: authUser.id,
          clinic_id: clinic.id,
          role: seed.role,
          full_name: seed.fullName,
          is_active: true,
          mfa_enabled: false,
        });

    if (saveError) {
      throw new Error(`No se pudo guardar el perfil de ${seed.email}: ${saveError.message}`);
    }

    await admin.from('audit_logs').insert({
      clinic_id: clinic.id,
      user_id: authUser.id,
      role: seed.role,
      entity_type: 'usuario',
      entity_id: authUser.id,
      action: isNew ? 'create' : 'update',
      result: 'success',
      metadata: { source: 'seed-users', target_role: seed.role },
    });

    console.log(`- ${seed.role}: ${seed.email}`);
    console.log(`  Estado: ${isNew ? 'cuenta creada' : 'cuenta existente reutilizada'}`);
    console.log(`  Contraseña inicial: ${isNew ? seed.password : 'sin cambios'}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Error desconocido durante el seed');
  process.exitCode = 1;
});
