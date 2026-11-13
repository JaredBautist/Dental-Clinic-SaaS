import { redirect } from 'next/navigation';
import { listPatientsAction } from '@/lib/actions/patients.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { PageHeader } from '@/components/ui/page-header';
import { PatientsClient } from './patients-client';

export const metadata = {
  title: 'Pacientes',
  description: 'Gestión de pacientes del consultorio',
};

export default async function PatientsPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  const patientsResult = await listPatientsAction();

  if (!patientsResult.success) {
    if (patientsResult.error.statusCode === 401 || patientsResult.error.statusCode === 403) {
      redirect('/dashboard');
    }
    throw new Error(patientsResult.error.message);
  }

  return (
    <div>
      <PageHeader
        title="Gestión de Pacientes"
        description="Registro, consulta y administración de pacientes del consultorio"
      />
      <PatientsClient
        initialPatients={patientsResult.data}
        canViewClinical={profile.role === 'odontologo'}
        canManagePatients={profile.role === 'recepcionista'}
      />
    </div>
  );
}
