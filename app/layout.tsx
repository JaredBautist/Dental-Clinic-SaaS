import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dental Clinic SaaS | Gestión Odontológica Integral',
  description:
    'Sistema SaaS multiempresa para la gestión integral de consultorios odontológicos privados en Cúcuta, Norte de Santander.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
