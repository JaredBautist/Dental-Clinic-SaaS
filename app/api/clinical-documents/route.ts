import { documentError } from '@/lib/clinical-documents/http';
import { documentRequest, maxDocumentBytes, requireDocumentActor, requireDocumentPatient, saveDocument, validatePdf } from '@/lib/clinical-documents/service';
import { DentalClinicError } from '@/errors/domain';

export async function POST(request: Request) {
  try {
    const actor = await requireDocumentActor('recepcionista');
    const maxBodyBytes = maxDocumentBytes + 65536;
    const oversized = () => new DentalClinicError('El PDF excede el límite de 20 MB.', 'DOCUMENT_TOO_LARGE', 413);
    if (Number(request.headers.get('content-length')) > maxBodyBytes) throw oversized();
    const contentType = request.headers.get('content-type');
    if (!request.body || !contentType?.startsWith('multipart/form-data;')) {
      throw new DentalClinicError('Adjunta un archivo PDF.', 'INVALID_UPLOAD', 422);
    }
    let receivedBytes = 0;
    const body = request.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        receivedBytes += chunk.byteLength;
        if (receivedBytes > maxBodyBytes) throw oversized();
        controller.enqueue(chunk);
      },
    }));
    let form: FormData;
    try {
      form = await new Response(body, { headers: { 'Content-Type': contentType } }).formData();
    } catch {
      if (receivedBytes > maxBodyBytes) throw oversized();
      throw new DentalClinicError('El envío del archivo está incompleto.', 'INVALID_UPLOAD', 422);
    }
    const input = documentRequest.parse({ patientId: form.get('patientId'), requestId: form.get('requestId') });
    await requireDocumentPatient(actor, input.patientId);
    const pdf = await validatePdf(form.get('file'));
    return Response.json(await saveDocument(actor, input, 'external_pdf', pdf.name, pdf.bytes), { status: 201 });
  } catch (error) {
    return documentError(error);
  }
}
