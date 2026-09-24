'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { createAuditLog } from '@/lib/audit';
import { DentalClinicError } from '@/errors/domain';
import type { Clinic } from '@/types/domain';

// Esquema de validación para registro inicial de consultorio
const registerClinicSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del consultorio es obligatorio').max(120, 'El nombre no puede exceder 120 caracteres'),
  address: z.string().trim().max(255, 'La dirección no puede exceder 255 caracteres').optional().nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/, 'El teléfono debe contener entre 7 y 15 dígitos numéricos')
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email('El formato del correo electrónico es inválido')
    .max(254, 'El correo electrónico no puede exceder 254 caracteres')
    .optional()
    .nullable(),
  adminName: z.string().trim().min(1, 'El nombre del administrador es obligatorio').max(200, 'El nombre no puede exceder 200 caracteres'),
  adminEmail: z.string().trim().email('El correo del administrador no es válido').max(254, 'El correo no puede exceder 254 caracteres'),
});

export type RegisterClinicInput = z.infer<typeof registerClinicSchema>;

// Esquema para actualización de consultorio existente
const updateClinicSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del consultorio es obligatorio').max(120, 'El nombre no puede exceder 120 caracteres'),
  address: z.string().trim().max(255, 'La dirección no puede exceder 255 caracteres').optional().nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/, 'El teléfono debe contener entre 7 y 15 dígitos numéricos')
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email('El formato del correo electrónico es inválido')
    .max(254, 'El correo electrónico no puede exceder 254 caracteres')
    .optional()
    .nullable(),
});

export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;

/**
 * Server Action: Registro de nuevo consultorio con creación del administrador inicial.
 * Requisitos: 1.1, 1.2, 1.8
 */
export async function registerClinicAction(
  rawInput: RegisterClinicInput
): Promise<ServerActionResult<{ clinicId: string; name: string; adminEmail: string }>> {
  return withErrorHandling(async () => {
    const input = registerClinicSchema.parse(rawInput);
    const admin = createAdminClient();

    const clinicId = crypto.randomUUID();

    // 1. Crear consultorio
    const { error: clinicError } = await admin.from('clinics').insert({
      id: clinicId,
      name: input.name,
      address: input.address || null,
      phone: input.phone || null,
      email: input.email || null,
    });

    if (clinicError) {
      throw new DentalClinicError('No se pudo registrar el consultorio.', 'CLINIC_CREATION_FAILED', 500);
    }

    // 2. Invitar o crear usuario administrador en Supabase Auth
    try {
      const { data: authData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
        input.adminEmail,
        {
          data: {
            clinic_id: clinicId,
            full_name: input.adminName,
            role: 'administrador',
          },
        }
      );

      if (inviteError || !authData?.user) {
        // Rollback: Eliminar consultorio creado para evitar datos huérfanos/parciales
        await admin.from('clinics').delete().eq('id', clinicId);
        throw new DentalClinicError(
          inviteError?.message || 'No se pudo crear el usuario administrador inicial.',
          'ADMIN_INVITE_FAILED',
          400
        );
      }

      const adminUserId = authData.user.id;

      // 3. Crear registro en tabla pública users
      const { error: profileError } = await admin.from('users').insert({
        id: adminUserId,
        clinic_id: clinicId,
        role: 'administrador',
        full_name: input.adminName,
        is_active: true,
        mfa_enabled: false,
      });

      if (profileError) {
        await admin.from('clinics').delete().eq('id', clinicId);
        await admin.auth.admin.deleteUser(adminUserId);
        throw new DentalClinicError(
          'Error al configurar el perfil de usuario administrador.',
          'PROFILE_CREATION_FAILED',
          500
        );
      }

      // 4. Registro de auditoría
      await createAuditLog({
        clinic_id: clinicId,
        user_id: adminUserId,
        role: 'administrador',
        entity_type: 'consultorio',
        entity_id: clinicId,
        action: 'create',
        result: 'success',
        metadata: { clinic_name: input.name, admin_email: input.adminEmail },
      });

      return {
        clinicId,
        name: input.name,
        adminEmail: input.adminEmail,
      };
    } catch (err) {
      // Limpieza preventiva si ocurrió error antes de completar
      await admin.from('clinics').delete().eq('id', clinicId);
      throw err;
    }
  });
}

/**
 * Server Action: Actualización de datos de configuración del consultorio.
 * Solo permitido para rol 'administrador' sobre su propio consultorio.
 * Requisitos: 1.6, 1.7
 */
export async function updateClinicAction(
  rawInput: UpdateClinicInput
): Promise<ServerActionResult<Clinic>> {
  return withErrorHandling(async () => {
    const input = updateClinicSchema.parse(rawInput);
    const authUser = await requireRole(['administrador'], 'consultorio');

    const supabase = await createServerSupabaseClient();

    const { data: updatedClinic, error } = await supabase
      .from('clinics')
      .update({
        name: input.name,
        address: input.address || null,
        phone: input.phone || null,
        email: input.email || null,
      })
      .eq('id', authUser.clinicId)
      .select('id, name, address, phone, email, created_at, updated_at')
      .single();

    if (error || !updatedClinic) {
      throw new DentalClinicError(
        'No se pudo actualizar la información del consultorio.',
        'CLINIC_UPDATE_FAILED',
        500
      );
    }

    // Registro de auditoría
    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'consultorio',
      entity_id: authUser.clinicId,
      action: 'update',
      result: 'success',
      metadata: { updated_fields: Object.keys(input) },
    });

    return updatedClinic as Clinic;
  });
}

/**
 * Server Action: Obtención de los datos del consultorio actual.
 */
export async function getClinicAction(): Promise<ServerActionResult<Clinic>> {
  return withErrorHandling(async () => {
    const authUser = await requireRole(['administrador', 'odontologo', 'recepcionista'], 'consultorio');
    const supabase = await createServerSupabaseClient();

    const { data: clinic, error } = await supabase
      .from('clinics')
      .select('id, name, address, phone, email, created_at, updated_at')
      .eq('id', authUser.clinicId)
      .single();

    if (error || !clinic) {
      throw new DentalClinicError('Consultorio no encontrado.', 'CLINIC_NOT_FOUND', 404);
    }

    return clinic as Clinic;
  });
}
