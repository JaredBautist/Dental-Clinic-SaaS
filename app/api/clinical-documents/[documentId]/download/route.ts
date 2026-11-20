import { z } from 'zod';
import { DentalClinicError } from '@/errors/domain';
import { documentError } from '@/lib/clinical-documents/http';
import { documentBucket, requireDocumentActor } from '@/lib/clinical-documents/service';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const actor = await requireDocumentActor('odontologo');
    const id = z.uuid().parse((await params).documentId);
    const supabase = await createClient();
    const { data, error } = await supabase.from('clinical_documents').select('storage_path, file_name')
      .eq('clinic_id', actor.clinicId).eq('id', id).maybeSingle();
    if (error) throw new DentalClinicError('No se pudo consultar el documento.', 'DOCUMENT_LOOKUP_FAILED', 500);
    const legacy = data ? null : await supabase.from('clinical_attachments').select('storage_path, file_name')
      .eq('clinic_id', actor.clinicId).eq('id', id).maybeSingle();
    if (legacy?.error) throw new DentalClinicError('No se pudo consultar el adjunto.', 'DOCUMENT_LOOKUP_FAILED', 500);
    const document = data ?? legacy?.data;
    if (!document) throw new DentalClinicError('Documento no disponible.', 'DOCUMENT_NOT_FOUND', 404);
    const signed = await createAdminClient().storage.from(data ? documentBucket : 'clinical-files')
      .createSignedUrl(document.storage_path, 60, { download: document.file_name });
    if (signed.error || !signed.data) {
      throw new DentalClinicError('No se pudo preparar la descarga.', 'DOCUMENT_DOWNLOAD_FAILED', 500);
    }
    return new Response(null, { status: 303, headers: { Location: signed.data.signedUrl, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch (error) {
    return documentError(error);
  }
}
