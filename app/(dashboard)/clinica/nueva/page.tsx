import { hasPlatformAccess } from '@/lib/platform/access';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { CreateClinicForm } from './create-clinic-form';

export const metadata = {
  title: 'Registrar consultorio',
  description: 'Creación de consultorios por el administrador del sistema',
};

export default async function CreateClinicPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'administrador' || !await hasPlatformAccess()) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar nuevo consultorio"
        description="Crea un consultorio con su administrador inicial. Los pacientes y citas los gestiona la recepcionista de cada consultorio."
      />
      <CreateClinicForm />
    </div>
  );
}
