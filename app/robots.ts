import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/pacientes',
          '/citas',
          '/reportes',
          '/usuarios',
          '/auditoria',
          '/clinica',
          '/consultorios',
          '/login',
          '/setup-mfa',
          '/verify-mfa',
          '/api',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
