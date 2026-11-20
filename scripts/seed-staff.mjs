import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

/**
 * Seed masivo e idempotente de personal (odontólogos y recepcionistas).
 *
 * Variables opcionales:
 *   SEED_CLINIC_ID       UUID de un consultorio concreto (por defecto: todos)
 *   SEED_DOCTORS         Odontólogos por consultorio (por defecto: 5)
 *   SEED_RECEPTIONISTS   Recepcionistas por consultorio (por defecto: 2)
 *   SEED_PASSWORD        Contraseña inicial para altas reales (obligatoria fuera de vista previa)
 *   SEED_DRY_RUN         1/true para previsualizar sin escribir en Supabase
 */

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

const DOCTOR_NAMES = [
  'Dr. Alejandro Morales',
  'Dra. Beatriz Salazar',
  'Dr. Camilo Restrepo',
  'Dra. Daniela Vargas',
  'Dr. Eduardo Peña',
  'Dra. Fernanda Ríos',
  'Dr. Gabriel Ortiz',
  'Dra. Helena Castro',
  'Dr. Iván Mendoza',
  'Dra. Juliana Navarro',
  'Dr. Mateo Aguirre',
  'Dra. Natalia Bermúdez',
  'Dr. Óscar Cardona',
  'Dra. Patricia Duarte',
  'Dr. Ricardo Escobar',
  'Dra. Sandra Fuentes',
  'Dr. Tomás Gallego',
  'Dra. Úrsula Hoyos',
  'Dr. Víctor Isaza',
  'Dra. Ximena Jaramillo',
  'Dr. Andrés León',
  'Dra. Carolina Mejía',
  'Dr. Felipe Naranjo',
  'Dra. Gabriela Ospina',
];

const RECEPTIONIST_NAMES = [
  'Sofía Herrera',
  'Valentina Gómez',
  'Mariana Torres',
  'Paula Jiménez',
  'Carolina Rincón',
  'Natalia Suárez',
  'Daniela Pardo',
  'Juliana Quintero',
  'Camila Ramírez',
  'Andrea Sánchez',
  'Laura Trujillo',
  'Diana Urrea',
];

function readCount(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;

  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`${name} debe ser un entero entre 0 y 100.`);
  }

  const value = Number.parseInt(trimmed, 10);
  if (value < 0 || value > 100) {
    throw new Error(`${name} debe ser un entero entre 0 y 100.`);
  }
  return value;
}

function isDryRun() {
  return ['1', 'true', 'yes', 'si', 'sí'].includes(String(process.env.SEED_DRY_RUN ?? '').toLowerCase());
}

function slugify(value) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 28) || 'consultorio'
  );
}

/** Genera slugs únicos para que dos consultorios con el mismo nombre no colisionen. */
function buildUniqueSlugs(clinics) {
  const used = new Map();
  const result = new Map();

  for (const clinic of clinics) {
    const base = slugify(clinic.name);
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    result.set(clinic.id, count === 1 ? base : `${base}-${count}`);
  }

  return result;
}

function nameFromPool(pool, index) {
  const base = pool[(index - 1) % pool.length];
  const cycle = Math.floor((index - 1) / pool.length);
  return cycle === 0 ? base : `${base} ${cycle + 1}`;
}

async function listAllAuthUsers() {
  const users = [];
  const perPage = 200;

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`No se pudieron consultar los usuarios de Auth: ${error.message}`);

    const batch = data.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;
  }

  return users;
}

async function main() {
  const doctorsPerClinic = readCount('SEED_DOCTORS', 5);
  const receptionistsPerClinic = readCount('SEED_RECEPTIONISTS', 2);
  const password = process.env.SEED_PASSWORD;
  const dryRun = isDryRun();

  if (doctorsPerClinic === 0 && receptionistsPerClinic === 0) {
    console.log('No hay nada que crear: SEED_DOCTORS y SEED_RECEPTIONISTS están en 0.');
    return;
  }

  if (!dryRun && (!password || password.length < 8)) {
    throw new Error('Configura SEED_PASSWORD con al menos 8 caracteres para crear cuentas.');
  }

  let clinicsQuery = admin.from('clinics').select('id, name').order('name');
  if (process.env.SEED_CLINIC_ID) {
    clinicsQuery = clinicsQuery.eq('id', process.env.SEED_CLINIC_ID);
  }

  const { data: clinics, error: clinicsError } = await clinicsQuery;
  if (clinicsError) throw new Error(`No se pudieron consultar los consultorios: ${clinicsError.message}`);
  if (!clinics?.length) {
    throw new Error(
      process.env.SEED_CLINIC_ID
        ? `No existe el consultorio ${process.env.SEED_CLINIC_ID}.`
        : 'No hay consultorios registrados. Crea uno antes de ejecutar el seed.'
    );
  }

  const { data: profiles, error: profilesError } = await admin
    .from('users')
    .select('id, clinic_id, role, full_name, is_active');
  if (profilesError) throw new Error(`No se pudieron consultar los perfiles: ${profilesError.message}`);

  const authUsers = await listAllAuthUsers();
  const authByEmail = new Map(
    authUsers
      .filter((user) => user.email)
      .map((user) => [user.email.toLowerCase(), user])
  );
  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const slugs = buildUniqueSlugs(clinics);

  const stats = {
    created: 0,
    repaired: 0,
    existing: 0,
    conflicts: 0,
    errors: 0,
    planned: 0,
  };

  console.log(
    `${dryRun ? '[DRY RUN] ' : ''}Seed de personal: ${doctorsPerClinic} odontólogo(s) y ` +
      `${receptionistsPerClinic} recepcionista(s) por consultorio.`
  );

  for (const clinic of clinics) {
    const slug = slugs.get(clinic.id);
    const clinicAdmin =
      (profiles ?? []).find(
        (profile) =>
          profile.clinic_id === clinic.id &&
          profile.role === 'administrador' &&
          profile.is_active
      ) ??
      (profiles ?? []).find(
        (profile) => profile.clinic_id === clinic.id && profile.role === 'administrador'
      );

    console.log(`\nConsultorio: ${clinic.name} (${slug})`);

    const plan = [
      ...Array.from({ length: doctorsPerClinic }, (_, index) => ({
        role: 'odontologo',
        email: `medico${index + 1}.${slug}@clinicadental.com`,
        fullName: nameFromPool(DOCTOR_NAMES, index + 1),
      })),
      ...Array.from({ length: receptionistsPerClinic }, (_, index) => ({
        role: 'recepcionista',
        email: `recepcion${index + 1}.${slug}@clinicadental.com`,
        fullName: nameFromPool(RECEPTIONIST_NAMES, index + 1),
      })),
    ];

    for (const item of plan) {
      const emailKey = item.email.toLowerCase();
      const existingAuth = authByEmail.get(emailKey);
      const existingProfile = existingAuth ? profilesById.get(existingAuth.id) : null;

      if (existingProfile) {
        if (existingProfile.clinic_id !== clinic.id) {
          console.warn(`  ! ${item.email} ya existe en otro consultorio; se omite.`);
          stats.conflicts += 1;
        } else {
          console.log(`  = ${item.email} ya existe; se omite.`);
          stats.existing += 1;
        }
        continue;
      }

      if (dryRun) {
        console.log(`  + [dry-run] ${item.fullName} <${item.email}> (${item.role})`);
        stats.planned += 1;
        continue;
      }

      let userId = existingAuth?.id;
      let authCreated = false;

      if (!existingAuth) {
        const { data, error } = await admin.auth.admin.createUser({
          email: item.email,
          password,
          email_confirm: true,
          user_metadata: {
            clinic_id: clinic.id,
            full_name: item.fullName,
            role: item.role,
          },
        });

        if (error || !data.user) {
          console.error(`  ! No se pudo crear ${item.email}: ${error?.message ?? 'sin usuario'}`);
          stats.errors += 1;
          continue;
        }

        userId = data.user.id;
        authCreated = true;
      }

      const { error: profileError } = await admin.from('users').insert({
        id: userId,
        clinic_id: clinic.id,
        full_name: item.fullName,
        role: item.role,
        is_active: true,
        mfa_enabled: false,
      });

      if (profileError) {
        console.error(`  ! No se pudo crear el perfil de ${item.email}: ${profileError.message}`);
        if (authCreated) {
          await admin.auth.admin.deleteUser(userId).catch(() => {});
        }
        stats.errors += 1;
        continue;
      }

      const actor = clinicAdmin ?? { id: userId, role: item.role };
      const { error: auditError } = await admin.from('audit_logs').insert({
        clinic_id: clinic.id,
        user_id: actor.id,
        role: actor.role,
        entity_type: 'usuario',
        entity_id: userId,
        action: 'create',
        result: 'success',
        metadata: {
          source: 'seed-staff',
          created_user_email: item.email,
          assigned_role: item.role,
          repaired_profile: !authCreated,
        },
      });

      if (auditError) {
        console.warn(`  (aviso) Sin auditoría para ${item.email}: ${auditError.message}`);
      }

      authByEmail.set(emailKey, existingAuth ?? { id: userId, email: item.email });
      profilesById.set(userId, {
        id: userId,
        clinic_id: clinic.id,
        role: item.role,
        full_name: item.fullName,
      });

      if (authCreated) {
        console.log(`  + ${item.fullName} <${item.email}> (${item.role})`);
        stats.created += 1;
      } else {
        console.log(`  ~ ${item.email} existía sin perfil; perfil reparado.`);
        stats.repaired += 1;
      }
    }
  }

  console.log('\nResumen');
  console.log(`  Creados:                    ${stats.created}`);
  console.log(`  Perfiles reparados:         ${stats.repaired}`);
  console.log(`  Ya existentes:              ${stats.existing}`);
  console.log(`  Conflictos de consultorio:  ${stats.conflicts}`);
  console.log(`  Errores:                    ${stats.errors}`);
  if (dryRun) console.log(`  Planificados (dry-run):     ${stats.planned}`);

  console.log(
    '\nNota: este seed no evita la pausa de Supabase por inactividad. ' +
      'Programa `npm run keep-alive` o el workflow de GitHub Actions.'
  );

  if (stats.errors > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Error desconocido durante el seed');
  process.exitCode = 1;
});
