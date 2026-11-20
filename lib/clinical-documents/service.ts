import { createHash } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { z } from 'zod';
import { DentalClinicError } from '@/errors/domain';
import { requireRole, type AuthenticatedUserContext } from '@/lib/auth/require-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const documentBucket = 'patient-documents';
export const maxDocumentBytes = 20 * 1024 * 1024;
export const documentRequest = z.object({ patientId: z.uuid(), requestId: z.uuid() });
export const documentReceiptFields = 'id, file_name, kind, created_at, author_id';
export interface DocumentReceipt {
  id: string;
  file_name: string;
  kind: 'external_pdf' | 'patient_report';
  created_at: string;
  author_id: string;
}

export async function requireDocumentActor(role: 'recepcionista' | 'odontologo') {
  const actor = await requireRole([role], 'historia_clinica');
  if (role === 'odontologo') {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || data?.currentLevel !== 'aal2') {
      throw new DentalClinicError('Verifica tu segundo factor para continuar.', 'MFA_REQUIRED', 403);
    }
  }
  return actor;
}

export async function requireDocumentPatient(actor: AuthenticatedUserContext, patientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('patients')
    .select('id, full_name, document_type, document_number, birth_date, phone_primary, email, medical_history')
    .eq('clinic_id', actor.clinicId).eq('id', patientId).maybeSingle();
  if (error) throw new DentalClinicError('No se pudo consultar el paciente.', 'PATIENT_FETCH_FAILED', 500);
  if (!data) throw new DentalClinicError('Paciente no disponible.', 'PATIENT_NOT_FOUND', 404);
  return data;
}

export async function validatePdf(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.type !== 'application/pdf' || value.size < 1 || value.size > maxDocumentBytes) {
    throw new DentalClinicError('Selecciona un PDF válido de hasta 20 MB.', 'INVALID_PDF', 422);
  }
  const bytes = new Uint8Array(await value.arrayBuffer());
  try {
    const pdf = await PDFDocument.load(bytes, { throwOnInvalidObject: true, updateMetadata: false });
    if (!pdf.getPageCount()) throw new Error('Empty PDF');
  } catch {
    throw new DentalClinicError('El archivo no es un PDF legible o está protegido.', 'INVALID_PDF', 422);
  }
  return { bytes, name: value.name.replace(/[\x00-\x1f\x7f/\\]/g, '_').slice(0, 180) || 'historia.pdf' };
}

export async function saveDocument(
  actor: AuthenticatedUserContext,
  request: z.infer<typeof documentRequest>,
  kind: DocumentReceipt['kind'],
  name: string,
  bytes: Uint8Array,
): Promise<DocumentReceipt> {
  if (bytes.byteLength > maxDocumentBytes) {
    throw new DentalClinicError('El PDF excede el límite de 20 MB.', 'DOCUMENT_TOO_LARGE', 422);
  }
  const admin = createAdminClient();
  const findReceipt = () => admin.from('clinical_documents')
    .select(`${documentReceiptFields}, patient_id, storage_path`)
    .eq('clinic_id', actor.clinicId).eq('author_id', actor.userId)
    .eq('request_id', request.requestId).maybeSingle();
  const receipt = (row: DocumentReceipt & { patient_id: string }) => {
    if (row.patient_id !== request.patientId || row.kind !== kind) {
      throw new DentalClinicError('Esta solicitud ya se usó para otro documento.', 'DOCUMENT_REQUEST_CONFLICT', 409);
    }
    return { id: row.id, file_name: row.file_name, kind: row.kind, created_at: row.created_at, author_id: row.author_id };
  };
  const existing = await findReceipt();
  if (existing.error) throw new DentalClinicError('No se pudo verificar la solicitud.', 'DOCUMENT_LOOKUP_FAILED', 500);
  if (existing.data) return receipt(existing.data as Parameters<typeof receipt>[0]);

  const digest = createHash('sha256').update(bytes).digest('hex');
  const path = `${actor.clinicId}/${request.patientId}/${actor.userId}/${request.requestId}/${digest}.pdf`;
  const bucket = admin.storage.from(documentBucket);
  const uploaded = await bucket.upload(path, bytes, { contentType: 'application/pdf', upsert: false });
  if (uploaded.error) {
    const found = await bucket.exists(path);
    if (found.error || !found.data) throw new DentalClinicError('No se pudo guardar el PDF.', 'DOCUMENT_UPLOAD_FAILED', 500);
  }

  const saved = await admin.from('clinical_documents').insert({
    clinic_id: actor.clinicId, patient_id: request.patientId,
    author_id: actor.userId, author_role: actor.role, request_id: request.requestId,
    kind, file_name: name, file_size_bytes: bytes.byteLength, storage_path: path,
  }).select(documentReceiptFields).single();
  if (!saved.error && saved.data) return saved.data as DocumentReceipt;
  const winner = await findReceipt();
  if (winner.data) {
    if (winner.data.storage_path !== path) await bucket.remove([path]);
    return receipt(winner.data as Parameters<typeof receipt>[0]);
  }
  // Keep the object available to retry after an uncertain catalog write.
  throw new DentalClinicError('No se pudo registrar el PDF. Reintenta con la misma solicitud.', 'DOCUMENT_SAVE_FAILED', 500);
}
