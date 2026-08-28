-- ============================================================
-- 005_create_clinical_records.sql
-- Tabla: clinical_records (Historias Clínicas — cabecera)
-- Requisitos: 6.1, 6.2
-- ============================================================

CREATE TABLE clinical_records (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID        NOT NULL REFERENCES clinics(id),
  patient_id  UUID        NOT NULL REFERENCES patients(id),
  version     INTEGER     NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un paciente solo tiene una historia clínica por consultorio
  UNIQUE (clinic_id, patient_id)
);

-- Índice compuesto para búsquedas por consultorio y paciente
CREATE INDEX idx_clinical_records_clinic_patient ON clinical_records(clinic_id, patient_id);

-- Trigger para updated_at automático
CREATE TRIGGER set_clinical_records_updated_at
  BEFORE UPDATE ON clinical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE clinical_records IS 'Cabecera de historia clínica — una por paciente por consultorio';
COMMENT ON COLUMN clinical_records.version IS 'Control de concurrencia optimista';
