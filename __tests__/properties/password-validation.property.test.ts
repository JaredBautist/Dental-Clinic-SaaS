/**
 * Prueba de Propiedad P22: Validación de Contraseñas
 *
 * Valida: Requisito 3.3
 *
 * Propiedad: Para cualquier contraseña generada:
 * - Acepta exactamente las contraseñas que cumplen:
 *   >= 10 caracteres, al menos 1 mayúscula, al menos 1 minúscula, al menos 1 dígito, al menos 1 carácter especial.
 * - Rechaza cualquier contraseña que incumpla una o más condiciones,
 *   incluyendo en la respuesta los mensajes de error correspondientes.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validatePassword,
  PASSWORD_REQUIREMENTS,
} from '@/lib/auth/password-validator';

// Generadores de caracteres específicos
const upperCharArb = fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
const lowerCharArb = fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split(''));
const digitCharArb = fc.constantFrom(...'0123456789'.split(''));
const specialCharArb = fc.constantFrom(...'!@#$%^&*()_+-=[]{};\':"|,.<>/?~`'.split(''));
const alphanumericArb = fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''));

// Generador de contraseña válida completa
const validPasswordArb = fc
  .tuple(
    upperCharArb,
    lowerCharArb,
    digitCharArb,
    specialCharArb,
    fc.array(fc.oneof(upperCharArb, lowerCharArb, digitCharArb, specialCharArb), {
      minLength: 6,
      maxLength: 30,
    }),
  )
  .map(([upper, lower, digit, special, rest]) => {
    // Mezclar los caracteres requeridos con el resto para que no estén en orden predecible
    const allChars = [upper, lower, digit, special, ...rest];
    // Shuffle
    for (let i = allChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
    }
    return allChars.join('');
  });

describe('Propiedad P22: Validación de Contraseñas', () => {
  it('toda contraseña que cumple los 5 criterios es aceptada como válida', () => {
    fc.assert(
      fc.property(validPasswordArb, (password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 },
    );
  });

  it('rechaza contraseñas con longitud menor a 10 caracteres', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(upperCharArb, lowerCharArb, digitCharArb, specialCharArb), {
          minLength: 0,
          maxLength: 9,
        }).map((chars) => chars.join('')),
        (shortPassword) => {
          const result = validatePassword(shortPassword);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(PASSWORD_REQUIREMENTS.MIN_LENGTH_MSG);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rechaza contraseñas sin mayúsculas', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          lowerCharArb,
          digitCharArb,
          specialCharArb,
          fc.array(fc.oneof(lowerCharArb, digitCharArb, specialCharArb), {
            minLength: 7,
            maxLength: 20,
          }),
        ).map(([lower, digit, special, rest]) => [lower, digit, special, ...rest].join('')),
        (noUpperPassword) => {
          const result = validatePassword(noUpperPassword);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(PASSWORD_REQUIREMENTS.HAS_UPPERCASE);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rechaza contraseñas sin minúsculas', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          upperCharArb,
          digitCharArb,
          specialCharArb,
          fc.array(fc.oneof(upperCharArb, digitCharArb, specialCharArb), {
            minLength: 7,
            maxLength: 20,
          }),
        ).map(([upper, digit, special, rest]) => [upper, digit, special, ...rest].join('')),
        (noLowerPassword) => {
          const result = validatePassword(noLowerPassword);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(PASSWORD_REQUIREMENTS.HAS_LOWERCASE);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rechaza contraseñas sin dígitos', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          upperCharArb,
          lowerCharArb,
          specialCharArb,
          fc.array(fc.oneof(upperCharArb, lowerCharArb, specialCharArb), {
            minLength: 7,
            maxLength: 20,
          }),
        ).map(([upper, lower, special, rest]) => [upper, lower, special, ...rest].join('')),
        (noDigitPassword) => {
          const result = validatePassword(noDigitPassword);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(PASSWORD_REQUIREMENTS.HAS_DIGIT);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rechaza contraseñas sin caracteres especiales', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          upperCharArb,
          lowerCharArb,
          digitCharArb,
          fc.array(alphanumericArb, { minLength: 7, maxLength: 20 }),
        ).map(([upper, lower, digit, rest]) => [upper, lower, digit, ...rest].join('')),
        (noSpecialPassword) => {
          const result = validatePassword(noSpecialPassword);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(PASSWORD_REQUIREMENTS.HAS_SPECIAL);
        },
      ),
      { numRuns: 100 },
    );
  });
});
