import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurar MFA',
  robots: { index: false, follow: false },
};

export default function SetupMfaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
