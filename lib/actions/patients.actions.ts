'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { createAuditLog } from '@/lib/audit';
import { DentalClinicError, UniqueDocumentError } from '@/errors/domain';
import type { Patient, DocumentType, BiologicalSex } from '@/types/domain';

const DOCUMENT_TYPES = ['CC', 'TI', 'CE', 'PA', 'RC', 'NIT'] as const;
const BIOLOGICAL_SEXES = ['masculino', 'femenino', 'intersexual'] as const;

const patientSchema = z.object({
  fullName: z.string().trim().min(1, 'El nombre completo es obligatorio').max(200, 'El nombre no puede exceder 200 caracteres'),
  documentType: z.enum(DOCUMENT_TYPES, {
    message: 'Tipo de documento inválido (CC, TI, CE, PA, RC, NIT)',
  }),
  documentNumber: z
    .string()
    .trim()
    .min(1, 'El número de documento es obligatorio')
    .max(20, 'El número de documento no puede exceder 20 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'El número de documento debe ser alfanumérico'),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de nacimiento debe tener formato AAAA-MM-DD')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return !isNaN(date.getTime()) && date <= today;
    }, 'La fecha de nacimiento no puede ser futura'),
  biologicalSex: z.enum(BIOLOGICAL_SEXES, {
    message: 'Sexo biológico inválido (masculino, femenino, intersexual)',
  }),
  phonePrimary: z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/, 'El teléfono principal debe contener entre 7 y 15 dígitos'),
  email: z
    .string()
    .trim()
    .email('El correo electrónico no es válido')
    .max(254)
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string().trim().max(255).optional().nullable(),
  guardianName: z.string().trim().max(200).optional().nullable(),
  guardianPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/, 'El teléfono del acudiente debe contener entre 7 y 15 dígitos')
    .optional()
    .nullable()
    .or(z.literal('')),
  medicalHistory: z.string().trim().optional().nullable(),
});

export type PatientInput = z.infer<typeof patientSchema>;

export interface UpdatePatientInput extends PatientInput {
  patientId: string;
}

/**
 * Server Action: Creación de paciente con validación de unicidad de documento.
 * Requisitos: 4.1, 4.2, 4.3, 4.4, 4.6
 */
export async function createPatientAction(
  rawInput: PatientInput
): Promise<ServerActionResult<Patient>> {
  return withErrorHandling(async () => {
    const input = patientSchema.parse(rawInput);
    const authUser = await requireRole(
      ['administrador', 'odontologo', 'recepcionista'],
      'paciente',
      '',
      'create'
    );
    const supabase = await createServerSupabaseClient();

    // 1. Verificar unicidad de documento dentro del consultorio
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id, full_name, document_type, document_number')
      .eq('clinic_id', authUser.clinicId)
      .eq('document_type', input.documentType)
      .eq('document_number', input.documentNumber)
      .maybeSingle();

    if (existingPatient) {
      throw new UniqueDocumentError(
        `El documento ${input.documentType} ${input.documentNumber} ya está registrado a nombre de ${existingPatient.full_name}`,
        existingPatient.full_name,
        existingPatient.id
      );
    }

    // 2. Insertar paciente
    const newPatientData = {
      clinic_id: authUser.clinicId,
      full_name: input.fullName,
      document_type: input.documentType,
      document_number: input.documentNumber,
      birth_date: input.birthDate,
      biological_sex: input.biologicalSex,
      phone_primary: input.phonePrimary,
      email: input.email || null,
      address: input.address || null,
      guardian_name: input.guardianName || null,
      guardian_phone: input.guardianPhone || null,
      medical_history: input.medicalHistory || null,
    };

    const { data: insertedPatient, error: insertError } = await supabase
      .from('patients')
      .insert(newPatientData)
      .select('*')
      .single();

    if (insertError || !insertedPatient) {
      // Manejo de error de constraint de base de datos si ocurre colisión concurrente
      if (insertError?.code === '23505') {
        throw new UniqueDocumentError(
          `El documento ${input.documentType} ${input.documentNumber} ya existe en este consultorio.`
        );
      }
      throw new DentalClinicError('No se pudo registrar el paciente.', 'PATIENT_CREATION_FAILED', 500);
    }

    // 3. Registrar auditoría
    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'paciente',
      entity_id: insertedPatient.id,
      action: 'create',
      result: 'success',
      metadata: { document_type: input.documentType, document_number: input.documentNumber },
    });

    return insertedPatient as Patient;
  });
}

/**
 * Server Action: Actualización de datos de paciente.
 */
export async function updatePatientAction(
  rawInput: UpdatePatientInput
): Promise<ServerActionResult<Patient>> {
  return withErrorHandling(async () => {
    const { patientId, ...dataToValidate } = rawInput;
    z.string().uuid('ID de paciente inválido').parse(patientId);
    const input = patientSchema.parse(dataToValidate);

    const authUser = await requireRole(
      ['administrador', 'odontologo', 'recepcionista'],
      'paciente',
      patientId,
      'update'
    );
    const supabase = await createServerSupabaseClient();

    // 1. Verificar si el documento colisiona con otro paciente
    const { data: collision } = await supabase
      .from('patients')
      .select('id, full_name')
      .eq('clinic_id', authUser.clinicId)
      .eq('document_type', input.documentType)
      .eq('document_number', input.documentNumber)
      .neq('id', patientId)
      .maybeSingle();

    if (collision) {
      throw new UniqueDocumentError(
        `El documento ${input.documentType} ${input.documentNumber} ya está registrado para otro paciente (${collision.full_name})`,
        collision.full_name,
        collision.id
      );
    }

    // 2. Actualizar paciente
    const updatePayload = {
      full_name: input.fullName,
      document_type: input.documentType,
      document_number: input.documentNumber,
      birth_date: input.birthDate,
      biological_sex: input.biologicalSex,
      phone_primary: input.phonePrimary,
      email: input.email || null,
      address: input.address || null,
      guardian_name: input.guardianName || null,
      guardian_phone: input.guardianPhone || null,
      medical_history: input.medicalHistory || null,
    };

    const { data: updatedPatient, error: updateError } = await supabase
      .from('patients')
      .update(updatePayload)
      .eq('id', patientId)
      .eq('clinic_id', authUser.clinicId)
      .select('*')
      .single();

    if (updateError || !updatedPatient) {
      throw new DentalClinicError('No se pudo actualizar el paciente.', 'PATIENT_UPDATE_FAILED', 500);
    }

    // 3. Auditoría
    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'paciente',
      entity_id: patientId,
      action: 'update',
      result: 'success',
      metadata: { document_number: input.documentNumber },
    });

    return updatedPatient as Patient;
  });
}

/**
 * Server Action: Búsqueda full-text de pacientes usando índice GIN en PostgreSQL.
 * Requisitos: 4.7, 4.8
 */
export async function searchPatientsAction(
  query: string
): Promise<ServerActionResult<Patient[]>> {
  return withErrorHandling(async () => {
    const authUser = await requireRole(['administrador', 'odontologo', 'recepcionista'], 'paciente');
    const sanitizedQuery = (query || '').trim();

    if (sanitizedQuery.length < 2) {
      return [];
    }

    const supabase = await createServerSupabaseClient();

    // Consulta con soporte de texto completo en español o búsqueda por coincidencia
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', authUser.clinicId)
      .or(`full_name.ilike.%${sanitizedQuery}%,document_number.ilike.%${sanitizedQuery}%`)
      .order('full_name', { ascending: true })
      .limit(50);

    if (error) {
      throw new DentalClinicError('Error al realizar la búsqueda de pacientes.', 'SEARCH_FAILED', 500);
    }

    return (patients || []) as Patient[];
  });
}

/**
 * Server Action: Obtención de un paciente por su ID.
 */
export async function getPatientByIdAction(
  patientId: string
): Promise<ServerActionResult<Patient>> {
  return withErrorHandling(async () => {
    z.string().uuid().parse(patientId);
    const authUser = await requireRole(['administrador', 'odontologo', 'recepcionista'], 'paciente');
    const supabase = await createServerSupabaseClient();

    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .eq('clinic_id', authUser.clinicId)
      .single();

    if (error || !patient) {
      throw new DentalClinicError('Paciente no encontrado.', 'PATIENT_NOT_FOUND', 404);
    }

    return patient as Patient;
  });
}
