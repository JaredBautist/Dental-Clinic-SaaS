"""Lógica de autenticación y MFA — port de lib/actions/auth.actions.ts.

Reglas heredadas del backend TypeScript (ADR-001):
- Nunca confiar en user_metadata: el perfil se lee de public.users con RLS.
- `mfa_enabled` solo se marca tras confirmar AAL2.
- Todo fallo MFA termina la sesión; si el proveedor no confirma el cierre,
  SIGN_OUT_FAILED (503) tiene prioridad sobre MFA_VERIFICATION_FAILED.
"""
from __future__ import annotations

import logging
import math
from dataclasses import dataclass
from typing import Any, Optional

from supabase import AsyncClient

from app.auth.login_attempts import LoginAttemptStore
from app.core.errors import (
    AccountInactiveError,
    AccountLockedError,
    AuthenticationRequiredError,
    AuthProfileUnavailableError,
    DentalClinicError,
    InvalidCredentialsError,
    InvalidMfaCodeError,
    MfaEnrollmentFailedError,
    MfaVerificationFailedError,
    RoleAuthorizationError,
    SignOutFailedError,
)
from app.core.security import decode_aal_claim

logger = logging.getLogger(__name__)

USER_ROLES = {"administrador", "odontologo", "recepcionista"}
CLINICAL_ROLES = {"administrador", "odontologo"}
MFA_ISSUER = "Dental Clinic SaaS"
LOCKOUT_MINUTES = 15


@dataclass(frozen=True)
class SessionTokens:
    access_token: str
    refresh_token: str


@dataclass(frozen=True)
class LoginResult:
    redirect_to: str
    role: str
    clinic_id: str
    user_id: str
    full_name: str
    mfa_required: bool
    session: SessionTokens


@dataclass(frozen=True)
class EnrollResult:
    factor_id: str
    qr_code: str
    secret: str
    uri: str


@dataclass(frozen=True)
class MfaVerifyResult:
    redirect_to: str
    session: Optional[SessionTokens]


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------


def _is_valid_profile(profile: Any) -> bool:
    return (
        isinstance(profile, dict)
        and isinstance(profile.get("id"), str)
        and isinstance(profile.get("clinic_id"), str)
        and profile.get("role") in USER_ROLES
    )


async def _sign_out_or_raise(client: AsyncClient, failure_message: str) -> None:
    """Port de terminateSession: solo retorna cuando el proveedor confirma el cierre."""
    try:
        await client.auth.sign_out()
    except Exception as exc:
        raise SignOutFailedError(failure_message) from exc


async def _fail_mfa(client: AsyncClient, message: str) -> None:
    """Port de failMfaVerification: cierra la sesión y luego lanza MFA_VERIFICATION_FAILED."""
    await _sign_out_or_raise(
        client, "No fue posible cerrar la sesión después del fallo MFA."
    )
    raise MfaVerificationFailedError(message)


async def _require_clinical_user(client: AsyncClient) -> Any:
    """Port de requireClinicalUser: sesión válida + perfil activo + rol clínico."""
    try:
        user_response = await client.auth.get_user()
    except Exception as exc:
        raise AuthenticationRequiredError() from exc
    user = getattr(user_response, "user", None)
    if user is None:
        raise AuthenticationRequiredError()

    try:
        result = (
            await client.table("users")
            .select("id, clinic_id, role, is_active")
            .eq("id", user.id)
            .maybe_single()
            .execute()
        )
        profile = result.data
    except Exception as exc:
        raise AuthProfileUnavailableError() from exc

    if not _is_valid_profile(profile):
        raise AuthProfileUnavailableError()

    if profile.get("is_active") is not True:
        raise AccountInactiveError()
    if profile["role"] not in CLINICAL_ROLES:
        raise RoleAuthorizationError(
            "El rol actual no puede completar este flujo MFA."
        )
    return user


async def _confirm_aal2(
    client: AsyncClient, verify_response: Any
) -> Optional[SessionTokens]:
    """Confirma AAL2 tras un verify exitoso.

    Prioriza el claim `aal` del nuevo JWT emitido por GoTrue; si el proveedor
    no devuelve tokens, recurre a get_authenticator_assurance_level().
    """
    access_token = getattr(verify_response, "access_token", None)
    refresh_token = getattr(verify_response, "refresh_token", None)

    aal = decode_aal_claim(access_token) if isinstance(access_token, str) else None
    if aal is None:
        try:
            assurance = await client.auth.mfa.get_authenticator_assurance_level()
            aal = getattr(assurance, "current_level", None)
        except Exception:
            aal = None

    if aal != "aal2":
        await _fail_mfa(
            client, "Supabase no confirmó el segundo factor. Inicie sesión nuevamente."
        )

    if isinstance(access_token, str) and isinstance(refresh_token, str):
        return SessionTokens(access_token=access_token, refresh_token=refresh_token)
    return None


# ---------------------------------------------------------------------------
# Casos de uso (port de las Server Actions)
# ---------------------------------------------------------------------------


async def login(
    client: AsyncClient,
    attempts: LoginAttemptStore,
    email: str,
    password: str,
) -> LoginResult:
    """Port de loginAction con protección de intentos fallidos persistente."""
    # 1. Verificar el bloqueo persistente antes de enviar credenciales a Auth.
    lockout = await attempts.check(email)
    if lockout.is_locked:
        raise AccountLockedError(max(1, math.ceil(lockout.remaining_seconds / 60)))

    # 2. Autenticación con Supabase Auth
    user = session = None
    try:
        auth_response = await client.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        user = getattr(auth_response, "user", None)
        session = getattr(auth_response, "session", None)
    except Exception:
        user = session = None

    if user is None or session is None:
        attempt = await attempts.record_failure(email)
        if attempt.triggered_lockout:
            # Transactional Outbox: no afirmar entrega hasta que un worker la procese.
            try:
                await attempts.enqueue_lockout_notification(email)
            except Exception:
                logger.exception("[Login Lockout Outbox Error]")
            raise AccountLockedError(LOCKOUT_MINUTES)
        raise InvalidCredentialsError(attempt.attempts_left)

    # 3. Consultar el perfil con la sesión del usuario y RLS activo.
    client.postgrest.auth(session.access_token)
    try:
        profile_result = (
            await client.table("users")
            .select("id, clinic_id, role, full_name, is_active, mfa_enabled")
            .eq("id", user.id)
            .single()
            .execute()
        )
        profile = profile_result.data
    except Exception:
        profile = None

    if not _is_valid_profile(profile):
        await _sign_out_or_raise(
            client, "No fue posible cerrar la sesión con un perfil inválido."
        )
        raise AuthProfileUnavailableError()

    role = profile["role"]
    if profile.get("is_active") is not True:
        await _sign_out_or_raise(
            client, "No fue posible cerrar la sesión de la cuenta desactivada."
        )
        raise AccountInactiveError()

    # 4. Limpiar intentos únicamente después de validar la cuenta completa.
    await attempts.clear(email)

    redirect_to = "/dashboard"
    mfa_required = False
    if role in CLINICAL_ROLES:
        mfa_required = True
        redirect_to = "/verify-mfa" if profile.get("mfa_enabled") else "/setup-mfa"

    return LoginResult(
        redirect_to=redirect_to,
        role=role,
        clinic_id=profile["clinic_id"],
        user_id=profile["id"],
        full_name=profile.get("full_name") or "",
        mfa_required=mfa_required,
        session=SessionTokens(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
        ),
    )


async def logout(client: AsyncClient) -> None:
    """Port de logoutAction."""
    await _sign_out_or_raise(client, "No fue posible cerrar la sesión de forma segura.")


async def enroll_mfa(client: AsyncClient) -> EnrollResult:
    """Port de enrollMfaAction: limpia factores no verificados y enrola TOTP."""
    await _require_clinical_user(client)

    # 1. Limpiar factores no verificados previos para evitar conflictos de idempotencia.
    try:
        factors = await client.auth.mfa.list_factors()
        all_factors = getattr(factors, "all", None) or []
    except Exception:
        all_factors = []

    for factor in all_factors:
        if getattr(factor, "status", None) != "unverified":
            continue
        try:
            await client.auth.mfa.unenroll({"factor_id": factor.id})
        except Exception:
            logger.warning(
                "[MFA Cleanup] No se pudo eliminar factor no verificado: %s",
                getattr(factor, "id", "?"),
            )

    # 2. Enrolar nuevo factor TOTP
    data = None
    try:
        data = await client.auth.mfa.enroll(
            {"factor_type": "totp", "issuer": MFA_ISSUER}
        )
    except Exception as exc:
        provider_code = str(getattr(exc, "code", "") or "")
        is_mfa_not_enabled = (
            "mfa" in str(exc).lower()
            or provider_code in {"mfa_factor_not_found", "auth_mfa_not_enabled"}
        )
        raise MfaEnrollmentFailedError(
            "El servicio MFA no está habilitado en este proyecto de Supabase. "
            "Por favor active Multi-Factor Authentication en el dashboard de Supabase "
            "(Authentication > Multi-Factor Authentication)."
            if is_mfa_not_enabled
            else f"No fue posible iniciar la configuración MFA: {exc}",
            mfa_not_enabled=is_mfa_not_enabled,
        ) from exc

    if data is None:
        raise MfaEnrollmentFailedError(
            "No fue posible iniciar la configuración MFA: respuesta vacía del proveedor."
        )

    totp = getattr(data, "totp", None)
    raw_qr = str(getattr(totp, "qr_code", "") or "").strip()
    if raw_qr:
        import base64
        prefix = "data:image/svg+xml;utf-8,"
        if raw_qr.startswith(prefix):
            svg_xml = raw_qr[len(prefix):]
            formatted_qr = f"data:image/svg+xml;base64,{base64.b64encode(svg_xml.encode('utf-8')).decode('ascii')}"
        elif raw_qr.startswith("<") or "svg" in raw_qr[:30]:
            formatted_qr = f"data:image/svg+xml;base64,{base64.b64encode(raw_qr.encode('utf-8')).decode('ascii')}"
        else:
            formatted_qr = raw_qr
    else:
        formatted_qr = ""

    secret_str = str(getattr(totp, "secret", "") or "")

    return EnrollResult(
        factor_id=str(getattr(data, "id", "")),
        qr_code=formatted_qr,
        secret=secret_str,
        uri=str(getattr(totp, "uri", "") or ""),
    )


async def verify_mfa_setup(
    client: AsyncClient, admin: AsyncClient, factor_id: str, code: str
) -> MfaVerifyResult:
    """Port de verifyMfaSetupAction: verifica el primer código y activa mfa_enabled."""
    user = await _require_clinical_user(client)

    # 1. Crear challenge y verificar
    try:
        challenge = await client.auth.mfa.challenge({"factor_id": factor_id})
    except Exception as exc:
        logger.exception("[MFA Challenge Error]: %s", exc)
        await _fail_mfa(
            client, "No fue posible generar el desafío MFA. Inicie sesión nuevamente."
        )

    try:
        verify_response = await client.auth.mfa.verify(
            {
                "factor_id": factor_id,
                "challenge_id": challenge.id,
                "code": code,
            }
        )
    except Exception as exc:
        logger.warning("[MFA Setup Verify Warning]: %s", exc)
        raise InvalidMfaCodeError(
            "El código de verificación es incorrecto o ha expirado. Por favor ingrese el código actual de su aplicación autenticadora."
        ) from exc

    # 2. Marcar mfa_enabled solo después de alcanzar AAL2.
    session = await _confirm_aal2(client, verify_response)

    try:
        await admin.table("users").update({"mfa_enabled": True}).eq(
            "id", user.id
        ).execute()
    except Exception:
        await _fail_mfa(
            client,
            "No fue posible guardar la configuración MFA. Inicie sesión nuevamente.",
        )

    return MfaVerifyResult(redirect_to="/dashboard", session=session)


async def verify_mfa_login(client: AsyncClient, code: str) -> MfaVerifyResult:
    """Port de verifyMfaLoginAction: verificación TOTP en cada inicio de sesión."""
    await _require_clinical_user(client)

    # Obtener los factores autenticados del usuario
    try:
        factors = await client.auth.mfa.list_factors()
        totp_factors = getattr(factors, "totp", None) or []
    except Exception:
        totp_factors = []

    if not totp_factors:
        await _fail_mfa(
            client, "No existe un factor TOTP válido. Inicie sesión nuevamente."
        )

    factor = totp_factors[0]
    try:
        verify_response = await client.auth.mfa.challenge_and_verify(
            {"factor_id": factor.id, "code": code}
        )
    except Exception as exc:
        logger.warning("[MFA Login Verify Warning]: %s", exc)
        raise InvalidMfaCodeError(
            "El código de verificación es incorrecto o ha expirado. Por favor verifique el código en su aplicación autenticadora."
        ) from exc

    session = await _confirm_aal2(client, verify_response)
    return MfaVerifyResult(redirect_to="/dashboard", session=session)


async def cancel_mfa(client: AsyncClient) -> None:
    """Port de cancelMfaAction."""
    await _sign_out_or_raise(
        client, "No fue posible cancelar el flujo MFA de forma segura."
    )


async def reset_mfa(client: AsyncClient, admin: AsyncClient) -> None:
    """Restablece el factor MFA del usuario para permitir un nuevo escaneo de código QR."""
    user = await _require_clinical_user(client)

    # 1. Desactivar flag mfa_enabled en public.users
    await admin.table("users").update({"mfa_enabled": False}).eq("id", user.id).execute()

    # 2. Eliminar factores existentes vía admin service role
    try:
        factors = await admin.auth.admin.mfa.list_factors({"user_id": user.id})
        for factor in factors:
            try:
                await admin.auth.admin.mfa.delete_factor({"user_id": user.id, "id": factor.id})
            except Exception:
                pass
    except Exception as exc:
        logger.warning("[MFA Reset Factors Error]: %s", exc)

