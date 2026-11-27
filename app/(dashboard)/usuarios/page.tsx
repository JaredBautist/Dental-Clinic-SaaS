import { redirect } from 'next/navigation';
import { listUsersAction } from '@/lib/actions/users.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { hasPlatformAccess } from '@/lib/platform/access';
import { UsersClient } from './users-client';

export default async function UsersPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  const [result, platformAccess] = await Promise.all([listUsersAction(), hasPlatformAccess()]);

  if (!result.success) {
    if (result.error.statusCode === 401 || result.error.statusCode === 403) {
      redirect('/dashboard');
    }
    throw new Error(result.error.message);
  }

  return <UsersClient platformAccess={platformAccess} clinicName={profile.clinicName} initialUsers={result.data} currentUserId={profile.userId} />;
}
