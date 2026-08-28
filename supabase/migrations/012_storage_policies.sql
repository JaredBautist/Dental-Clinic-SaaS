-- ============================================================
-- 012_storage_policies.sql
-- Bucket privado de Supabase Storage y políticas de acceso
-- Requisitos: 6.8, 8.1
-- ============================================================

-- Crear bucket privado para archivos clínicos
-- Estructura: clinical-files/{clinic_id}/{patient_id}/{entry_id}/{filename}
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinical-files', 'clinical-files', false)
ON CONFLICT (id) DO NOTHING;

-- Política de INSERT: solo odontólogos y administradores del mismo consultorio
CREATE POLICY "storage_insert_clinical" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinical-files'
    AND (storage.foldername(name))[1] = (
      SELECT clinic_id::text FROM users WHERE id = auth.uid()
    )
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );

-- Política de SELECT: solo odontólogos y administradores del mismo consultorio
-- El acceso real del usuario final es vía URL firmada generada server-side (15 min)
CREATE POLICY "storage_select_clinical" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'clinical-files'
    AND (storage.foldername(name))[1] = (
      SELECT clinic_id::text FROM users WHERE id = auth.uid()
    )
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('administrador','odontologo')
  );
