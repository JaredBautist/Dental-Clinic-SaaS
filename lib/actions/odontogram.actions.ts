'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { createAuditLog } from '@/lib/audit';
import { ConcurrencyConflictError, DentalClinicError } from '@/errors/domain';
import type { OdontogramState, CustomToothStatus, ToothSurface } from '@/types/domain';

const FDI_TOOTH_CODES = [
  '11', '12', '13', '14', '15', '16', '17', '18',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '31', '32', '33', '34', '35', '36', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48',
] as const;

const SURFACES = [
  'oclusal',
  'mesial',
  'distal',
  'vestibular',
  'palatino_lingual',
  'completa',
] as const;

const saveToothStateSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido'),
  toothCode: z.enum(FDI_TOOTH_CODES, {
    message: 'Código dental FDI inválido (debe ser de 11 a 48)',
  }),
  surface: z.enum(SURFACES, {
    message: 'Superficie dental inválida',
  }),
  status: z.string().trim().min(1, 'El estado dental es obligatorio').max(50),
  proposedTreatment: z.string().trim().max(500).optional().nullable(),
  completedTreatment: z.string().trim().max(500).optional().nullable(),
  expectedVersion: z.number().int().min(1).default(1),
});

export type SaveToothStateInput = z.infer<typeof saveToothStateSchema>;

const customStatusSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del estado es obligatorio').max(50),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe tener formato hexadecimal #RRGGBB'),
});

export type CreateCustomStatusInput = z.infer<typeof customStatusSchema>;

/**
 * Server Action: Registro inmutable de un cambio de estado en el odontograma (append-only).
 * Requisitos: 7.2, 7.3, 7.6, 7.7
 */
export async function saveToothStateAction(
  rawInput: SaveToothStateInput
): Promise<ServerActionResult<{ state: OdontogramState; newVersion: number }>> {
  return withErrorHandling(async () => {
    const input = saveToothStateSchema.parse(rawInput);
    const authUser = await requireRole(
      ['administrador', 'odontologo'],
      'odontograma',
      input.patientId,
      'create'
    );
    const supabase = await createServerSupabaseClient();

    // 1. Obtener la última versión registrada para esta pieza y superficie
    const { data: latestState } = await supabase
      .from('odontogram_states')
      .select('version')
      .eq('clinic_id', authUser.clinicId)
      .eq('patient_id', input.patientId)
      .eq('tooth_code', input.toothCode)
      .eq('surface', input.surface)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestState && latestState.version !== input.expectedVersion) {
      throw new ConcurrencyConflictError(
        `Conflicto de concurrencia: La pieza ${input.toothCode} (${input.surface}) fue modificada por otro usuario.`,
        latestState.version
      );
    }

    const nextVersion = latestState ? latestState.version + 1 : 1;

    // 2. Insertar nuevo registro append-only (sin UPDATE ni DELETE)
    const { data: newState, error: insertError } = await supabase
      .from('odontogram_states')
      .insert({
        clinic_id: authUser.clinicId,
        patient_id: input.patientId,
        dentist_id: authUser.userId,
        tooth_code: input.toothCode,
        surface: input.surface,
        status: input.status,
        proposed_treatment: input.proposedTreatment || null,
        completed_treatment: input.completedTreatment || null,
        version: nextVersion,
      })
      .select('*')
      .single();

    if (insertError || !newState) {
      throw new DentalClinicError('Error al guardar el estado dental.', 'ODONTOGRAM_SAVE_FAILED', 500);
    }

    // 3. Auditoría
    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'odontograma',
      entity_id: newState.id,
      action: 'create',
      result: 'success',
      metadata: {
        tooth_code: input.toothCode,
        surface: input.surface,
        status: input.status,
        version: nextVersion,
      },
    });

    return {
      state: newState as OdontogramState,
      newVersion: nextVersion,
    };
  });
}

/**
 * Server Action: Consulta del estado vigente de todas las piezas y superficies del odontograma.
 * Requisitos: 7.4, 7.8
 */
export async function getOdontogramStateAction(
  patientId: string
): Promise<ServerActionResult<OdontogramState[]>> {
  return withErrorHandling(async () => {
    z.string().uuid('ID de paciente inválido').parse(patientId);
    const authUser = await requireRole(['administrador', 'odontologo'], 'odontograma', patientId);
    const supabase = await createServerSupabaseClient();

    // Consulta todos los estados del paciente ordenados cronológicamente
    const { data: allStates, error } = await supabase
      .from('odontogram_states')
      .select('*')
      .eq('clinic_id', authUser.clinicId)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new DentalClinicError('Error al cargar el odontograma.', 'ODONTOGRAM_FETCH_FAILED', 500);
    }

    // Agrupar y seleccionar el más reciente por combinación (tooth_code, surface)
    const latestMap = new Map<string, OdontogramState>();
    for (const item of (allStates || []) as OdontogramState[]) {
      const key = `${item.tooth_code}_${item.surface}`;
      latestMap.set(key, item);
    }

    return Array.from(latestMap.values());
  });
}

/**
 * Server Action: Creación de un estado personalizado para el odontograma del consultorio.
 * Máximo 20 estados por consultorio (Requisito 7.3).
 */
export async function createCustomToothStatusAction(
  rawInput: CreateCustomStatusInput
): Promise<ServerActionResult<CustomToothStatus>> {
  return withErrorHandling(async () => {
    const input = customStatusSchema.parse(rawInput);
    const authUser = await requireRole(['administrador', 'odontologo'], 'odontograma');
    const supabase = await createServerSupabaseClient();

    // 1. Validar límite de 20 estados personalizados por consultorio
    const { count, error: countError } = await supabase
      .from('custom_tooth_statuses')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', authUser.clinicId);

    if (countError) {
      throw new DentalClinicError('Error al validar estados personalizados.', 'CUSTOM_STATUS_COUNT_FAILED', 500);
    }

    if (count !== null && count >= 20) {
      throw new DentalClinicError(
        'Límite alcanzado: Un consultorio no puede tener más de 20 estados personalizados.',
        'CUSTOM_STATUS_LIMIT_REACHED',
        400
      );
    }

    // 2. Insertar nuevo estado personalizado
    const { data: newStatus, error: insertError } = await supabase
      .from('custom_tooth_statuses')
      .insert({
        clinic_id: authUser.clinicId,
        name: input.name,
        color_hex: input.colorHex,
      })
      .select('*')
      .single();

    if (insertError || !newStatus) {
      if (insertError?.code === '23505') {
        throw new DentalClinicError(
          `Ya existe un estado personalizado con el nombre '${input.name}'.`,
          'DUPLICATE_STATUS_NAME',
          409
        );
      }
      throw new DentalClinicError('Error al crear el estado personalizado.', 'CUSTOM_STATUS_CREATE_FAILED', 500);
    }

    return newStatus as CustomToothStatus;
  });
}

/**
 * Server Action: Listado de estados personalizados del consultorio.
 */
export async function listCustomToothStatusesAction(): Promise<ServerActionResult<CustomToothStatus[]>> {
  return withErrorHandling(async () => {
    const authUser = await requireRole(['administrador', 'odontologo'], 'odontograma');
    const supabase = await createServerSupabaseClient();

    const { data: statuses, error } = await supabase
      .from('custom_tooth_statuses')
      .select('*')
      .eq('clinic_id', authUser.clinicId)
      .order('name', { ascending: true });

    if (error) {
      throw new DentalClinicError('Error al listar estados personalizados.', 'CUSTOM_STATUSES_FETCH_FAILED', 500);
    }

    return (statuses || []) as CustomToothStatus[];
  });
}
