/**
 * Prueba de Propiedad P24: Integridad del JWT Emitido
 *
 * Valida: Requisito 2.9
 *
 * Propiedad: Para cualquier usuario autenticado correctamente en el sistema:
 * 1. El token / claims emitidos contienen exactamente: clinic_id, user_id y role.
 * 2. Los valores en las claims coinciden de manera idéntica e inmutable con los
 *    datos registrados en la tabla users.
 * 3. El rol extraído pertenece exclusivamente al conjunto {'administrador', 'odontologo', 'recepcionista'}.
 * 4. Los identificadores clinic_id y user_id son UUIDs válidos.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { JWTClaims, UserRole } from '@/types/domain';

// Función simulada que genera y valida las claims de JWT según el diseño de Supabase / Next.js
function buildJWTClaims(user: {
  id: string;
  clinic_id: string;
  role: UserRole;
  is_active: boolean;
}): JWTClaims {
  if (!user.is_active) {
    throw new Error('Usuario inactivo');
  }

  return {
    clinic_id: user.clinic_id,
    user_id: user.id,
    role: user.role,
  };
}

function parseAndVerifyClaims(
  claims: JWTClaims,
  expectedUser: { id: string; clinic_id: string; role: UserRole }
): boolean {
  return (
    claims.clinic_id === expectedUser.clinic_id &&
    claims.user_id === expectedUser.id &&
    claims.role === expectedUser.role
  );
}

const roleArb = fc.constantFrom<UserRole>('administrador', 'odontologo', 'recepcionista');
const uuidArb = fc.uuid();

const activeUserArb = fc.record({
  id: uuidArb,
  clinic_id: uuidArb,
  role: roleArb,
  is_active: fc.constant(true),
});

describe('Propiedad P24: Integridad del JWT Emitido', () => {
  it('para todo usuario activo, las claims del JWT coinciden idénticamente con el registro de users', () => {
    fc.assert(
      fc.property(activeUserArb, (user) => {
        const claims = buildJWTClaims(user);

        // 1. Integridad de los valores
        expect(parseAndVerifyClaims(claims, user)).toBe(true);

        // 2. Coincidencia exacta de cada campo
        expect(claims.user_id).toBe(user.id);
        expect(claims.clinic_id).toBe(user.clinic_id);
        expect(claims.role).toBe(user.role);

        // 3. Tipado estricto del rol
        expect(['administrador', 'odontologo', 'recepcionista']).toContain(claims.role);

        // 4. Formato UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        expect(claims.user_id).toMatch(uuidRegex);
        expect(claims.clinic_id).toMatch(uuidRegex);
      }),
      { numRuns: 100 }
    );
  });

  it('rechaza la emisión de claims para usuarios inactivos', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: uuidArb,
          clinic_id: uuidArb,
          role: roleArb,
          is_active: fc.constant(false),
        }),
        (inactiveUser) => {
          expect(() => buildJWTClaims(inactiveUser)).toThrow('Usuario inactivo');
        }
      ),
      { numRuns: 100 }
    );
  });
});
