import { documentReceiptFields, type DocumentReceipt } from '@/lib/clinical-documents/service';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPatientByIdAction } from '@/lib/actions/patients.actions';
import { getClinicalHistoryAction } from '@/lib/actions/clinical.actions';
import { getOdontogramStateAction, listCustomToothStatusesAction } from '@/lib/actions/odontogram.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { PageHeader } from '@/components/ui/page-header';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { HistoryClient } from './history-client';

export const metadata = {
  title: 'Historia clínica',
  description: 'Historia clínica y odontograma digital del paciente',
};

export default async function ClinicalHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  // La recepcionista no accede a historias clínicas (Requisito RF-6)
  if (profile.role === 'recepcionista') {
    redirect('/dashboard');
  }

  const { id } = await params;

  const patientResult = await getPatientByIdAction(id);
  if (!patientResult.success) {
    if (patientResult.error.statusCode === 401 || patientResult.error.statusCode === 403) {
      redirect('/dashboard');
    }
    if (patientResult.error.statusCode === 404) notFound();
    throw new Error(patientResult.error.message);
  }

  const [historyResult, odontogramResult, customStatusesResult, usersResult, documentsResult, legacyResult] = await Promise.all([
    getClinicalHistoryAction(id),
    getOdontogramStateAction(id),
    listCustomToothStatusesAction(),
    createServerSupabaseClient().then((supabase) =>
      supabase.from('users').select('id, full_name').eq('clinic_id', profile.clinicId)
    ),
    profile.role === 'odontologo' ? createServerSupabaseClient().then((supabase) =>
      supabase.from('clinical_documents').select(documentReceiptFields)
        .eq('clinic_id', profile.clinicId).eq('patient_id', id).order('created_at', { ascending: false })
    ) : null,
    profile.role === 'odontologo' ? createServerSupabaseClient().then((supabase) =>
      supabase.from('clinical_attachments').select('id, file_name, file_type, created_at, entry_id')
        .eq('clinic_id', profile.clinicId).eq('patient_id', id).order('created_at', { ascending: false })
    ) : null,
  ]);

  if (!historyResult.success || !odontogramResult.success || !customStatusesResult.success) {
    const firstError =
      historyResult.error ?? odontogramResult.error ?? customStatusesResult.error;
    throw new Error(firstError?.message ?? 'Error al cargar la historia clínica');
  }

  const dentistNames: Record<string, string> = {};
  for (const user of usersResult.data ?? []) {
    dentistNames[user.id] = user.full_name;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/pacientes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver a pacientes
      </Link>

      <PageHeader
        title="Historia clínica"
        description="Consulta el expediente y registra la atención del paciente."
      />

      <HistoryClient
        patient={patientResult.data}
        documents={profile.role === 'odontologo' ? (documentsResult?.data ?? []) as DocumentReceipt[] : undefined}
        legacyAttachments={legacyResult?.data ?? []}
        documentsUnavailable={!!(documentsResult?.error || legacyResult?.error)}
        record={historyResult.data.record}
        initialEntries={historyResult.data.entries}
        dentistNames={dentistNames}
        odontogramStates={odontogramResult.data}
        customStatuses={customStatusesResult.data}
      />
    </div>
  );
}
