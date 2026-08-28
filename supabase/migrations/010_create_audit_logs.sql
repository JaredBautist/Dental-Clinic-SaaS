-- ============================================================
-- 010_create_audit_logs.sql
-- Tabla: audit_logs (Registros de Auditoría — inmutables)
-- Requisitos: 8.4, 8.5
-- ============================================================

CREATE TABLE audit_logs (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    UUID         NOT NULL,  -- Sin FK: preservar registro si el consultorio se elimina
  user_id      UUID         NOT NULL,  -- Sin FK: preservar registro si el usuario se elimina
  role         VARCHAR(20)  NOT NULL,
  entity_type  VARCHAR(30)  NOT NULL
               CHECK (entity_type IN ('consultorio','usuario','paciente','cita','historia_clinica','odontograma')),
  entity_id    UUID         NOT NULL,
  action       VARCHAR(20)  NOT NULL,
  timestamp    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  result       VARCHAR(10)  NOT NULL CHECK (result IN ('success','failure')),
  metadata     JSONB        -- Información adicional contextual (opcional)

  -- SIN updated_at: inmutable por diseño
);

-- Índices para consultas de auditoría
CREATE INDEX idx_audit_clinic_timestamp ON audit_logs(clinic_id, timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_logs(clinic_id, entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(clinic_id, user_id);

COMMENT ON TABLE audit_logs IS 'Registros de auditoría inmutables — toda operación de escritura queda registrada';
COMMENT ON COLUMN audit_logs.clinic_id IS 'Sin FK intencional: preservar registro aunque el consultorio se elimine';
COMMENT ON COLUMN audit_logs.user_id IS 'Sin FK intencional: preservar registro aunque el usuario se elimine';
COMMENT ON COLUMN audit_logs.metadata IS 'Datos adicionales como valores anteriores, IP, user-agent, etc.';
