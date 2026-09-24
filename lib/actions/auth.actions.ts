'use server';

import { z } from 'zod';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withErrorHandling, ServerActionResult } from '@/lib/server-action-wrapper';
import {
  createLoginAttemptStore,
  type RpcInvoker,
} from '@/lib/auth/login-attempt-store';
import { terminateSession } from '@/lib/auth/session-termination';
import {
  AccountLockedError,
  DentalClinicError,
  InvalidCredentialsError,
  RoleAuthorizationError,
} from '@/errors/domain';
import { UserRole } from '@/types/domain';

const USER_ROLES = new Set<UserRole>(['administrador', 'odontologo', 'recepcionista']);

const loginSchema = z.object({
  email: z.string().email('El formato del correo electrónico no es válido').max(254),
  password: z.string().min(1, 'La contraseña es obligatoria').max(256),
});

function createPersistentAttemptStore() {
  const admin = createAdminClient();
  const invokeRpc: RpcInvoker = async (functionName, parameters) => {
    const { data, error } = await admin.rpc(functionName, parameters);
    return {
      data,
      error: error ? { message: error.message } : null,
    };
  };
  return createLoginAttemptStore(invokeRpc);
}

async function requireClinicalUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new DentalClinicError('Debe iniciar sesión nuevamente.', 'AUTHENTICATION_REQUIRED', 401);
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, clinic_id, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (
    error ||
    !profile ||
    typeof profile.id !== 'string' ||
    typeof profile.clinic_id !== 'string' ||
    !USER_ROLES.has(profile.role as UserRole)
  ) {
    throw new DentalClinicError(
      'No fue posible validar el perfil de acceso.',
      'AUTH_PROFILE_UNAVAILABLE',
      401
    );
  }

  const role = profile.role as UserRole;
  const authorizationContext = {
    clinicId: profile.clinic_id,
    userId: profile.id,
    role,
    entityType: 'usuario' as const,
    entityId: profile.id,
    action: 'access_denied' as const,
  };

  if (profile.is_active !== true) {
    throw new DentalClinicError(
      'Su cuenta está desactivada. Comuníquese con el administrador del consultorio.',
      'ACCOUNT_INACTIVE',
      403,
      authorizationContext
    );
  }

  if (role !== 'administrador' && role !== 'odontologo') {
    throw new RoleAuthorizationError(
      'El rol actual no puede completar este flujo MFA.',
      authorizationContext
    );
  }

  return { supabase, user };
}

async function failMfaVerification(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  message: string
): Promise<never> {
  await terminateSession(
    () => supabase.auth.signOut(),
    'No fue posible cerrar la sesión después del fallo MFA.'
  );
  throw new DentalClinicError(message, 'MFA_VERIFICATION_FAILED', 401);
}

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

    // 2. Verificar el bloqueo persistente antes de enviar credenciales a Auth.
    const attemptStore = createPersistentAttemptStore();
    const lockout = await attemptStore.check(email);
    if (lockout.isLocked) {
      throw new AccountLockedError(Math.max(1, Math.ceil(lockout.remainingSeconds / 60)));
    }

    const supabase = await createServerSupabaseClient();

    // 3. Autenticación con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      const attemptResult = await attemptStore.recordFailure(email);

      if (attemptResult.triggeredLockout) {
        // Transactional Outbox: no afirmar entrega hasta que un worker la procese.
        try {
          await attemptStore.enqueueLockoutNotification(email);
        } catch (notificationError: unknown) {
          console.error('[Login Lockout Outbox Error]:', notificationError);
        }

        throw new AccountLockedError(15);
      }

      throw new InvalidCredentialsError(attemptResult.attemptsLeft);
    }

    // 4. Consultar el perfil con la sesión del usuario y RLS activo.
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, clinic_id, role, full_name, is_active, mfa_enabled')
      .eq('id', authData.user.id)
      .single();

    if (
      profileError ||
      !userProfile ||
      typeof userProfile.id !== 'string' ||
      typeof userProfile.clinic_id !== 'string' ||
      !USER_ROLES.has(userProfile.role as UserRole)
    ) {
      await terminateSession(
        () => supabase.auth.signOut(),
        'No fue posible cerrar la sesión con un perfil inválido.'
      );
      throw new DentalClinicError(
        'No fue posible validar el perfil de acceso.',
        'AUTH_PROFILE_UNAVAILABLE',
        401
      );
    }

    const role = userProfile.role as UserRole;
    if (!userProfile.is_active) {
      await terminateSession(
        () => supabase.auth.signOut(),
        'No fue posible cerrar la sesión de la cuenta desactivada.'
      );
      throw new DentalClinicError(
        'Su cuenta está desactivada. Comuníquese con el administrador del consultorio.',
        'ACCOUNT_INACTIVE',
        403,
        {
          clinicId: userProfile.clinic_id,
          userId: userProfile.id,
          role,
          entityType: 'usuario',
          entityId: userProfile.id,
          action: 'access_denied',
        }
      );
    }

    // 5. Limpiar intentos únicamente después de validar la cuenta completa.
    await attemptStore.clear(email);

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
    await terminateSession(
      () => supabase.auth.signOut(),
      'No fue posible cerrar la sesión de forma segura.'
    );
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
    const { supabase } = await requireClinicalUser();

    // Limpiar factores previos no verificados (p. ej. por recarga de página o StrictMode de React)
    // para evitar el error de conflicto 'mfa_factor_name_conflict'
    const { data: factorList } = await supabase.auth.mfa.listFactors();
    if (factorList?.all) {
      for (const factor of factorList.all) {
        if (factor.status === 'unverified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Dental Clinic SaaS',
    });

    if (error || !data) {
      throw new DentalClinicError(
        'No fue posible iniciar la configuración MFA.',
        'MFA_ENROLLMENT_FAILED',
        503
      );
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
        code: z.string().regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos'),
      })
      .parse(formData);

    const { supabase, user } = await requireClinicalUser();

    // 1. Crear challenge y verificar
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError || !challengeData) {
      return failMfaVerification(
        supabase,
        'No fue posible generar el desafío MFA. Inicie sesión nuevamente.'
      );
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      return failMfaVerification(
        supabase,
        'El código MFA es incorrecto o expiró. Inicie sesión nuevamente.'
      );
    }

    // 2. Marcar mfa_enabled solo después de alcanzar AAL2.
    const { data: assurance, error: assuranceError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError || assurance.currentLevel !== 'aal2') {
      return failMfaVerification(
        supabase,
        'Supabase no confirmó el segundo factor. Inicie sesión nuevamente.'
      );
    }

    const admin = createAdminClient();
    const { error: profileUpdateError } = await admin
      .from('users')
      .update({ mfa_enabled: true })
      .eq('id', user.id);
    if (profileUpdateError) {
      return failMfaVerification(
        supabase,
        'No fue posible guardar la configuración MFA. Inicie sesión nuevamente.'
      );
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
        code: z.string().regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos'),
      })
      .parse(formData);

    const { supabase } = await requireClinicalUser();

    // Obtener los factores autenticados del usuario
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError || !factors.totp || factors.totp.length === 0) {
      return failMfaVerification(
        supabase,
        'No existe un factor TOTP válido. Inicie sesión nuevamente.'
      );
    }

    const factor = factors.totp[0];

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });

    if (challengeError || !challengeData) {
      return failMfaVerification(
        supabase,
        'No fue posible generar el desafío MFA. Inicie sesión nuevamente.'
      );
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      return failMfaVerification(
        supabase,
        'El código MFA es incorrecto o expiró. Inicie sesión nuevamente.'
      );
    }

    const { data: assurance, error: assuranceError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError || assurance.currentLevel !== 'aal2') {
      return failMfaVerification(
        supabase,
        'Supabase no confirmó el segundo factor. Inicie sesión nuevamente.'
      );
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
    await terminateSession(
      () => supabase.auth.signOut(),
      'No fue posible cancelar el flujo MFA de forma segura.'
    );
    return { success: true };
  });
}
