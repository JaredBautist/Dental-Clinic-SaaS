import { redirect } from 'next/navigation';
import { getClinicAction } from '@/lib/actions/clinic.actions';
import { ClinicConfigClient } from './clinic-config-client';

export default async function ClinicConfigPage() {
  const result = await getClinicAction();

  if (!result.success) {
    if (result.error.statusCode === 401 || result.error.statusCode === 403) {
      redirect('/login');
    }
    throw new Error(result.error.message);
  }

  return <ClinicConfigClient initialClinic={result.data} />;
}
