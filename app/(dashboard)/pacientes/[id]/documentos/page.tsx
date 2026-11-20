import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { DocumentUpload } from '@/components/patients/document-upload';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { getPatientByIdAction } from '@/lib/actions/patients.actions';

export default async function PatientIntakeDocuments({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getShellProfile();
  if (!profile) redirect('/login');
  if (profile.role !== 'recepcionista') redirect('/pacientes');
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const patient = await getPatientByIdAction(id.data);
  if (!patient.success) {
    if ([403, 404].includes(patient.error.statusCode)) notFound();
    throw new Error(patient.error.message);
  }
  return (
    <div className="max-w-2xl space-y-5">
      <Link className="inline-flex min-h-11 items-center underline" href="/pacientes">Volver a pacientes</Link>
      <PageHeader title="Cargar historia clínica" description={patient.data.full_name} />
      <Card><CardContent className="pt-6"><DocumentUpload patientId={id.data} /></CardContent></Card>
    </div>
  );
}
