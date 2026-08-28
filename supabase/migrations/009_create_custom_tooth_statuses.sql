-- ============================================================
-- 009_create_custom_tooth_statuses.sql
-- Tabla: custom_tooth_statuses (Estados Personalizados del Odontograma)
-- Requisitos: 7.3
-- ============================================================

CREATE TABLE custom_tooth_statuses (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID         NOT NULL REFERENCES clinics(id),
  name        VARCHAR(50)  NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  color_hex   CHAR(7)      CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- Un consultorio no puede tener estados duplicados por nombre
  UNIQUE (clinic_id, name)
);

-- Restricción: máximo 20 estados personalizados por consultorio (validada en Server Action)

-- Índices
CREATE INDEX idx_custom_statuses_clinic ON custom_tooth_statuses(clinic_id);

COMMENT ON TABLE custom_tooth_statuses IS 'Estados personalizados del odontograma definidos por cada consultorio';
COMMENT ON COLUMN custom_tooth_statuses.color_hex IS 'Color hexadecimal para renderizado en el SVG del odontograma';
