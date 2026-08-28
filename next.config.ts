import type { NextConfig } from 'next';

export function createSecurityHeaders(nodeEnvironment: string | undefined) {
  const scriptSources = ["'self'", "'unsafe-inline'"];
  if (nodeEnvironment === 'development') {
    scriptSources.push("'unsafe-eval'");
  }

  return [
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        `script-src ${scriptSources.join(' ')}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://*.supabase.co",
        "font-src 'self' data:",
      ].join('; '),
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), geolocation=(), microphone=()',
    },
  ];
}

export const securityHeaders = createSecurityHeaders(process.env.NODE_ENV);

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    // Work around Next.js 16 CLI JSON parsing failures during build-time checks.
    useTypeScriptCli: false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
