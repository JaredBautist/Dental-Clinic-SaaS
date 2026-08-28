/**
 * Tipos de Dominio del Sistema Dental Clinic SaaS
 */

export type UserRole = 'administrador' | 'odontologo' | 'recepcionista';

export type AppointmentStatus =
  | 'programada'
  | 'confirmada'
  | 'en_curso'
  | 'completada'
  | 'cancelada'
  | 'reprogramada';

export type ClinicalEntryType =
  | 'motivo_consulta'
  | 'diagnostico'
  | 'plan_tratamiento'
  | 'procedimiento'
  | 'evolucion'
  | 'correccion';

export type ToothSurface =
  | 'oclusal'
  | 'mesial'
  | 'distal'
  | 'vestibular'
  | 'palatino_lingual'
  | 'completa';

export type ToothStatus =
  | 'sano'
  | 'caries'
  | 'obturado'
  | 'ausente'
  | 'corona'
  | 'endodoncia'
  | 'extraccion_indicada'
  | 'fractura'
  | string; // Admite estados personalizados por consultorio (hasta 20)

export type AuditAction =
  | 'create'
  | 'update'
  | 'cancel'
  | 'reschedule'
  | 'correccion'
  | 'delete_attempt'
  | 'access_denied';

export type AuditEntityType =
  | 'consultorio'
  | 'usuario'
  | 'paciente'
  | 'cita'
  | 'historia_clinica'
  | 'odontograma';

export type AuditResult = 'success' | 'failure';

export interface AuthorizationSecurityContext {
  clinicId: string;
  userId: string;
  role: UserRole;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
}

export interface JWTClaims {
  clinic_id: string; // UUID del consultorio
  user_id: string;   // UUID del usuario
  user_role: UserRole; // Rol de negocio; `role` está reservado por Supabase
}

export interface AuditRecord {
  id?: string;
  clinic_id: string;
  user_id: string;
  role: UserRole;
  entity_type: AuditEntityType;
  entity_id: string;
  action: AuditAction;
  timestamp?: string; // ISO 8601
  result: AuditResult;
  metadata?: Record<string, unknown>;
}

export interface Clinic {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  clinic_id: string;
  role: UserRole;
  full_name: string;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'CC' | 'TI' | 'CE' | 'PA' | 'RC' | 'NIT';
export type BiologicalSex = 'masculino' | 'femenino' | 'intersexual';

export interface Patient {
  id: string;
  clinic_id: string;
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  birth_date: string;
  biological_sex: BiologicalSex;
  phone_primary: string;
  email?: string | null;
  address?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  medical_history?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  dentist_id: string;
  scheduled_at: string;
  duration_min: number;
  ends_at: string;
  status: AppointmentStatus;
  reason: string;
  cancel_reason?: string | null;
  cancelled_by?: string | null;
  cancelled_at?: string | null;
  rescheduled_from?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicalRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ClinicalEntry {
  id: string;
  clinic_id: string;
  record_id: string;
  patient_id: string;
  dentist_id: string;
  entry_type: ClinicalEntryType;
  content: string;
  corrects_entry_id?: string | null;
  version: number;
  created_at: string;
}

export interface ClinicalAttachment {
  id: string;
  clinic_id: string;
  entry_id: string;
  patient_id: string;
  file_name: string;
  file_type: 'JPEG' | 'PNG' | 'PDF' | 'DICOM';
  file_size_bytes: number;
  storage_path: string;
  created_at: string;
}

export interface OdontogramState {
  id: string;
  clinic_id: string;
  patient_id: string;
  dentist_id: string;
  tooth_code: string;
  surface: ToothSurface;
  status: ToothStatus;
  proposed_treatment?: string | null;
  completed_treatment?: string | null;
  version: number;
  created_at: string;
}

export interface CustomToothStatus {
  id: string;
  clinic_id: string;
  name: string;
  color_hex?: string | null;
  created_at: string;
}
