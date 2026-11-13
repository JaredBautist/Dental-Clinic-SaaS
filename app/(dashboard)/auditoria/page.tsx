import { redirect } from 'next/navigation';
import { getAuditLogsAction } from '@/lib/actions/audit.actions';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { PageHeader } from '@/components/ui/page-header';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { AuditClient } from './audit-client';

export const metadata = {
  title: 'Auditoría',
  description: 'Registro inmutable de operaciones del consultorio',
};

export default async function AuditPage() {
  const profile = await getShellProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'administrador') {
    redirect('/dashboard');
  }

  const [logsResult, usersResult] = await Promise.all([
    getAuditLogsAction(),
    createServerSupabaseClient().then((supabase) =>
      supabase.from('users').select('id, full_name').eq('clinic_id', profile.clinicId)
    ),
  ]);

  if (!logsResult.success) {
    throw new Error(logsResult.error.message);
  }

  const userNames: Record<string, string> = {};
  for (const user of usersResult.data ?? []) {
    userNames[user.id] = user.full_name;
  }

  return (
    <div>
      <PageHeader
        title="Auditoría"
        description="Toda operación de escritura queda registrada de forma inmutable (Requisito 8.4)"
      />
      <AuditClient initialLogs={logsResult.data} userNames={userNames} />
    </div>
  );
}
