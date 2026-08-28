-- ============================================================
-- 007_create_clinical_attachments.sql
-- Tabla: clinical_attachments (Adjuntos de Entradas Clínicas)
-- Requisitos: 6.8
-- ============================================================

CREATE TABLE clinical_attachments (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID          NOT NULL REFERENCES clinics(id),
  entry_id        UUID          NOT NULL REFERENCES clinical_entries(id),
  patient_id      UUID          NOT NULL REFERENCES patients(id),
  file_name       VARCHAR(255)  NOT NULL,
  file_type       VARCHAR(10)   NOT NULL CHECK (file_type IN ('JPEG','PNG','PDF','DICOM')),
  file_size_bytes BIGINT        NOT NULL CHECK (file_size_bytes BETWEEN 1 AND 20971520), -- 20 MB máximo
  storage_path    TEXT          NOT NULL,  -- path en Supabase Storage
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Restricción: máximo 10 adjuntos por entrada clínica (validada en Server Action antes de INSERT)

-- Índices
CREATE INDEX idx_clinical_attachments_entry ON clinical_attachments(entry_id);
CREATE INDEX idx_clinical_attachments_clinic_patient ON clinical_attachments(clinic_id, patient_id);

COMMENT ON TABLE clinical_attachments IS 'Archivos adjuntos a entradas clínicas (radiografías, informes, etc.)';
COMMENT ON COLUMN clinical_attachments.file_size_bytes IS 'Tamaño máximo: 20 MB (20971520 bytes)';
COMMENT ON COLUMN clinical_attachments.storage_path IS 'Ruta en Supabase Storage: {clinic_id}/{patient_id}/{entry_id}/{filename}';
