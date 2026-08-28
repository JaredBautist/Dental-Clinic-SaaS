-- ============================================================
-- 002_create_users.sql
-- Tabla: users (Usuarios — extiende auth.users de Supabase)
-- Requisitos: 1.3, 2.1
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

-- Índices para consultas frecuentes
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_clinic_role ON users(clinic_id, role);

-- Trigger para updated_at automático
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Usuarios del sistema, vinculados a auth.users de Supabase y a un consultorio';
COMMENT ON COLUMN users.role IS 'Rol: administrador, odontologo o recepcionista';
COMMENT ON COLUMN users.is_active IS 'Los usuarios se desactivan, nunca se eliminan';
