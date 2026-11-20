BEGIN;

CREATE TABLE private.platform_operators (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE
);
REVOKE ALL ON private.platform_operators FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.has_platform_access()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT coalesce((auth.jwt() ->> 'aal') = 'aal2', false)
    AND EXISTS (
      SELECT 1 FROM private.platform_operators p
      JOIN public.users u ON u.id = p.user_id
      WHERE p.user_id = auth.uid() AND u.is_active AND u.role = 'administrador'
    );
$$;
REVOKE ALL ON FUNCTION public.has_platform_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_platform_access() TO authenticated;

ALTER TABLE public.clinics
  ADD COLUMN subscription_plan text CHECK (char_length(subscription_plan) BETWEEN 1 AND 80),
  ADD COLUMN subscription_status text NOT NULL DEFAULT 'pending'
    CHECK (subscription_status IN ('pending', 'active', 'paused', 'cancelled')),
  ADD COLUMN subscription_starts_on date,
  ADD COLUMN subscription_ends_on date,
  ADD CONSTRAINT clinic_subscription_dates CHECK (
    (subscription_starts_on IS NULL AND subscription_ends_on IS NULL)
    OR (subscription_starts_on IS NOT NULL AND subscription_ends_on IS NOT NULL
      AND subscription_ends_on >= subscription_starts_on)
  );

-- Existing clinic update policies must not allow editing the platform's subscription fields.
CREATE FUNCTION private.protect_clinic_subscription()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') AND (
    ROW(NEW.subscription_plan, NEW.subscription_status, NEW.subscription_starts_on, NEW.subscription_ends_on)
    IS DISTINCT FROM
    ROW(OLD.subscription_plan, OLD.subscription_status, OLD.subscription_starts_on, OLD.subscription_ends_on)
  ) THEN
    RAISE EXCEPTION 'Subscription changes require platform access' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_clinic_subscription BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION private.protect_clinic_subscription();

CREATE FUNCTION public.set_clinic_subscription(
  target_clinic uuid, plan_name text, plan_status text, starts_on date, ends_on date
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT public.has_platform_access() THEN
    RAISE EXCEPTION 'Platform access required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.clinics
  SET subscription_plan = plan_name, subscription_status = plan_status,
      subscription_starts_on = starts_on, subscription_ends_on = ends_on
  WHERE id = target_clinic;
  IF NOT FOUND THEN RETURN false; END IF;
  INSERT INTO public.audit_logs (clinic_id, user_id, role, entity_type, entity_id, action, result, metadata)
  VALUES (target_clinic, auth.uid(), 'administrador', 'consultorio', target_clinic, 'update', 'success',
    jsonb_build_object('subscription', jsonb_build_object('plan', plan_name, 'status', plan_status,
      'starts_on', starts_on, 'ends_on', ends_on)));
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.set_clinic_subscription(uuid, text, text, date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_clinic_subscription(uuid, text, text, date, date) TO authenticated;

CREATE TABLE public.clinical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  author_id uuid NOT NULL,
  author_role text NOT NULL CHECK (author_role IN ('odontologo', 'recepcionista')),
  request_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('external_pdf', 'patient_report')),
  file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 180),
  file_size_bytes integer NOT NULL CHECK (file_size_bytes BETWEEN 1 AND 20971520),
  storage_path text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (clinic_id, patient_id) REFERENCES public.patients (clinic_id, id),
  FOREIGN KEY (clinic_id, author_id) REFERENCES public.users (clinic_id, id),
  UNIQUE (clinic_id, author_id, request_id)
);
CREATE INDEX clinical_documents_patient_date ON public.clinical_documents (clinic_id, patient_id, created_at DESC);
ALTER TABLE public.clinical_documents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.clinical_documents FROM anon, authenticated;
GRANT SELECT ON public.clinical_documents TO authenticated;
CREATE POLICY clinical_documents_read ON public.clinical_documents FOR SELECT TO authenticated
  USING (clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'odontologo'
    AND (auth.jwt() ->> 'aal') = 'aal2');

CREATE FUNCTION private.audit_clinical_document()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (clinic_id, user_id, role, entity_type, entity_id, action, result, metadata)
  VALUES (NEW.clinic_id, NEW.author_id, NEW.author_role, 'historia_clinica', NEW.patient_id,
    'create', 'success', jsonb_build_object('document_id', NEW.id, 'kind', NEW.kind));
  RETURN NEW;
END;
$$;
CREATE TRIGGER audit_clinical_document AFTER INSERT ON public.clinical_documents
  FOR EACH ROW EXECUTE FUNCTION private.audit_clinical_document();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('patient-documents', 'patient-documents', false, 20971520, ARRAY['application/pdf']);
-- No authenticated object policies. The authorized server issues signed downloads.

DROP POLICY IF EXISTS appointments_select_same_clinic ON public.appointments;
CREATE POLICY appointments_select_same_clinic ON public.appointments FOR SELECT TO authenticated
  USING (clinic_id = private.current_clinic_id()
    AND (private.current_user_role() <> 'odontologo' OR dentist_id = auth.uid()));

COMMIT;
