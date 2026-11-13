import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2 } from 'lucide-react';
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

export default async function ConsultoriosPage() {
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

  const firstClinic = clinicsResult.data[0];
  const detailResult = firstClinic
    ? await getAdminClinicDetailAction(firstClinic.id)
    : null;

  if (detailResult && !detailResult.success) {
    throw new Error(detailResult.error.message);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultorios"
        description="Consulta la información y gestiona los usuarios de cada consultorio"
        action={
          <Button asChild>
            <Link href="/clinica/nueva">
              <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Nuevo consultorio
            </Link>
          </Button>
        }
      />
      <ConsultoriosClient
        initialClinics={clinicsResult.data}
        initialDetail={detailResult?.success ? detailResult.data : null}
      />
    </div>
  );
}
