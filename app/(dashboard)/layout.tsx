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

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
