import { PDFDocument, StandardFonts, type PDFPage } from 'pdf-lib';
import type { PatientReportPreview } from './sections';

export async function renderPatientPdf(preview: PatientReportPreview) {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = 595;
  const height = 842;
  const margin = 48;
  let page: PDFPage = pdf.addPage([width, height]);
  let y = height - margin;
  const safeText = (text: string) => Array.from(text).map((char) => {
    if (char === '\n') return char;
    try { regular.encodeText(char); return char; } catch { return '?'; }
  }).join('');

  function paragraph(text: string, heading = false) {
    const font = heading ? bold : regular;
    const size = heading ? 14 : 11;
    let line = '';
    function draw(value: string) {
      if (y < margin + 18) { page = pdf.addPage([width, height]); y = height - margin; }
      page.drawText(value, { x: margin, y, size, font });
      y -= size + 6;
    }
    for (const char of safeText(text)) {
      if (char === '\n' || font.widthOfTextAtSize(line + char, size) > width - margin * 2) {
        draw(line);
        line = '';
      }
      if (char !== '\n') line += char;
    }
    if (line) draw(line);
  }

  paragraph(preview.title, true);
  for (const section of preview.sections) {
    y -= 10;
    paragraph(section.title, true);
    for (const line of section.lines) paragraph(line.replace(/\r\n?/g, '\n').replace(/\t/g, ' '));
  }
  return pdf.save();
}
