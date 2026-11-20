\set ON_ERROR_STOP on

GRANT USAGE ON SCHEMA public, storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('10000000-0000-4000-8000-000000000001', 'admin-a@example.test'),
  ('10000000-0000-4000-8000-000000000002', 'reception-a@example.test'),
  ('20000000-0000-4000-8000-000000000001', 'admin-b@example.test');

INSERT INTO public.clinics (id, name) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Clínica A'),
  ('b0000000-0000-4000-8000-000000000001', 'Clínica B');

INSERT INTO public.users (id, clinic_id, role, full_name) VALUES
  ('10000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'administrador', 'Admin A'),
  ('10000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'recepcionista', 'Recepción A'),
  ('20000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'administrador', 'Admin B');

INSERT INTO public.patients (
  id, clinic_id, full_name, document_type, document_number,
  birth_date, biological_sex, phone_primary
) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Paciente A', 'CC', '1001', '1990-01-01', 'femenino', '3000000001'),
  ('b1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Paciente B', 'CC', '2001', '1990-01-01', 'masculino', '3000000002');

INSERT INTO public.clinical_records (
  id, clinic_id, patient_id
) VALUES (
  'a2000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001'
);

INSERT INTO public.clinical_entries (
  id, clinic_id, record_id, patient_id, dentist_id, entry_type, content
) VALUES (
  'a3000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'a2000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'diagnostico',
  'Registro inmutable'
);

-- Integridad referencial: una FK compuesta debe rechazar referencias cruzadas.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.clinical_records (clinic_id, patient_id)
    VALUES (
      'a0000000-0000-4000-8000-000000000001',
      'b1000000-0000-4000-8000-000000000001'
    );
    RAISE EXCEPTION 'cross-tenant foreign key was accepted';
  EXCEPTION
    WHEN foreign_key_violation THEN NULL;
  END;
END;
$$;

-- Un administrador solo observa filas de su clínica.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  TRUE
);
DO $$
DECLARE
  visible_patients INTEGER;
  foreign_patients INTEGER;
BEGIN
  SELECT count(*) INTO visible_patients FROM public.patients;
  SELECT count(*) INTO foreign_patients
  FROM public.patients
  WHERE clinic_id = 'b0000000-0000-4000-8000-000000000001';

  IF visible_patients <> 1 OR foreign_patients <> 0 THEN
    RAISE EXCEPTION 'tenant isolation failed: visible %, foreign %', visible_patients, foreign_patients;
  END IF;
END;
$$;
ROLLBACK;

-- Recepción no puede leer historia clínica.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000002',
  TRUE
);
DO $$
DECLARE
  visible_records INTEGER;
BEGIN
  SELECT count(*) INTO visible_records FROM public.clinical_records;
  IF visible_records <> 0 THEN
    RAISE EXCEPTION 'receptionist can read clinical records';
  END IF;
END;
$$;
ROLLBACK;

-- Las entradas clínicas siguen siendo inmutables incluso para admin.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  TRUE
);
DO $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.clinical_entries
  SET content = 'Mutado'
  WHERE id = 'a3000000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  IF affected_rows <> 0 THEN
    RAISE EXCEPTION 'immutable clinical entry was updated';
  END IF;
END;
$$;
ROLLBACK;

-- El hook firma claims de negocio sin sobrescribir `role=authenticated`.
BEGIN;
SET LOCAL ROLE supabase_auth_admin;
DO $$
DECLARE
  result JSONB;
BEGIN
  result := public.custom_access_token_hook(
    jsonb_build_object(
      'user_id', '10000000-0000-4000-8000-000000000001',
      'claims', jsonb_build_object('role', 'authenticated')
    )
  );

  IF result #>> '{claims,role}' <> 'authenticated'
    OR result #>> '{claims,user_role}' <> 'administrador'
    OR result #>> '{claims,clinic_id}' <> 'a0000000-0000-4000-8000-000000000001'
    OR result #>> '{claims,user_id}' <> '10000000-0000-4000-8000-000000000001'
  THEN
    RAISE EXCEPTION 'custom access token claims are invalid: %', result;
  END IF;
END;
$$;
ROLLBACK;

-- El quinto fallo bloquea exactamente durante la ventana configurada.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
  lockout RECORD;
BEGIN
  PERFORM * FROM public.record_failed_login_attempt(repeat('a', 64));
  PERFORM * FROM public.record_failed_login_attempt(repeat('a', 64));
  PERFORM * FROM public.record_failed_login_attempt(repeat('a', 64));
  PERFORM * FROM public.record_failed_login_attempt(repeat('a', 64));
  SELECT * INTO lockout
  FROM public.record_failed_login_attempt(repeat('a', 64));

  IF lockout.is_locked IS NOT TRUE
    OR lockout.attempts_left <> 0
    OR lockout.remaining_seconds <> 900
    OR lockout.triggered_lockout IS NOT TRUE
  THEN
    RAISE EXCEPTION 'persistent lockout failed: %', lockout;
  END IF;
END;
$$;
ROLLBACK;

-- Clinical workspaces: two dentists in one clinic, separate tenant and explicit operator.
BEGIN;
INSERT INTO auth.users (id, email) VALUES
  ('10000000-0000-4000-8000-000000000003', 'dentist-a1@example.test'),
  ('10000000-0000-4000-8000-000000000004', 'dentist-a2@example.test');
INSERT INTO public.users (id, clinic_id, role, full_name) VALUES
  ('10000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'odontologo', 'Dentist A1'),
  ('10000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'odontologo', 'Dentist A2');
INSERT INTO public.appointments (clinic_id, patient_id, dentist_id, created_by, scheduled_at, duration_min, reason)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '2026-11-20 14:00+00', 30, 'Control'),
  ('a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', '2026-11-20 15:00+00', 30, 'Control');
INSERT INTO private.platform_operators VALUES ('10000000-0000-4000-8000-000000000001');
INSERT INTO public.clinical_documents
  (clinic_id, patient_id, author_id, author_role, request_id, kind, file_name, file_size_bytes, storage_path)
VALUES
  ('a0000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002', 'recepcionista', gen_random_uuid(), 'external_pdf', 'example.pdf', 100, 'test/a.pdf');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
SELECT set_config('request.jwt.claims', '{"aal":"aal2"}', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.appointments) <> 1 OR
    EXISTS (SELECT FROM public.appointments WHERE dentist_id <> auth.uid()) THEN
    RAISE EXCEPTION 'dentist can see assignments of another dentist';
  END IF;
  IF (SELECT count(*) FROM public.clinical_documents) <> 1 THEN
    RAISE EXCEPTION 'authorized dentist cannot see clinic document';
  END IF;
END;
$$;

SELECT set_config('request.jwt.claims', '{"aal":"aal1"}', true);
DO $$ BEGIN
  IF EXISTS (SELECT FROM public.clinical_documents) THEN
    RAISE EXCEPTION 'dentist without AAL2 can read documents';
  END IF;
END $$;

SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
SELECT set_config('request.jwt.claims', '{"aal":"aal2"}', true);
DO $$ BEGIN
  IF EXISTS (SELECT FROM public.clinical_documents) THEN
    RAISE EXCEPTION 'reception can read clinical documents';
  END IF;
END $$;

SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
DO $$ BEGIN
  IF public.has_platform_access() OR EXISTS (SELECT FROM public.clinical_documents) THEN
    RAISE EXCEPTION 'foreign admin can access platform or clinical documents';
  END IF;
  BEGIN
    UPDATE public.clinics SET subscription_plan = 'Unexpected' WHERE id = 'b0000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'tenant administrator can write plan directly';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.set_clinic_subscription('a0000000-0000-4000-8000-000000000001', 'Unexpected', 'active', '2026-11-20', '2026-12-20');
    RAISE EXCEPTION 'tenant administrator can invoke subscription RPC';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;

SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
SELECT set_config('request.jwt.claims', '{"aal":"aal1"}', true);
DO $$ BEGIN
  IF public.has_platform_access() THEN RAISE EXCEPTION 'operator bypassed AAL2'; END IF;
END $$;
SELECT set_config('request.jwt.claims', '{"aal":"aal2"}', true);
DO $$ BEGIN
  IF NOT public.set_clinic_subscription('b0000000-0000-4000-8000-000000000001', 'Annual', 'active', '2026-11-20', '2027-11-20') THEN
    RAISE EXCEPTION 'operator could not update subscription';
  END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM public.audit_logs WHERE clinic_id = 'b0000000-0000-4000-8000-000000000001' AND metadata ? 'subscription') THEN
    RAISE EXCEPTION 'subscription change was not audited';
  END IF;
END $$;
ROLLBACK;
