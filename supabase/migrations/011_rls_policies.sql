-- ============================================================
-- 011_rls_policies.sql
-- Políticas RLS para todas las tablas
-- Requisitos: 2.10, 6.3, 7.7, 8.1, 8.5
-- ============================================================

-- ============================================================
-- CLINICS
-- ============================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Solo usuarios del consultorio pueden ver su propio consultorio
CREATE POLICY "clinics_select_own" ON clinics FOR SELECT
  USING (id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

-- Solo el administrador del consultorio puede actualizar los datos
CREATE POLICY "clinics_update_admin" ON clinics FOR UPDATE
  USING (
    id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

-- ============================================================
-- USERS
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios del mismo consultorio pueden ver a sus compañeros
CREATE POLICY "users_select_same_clinic" ON users FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

-- Solo el administrador puede crear usuarios en su consultorio
CREATE POLICY "users_insert_admin" ON users FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

-- Solo el administrador puede actualizar usuarios de su consultorio
CREATE POLICY "users_update_admin" ON users FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

-- DELETE denegado para todos (se desactiva, no se elimina)
-- No se crea política DELETE → rechazada por defecto con RLS habilitado

-- ============================================================
-- PATIENTS
-- ============================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Todos los roles del consultorio pueden ver pacientes
CREATE POLICY "patients_select_same_clinic" ON patients FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

-- Todos los roles autorizados pueden registrar pacientes
CREATE POLICY "patients_insert_authorized" ON patients FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo','recepcionista')
  );

-- Todos los roles autorizados pueden actualizar pacientes
CREATE POLICY "patients_update_authorized" ON patients FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo','recepcionista')
  );

-- ============================================================
-- APPOINTMENTS
-- ============================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Todos los roles del consultorio pueden ver citas
CREATE POLICY "appointments_select_same_clinic" ON appointments FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

-- Todos los roles autorizados pueden crear citas
CREATE POLICY "appointments_insert_authorized" ON appointments FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo','recepcionista')
  );

-- Todos los roles autorizados pueden actualizar citas (cancelar, reprogramar, cambiar estado)
CREATE POLICY "appointments_update_authorized" ON appointments FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo','recepcionista')
  );

-- ============================================================
-- CLINICAL_RECORDS
-- ============================================================
ALTER TABLE clinical_records ENABLE ROW LEVEL SECURITY;

-- Solo administrador y odontólogo pueden ver historias clínicas
CREATE POLICY "clinical_records_select_clinical" ON clinical_records FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- Solo administrador y odontólogo pueden crear historias clínicas
CREATE POLICY "clinical_records_insert_dentist" ON clinical_records FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- UPDATE solo para incrementar version (control de concurrencia)
CREATE POLICY "clinical_records_update_version" ON clinical_records FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- ============================================================
-- CLINICAL_ENTRIES (inmutables)
-- ============================================================
ALTER TABLE clinical_entries ENABLE ROW LEVEL SECURITY;

-- Solo administrador y odontólogo pueden ver entradas clínicas
CREATE POLICY "clinical_entries_select_clinical" ON clinical_entries FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- Solo administrador y odontólogo pueden insertar entradas clínicas
CREATE POLICY "clinical_entries_insert_dentist" ON clinical_entries FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- UPDATE y DELETE denegados para TODOS (inmutabilidad garantizada por RLS)
-- No se crean políticas UPDATE ni DELETE → rechazadas por defecto

-- ============================================================
-- CLINICAL_ATTACHMENTS
-- ============================================================
ALTER TABLE clinical_attachments ENABLE ROW LEVEL SECURITY;

-- Solo administrador y odontólogo pueden ver adjuntos
CREATE POLICY "clinical_attachments_select_clinical" ON clinical_attachments FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- Solo administrador y odontólogo pueden insertar adjuntos
CREATE POLICY "clinical_attachments_insert_dentist" ON clinical_attachments FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- ============================================================
-- ODONTOGRAM_STATES (inmutables — append only)
-- ============================================================
ALTER TABLE odontogram_states ENABLE ROW LEVEL SECURITY;

-- Solo administrador y odontólogo pueden ver estados del odontograma
CREATE POLICY "odontogram_select_clinical" ON odontogram_states FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- Solo administrador y odontólogo pueden insertar estados del odontograma
CREATE POLICY "odontogram_insert_dentist" ON odontogram_states FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- UPDATE y DELETE denegados: el historial es append-only

-- ============================================================
-- CUSTOM_TOOTH_STATUSES
-- ============================================================
ALTER TABLE custom_tooth_statuses ENABLE ROW LEVEL SECURITY;

-- Todos los roles clínicos del consultorio pueden ver estados personalizados
CREATE POLICY "custom_statuses_select_same_clinic" ON custom_tooth_statuses FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

-- Solo el administrador puede crear estados personalizados
CREATE POLICY "custom_statuses_insert_admin" ON custom_tooth_statuses FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

-- Solo el administrador puede actualizar estados personalizados
CREATE POLICY "custom_statuses_update_admin" ON custom_tooth_statuses FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

-- ============================================================
-- AUDIT_LOGS (inmutables)
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo el administrador puede leer los logs de auditoría de su consultorio
CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'administrador'
  );

-- INSERT permitido solo desde el servidor (service_role) vía Server Action
-- Las Server Actions usan supabase admin client que bypassa RLS
-- UPDATE y DELETE denegados para TODOS (incluido administrador)
