import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dental Clinic SaaS | Gestión Odontológica Integral',
    template: '%s | Dental Clinic SaaS',
  },
  description:
    'Sistema SaaS multiempresa para la gestión integral de consultorios odontológicos privados: pacientes, citas, historia clínica, odontograma y reportes con seguridad de nivel empresarial.',
  keywords: [
    'software odontológico',
    'consultorio dental',
    'historia clínica dental',
    'odontograma digital',
    'gestión de citas dentales',
    'SaaS dental Colombia',
  ],
  applicationName: 'Dental Clinic SaaS',
  authors: [{ name: 'Dental Clinic SaaS' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: siteUrl,
    siteName: 'Dental Clinic SaaS',
    title: 'Dental Clinic SaaS | Gestión Odontológica Integral',
    description:
      'Pacientes, citas, historia clínica inmutable y odontograma digital para consultorios odontológicos privados.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dental Clinic SaaS | Gestión Odontológica Integral',
    description:
      'Pacientes, citas, historia clínica inmutable y odontograma digital para consultorios odontológicos privados.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
