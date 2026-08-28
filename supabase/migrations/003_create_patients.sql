-- ============================================================
-- 003_create_patients.sql
-- Tabla: patients (Pacientes)
-- Requisitos: 4.3, 4.7
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

  -- Un paciente no puede tener el mismo documento duplicado dentro del mismo consultorio
  UNIQUE (clinic_id, document_type, document_number)
);

-- Índices
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);

-- Índice GIN para búsqueda full-text en español (nombre + número de documento)
CREATE INDEX idx_patients_search ON patients
  USING GIN (to_tsvector('spanish', full_name || ' ' || document_number));

-- Índice compuesto para búsqueda por documento
CREATE INDEX idx_patients_document ON patients(clinic_id, document_type, document_number);

-- Trigger para updated_at automático
CREATE TRIGGER set_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE patients IS 'Pacientes registrados en cada consultorio';
COMMENT ON COLUMN patients.document_type IS 'Tipo documento colombiano: CC, TI, CE, PA, RC, NIT';
COMMENT ON COLUMN patients.biological_sex IS 'Sexo biológico para contexto clínico odontológico';
