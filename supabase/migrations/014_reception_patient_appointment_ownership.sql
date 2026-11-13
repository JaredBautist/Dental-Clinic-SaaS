-- 014_reception_patient_appointment_ownership.sql
-- Separa la titularidad operativa: recepcionista registra y gestiona pacientes/citas;
-- odontologo y administrador conservan lectura dentro de su consultorio.

DROP POLICY IF EXISTS "patients_insert_authorized" ON public.patients;
DROP POLICY IF EXISTS "patients_update_authorized" ON public.patients;

CREATE POLICY "patients_insert_authorized"
  ON public.patients FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'recepcionista'
  );

CREATE POLICY "patients_update_authorized"
  ON public.patients FOR UPDATE TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'recepcionista'
  )
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'recepcionista'
  );

DROP POLICY IF EXISTS "appointments_insert_authorized" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_authorized" ON public.appointments;

CREATE POLICY "appointments_insert_authorized"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'recepcionista'
  );

CREATE POLICY "appointments_update_authorized"
  ON public.appointments FOR UPDATE TO authenticated
  USING (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'recepcionista'
  )
  WITH CHECK (
    clinic_id = private.current_clinic_id()
    AND private.current_user_role() = 'recepcionista'
  );
