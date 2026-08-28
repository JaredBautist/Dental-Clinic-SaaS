-- ============================================================
-- 008_create_odontogram_states.sql
-- Tabla: odontogram_states (Estados del Odontograma — append-only)
-- Requisitos: 7.2, 7.3
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
  status                VARCHAR(50)   NOT NULL,  -- predefinido o personalizado del consultorio
  proposed_treatment    VARCHAR(500),
  completed_treatment   VARCHAR(500),
  version               INTEGER       NOT NULL DEFAULT 1,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now()

  -- Inmutable: sin updated_at. Cada cambio genera un nuevo registro (append-only).
);

-- Índices
CREATE INDEX idx_odontogram_clinic_patient ON odontogram_states(clinic_id, patient_id);
-- Índice para obtener el estado más reciente de cada pieza/superficie
CREATE INDEX idx_odontogram_latest ON odontogram_states(clinic_id, patient_id, tooth_code, surface, created_at DESC);

COMMENT ON TABLE odontogram_states IS 'Historial append-only del odontograma — cada cambio crea un nuevo registro';
COMMENT ON COLUMN odontogram_states.tooth_code IS 'Código FDI de 2 dígitos (nomenclatura dental internacional)';
COMMENT ON COLUMN odontogram_states.surface IS 'Superficie dental: oclusal, mesial, distal, vestibular, palatino_lingual o completa';
