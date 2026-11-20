import { z } from 'zod';
import { DentalClinicError } from '@/errors/domain';
import { getClinicalHistoryAction } from '@/lib/actions/clinical.actions';
import { getOdontogramStateAction } from '@/lib/actions/odontogram.actions';
import { documentError } from '@/lib/clinical-documents/http';
import { renderPatientPdf } from '@/lib/clinical-documents/render-pdf';
import { reportSections, type PatientReportPreview } from '@/lib/clinical-documents/sections';
import { documentRequest, requireDocumentActor, requireDocumentPatient, saveDocument } from '@/lib/clinical-documents/service';
import { formatReportDate } from '@/lib/report-dates';
import { createClient } from '@/lib/supabase/server';

const reportRequest = documentRequest.extend({
  sections: z.array(z.enum(['background', 'notes', 'odontogram', 'appointments'])).max(4),
  preview: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const actor = await requireDocumentActor('odontologo');
    const input = reportRequest.parse(await request.json());
    const patient = await requireDocumentPatient(actor, input.patientId);
    const preview: PatientReportPreview = { title: 'Informe odontológico', sections: [{
      title: 'Paciente',
      lines: [patient.full_name, `${patient.document_type} ${patient.document_number}`,
        `Nacimiento: ${patient.birth_date}`, `Profesional: ${actor.fullName}`],
    }] };
    for (const section of new Set(input.sections)) {
      let lines: string[] = [];
      if (section === 'background') lines = patient.medical_history ? [patient.medical_history] : [];
      if (section === 'notes') {
        const history = await getClinicalHistoryAction(patient.id);
        if (!history.success) throw new DentalClinicError('No se pudieron cargar las notas.', 'REPORT_DATA_FAILED', 500);
        lines = history.data.entries.map((entry) => `${formatReportDate(entry.created_at)} · ${entry.entry_type.replaceAll('_', ' ')}: ${entry.content}`);
      }
      if (section === 'odontogram') {
        const odontogram = await getOdontogramStateAction(patient.id);
        if (!odontogram.success) throw new DentalClinicError('No se pudo cargar el odontograma.', 'REPORT_DATA_FAILED', 500);
        lines = odontogram.data.map((state) => `Pieza ${state.tooth_code} · ${state.surface}: ${state.status}`);
      }
      if (section === 'appointments') {
        const supabase = await createClient();
        const { data, error } = await supabase.from('appointments').select('scheduled_at, status, reason')
          .eq('clinic_id', actor.clinicId).eq('patient_id', patient.id).eq('dentist_id', actor.userId)
          .eq('status', 'completada').order('scheduled_at', { ascending: false });
        if (error) throw new DentalClinicError('No se pudieron cargar las citas.', 'REPORT_DATA_FAILED', 500);
        lines = (data ?? []).map((appointment) => `${formatReportDate(appointment.scheduled_at)} · ${appointment.reason}`);
      }
      preview.sections.push({ title: reportSections[section], lines: lines.length ? lines : ['Sin registros.'] });
    }
    if (input.preview) return Response.json(preview, { headers: { 'Cache-Control': 'private, no-store' } });
    return Response.json(await saveDocument(actor, input, 'patient_report', 'informe-odontologico.pdf', await renderPatientPdf(preview)), { status: 201 });
  } catch (error) {
    return documentError(error);
  }
}
