import { redirect } from 'next/navigation';
import { listUsersAction } from '@/lib/actions/users.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { hasPlatformAccess } from '@/lib/platform/access';
import { listClinicsForView } from '@/lib/platform/clinic-view-data';
import { selectClinicForView } from '@/lib/platform/clinic-selection';
import { UsersClient } from './users-client';

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ clinic?: string | string[] }> }) {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  const platformAccess = profile.role === 'administrador' && await hasPlatformAccess();
  let clinic = { id: profile.clinicId, name: profile.clinicName };
  if (platformAccess) {
    const [clinics, params] = await Promise.all([listClinicsForView(), searchParams]);
    if (!clinics.success) throw new Error(clinics.error.message);
    clinic = selectClinicForView(clinics.data, profile.clinicId, params.clinic) ?? clinic;
  }
  const result = await listUsersAction(clinic.id);

  if (!result.success) {
    if (result.error.statusCode === 401 || result.error.statusCode === 403) {
      redirect('/dashboard');
    }
    throw new Error(result.error.message);
  }

  return <UsersClient key={clinic.id} clinicId={clinic.id} platformAccess={platformAccess} clinicName={clinic.name} initialUsers={result.data} currentUserId={profile.userId} />;
}
