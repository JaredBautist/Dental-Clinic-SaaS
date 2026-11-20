import { hasPlatformAccess } from '@/lib/platform/access';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { getShellProfile } from '@/lib/auth/shell-profile';
import {
  getAdminClinicDetailAction,
  listAdminClinicsAction,
} from '@/lib/actions/admin-clinics.actions';
import { ConsultoriosClient } from './consultorios-client';

export const metadata = {
  title: 'Consultorios',
  description: 'Administración de consultorios y sus usuarios',
};

interface ConsultoriosPageProps {
  searchParams: Promise<{ clinic?: string }>;
}

export default async function ConsultoriosPage({ searchParams }: ConsultoriosPageProps) {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'administrador') {
    redirect('/dashboard');
  }

  const [clinicsResult, platformAccess] = await Promise.all([listAdminClinicsAction(), hasPlatformAccess()]);
  if (!clinicsResult.success) {
    throw new Error(clinicsResult.error.message);
  }

  const { clinic: requestedClinicId } = await searchParams;
  const selectedClinic =
    clinicsResult.data.find((clinic) => clinic.id === requestedClinicId) ??
    clinicsResult.data[0];
  const detailResult = selectedClinic
    ? await getAdminClinicDetailAction(selectedClinic.id)
    : null;

  if (detailResult && !detailResult.success) {
    throw new Error(detailResult.error.message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultorios"
        description="Consulta los datos del consultorio y administra su personal."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/consultorios/nuevo-usuario">
                <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Nuevo usuario
              </Link>
            </Button>
            {platformAccess && <Button variant="outline" asChild>
              <Link href="/clinica/nueva">
                <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Nuevo consultorio
              </Link>
            </Button>}
          </div>
        }
      />
      <ConsultoriosClient
        initialClinics={clinicsResult.data}
        initialDetail={detailResult?.success ? detailResult.data : null}
      />
    </div>
  );
}
