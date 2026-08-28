import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import nextConfig, { securityHeaders } from '@/next.config';

/**
 * Propiedad 25: Headers de Seguridad HTTP Presentes en Todas las Respuestas
 * Valida: Requisito 3.7 (README / Requirements / Design)
 *
 * THE Sistema SHALL incluir los encabezados de seguridad HTTP
 * Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options y
 * Referrer-Policy en todas las respuestas del servidor.
 */
describe('P25: Propiedad de Headers de Seguridad HTTP', () => {
  it('debe contener los cuatro encabezados obligatorios con configuraciones seguras', async () => {
    const requiredHeaderKeys = [
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'Referrer-Policy',
    ];

    const configuredKeys = securityHeaders.map((h) => h.key);
    for (const key of requiredHeaderKeys) {
      expect(configuredKeys).toContain(key);
    }

    const headersFn = nextConfig.headers;
    expect(headersFn).toBeDefined();

    if (headersFn) {
      const headersConfig = await headersFn();
      expect(headersConfig).toBeInstanceOf(Array);
      expect(headersConfig.length).toBeGreaterThan(0);

      // Verificamos que la regla capture todas las rutas con /:path*
      const rootMatcher = headersConfig.find((entry) => entry.source === '/:path*');
      expect(rootMatcher).toBeDefined();
      expect(rootMatcher?.headers).toEqual(expect.arrayContaining(securityHeaders));
    }
  });

  it('debe aplicar los headers requeridos para cualquier ruta arbitraria generada', async () => {
    const headersFn = nextConfig.headers;
    if (!headersFn) throw new Error('nextConfig.headers no está definido');

    const headersConfig = await headersFn();
    const globalRule = headersConfig.find((entry) => entry.source === '/:path*');

    // Usamos fast-check para validar rutas aleatorias
    fc.assert(
      fc.property(
        fc.webPath(),
        (path) => {
          // La regla global /:path* cubre cualquier ruta
          expect(globalRule).toBeDefined();
          const headerMap = new Map(
            globalRule!.headers.map((h) => [h.key, h.value])
          );

          expect(headerMap.has('Content-Security-Policy')).toBe(true);
          expect(headerMap.get('Content-Security-Policy')).toContain('default-src');
          expect(headerMap.get('Content-Security-Policy')).toContain('*.supabase.co');

          expect(headerMap.has('Strict-Transport-Security')).toBe(true);
          expect(headerMap.get('Strict-Transport-Security')).toContain('max-age=63072000');
          expect(headerMap.get('Strict-Transport-Security')).toContain('includeSubDomains');

          expect(headerMap.has('X-Content-Type-Options')).toBe(true);
          expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');

          expect(headerMap.has('Referrer-Policy')).toBe(true);
          expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
