-- ============================================================
-- ALL MIGRATIONS CONSOLIDATED
-- Ejecutar TODO este archivo en el SQL Editor de Supabase Cloud
-- ============================================================

-- ============================================================
-- 001_create_clinics.sql
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE clinics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120)  NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  address       VARCHAR(255),
  phone         VARCHAR(15)   CHECK (phone ~ '^[0-9]{7,15}$'),
  email         VARCHAR(254)  CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TRIGGER set_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE clinics IS 'Consultorios odontológicos registrados en la plataforma SaaS';
COMMENT ON COLUMN clinics.id IS 'UUID único e irrepetible del consultorio (generado por el servidor)';

-- ============================================================
-- 002_create_users.sql
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id     UUID          NOT NULL REFERENCES clinics(id),
  role          VARCHAR(20)   NOT NULL CHECK (role IN ('administrador', 'odontologo', 'recepcionista')),
  full_name     VARCHAR(200)  NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  mfa_enabled   BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_clinic_role ON users(clinic_id, role);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Usuarios del sistema, vinculados a auth.users de Supabase y a un consultorio';
COMMENT ON COLUMN users.role IS 'Rol: administrador, odontologo o recepcionista';
COMMENT ON COLUMN users.is_active IS 'Los usuarios se desactivan, nunca se eliminan';

-- ============================================================
-- 003_create_patients.sql
-- ============================================================
CREATE TABLE patients (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id         UUID        NOT NULL REFERENCES clinics(id),
  full_name         VARCHAR(200) NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 200),
  document_type     VARCHAR(20)  NOT NULL CHECK (document_type IN ('CC', 'TI', 'CE', 'PA', 'RC', 'NIT')),
  document_number   VARCHAR(20)  NOT NULL CHECK (document_number ~ '^[A-Za-z0-9]{1,20}$'),
  birth_date        DATE         NOT NULL CHECK (birth_date <= CURRENT_DATE),
  biological_sex    VARCHAR(10)  NOT NULL CHECK (biological_sex IN ('masculino', 'femenino', 'intersexual')),
  phone_primary     VARCHAR(15)  NOT NULL CHECK (phone_primary ~ '^[0-9]{7,15}$'),
  email             VARCHAR(254) CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  address           VARCHAR(255),
  guardian_name     VARCHAR(200),
  guardian_phone    VARCHAR(15)  CHECK (guardian_phone ~ '^[0-9]{7,15}$'),
  medical_history   VARCHAR(500),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, document_type, document_number)
);

CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_search ON patients
  USING GIN (to_tsvector('spanish', full_name || ' ' || document_number));
CREATE INDEX idx_patients_document ON patients(clinic_id, document_type, document_number);

CREATE TRIGGER set_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE patients IS 'Pacientes registrados en cada consultorio';
COMMENT ON COLUMN patients.document_type IS 'Tipo documento colombiano: CC, TI, CE, PA, RC, NIT';
COMMENT ON COLUMN patients.biological_sex IS 'Sexo biológico para contexto clínico odontológico';

-- ============================================================
-- 004_create_appointments.sql
-- ============================================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION calc_ends_at(scheduled_at TIMESTAMPTZ, duration_min SMALLINT)
RETURNS TIMESTAMPTZ IMMUTABLE LANGUAGE sql AS $$
  SELECT scheduled_at + (duration_min * interval '1 minute');
$$;

CREATE TABLE appointments (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID          NOT NULL REFERENCES clinics(id),
  patient_id      UUID          NOT NULL REFERENCES patients(id),
  dentist_id      UUID          NOT NULL REFERENCES users(id),
  scheduled_at    TIMESTAMPTZ   NOT NULL,
  duration_min    SMALLINT      NOT NULL CHECK (duration_min BETWEEN 15 AND 480),
  ends_at         TIMESTAMPTZ   GENERATED ALWAYS AS (calc_ends_at(scheduled_at, duration_min)) STORED,
  status          VARCHAR(20)   NOT NULL DEFAULT 'programada'
                  CHECK (status IN ('programada','confirmada','en_curso','completada','cancelada','reprogramada')),
  reason          VARCHAR(500)  NOT NULL,
  cancel_reason   VARCHAR(255),
  cancelled_by    UUID          REFERENCES users(id),
  cancelled_at    TIMESTAMPTZ,
  rescheduled_from UUID         REFERENCES appointments(id),
  created_by      UUID          NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_dentist_date ON appointments(clinic_id, dentist_id, scheduled_at);
CREATE INDEX idx_appointments_patient ON appointments(clinic_id, patient_id);
CREATE INDEX idx_appointments_status ON appointments(clinic_id, status);

ALTER TABLE appointments ADD CONSTRAINT no_overlap_appointments
  EXCLUDE USING gist (
    dentist_id WITH =,
    tstzrange(scheduled_at, ends_at, '[)') WITH &&
  )
  WHERE (status IN ('programada','confirmada','en_curso'));

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE appointments IS 'Citas programadas entre pacientes y odontólogos';
COMMENT ON COLUMN appointments.ends_at IS 'Hora de fin calculada automáticamente (columna generada)';
COMMENT ON CONSTRAINT no_overlap_appointments ON appointments IS 'Previene solapamiento de citas activas del mismo odontólogo';

-- ============================================================
-- 005_create_clinical_records.sql
-- ============================================================
CREATE TABLE clinical_records (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID        NOT NULL REFERENCES clinics(id),
  patient_id  UUID        NOT NULL REFERENCES patients(id),
  version     INTEGER     NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, patient_id)
);

CREATE INDEX idx_clinical_records_clinic_patient ON clinical_records(clinic_id, patient_id);

CREATE TRIGGER set_clinical_records_updated_at
  BEFORE UPDATE ON clinical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE clinical_records IS 'Cabecera de historia clínica — una por paciente por consultorio';
COMMENT ON COLUMN clinical_records.version IS 'Control de concurrencia optimista';

-- ============================================================
-- 006_create_clinical_entries.sql
-- ============================================================
CREATE TABLE clinical_entries (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id         UUID           NOT NULL REFERENCES clinics(id),
  record_id         UUID           NOT NULL REFERENCES clinical_records(id),
  patient_id        UUID           NOT NULL REFERENCES patients(id),
  dentist_id        UUID           NOT NULL REFERENCES users(id),
  entry_type        VARCHAR(30)    NOT NULL
                    CHECK (entry_type IN ('motivo_consulta','diagnostico','plan_tratamiento',
                                          'procedimiento','evolucion','correccion')),
  content           VARCHAR(5000)  NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  corrects_entry_id UUID           REFERENCES clinical_entries(id),
  version           INTEGER        NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

ALTER TABLE clinical_entries ADD CONSTRAINT correction_entry_consistency
  CHECK (
    (entry_type = 'correccion' AND corrects_entry_id IS NOT NULL)
    OR
    (entry_type <> 'correccion' AND corrects_entry_id IS NULL)
  );

CREATE INDEX idx_clinical_entries_record ON clinical_entries(record_id, created_at);
CREATE INDEX idx_clinical_entries_clinic_patient ON clinical_entries(clinic_id, patient_id);

COMMENT ON TABLE clinical_entries IS 'Entradas clínicas inmutables — las correcciones crean nuevas entradas';
COMMENT ON COLUMN clinical_entries.corrects_entry_id IS 'Referencia a la entrada que esta corrección reemplaza (solo para tipo correccion)';

-- ============================================================
-- 007_create_clinical_attachments.sql
-- ============================================================
CREATE TABLE clinical_attachments (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID          NOT NULL REFERENCES clinics(id),
  entry_id        UUID          NOT NULL REFERENCES clinical_entries(id),
  patient_id      UUID          NOT NULL REFERENCES patients(id),
  file_name       VARCHAR(255)  NOT NULL,
  file_type       VARCHAR(10)   NOT NULL CHECK (file_type IN ('JPEG','PNG','PDF','DICOM')),
  file_size_bytes BIGINT        NOT NULL CHECK (file_size_bytes BETWEEN 1 AND 20971520),
  storage_path    TEXT          NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinical_attachments_entry ON clinical_attachments(entry_id);
CREATE INDEX idx_clinical_attachments_clinic_patient ON clinical_attachments(clinic_id, patient_id);

COMMENT ON TABLE clinical_attachments IS 'Archivos adjuntos a entradas clínicas (radiografías, informes, etc.)';
COMMENT ON COLUMN clinical_attachments.file_size_bytes IS 'Tamaño máximo: 20 MB (20971520 bytes)';
COMMENT ON COLUMN clinical_attachments.storage_path IS 'Ruta en Supabase Storage: {clinic_id}/{patient_id}/{entry_id}/{filename}';

-- ============================================================
-- 008_create_odontogram_states.sql
-- ============================================================
CREATE TABLE odontogram_states (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id             UUID          NOT NULL REFERENCES clinics(id),
  patient_id            UUID          NOT NULL REFERENCES patients(id),
  dentist_id            UUID          NOT NULL REFERENCES users(id),
  tooth_code            CHAR(2)       NOT NULL
                        CHECK (tooth_code IN (
                          '11','12','13','14','15','16','17','18',
                          '21','22','23','24','25','26','27','28',
                          '31','32','33','34','35','36','37','38',
                          '41','42','43','44','45','46','47','48'
                        )),
  surface               VARCHAR(20)   NOT NULL
                        CHECK (surface IN ('oclusal','mesial','distal','vestibular','palatino_lingual','completa')),
  status                VARCHAR(50)   NOT NULL,
  proposed_treatment    VARCHAR(500),
  completed_treatment   VARCHAR(500),
  version               INTEGER       NOT NULL DEFAULT 1,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_odontogram_clinic_patient ON odontogram_states(clinic_id, patient_id);
CREATE INDEX idx_odontogram_latest ON odontogram_states(clinic_id, patient_id, tooth_code, surface, created_at DESC);

COMMENT ON TABLE odontogram_states IS 'Historial append-only del odontograma — cada cambio crea un nuevo registro';
COMMENT ON COLUMN odontogram_states.tooth_code IS 'Código FDI de 2 dígitos (nomenclatura dental internacional)';
COMMENT ON COLUMN odontogram_states.surface IS 'Superficie dental: oclusal, mesial, distal, vestibular, palatino_lingual o completa';

-- ============================================================
-- 009_create_custom_tooth_statuses.sql
-- ============================================================
CREATE TABLE custom_tooth_statuses (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID         NOT NULL REFERENCES clinics(id),
  name        VARCHAR(50)  NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  color_hex   CHAR(7)      CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, name)
);

CREATE INDEX idx_custom_statuses_clinic ON custom_tooth_statuses(clinic_id);

COMMENT ON TABLE custom_tooth_statuses IS 'Estados personalizados del odontograma definidos por cada consultorio';
COMMENT ON COLUMN custom_tooth_statuses.color_hex IS 'Color hexadecimal para renderizado en el SVG del odontograma';

-- ============================================================
-- 010_create_audit_logs.sql
-- ============================================================
CREATE TABLE audit_logs (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    UUID         NOT NULL,
  user_id      UUID         NOT NULL,
  role         VARCHAR(20)  NOT NULL,
  entity_type  VARCHAR(30)  NOT NULL
               CHECK (entity_type IN ('consultorio','usuario','paciente','cita','historia_clinica','odontograma')),
  entity_id    UUID         NOT NULL,
  action       VARCHAR(20)  NOT NULL,
  timestamp    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  result       VARCHAR(10)  NOT NULL CHECK (result IN ('success','failure')),
  metadata     JSONB
);

CREATE INDEX idx_audit_clinic_timestamp ON audit_logs(clinic_id, timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_logs(clinic_id, entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(clinic_id, user_id);

COMMENT ON TABLE audit_logs IS 'Registros de auditoría inmutables — toda operación de escritura queda registrada';
COMMENT ON COLUMN audit_logs.clinic_id IS 'Sin FK intencional: preservar registro aunque el consultorio se elimine';
COMMENT ON COLUMN audit_logs.user_id IS 'Sin FK intencional: preservar registro aunque el usuario se elimine';
COMMENT ON COLUMN audit_logs.metadata IS 'Datos adicionales como valores anteriores, IP, user-agent, etc.';

-- ============================================================
-- 011_rls_policies.sql
-- ============================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinics_select_own" ON clinics FOR SELECT
  USING (id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "clinics_update_admin" ON clinics FOR UPDATE
  USING (
    id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_same_clinic" ON users FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "users_insert_admin" ON users FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

CREATE POLICY "users_update_admin" ON users FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_select_same_clinic" ON patients FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "patients_insert_authorized" ON patients FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo','recepcionista')
  );

CREATE POLICY "patients_update_authorized" ON patients FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo','recepcionista')
  );

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select_same_clinic" ON appointments FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "appointments_insert_authorized" ON appointments FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo','recepcionista')
  );

CREATE POLICY "appointments_update_authorized" ON appointments FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo','recepcionista')
  );

ALTER TABLE clinical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinical_records_select_clinical" ON clinical_records FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

CREATE POLICY "clinical_records_insert_dentist" ON clinical_records FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

CREATE POLICY "clinical_records_update_version" ON clinical_records FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

ALTER TABLE clinical_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinical_entries_select_clinical" ON clinical_entries FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

CREATE POLICY "clinical_entries_insert_dentist" ON clinical_entries FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

ALTER TABLE clinical_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinical_attachments_select_clinical" ON clinical_attachments FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

CREATE POLICY "clinical_attachments_insert_dentist" ON clinical_attachments FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

ALTER TABLE odontogram_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "odontogram_select_clinical" ON odontogram_states FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

CREATE POLICY "odontogram_insert_dentist" ON odontogram_states FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

ALTER TABLE custom_tooth_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_statuses_select_same_clinic" ON custom_tooth_statuses FOR SELECT
  USING (clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid()));

CREATE POLICY "custom_statuses_insert_admin" ON custom_tooth_statuses FOR INSERT
  WITH CHECK (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

CREATE POLICY "custom_statuses_update_admin" ON custom_tooth_statuses FOR UPDATE
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid() AND role = 'administrador')
  );

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'administrador'
  );

-- ============================================================
-- 012_storage_policies.sql
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinical-files', 'clinical-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_insert_clinical" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinical-files'
    AND (storage.foldername(name))[1] = (
      SELECT clinic_id::text FROM users WHERE id = auth.uid()
    )
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

CREATE POLICY "storage_select_clinical" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'clinical-files'
    AND (storage.foldername(name))[1] = (
      SELECT clinic_id::text FROM users WHERE id = auth.uid()
    )
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );
