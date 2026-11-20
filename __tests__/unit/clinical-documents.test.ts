import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { renderPatientPdf } from '@/lib/clinical-documents/render-pdf';
import { validatePdf } from '@/lib/clinical-documents/service';

describe('Patient PDFs', () => {
  it('renders Spanish clinical notes across pages and accepts the resulting PDF', async () => {
    const bytes = await renderPatientPdf({
      title: 'Informe odontológico',
      sections: [{ title: 'Evolución', lines: Array.from({ length: 80 }, () => 'Control de Joaquín. Evolución favorable.') }],
    });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(1);
    const uploaded = await validatePdf(new File([Uint8Array.from(bytes)], 'informe.pdf', { type: 'application/pdf' }));
    expect(uploaded.name).toBe('informe.pdf');
    expect(uploaded.bytes.byteLength).toBe(bytes.byteLength);
  });

  it('rejects mislabeled bytes even when the filename and media type indicate PDF', async () => {
    await expect(validatePdf(new File(['plain text'], 'wrong.pdf', { type: 'application/pdf' })))
      .rejects.toMatchObject({ code: 'INVALID_PDF' });
  });
});
