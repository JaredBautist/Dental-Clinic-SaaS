'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import { requireRole } from '@/lib/auth/require-user';
import { createAuditLog } from '@/lib/audit';
import { DentalClinicError } from '@/errors/domain';
import type { ClinicalAttachment } from '@/types/domain';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB (20971520 bytes)
const ALLOWED_FILE_TYPES = ['JPEG', 'PNG', 'PDF', 'DICOM'] as const;

const uploadAttachmentSchema = z.object({
  entryId: z.string().uuid('ID de entrada clínica inválido'),
  patientId: z.string().uuid('ID de paciente inválido'),
  fileName: z.string().trim().min(1, 'El nombre de archivo es obligatorio').max(255),
  fileType: z.enum(ALLOWED_FILE_TYPES, {
    message: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG, PDF y DICOM.',
  }),
  fileSizeBytes: z
    .number()
    .int()
    .min(1, 'El archivo no puede estar vacío')
    .max(MAX_FILE_SIZE, 'El archivo excede el tamaño máximo permitido de 20 MB'),
  fileData: z.string().min(1, 'El contenido del archivo (base64) es obligatorio'), // Base64 del archivo
});

export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;

/**
 * Server Action: Subida y registro de adjuntos a entradas de historia clínica.
 * Requisitos: 6.7, 6.8
 */
export async function uploadAttachmentAction(
  rawInput: UploadAttachmentInput
): Promise<ServerActionResult<ClinicalAttachment>> {
  return withErrorHandling(async () => {
    const input = uploadAttachmentSchema.parse(rawInput);
    const authUser = await requireRole(
      ['administrador', 'odontologo'],
      'historia_clinica',
      input.entryId,
      'create'
    );
    const supabase = await createServerSupabaseClient();
    const admin = createAdminClient();

    // 1. Verificar existencia y pertenencia de la entrada clínica
    const { data: entry, error: entryError } = await supabase
      .from('clinical_entries')
      .select('id, clinic_id, patient_id')
      .eq('id', input.entryId)
      .eq('clinic_id', authUser.clinicId)
      .single();

    if (entryError || !entry) {
      throw new DentalClinicError('Entrada clínica no encontrada.', 'ENTRY_NOT_FOUND', 404);
    }

    // 2. Verificar que la entrada no tenga ya 10 adjuntos (Límite del requisito 6.7)
    const { count, error: countError } = await supabase
      .from('clinical_attachments')
      .select('*', { count: 'exact', head: true })
      .eq('entry_id', input.entryId);

    if (countError) {
      throw new DentalClinicError('Error al validar adjuntos existentes.', 'ATTACHMENTS_COUNT_FAILED', 500);
    }

    if (count !== null && count >= 10) {
      throw new DentalClinicError(
        'Límite excedido: No se pueden adjuntar más de 10 archivos por entrada clínica.',
        'ATTACHMENT_LIMIT_EXCEEDED',
        400
      );
    }

    // 3. Subir archivo a Supabase Storage
    const fileId = crypto.randomUUID();
    const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${authUser.clinicId}/${input.patientId}/${input.entryId}/${fileId}-${sanitizedFileName}`;

    const buffer = Buffer.from(input.fileData, 'base64');

    const mimeMap: Record<string, string> = {
      JPEG: 'image/jpeg',
      PNG: 'image/png',
      PDF: 'application/pdf',
      DICOM: 'application/dicom',
    };

    const { error: storageError } = await admin.storage
      .from('clinical-files')
      .upload(storagePath, buffer, {
        contentType: mimeMap[input.fileType] || 'application/octet-stream',
        upsert: false,
      });

    if (storageError) {
      throw new DentalClinicError(
        `Error al almacenar el archivo en almacenamiento seguro: ${storageError.message}`,
        'STORAGE_UPLOAD_FAILED',
        500
      );
    }

    // 4. Guardar metadatos en tabla clinical_attachments
    const { data: attachmentRecord, error: dbError } = await supabase
      .from('clinical_attachments')
      .insert({
        clinic_id: authUser.clinicId,
        entry_id: input.entryId,
        patient_id: input.patientId,
        file_name: input.fileName,
        file_type: input.fileType,
        file_size_bytes: input.fileSizeBytes,
        storage_path: storagePath,
      })
      .select('*')
      .single();

    if (dbError || !attachmentRecord) {
      // Revertir archivo subido a Storage para no dejar archivos huérfanos
      await admin.storage.from('clinical-files').remove([storagePath]);
      throw new DentalClinicError('Error al guardar los metadatos del adjunto.', 'ATTACHMENT_RECORD_FAILED', 500);
    }

    // 5. Auditoría
    await createAuditLog({
      clinic_id: authUser.clinicId,
      user_id: authUser.userId,
      role: authUser.role,
      entity_type: 'historia_clinica',
      entity_id: attachmentRecord.id,
      action: 'create',
      result: 'success',
      metadata: { file_name: input.fileName, file_size: input.fileSizeBytes, file_type: input.fileType },
    });

    return attachmentRecord as ClinicalAttachment;
  });
}

/**
 * Server Action: Listado de adjuntos para una entrada clínica.
 */
export async function listEntryAttachmentsAction(
  entryId: string
): Promise<ServerActionResult<ClinicalAttachment[]>> {
  return withErrorHandling(async () => {
    z.string().uuid().parse(entryId);
    const authUser = await requireRole(['administrador', 'odontologo'], 'historia_clinica', entryId);
    const supabase = await createServerSupabaseClient();

    const { data: attachments, error } = await supabase
      .from('clinical_attachments')
      .select('*')
      .eq('entry_id', entryId)
      .eq('clinic_id', authUser.clinicId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new DentalClinicError('Error al obtener los adjuntos.', 'ATTACHMENTS_FETCH_FAILED', 500);
    }

    return (attachments || []) as ClinicalAttachment[];
  });
}
