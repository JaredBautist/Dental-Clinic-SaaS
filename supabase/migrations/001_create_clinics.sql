-- ============================================================
-- 001_create_clinics.sql
-- Tabla: clinics (Consultorios)
-- Requisitos: 1.3, 2.1
-- ============================================================

-- Función reutilizable para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabla principal de consultorios
CREATE TABLE clinics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120)  NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  address       VARCHAR(255),
  phone         VARCHAR(15)   CHECK (phone ~ '^[0-9]{7,15}$'),
  email         VARCHAR(254)  CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Trigger para updated_at automático
CREATE TRIGGER set_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE clinics IS 'Consultorios odontológicos registrados en la plataforma SaaS';
COMMENT ON COLUMN clinics.id IS 'UUID único e irrepetible del consultorio (generado por el servidor)';
