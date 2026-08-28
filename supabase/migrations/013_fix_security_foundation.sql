-- ============================================================
-- 013_fix_security_foundation.sql
-- Correcciones aditivas para RLS, claims JWT, integridad tenant
-- y bloqueo persistente de autenticación.
-- ============================================================

BEGIN;

-- Las funciones de contexto no se exponen mediante la Data API.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.current_clinic_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.clinic_id
  FROM public.users AS u
  WHERE u.id = auth.uid()
    AND u.is_active = TRUE;
$$;

CREATE OR REPLACE FUNCTION private.current_user_role()
RETURNS VARCHAR(20)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.role
  FROM public.users AS u
  WHERE u.id = auth.uid()
    AND u.is_active = TRUE;
$$;

REVOKE ALL ON FUNCTION private.current_clinic_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_clinic_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_user_role() TO authenticated, service_role;

-- ============================================================
-- RLS no recursivo
-- ============================================================

DROP POLICY IF EXISTS "clinics_select_own" ON public.clinics;
DROP POLICY IF EXISTS "clinics_update_admin" ON public.clinics;

CREATE POLICY "clinics_select_own"
  ON public.clinics FOR SELECT TO authenticated
  USING (id = private.current_clinic_id());

CREATE POLICY "clinics_update_admin"
  ON public.clinics FOR UPDATE TO authenticated
  USING (
    id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  )
  WITH CHECK (
    id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  );

DROP POLICY IF EXISTS "users_select_same_clinic" ON public.users;
DROP POLICY IF EXISTS "users_insert_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;

CREATE POLICY "users_select_same_clinic"
  ON public.users FOR SELECT TO authenticated
  USING (clinic_id = private.current_clinic_id());

CREATE POLICY "users_insert_admin"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  );

CREATE POLICY "users_update_admin"
  ON public.users FOR UPDATE TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  )
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  );

DROP POLICY IF EXISTS "patients_select_same_clinic" ON public.patients;
DROP POLICY IF EXISTS "patients_insert_authorized" ON public.patients;
DROP POLICY IF EXISTS "patients_update_authorized" ON public.patients;

CREATE POLICY "patients_select_same_clinic"
  ON public.patients FOR SELECT TO authenticated
  USING (clinic_id = private.current_clinic_id());

CREATE POLICY "patients_insert_authorized"
  ON public.patients FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo', 'recepcionista')
  );

CREATE POLICY "patients_update_authorized"
  ON public.patients FOR UPDATE TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo', 'recepcionista')
  )
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo', 'recepcionista')
  );

DROP POLICY IF EXISTS "appointments_select_same_clinic" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_authorized" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_authorized" ON public.appointments;

CREATE POLICY "appointments_select_same_clinic"
  ON public.appointments FOR SELECT TO authenticated
  USING (clinic_id = private.current_clinic_id());

CREATE POLICY "appointments_insert_authorized"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo', 'recepcionista')
  );

CREATE POLICY "appointments_update_authorized"
  ON public.appointments FOR UPDATE TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo', 'recepcionista')
  )
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo', 'recepcionista')
  );

DROP POLICY IF EXISTS "clinical_records_select_clinical" ON public.clinical_records;
DROP POLICY IF EXISTS "clinical_records_insert_dentist" ON public.clinical_records;
DROP POLICY IF EXISTS "clinical_records_update_version" ON public.clinical_records;

CREATE POLICY "clinical_records_select_clinical"
  ON public.clinical_records FOR SELECT TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

CREATE POLICY "clinical_records_insert_dentist"
  ON public.clinical_records FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

CREATE POLICY "clinical_records_update_version"
  ON public.clinical_records FOR UPDATE TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  )
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

DROP POLICY IF EXISTS "clinical_entries_select_clinical" ON public.clinical_entries;
DROP POLICY IF EXISTS "clinical_entries_insert_dentist" ON public.clinical_entries;

CREATE POLICY "clinical_entries_select_clinical"
  ON public.clinical_entries FOR SELECT TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

CREATE POLICY "clinical_entries_insert_dentist"
  ON public.clinical_entries FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

DROP POLICY IF EXISTS "clinical_attachments_select_clinical" ON public.clinical_attachments;
DROP POLICY IF EXISTS "clinical_attachments_insert_dentist" ON public.clinical_attachments;

CREATE POLICY "clinical_attachments_select_clinical"
  ON public.clinical_attachments FOR SELECT TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

CREATE POLICY "clinical_attachments_insert_dentist"
  ON public.clinical_attachments FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

DROP POLICY IF EXISTS "odontogram_select_clinical" ON public.odontogram_states;
DROP POLICY IF EXISTS "odontogram_insert_dentist" ON public.odontogram_states;

CREATE POLICY "odontogram_select_clinical"
  ON public.odontogram_states FOR SELECT TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

CREATE POLICY "odontogram_insert_dentist"
  ON public.odontogram_states FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

DROP POLICY IF EXISTS "custom_statuses_select_same_clinic" ON public.custom_tooth_statuses;
DROP POLICY IF EXISTS "custom_statuses_insert_admin" ON public.custom_tooth_statuses;
DROP POLICY IF EXISTS "custom_statuses_update_admin" ON public.custom_tooth_statuses;

CREATE POLICY "custom_statuses_select_same_clinic"
  ON public.custom_tooth_statuses FOR SELECT TO authenticated
  USING (clinic_id = private.current_clinic_id());

CREATE POLICY "custom_statuses_insert_admin"
  ON public.custom_tooth_statuses FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  );

CREATE POLICY "custom_statuses_update_admin"
  ON public.custom_tooth_statuses FOR UPDATE TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  )
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  );

DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;

CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'administrador'
  );

-- Storage deja de consultar public.users directamente.
DROP POLICY IF EXISTS "storage_insert_clinical" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_clinical" ON storage.objects;

CREATE POLICY "storage_insert_clinical"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'clinical-files'
    AND (storage.foldername(name))[1] = private.current_clinic_id()::TEXT
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

CREATE POLICY "storage_select_clinical"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'clinical-files'
    AND (storage.foldername(name))[1] = private.current_clinic_id()::TEXT
    AND private.current_user_role() IN ('administrador', 'odontologo')
  );

-- ============================================================
-- Integridad referencial por tenant
-- ============================================================

ALTER TABLE public.users
  ADD CONSTRAINT users_clinic_id_id_unique UNIQUE (clinic_id, id);
ALTER TABLE public.patients
  ADD CONSTRAINT patients_clinic_id_id_unique UNIQUE (clinic_id, id);
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_clinic_id_id_unique UNIQUE (clinic_id, id);
ALTER TABLE public.clinical_records
  ADD CONSTRAINT clinical_records_clinic_id_id_unique UNIQUE (clinic_id, id);
ALTER TABLE public.clinical_entries
  ADD CONSTRAINT clinical_entries_clinic_id_id_unique UNIQUE (clinic_id, id);

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_patient_same_clinic
    FOREIGN KEY (clinic_id, patient_id) REFERENCES public.patients (clinic_id, id),
  ADD CONSTRAINT appointments_dentist_same_clinic
    FOREIGN KEY (clinic_id, dentist_id) REFERENCES public.users (clinic_id, id),
  ADD CONSTRAINT appointments_creator_same_clinic
    FOREIGN KEY (clinic_id, created_by) REFERENCES public.users (clinic_id, id),
  ADD CONSTRAINT appointments_canceller_same_clinic
    FOREIGN KEY (clinic_id, cancelled_by) REFERENCES public.users (clinic_id, id),
  ADD CONSTRAINT appointments_reschedule_same_clinic
    FOREIGN KEY (clinic_id, rescheduled_from) REFERENCES public.appointments (clinic_id, id);

ALTER TABLE public.clinical_records
  ADD CONSTRAINT clinical_records_patient_same_clinic
    FOREIGN KEY (clinic_id, patient_id) REFERENCES public.patients (clinic_id, id);

ALTER TABLE public.clinical_entries
  ADD CONSTRAINT clinical_entries_record_same_clinic
    FOREIGN KEY (clinic_id, record_id) REFERENCES public.clinical_records (clinic_id, id),
  ADD CONSTRAINT clinical_entries_patient_same_clinic
    FOREIGN KEY (clinic_id, patient_id) REFERENCES public.patients (clinic_id, id),
  ADD CONSTRAINT clinical_entries_dentist_same_clinic
    FOREIGN KEY (clinic_id, dentist_id) REFERENCES public.users (clinic_id, id),
  ADD CONSTRAINT clinical_entries_correction_same_clinic
    FOREIGN KEY (clinic_id, corrects_entry_id) REFERENCES public.clinical_entries (clinic_id, id);

ALTER TABLE public.clinical_attachments
  ADD CONSTRAINT clinical_attachments_entry_same_clinic
    FOREIGN KEY (clinic_id, entry_id) REFERENCES public.clinical_entries (clinic_id, id),
  ADD CONSTRAINT clinical_attachments_patient_same_clinic
    FOREIGN KEY (clinic_id, patient_id) REFERENCES public.patients (clinic_id, id);

ALTER TABLE public.odontogram_states
  ADD CONSTRAINT odontogram_patient_same_clinic
    FOREIGN KEY (clinic_id, patient_id) REFERENCES public.patients (clinic_id, id),
  ADD CONSTRAINT odontogram_dentist_same_clinic
    FOREIGN KEY (clinic_id, dentist_id) REFERENCES public.users (clinic_id, id);

-- RLS controla quién actualiza; este trigger limita qué puede cambiar.
CREATE OR REPLACE FUNCTION private.enforce_clinical_record_version_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.clinic_id IS DISTINCT FROM OLD.clinic_id
    OR NEW.patient_id IS DISTINCT FROM OLD.patient_id
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR NEW.version <> OLD.version + 1
  THEN
    RAISE EXCEPTION 'clinical_records only permits an atomic version increment'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_clinical_record_version_update ON public.clinical_records;
CREATE TRIGGER enforce_clinical_record_version_update
  BEFORE UPDATE ON public.clinical_records
  FOR EACH ROW EXECUTE FUNCTION private.enforce_clinical_record_version_update();

-- ============================================================
-- Custom Access Token Hook
-- `role` está reservado por Supabase; el rol de negocio se llama
-- `user_role` y también se firma dentro de app_metadata.role.
-- ============================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  claims JSONB;
  signed_app_metadata JSONB;
  profile RECORD;
BEGIN
  SELECT u.clinic_id, u.role, u.is_active
    INTO profile
  FROM public.users AS u
  WHERE u.id = (event->>'user_id')::UUID;

  IF NOT FOUND OR profile.is_active IS NOT TRUE THEN
    RETURN event;
  END IF;

  claims := event->'claims';
  claims := jsonb_set(claims, '{clinic_id}', to_jsonb(profile.clinic_id::TEXT), TRUE);
  claims := jsonb_set(claims, '{user_id}', to_jsonb(event->>'user_id'), TRUE);
  claims := jsonb_set(claims, '{user_role}', to_jsonb(profile.role::TEXT), TRUE);

  signed_app_metadata := COALESCE(claims->'app_metadata', '{}'::JSONB);
  signed_app_metadata := jsonb_set(signed_app_metadata, '{clinic_id}', to_jsonb(profile.clinic_id::TEXT), TRUE);
  signed_app_metadata := jsonb_set(signed_app_metadata, '{user_id}', to_jsonb(event->>'user_id'), TRUE);
  signed_app_metadata := jsonb_set(signed_app_metadata, '{role}', to_jsonb(profile.role::TEXT), TRUE);
  claims := jsonb_set(claims, '{app_metadata}', signed_app_metadata, TRUE);

  RETURN jsonb_set(event, '{claims}', claims, TRUE);
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON TABLE public.users TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "users_select_auth_hook" ON public.users;
CREATE POLICY "users_select_auth_hook"
  ON public.users FOR SELECT TO supabase_auth_admin
  USING (TRUE);

-- ============================================================
-- Bloqueo persistente de login
-- ============================================================

CREATE TABLE private.login_attempts (
  identifier_hash TEXT PRIMARY KEY CHECK (identifier_hash ~ '^[0-9a-f]{64}$'),
  failed_count SMALLINT NOT NULL DEFAULT 0 CHECK (failed_count BETWEEN 0 AND 5),
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

REVOKE ALL ON TABLE private.login_attempts FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_login_lockout(p_identifier_hash TEXT)
RETURNS TABLE (is_locked BOOLEAN, remaining_seconds INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  attempt private.login_attempts%ROWTYPE;
BEGIN
  IF p_identifier_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid identifier hash' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  SELECT * INTO attempt
  FROM private.login_attempts
  WHERE identifier_hash = p_identifier_hash;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;

  IF attempt.locked_until IS NOT NULL AND attempt.locked_until > now() THEN
    RETURN QUERY
      SELECT TRUE, GREATEST(1, CEIL(EXTRACT(EPOCH FROM attempt.locked_until - now()))::INTEGER);
    RETURN;
  END IF;

  IF attempt.locked_until IS NOT NULL THEN
    DELETE FROM private.login_attempts WHERE identifier_hash = p_identifier_hash;
  END IF;

  RETURN QUERY SELECT FALSE, 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_failed_login_attempt(p_identifier_hash TEXT)
RETURNS TABLE (
  is_locked BOOLEAN,
  attempts_left INTEGER,
  remaining_seconds INTEGER,
  triggered_lockout BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  attempt private.login_attempts%ROWTYPE;
  next_count SMALLINT;
BEGIN
  IF p_identifier_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid identifier hash' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  INSERT INTO private.login_attempts (identifier_hash)
  VALUES (p_identifier_hash)
  ON CONFLICT (identifier_hash) DO NOTHING;

  SELECT * INTO attempt
  FROM private.login_attempts
  WHERE identifier_hash = p_identifier_hash
  FOR UPDATE;

  IF attempt.locked_until IS NOT NULL AND attempt.locked_until > now() THEN
    RETURN QUERY SELECT
      TRUE,
      0,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM attempt.locked_until - now()))::INTEGER),
      FALSE;
    RETURN;
  END IF;

  IF attempt.locked_until IS NOT NULL THEN
    attempt.failed_count := 0;
    attempt.locked_until := NULL;
  END IF;

  next_count := LEAST(5, attempt.failed_count + 1);

  UPDATE private.login_attempts
  SET failed_count = next_count,
      locked_until = CASE WHEN next_count >= 5 THEN now() + INTERVAL '15 minutes' ELSE NULL END,
      updated_at = now()
  WHERE identifier_hash = p_identifier_hash;

  RETURN QUERY SELECT
    next_count >= 5,
    GREATEST(0, 5 - next_count)::INTEGER,
    CASE WHEN next_count >= 5 THEN 900 ELSE 0 END,
    next_count >= 5;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_login_attempts(p_identifier_hash TEXT)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM private.login_attempts WHERE identifier_hash = p_identifier_hash;
$$;

REVOKE EXECUTE ON FUNCTION public.check_login_lockout(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_failed_login_attempt(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clear_login_attempts(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_login_lockout(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_failed_login_attempt(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_login_attempts(TEXT) TO service_role;

-- Transactional Outbox: registra la intención; un proveedor de correo
-- separado deberá entregar y marcar processed_at.
CREATE TABLE private.security_notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login_lockout')),
  clinic_id UUID,
  target_email TEXT NOT NULL,
  recipient_emails TEXT[] NOT NULL DEFAULT '{}',
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  last_error TEXT
);

REVOKE ALL ON TABLE private.security_notification_outbox FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.enqueue_login_lockout_notification(p_target_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_clinic_id UUID;
  recipients TEXT[];
  outbox_id UUID;
BEGIN
  IF p_target_email IS NULL OR char_length(p_target_email) > 254 THEN
    RAISE EXCEPTION 'invalid target email' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  SELECT profile.clinic_id INTO target_clinic_id
  FROM auth.users AS auth_user
  JOIN public.users AS profile ON profile.id = auth_user.id
  WHERE lower(auth_user.email) = lower(p_target_email)
  LIMIT 1;

  -- Mantener la misma respuesta observable para emails inexistentes, sin
  -- llenar el outbox con destinatarios imposibles.
  IF target_clinic_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(array_agg(auth_admin.email) FILTER (WHERE auth_admin.email IS NOT NULL), '{}')
    INTO recipients
  FROM public.users AS admin_profile
  JOIN auth.users AS auth_admin ON auth_admin.id = admin_profile.id
  WHERE admin_profile.clinic_id = target_clinic_id
    AND admin_profile.role = 'administrador'
    AND admin_profile.is_active = TRUE;

  IF COALESCE(cardinality(recipients), 0) = 0 THEN
    RETURN NULL;
  END IF;

  INSERT INTO private.security_notification_outbox (
    event_type,
    clinic_id,
    target_email,
    recipient_emails,
    payload
  ) VALUES (
    'login_lockout',
    target_clinic_id,
    lower(p_target_email),
    COALESCE(recipients, '{}'),
    jsonb_build_object('lockout_minutes', 15)
  )
  RETURNING id INTO outbox_id;

  RETURN outbox_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enqueue_login_lockout_notification(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_login_lockout_notification(TEXT)
  TO service_role;

COMMIT;
