-- ============================================================
-- 004_create_appointments.sql
-- Tabla: appointments (Citas)
-- Requisitos: 5.1, 5.4
-- ============================================================

-- Extensión requerida para exclusion constraint con tstzrange
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Función inmutable requerida para columna generada (PostgreSQL exige inmutabilidad)
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
  -- Columna generada: calcula automáticamente la hora de fin via función IMMUTABLE
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

-- Índices para consultas frecuentes
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_dentist_date ON appointments(clinic_id, dentist_id, scheduled_at);
CREATE INDEX idx_appointments_patient ON appointments(clinic_id, patient_id);
CREATE INDEX idx_appointments_status ON appointments(clinic_id, status);

-- Exclusion constraint: previene solapamiento de citas del mismo odontólogo
-- Solo aplica a citas activas (programada, confirmada, en_curso)
ALTER TABLE appointments ADD CONSTRAINT no_overlap_appointments
  EXCLUDE USING gist (
    dentist_id WITH =,
    tstzrange(scheduled_at, ends_at, '[)') WITH &&
  )
  WHERE (status IN ('programada','confirmada','en_curso'));

-- Trigger para updated_at automático
CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE appointments IS 'Citas programadas entre pacientes y odontólogos';
COMMENT ON COLUMN appointments.ends_at IS 'Hora de fin calculada automáticamente (columna generada)';
COMMENT ON CONSTRAINT no_overlap_appointments ON appointments IS 'Previene solapamiento de citas activas del mismo odontólogo';
