-- ============================================================
-- 006_create_clinical_entries.sql
-- Tabla: clinical_entries (Entradas Clínicas — inmutables)
-- Requisitos: 6.2, 6.3
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

  -- SIN updated_at intencionalmente: inmutable por diseño
);

-- Restricción: solo entradas de tipo 'correccion' pueden tener corrects_entry_id
ALTER TABLE clinical_entries ADD CONSTRAINT correction_entry_consistency
  CHECK (
    (entry_type = 'correccion' AND corrects_entry_id IS NOT NULL)
    OR
    (entry_type <> 'correccion' AND corrects_entry_id IS NULL)
  );

-- Índices
CREATE INDEX idx_clinical_entries_record ON clinical_entries(record_id, created_at);
CREATE INDEX idx_clinical_entries_clinic_patient ON clinical_entries(clinic_id, patient_id);

COMMENT ON TABLE clinical_entries IS 'Entradas clínicas inmutables — las correcciones crean nuevas entradas';
COMMENT ON COLUMN clinical_entries.corrects_entry_id IS 'Referencia a la entrada que esta corrección reemplaza (solo para tipo correccion)';
