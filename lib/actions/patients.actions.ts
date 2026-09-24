'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { DentalClinicError } from '@/errors/domain';
import type { Patient, DocumentType, BiologicalSex } from '@/types/domain';

const patientSchema = z.object({
  full_name: z.string().min(1, 'El nombre es obligatorio').max(200),
  document_type: z.enum(['CC', 'TI', 'CE', 'PA', 'RC', 'NIT']),
  document_number: z.string().min(1, 'El documento es obligatorio').max(20),
  birth_date: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  biological_sex: z.enum(['masculino', 'femenino', 'intersexual']),
  phone_primary: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos').max(15),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  guardian_name: z.string().max(200).optional().or(z.literal('')),
  guardian_phone: z.string().max(15).optional().or(z.literal('')),
  medical_history: z.string().max(500).optional().or(z.literal('')),
});

export async function createPatientAction(
  formData: z.infer<typeof patientSchema>
): Promise<ServerActionResult<Patient>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new DentalClinicError('Perfil no encontrado.', 'PROFILE_NOT_FOUND', 404);
    }

    const validated = patientSchema.parse(formData);

    const { data, error } = await supabase
      .from('patients')
      .insert({
        clinic_id: profile.clinic_id,
        ...validated,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new DentalClinicError(
          'Ya existe un paciente con este documento en el consultorio.',
          'UNIQUE_DOCUMENT_ERROR',
          409
        );
      }
      throw new DentalClinicError('Error al registrar paciente.', 'CREATE_PATIENT_ERROR', 500);
    }

    return data as Patient;
  });
}

export async function listPatientsAction(): Promise<ServerActionResult<Patient[]>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new DentalClinicError('Perfil no encontrado.', 'PROFILE_NOT_FOUND', 404);
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DentalClinicError('Error al listar pacientes.', 'LIST_PATIENTS_ERROR', 500);
    }

    return data as Patient[];
  });
}

export async function searchPatientsAction(
  query: string
): Promise<ServerActionResult<Patient[]>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new DentalClinicError('Perfil no encontrado.', 'PROFILE_NOT_FOUND', 404);
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .or(`full_name.ilike.%${query}%,document_number.ilike.%${query}%`)
      .order('full_name', { ascending: true })
      .limit(50);

    if (error) {
      throw new DentalClinicError('Error al buscar pacientes.', 'SEARCH_PATIENTS_ERROR', 500);
    }

    return data as Patient[];
  });
}

export async function updatePatientAction(
  id: string,
  formData: Partial<z.infer<typeof patientSchema>>
): Promise<ServerActionResult<Patient>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new DentalClinicError('Debe iniciar sesión.', 'AUTHENTICATION_REQUIRED', 401);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new DentalClinicError('Perfil no encontrado.', 'PROFILE_NOT_FOUND', 404);
    }

    const validated = patientSchema.partial().parse(formData);

    const { data, error } = await supabase
      .from('patients')
      .update(validated)
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .select()
      .single();

    if (error) {
      throw new DentalClinicError('Error al actualizar paciente.', 'UPDATE_PATIENT_ERROR', 500);
    }

    return data as Patient;
  });
}
