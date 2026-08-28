'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import {
  checkLockout,
  recordFailedAttempt,
  clearFailedAttempts,
} from '@/lib/auth/login-limiter';
import { UserRole } from '@/types/domain';

const loginSchema = z.object({
  email: z.string().email('El formato del correo electrónico no es válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export interface LoginResult {
  redirectTo: string;
  role: UserRole;
  clinicId: string;
  userId: string;
  fullName: string;
  mfaRequired: boolean;
}

/**
 * Server Action para inicio de sesión seguro con protección de intentos fallidos
 */
export async function loginAction(
  formData: z.infer<typeof loginSchema>
): Promise<ServerActionResult<LoginResult>> {
  return withErrorHandling(async () => {
    // 1. Validar esquema de entrada
    const { email, password } = loginSchema.parse(formData);

    // 2. Verificar si la cuenta está bloqueada por intentos fallidos
    const lockout = checkLockout(email);
    if (lockout.isLocked) {
      throw new Error(
        `Demasiados intentos fallidos. Su cuenta ha sido bloqueada temporalmente por ${lockout.remainingMinutes} minutos.`
      );
    }

    const supabase = await createServerSupabaseClient();

    // 3. Autenticación con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Registrar intento fallido
      const attemptResult = recordFailedAttempt(email);

      if (attemptResult.triggeredLockout) {
        // Enviar notificación al admin o registrar auditoría
        try {
          const admin = createAdminClient();
          await admin.from('audit_logs').insert({
            clinic_id: '00000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000',
            role: 'administrador',
            entity_type: 'usuario',
            entity_id: '00000000-0000-0000-0000-000000000000',
            action: 'update',
            result: 'failure',
            metadata: {
              reason: 'ACCOUNT_LOCKED_FAILED_ATTEMPTS',
              targetEmail: email,
              lockoutMinutes: 15,
            },
          });
        } catch {
          // No detener el flujo si falla el log de auditoría
        }

        throw new Error(
          'Ha superado el límite de 5 intentos fallidos. Su cuenta ha sido bloqueada por 15 minutos.'
        );
      }

      const attemptsWarning =
        attemptResult.attemptsLeft > 0
          ? ` (${attemptResult.attemptsLeft} intentos restantes antes de bloqueo temporal)`
          : '';

      throw new Error(`Credenciales inválidas. Por favor verifique su correo y contraseña${attemptsWarning}.`);
    }

    // 4. Limpiar intentos fallidos tras login exitoso
    clearFailedAttempts(email);

    // 5. Consultar información del usuario en la tabla users
    const admin = createAdminClient();
    const { data: userProfile, error: profileError } = await admin
      .from('users')
      .select('id, clinic_id, role, full_name, is_active, mfa_enabled')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      await supabase.auth.signOut();
      throw new Error('El perfil de usuario asociado no existe en este consultorio.');
    }

    if (!userProfile.is_active) {
      await supabase.auth.signOut();
      throw new Error('Su cuenta ha sido desactivada. Comuníquese con el administrador del consultorio.');
    }

    const role = userProfile.role as UserRole;
    const isClinicalRole = role === 'administrador' || role === 'odontologo';

    let redirectTo = '/dashboard';
    let mfaRequired = false;

    if (isClinicalRole) {
      if (!userProfile.mfa_enabled) {
        redirectTo = '/setup-mfa';
        mfaRequired = true;
      } else {
        redirectTo = '/verify-mfa';
        mfaRequired = true;
      }
    }

    return {
      redirectTo,
      role,
      clinicId: userProfile.clinic_id,
      userId: userProfile.id,
      fullName: userProfile.full_name,
      mfaRequired,
    };
  });
}

/**
 * Server Action para cierre de sesión
 */
export async function logoutAction(): Promise<ServerActionResult<{ success: boolean }>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return { success: true };
  });
}

/**
 * Server Action para iniciar el enrolamiento de MFA (TOTP)
 */
export async function enrollMfaAction(): Promise<
  ServerActionResult<{
    factorId: string;
    qrCode: string;
    secret: string;
    uri: string;
  }>
> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Dental Clinic SaaS',
    });

    if (error || !data) {
      throw new Error(error?.message || 'Error al inicializar la configuración de MFA.');
    }

    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    };
  });
}

/**
 * Server Action para verificar el código inicial de MFA y activar mfa_enabled
 */
export async function verifyMfaSetupAction(formData: {
  factorId: string;
  code: string;
}): Promise<ServerActionResult<{ success: boolean; redirectTo: string }>> {
  return withErrorHandling(async () => {
    const { factorId, code } = z
      .object({
        factorId: z.string().min(1, 'El ID de factor es obligatorio'),
        code: z.string().length(6, 'El código debe tener exactamente 6 dígitos'),
      })
      .parse(formData);

    const supabase = await createServerSupabaseClient();

    // 1. Crear challenge y verificar
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError || !challengeData) {
      throw new Error('No se pudo generar el desafío de verificación MFA.');
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      throw new Error('Código de autenticación incorrecto o expirado. Intente nuevamente.');
    }

    // 2. Marcar mfa_enabled = true en la base de datos
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      await admin.from('users').update({ mfa_enabled: true }).eq('id', user.id);
    }

    return {
      success: true,
      redirectTo: '/dashboard',
    };
  });
}

/**
 * Server Action para verificar TOTP en cada inicio de sesión
 */
export async function verifyMfaLoginAction(formData: {
  code: string;
}): Promise<ServerActionResult<{ success: boolean; redirectTo: string }>> {
  return withErrorHandling(async () => {
    const { code } = z
      .object({
        code: z.string().length(6, 'El código debe tener exactamente 6 dígitos'),
      })
      .parse(formData);

    const supabase = await createServerSupabaseClient();

    // Obtener los factores autenticados del usuario
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError || !factors.totp || factors.totp.length === 0) {
      throw new Error('No se encontró un factor de autenticación TOTP configurado.');
    }

    const factor = factors.totp[0];

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });

    if (challengeError || !challengeData) {
      throw new Error('No se pudo generar el desafío de verificación MFA.');
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      throw new Error('Código de autenticación incorrecto o expirado.');
    }

    return {
      success: true,
      redirectTo: '/dashboard',
    };
  });
}

/**
 * Server Action si el usuario cancela o abandona el flujo MFA
 */
export async function cancelMfaAction(): Promise<ServerActionResult<{ success: boolean }>> {
  return withErrorHandling(async () => {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return { success: true };
  });
}
