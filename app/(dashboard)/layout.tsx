import { listClinicsForView } from '@/lib/platform/clinic-view-data';
import { hasPlatformAccess } from '@/lib/platform/access';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getShellProfile } from '@/lib/auth/shell-profile';

// Todas las rutas del dashboard dependen de sesión/cookies: nunca prerenderizar.
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  const platformAccess = profile.role === 'administrador' && await hasPlatformAccess();
  const clinicList = platformAccess ? await listClinicsForView() : null;

  return (
    <DashboardShell
      profile={profile}
      platformAccess={platformAccess}
      platformClinics={clinicList?.success ? clinicList.data.map(({ id, name }) => ({ id, name })) : []}
    >
      {children}
    </DashboardShell>
  );
}
