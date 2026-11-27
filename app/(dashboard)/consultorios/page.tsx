import { hasPlatformAccess } from '@/lib/platform/access';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { getAdminClinicDetailAction } from '@/lib/actions/admin-clinics.actions';
import { listClinicsForView } from '@/lib/platform/clinic-view-data';
import { selectClinicForView } from '@/lib/platform/clinic-selection';
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

  const [clinicsResult, platformAccess] = await Promise.all([listClinicsForView(), hasPlatformAccess()]);
  if (!clinicsResult.success) {
    throw new Error(clinicsResult.error.message);
  }

  const { clinic: requestedClinicId } = await searchParams;
  const selectedClinic = selectClinicForView(clinicsResult.data, profile.clinicId, requestedClinicId);
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
              <Link href={selectedClinic ? `/consultorios/nuevo-usuario?clinic=${selectedClinic.id}` : "/consultorios/nuevo-usuario"}>
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
        key={selectedClinic?.id}
        platformAccess={platformAccess}
        initialClinics={clinicsResult.data}
        initialDetail={detailResult?.success ? detailResult.data : null}
      />
    </div>
  );
}
