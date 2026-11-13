import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getShellProfile } from '@/lib/auth/shell-profile';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  robots: { index: false, follow: false },
};

// El contenido del login depende de la sesión: nunca se prerenderiza de forma estática.
export const dynamic = 'force-dynamic';

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const profile = await getShellProfile();

  // También protege las entradas antiguas del historial del navegador.
  if (profile) {
    if (profile.role === 'administrador' || profile.role === 'odontologo') {
      if (!profile.mfaEnabled) {
        redirect('/setup-mfa');
      }

      const supabase = await createClient();
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel !== 'aal2') {
        redirect('/verify-mfa');
      }
    }

    redirect('/dashboard');
  }

  return children;
}
