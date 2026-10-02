"""Jerarquía de errores de dominio — port de errors/domain.ts (subset auth).

Los códigos y status HTTP son idénticos a los del backend TypeScript para
conservar el contrato con el frontend (ServerActionResult).
"""


class DentalClinicError(Exception):
    def __init__(
        self,
        message: str,
        code: str = "DENTAL_CLINIC_ERROR",
        status_code: int = 400,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


class AuthenticationRequiredError(DentalClinicError):
    def __init__(self, message: str = "Debe iniciar sesión nuevamente.") -> None:
        super().__init__(message, "AUTHENTICATION_REQUIRED", 401)


class AuthProfileUnavailableError(DentalClinicError):
    def __init__(
        self, message: str = "No fue posible validar el perfil de acceso."
    ) -> None:
        super().__init__(message, "AUTH_PROFILE_UNAVAILABLE", 401)


class AccountInactiveError(DentalClinicError):
    def __init__(
        self,
        message: str = "Su cuenta está desactivada. Comuníquese con el administrador del consultorio.",
    ) -> None:
        super().__init__(message, "ACCOUNT_INACTIVE", 403)


class RoleAuthorizationError(DentalClinicError):
    def __init__(
        self,
        message: str = "Acceso denegado: Rol no autorizado para esta operación",
    ) -> None:
        super().__init__(message, "ROLE_AUTHORIZATION_ERROR", 403)


class InvalidCredentialsError(DentalClinicError):
    def __init__(self, attempts_left: int | None = None) -> None:
        suffix = ""
        if isinstance(attempts_left, int):
            suffix = (
                f" Queda {attempts_left} intento."
                if attempts_left == 1
                else f" Quedan {attempts_left} intentos."
            )
        super().__init__(
            f"Credenciales inválidas. Verifique los datos e intente nuevamente.{suffix}",
            "INVALID_CREDENTIALS",
            401,
        )


class AccountLockedError(DentalClinicError):
    def __init__(self, remaining_minutes: int) -> None:
        super().__init__(
            f"La cuenta está bloqueada temporalmente. Intente nuevamente en {remaining_minutes} minutos.",
            "ACCOUNT_LOCKED",
            423,
        )


class MfaVerificationFailedError(DentalClinicError):
    def __init__(self, message: str) -> None:
        super().__init__(message, "MFA_VERIFICATION_FAILED", 401)


class MfaEnrollmentFailedError(DentalClinicError):
    def __init__(self, message: str, mfa_not_enabled: bool = False) -> None:
        super().__init__(
            message, "MFA_ENROLLMENT_FAILED", 503 if mfa_not_enabled else 400
        )


class SignOutFailedError(DentalClinicError):
    def __init__(self, message: str) -> None:
        super().__init__(message, "SIGN_OUT_FAILED", 503)


class AuthConfigurationUnavailableError(DentalClinicError):
    def __init__(self) -> None:
        super().__init__(
            "El servicio de autenticación no está disponible temporalmente.",
            "AUTH_CONFIGURATION_UNAVAILABLE",
            503,
        )


class LoginAttemptStoreError(DentalClinicError):
    def __init__(self, message: str) -> None:
        super().__init__(message, "LOGIN_ATTEMPT_STORE_ERROR", 500)
