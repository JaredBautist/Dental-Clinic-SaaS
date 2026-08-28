export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 10,
  HAS_UPPERCASE: 'Debe contener al menos una letra mayúscula',
  HAS_LOWERCASE: 'Debe contener al menos una letra minúscula',
  HAS_DIGIT: 'Debe contener al menos un número',
  HAS_SPECIAL: 'Debe contener al menos un carácter especial (!@#$%^&*...)',
  MIN_LENGTH_MSG: 'Debe tener al menos 10 caracteres',
};

/**
 * Valida si una contraseña cumple los requisitos del sistema:
 * - Mínimo 10 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un dígito
 * - Al menos un carácter especial
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(PASSWORD_REQUIREMENTS.MIN_LENGTH_MSG);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(PASSWORD_REQUIREMENTS.HAS_UPPERCASE);
  }

  if (!/[a-z]/.test(password)) {
    errors.push(PASSWORD_REQUIREMENTS.HAS_LOWERCASE);
  }

  if (!/[0-9]/.test(password)) {
    errors.push(PASSWORD_REQUIREMENTS.HAS_DIGIT);
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push(PASSWORD_REQUIREMENTS.HAS_SPECIAL);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
