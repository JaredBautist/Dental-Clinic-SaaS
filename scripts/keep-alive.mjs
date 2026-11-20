import fs from 'node:fs';
import path from 'node:path';

/**
 * Petición ligera a Supabase para mantener activo el proyecto gratuito.
 * Supabase pausa proyectos sin actividad durante 7 días; una petición diaria evita la pausa.
 *
 * Uso: npm run keep-alive
 * Programación sugerida: cron diario o el workflow .github/workflows/supabase-keepalive.yml
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  throw new Error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY (o SUPABASE_URL / SUPABASE_ANON_KEY).'
  );
}

const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/health`;
const startedAt = Date.now();

try {
  const response = await fetch(endpoint, {
    headers: { apikey: anonKey },
    cache: 'no-store',
  });
  const elapsed = Date.now() - startedAt;

  console.log(
    `[keep-alive] ${new Date().toISOString()} · HTTP ${response.status} · ${elapsed} ms · ${endpoint}`
  );

  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    console.error(body);
    process.exitCode = 1;
  }
} catch (error) {
  console.error(
    `[keep-alive] Falló la petición a Supabase: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
  process.exitCode = 1;
}
