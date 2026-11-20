import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { listAdminClinicsAction } from '@/lib/actions/admin-clinics.actions';
import { CreateClinicUserForm } from './create-clinic-user-form';

export const metadata = {
  title: 'Nuevo usuario',
  description: 'Alta de personal para un consultorio',
};

interface NewClinicUserPageProps {
  searchParams: Promise<{ clinic?: string }>;
}

export default async function NewClinicUserPage({ searchParams }: NewClinicUserPageProps) {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'administrador') {
    redirect('/dashboard');
  }

  const clinicsResult = await listAdminClinicsAction();
  if (!clinicsResult.success) {
    throw new Error(clinicsResult.error.message);
  }

  const { clinic: requestedClinicId } = await searchParams;
  const clinics = clinicsResult.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo usuario"
        description="Crea una cuenta de odontólogo, recepcionista o administrador para el consultorio seleccionado."
        action={
          <Button variant="outline" asChild>
            <Link href="/consultorios">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Volver a consultorios
            </Link>
          </Button>
        }
      />

      {clinics.length === 0 ? (
        <Alert tone="info" title="Primero registra un consultorio">
          <p>
            Los usuarios deben pertenecer a un consultorio. Crea uno antes de dar de alta personal.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/clinica/nueva">
              <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Registrar consultorio
            </Link>
          </Button>
        </Alert>
      ) : (
        <CreateClinicUserForm clinics={clinics} initialClinicId={requestedClinicId} />
      )}
    </div>
  );
}
