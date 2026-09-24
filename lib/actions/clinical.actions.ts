'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { createAuditLog } from '@/lib/audit';
import { ConcurrencyConflictError, DentalClinicError } from '@/errors/domain';
import type { ClinicalEntry, ClinicalRecord, ClinicalEntryType } from '@/types/domain';

const ENTRY_TYPES = [
  'motivo_consulta',
  'diagnostico',
  'plan_tratamiento',
  'procedimiento',
  'evolucion',
  'correccion',
] as const;

const saveClinicalEntrySchema = z
  .object({
    patientId: z.string().uuid('ID de paciente inválido'),
    entryType: z.enum(ENTRY_TYPES, {
      message: 'Tipo de entrada clínica inválido',
    }),
    content: z
      .string()
      .trim()
      .min(1, 'El contenido de la entrada es obligatorio')
      .max(5000, 'El contenido no puede exceder 5000 caracteres'),
    expectedVersion: z
      .number()
      .int()
      .min(1, 'La versión esperada debe ser un entero positivo mayor o igual a 1'),
    correctsEntryId: z.string().uuid('ID de entrada a corregir inválido').optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.entryType === 'correccion') {
        return !!data.correctsEntryId;
      }
      return !data.correctsEntryId;
    },
    {
      message:
        "Las entradas de tipo 'correccion' deben incluir obligatoriamente correctsEntryId. Las demás entradas no deben tenerlo.",
      path: ['correctsEntryId'],
    }
  );

export type SaveClinicalEntryInput = z.infer<typeof saveClinicalEntrySchema>;

/**
 * Server Action: Registro de entradas en la historia clínica con control de concurrencia optimista.
 * Requisitos: 6.1, 6.2, 6.3, 6.4, 6.6, 6.11
 * Acceso: Solo 'administrador' y 'odontologo'. Recepcionistas reciben 403.
 */
export async function saveClinicalEntryAction(
  rawInput: SaveClinicalEntryInput
): Promise<ServerActionResult<{ entry: ClinicalEntry; newVersion: number }>> {
  return withErrorHandling(async () => {
    const input = saveClinicalEntrySchema.parse(rawInput);
    const authUser = await requireRole(
      ['administrador', 'odontologo'],
      'historia_clinica',
      input.patientId,
      input.entryType === 'correccion' ? 'correccion' : 'create'
    );
    const supabase = await createServerSupabaseClient();

    // 1. Obtener o inicializar la cabecera clinical_records
    let { data: record, error: recordError } = await supabase
      .from('clinical_records')
      .select('id, version')
      .eq('clinic_id', authUser.clinicId)
      .eq('patient_id', input.patientId)
      .maybeSingle();

    if (!record) {
      // Crear cabecera inicial con versión 1
      const { data: newRecord, error: createRecordError } = await supabase
        .from('clinical_records')
        .insert({
          clinic_id: authUser.clinicId,
          patient_id: input.patientId,
          version: 1,
        })
        .select('id, version')
        .single();

      if (createRecordError || !newRecord) {
        throw new DentalClinicError('No se pudo inicializar la historia clínica.', 'RECORD_CREATION_FAILED', 500);
      }
      record = newRecord;
    }

    // 2. Control de concurrencia optimista
    if (record.version !== input.expectedVersion) {
      throw new ConcurrencyConflictError(
        'Conflicto de concurrencia: La historia clínica fue modificada por otro usuario.',
        record.version
      );
    }

    // 3. Si es una corrección, verificar que la entrada original exista y pertenezca a la misma historia
    if (input.entryType === 'correccion' && input.correctsEntryId) {
      const { data: originalEntry } = await supabase
        .from('clinical_entries')
        .select('id, record_id')
        .eq('id', input.correctsEntryId)
        .eq('record_id', record.id)
        .maybeSingle();

      if (!originalEntry) {
        throw new DentalClinicError(
          'La entrada clínica a corregir no existe o no pertenece a esta historia clínica.',
          'ORIGINAL_ENTRY_NOT_FOUND',
          404
        );
      }
    }

    const nextVersion = record.version + 1;

    // 4. Actualizar versión en clinical_records (el trigger de la BD exige exactamente version + 1)
    const { error: updateVersionError } = await supabase
      .from('clinical_records')
      .update({ version: nextVersion })
      .eq('id', record.id)
      .eq('version', record.version);

    if (updateVersionError) {
      throw new ConcurrencyConflictError(
        'Conflicto concurrente al actualizar la versión de la historia clínica.',
        record.version
      );
    }

    // 5. Insertar entrada clínica inmutable
    const { data: insertedEntry, error: entryInsertError } = await supabase
      .from('clinical_entries')
      .insert({
        clinic_id: authUser.clinicId,
        record_id: record.id,
        patient_id: input.patientId,
        dentist_id: authUser.userId,
        entry_type: input.entryType,
        content: input.content,
        corrects_entry_id: input.correctsEntryId || null,
        version: record.version,
      })
      .select('*')
      .single();

    if (entryInsertError || !insertedEntry) {
      throw new DentalClinicError('Error al guardar la entrada en la historia clínica.', 'ENTRY_INSERT_FAILED', 500);
    }

    // 6. Auditoría
    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'historia_clinica',
      entity_id: insertedEntry.id,
      action: input.entryType === 'correccion' ? 'correccion' : 'create',
      result: 'success',
      metadata: {
        entry_type: input.entryType,
        record_id: record.id,
        corrects_entry_id: input.correctsEntryId || null,
        new_version: nextVersion,
      },
    });

    return {
      entry: insertedEntry as ClinicalEntry,
      newVersion: nextVersion,
    };
  });
}

/**
 * Server Action: Consulta de la historia clínica del paciente con entradas cronológicas.
 * Requisitos: 6.5, 6.9
 */
export async function getClinicalHistoryAction(
  patientId: string
): Promise<ServerActionResult<{ record: ClinicalRecord | null; entries: ClinicalEntry[] }>> {
  return withErrorHandling(async () => {
    z.string().uuid('ID de paciente inválido').parse(patientId);
    const authUser = await requireRole(['administrador', 'odontologo'], 'historia_clinica', patientId);
    const supabase = await createServerSupabaseClient();

    const { data: record } = await supabase
      .from('clinical_records')
      .select('*')
      .eq('clinic_id', authUser.clinicId)
      .eq('patient_id', patientId)
      .maybeSingle();

    if (!record) {
      return { record: null, entries: [] };
    }

    const { data: entries, error } = await supabase
      .from('clinical_entries')
      .select('*')
      .eq('record_id', record.id)
      .order('created_at', { ascending: true });

    if (error) {
      throw new DentalClinicError('Error al consultar las entradas clínicas.', 'ENTRIES_FETCH_FAILED', 500);
    }

    return {
      record: record as ClinicalRecord,
      entries: (entries || []) as ClinicalEntry[],
    };
  });
}
