import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar MFA',
  robots: { index: false, follow: false },
};

export default function VerifyMfaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
