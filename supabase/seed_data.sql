-- ============================================================
-- SEED DATA: Clínica y Usuario Administrador de Prueba
-- 
-- INSTRUCCIONES:
-- 1. Ejecuta la sección 1 y 2 tal cual en el SQL Editor de Supabase.
-- 2. Ve a Authentication → Users en tu Dashboard de Supabase.
-- 3. Crea un nuevo usuario con email y contraseña.
-- 4. Copia el UUID del usuario recién creado.
-- 5. Reemplaza 'Pega-Aqui-El-UUID-Del-Usuario-Auth' en la sección 3.
-- 6. Ejecuta la sección 3.
-- ============================================================

-- ============================================================
-- 1. Crear la clínica de prueba (UUID fijo para predecibilidad)
-- ============================================================
INSERT INTO clinics (id, name, address, phone, email)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Consultorio Dental Prueba',
  'Calle 1 # 2-3, Cúcuta, Colombia',
  '3123456789',
  'contacto@consultorio-prueba.com'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Verificar que la clínica existe (opcional, para confirmar)
-- ============================================================
SELECT id, name FROM clinics WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- ============================================================
-- 3. Crear el perfil de usuario administrador
-- 
-- ⚠️ IMPORTANTE: Reemplaza 'Pega-Aqui-El-UUID-Del-Usuario-Auth'
--    con el UUID real del usuario creado en Authentication → Users.
-- ============================================================
INSERT INTO users (id, clinic_id, role, full_name, is_active, mfa_enabled)
VALUES (
  'Pega-Aqui-El-UUID-Del-Usuario-Auth',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'administrador',
  'Dr. Administrador Prueba',
  true,
  false
)
ON CONFLICT (id) DO NOTHING;
