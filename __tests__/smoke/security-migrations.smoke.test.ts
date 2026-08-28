import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = join(
  process.cwd(),
  'supabase/migrations/013_fix_security_foundation.sql'
);

describe('migración correctiva de seguridad', () => {
  it('elimina la recursión RLS mediante helpers privados con privilegios mínimos', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.current_clinic_id()');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION private.current_user_role()');
    expect(sql).toMatch(/SECURITY DEFINER[\s\S]*SET search_path = ''/);
    expect(sql).toContain('private.current_clinic_id()');
    expect(sql).toContain('private.current_user_role()');
    expect(sql).toContain('DROP POLICY IF EXISTS "users_select_same_clinic"');
  });

  it('versiona claims verificables sin sobrescribir el role reservado de Supabase', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)');
    expect(sql).toContain("'{user_role}'");
    expect(sql).toContain("'{clinic_id}'");
    expect(sql).toContain("'{user_id}'");
    expect(sql).not.toContain("jsonb_set(claims, '{role}'");
  });

  it('persiste el lockout mediante RPC atómica y prepara un outbox de notificación', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('CREATE TABLE private.login_attempts');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.record_failed_login_attempt');
    expect(sql).toContain('FOR UPDATE');
    expect(sql).toContain("INTERVAL '15 minutes'");
    expect(sql).toContain('CREATE TABLE private.security_notification_outbox');
    expect(sql).toMatch(/IF target_clinic_id IS NULL THEN\s+RETURN NULL;/);
  });

  it('impide referencias cruzadas entre tenants con claves foráneas compuestas', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('appointments_patient_same_clinic');
    expect(sql).toContain('clinical_entries_record_same_clinic');
    expect(sql).toContain('clinical_attachments_entry_same_clinic');
    expect(sql).toContain('odontogram_patient_same_clinic');
  });
});
