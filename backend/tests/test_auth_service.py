"""Tests del servicio de auth/MFA con clientes Supabase falsos (sin red).

Port de __tests__/unit/auth-actions.test.ts + cobertura de los flujos
login / enroll / verify-setup / verify-login / logout / cancel.
"""
from types import SimpleNamespace
from typing import Any, Optional

import jwt
import pytest
from pydantic import ValidationError

from app.auth import service
from app.auth.login_attempts import FailedAttemptStatus, LockoutStatus
from app.auth.schemas import VerifyLoginRequest, VerifySetupRequest
from app.core.errors import (
    AccountInactiveError,
    AccountLockedError,
    InvalidCredentialsError,
    MfaVerificationFailedError,
    RoleAuthorizationError,
    SignOutFailedError,
)

PROFILE = {
    "id": "10000000-0000-4000-8000-000000000001",
    "clinic_id": "00000000-0000-4000-8000-000000000001",
    "role": "odontologo",
    "is_active": True,
}


def _jwt_with_aal(aal: str) -> str:
    """JWT no firmado válido estructuralmente (solo para leer el claim `aal`)."""
    return jwt.encode(
        {"aal": aal, "sub": PROFILE["id"]}, "test-secret-key-with-32-bytes!!!"
    )


# ---------------------------------------------------------------------------
# Clientes falsos
# ---------------------------------------------------------------------------


class FakeQuery:
    """Simula el builder de PostgREST (select/eq/maybe_single/single/update)."""

    def __init__(self, data: Any):
        self._data = data
        self.update_values: Optional[dict] = None

    def select(self, *_args: Any, **_kwargs: Any) -> "FakeQuery":
        return self

    def eq(self, *_args: Any, **_kwargs: Any) -> "FakeQuery":
        return self

    def maybe_single(self) -> "FakeQuery":
        return self

    def single(self) -> "FakeQuery":
        return self

    def update(self, values: dict) -> "FakeQuery":
        self.update_values = values
        return self

    async def execute(self) -> Any:
        return SimpleNamespace(data=self._data)


class FakeMfa:
    def __init__(
        self,
        *,
        all_factors: Optional[list] = None,
        totp_factors: Optional[list] = None,
        challenge_result: Any = None,
        challenge_error: Optional[Exception] = None,
        verify_result: Any = None,
        verify_error: Optional[Exception] = None,
        challenge_and_verify_result: Any = None,
        challenge_and_verify_error: Optional[Exception] = None,
        enroll_result: Any = None,
        enroll_error: Optional[Exception] = None,
        aal_level: Optional[str] = None,
    ) -> None:
        self.all_factors = all_factors or []
        self.totp_factors = totp_factors or []
        self.challenge_result = challenge_result
        self.challenge_error = challenge_error
        self.verify_result = verify_result
        self.verify_error = verify_error
        self.challenge_and_verify_result = challenge_and_verify_result
        self.challenge_and_verify_error = challenge_and_verify_error
        self.enroll_result = enroll_result
        self.enroll_error = enroll_error
        self.aal_level = aal_level
        self.unenrolled: list[str] = []

    async def list_factors(self) -> Any:
        return SimpleNamespace(all=self.all_factors, totp=self.totp_factors)

    async def unenroll(self, params: dict) -> None:
        self.unenrolled.append(params["factor_id"])

    async def enroll(self, _params: dict) -> Any:
        if self.enroll_error:
            raise self.enroll_error
        return self.enroll_result

    async def challenge(self, _params: dict) -> Any:
        if self.challenge_error:
            raise self.challenge_error
        return self.challenge_result

    async def verify(self, _params: dict) -> Any:
        if self.verify_error:
            raise self.verify_error
        return self.verify_result

    async def challenge_and_verify(self, _params: dict) -> Any:
        if self.challenge_and_verify_error:
            raise self.challenge_and_verify_error
        return self.challenge_and_verify_result

    async def get_authenticator_assurance_level(self) -> Any:
        return SimpleNamespace(current_level=self.aal_level)


class FakeAuth:
    def __init__(
        self,
        *,
        user: Any = None,
        sign_in_error: Optional[Exception] = None,
        sign_out_error: Optional[str] = None,
        mfa: Optional[FakeMfa] = None,
    ) -> None:
        self._user = user if user is not None else SimpleNamespace(id=PROFILE["id"])
        self._sign_in_error = sign_in_error
        self._sign_out_error = sign_out_error
        self.mfa = mfa or FakeMfa()
        self.sign_out_calls = 0
        self.sign_in_calls = 0

    async def get_user(self) -> Any:
        return SimpleNamespace(user=self._user)

    async def sign_in_with_password(self, _credentials: dict) -> Any:
        self.sign_in_calls += 1
        if self._sign_in_error:
            raise self._sign_in_error
        return SimpleNamespace(
            user=self._user,
            session=SimpleNamespace(access_token="at", refresh_token="rt"),
        )

    async def set_session(self, *_args: str) -> None:
        return None

    async def sign_out(self) -> None:
        self.sign_out_calls += 1
        if self._sign_out_error:
            raise Exception(self._sign_out_error)


class FakePostgrest:
    def __init__(self) -> None:
        self.authed_token: Optional[str] = None

    def auth(self, token: str) -> None:
        self.authed_token = token


class FakeClient:
    """Simula un AsyncClient de supabase-py."""

    def __init__(self, *, auth: FakeAuth, table_data: Any = PROFILE) -> None:
        self.auth = auth
        self.postgrest = FakePostgrest()
        self._query = FakeQuery(table_data)

    def table(self, _name: str) -> FakeQuery:
        return self._query


class FakeAttemptStore:
    def __init__(
        self,
        *,
        lockout: Optional[LockoutStatus] = None,
        failure: Optional[FailedAttemptStatus] = None,
    ) -> None:
        self._lockout = lockout or LockoutStatus(is_locked=False, remaining_seconds=0)
        self._failure = failure or FailedAttemptStatus(
            is_locked=False,
            remaining_seconds=0,
            attempts_left=4,
            triggered_lockout=False,
        )
        self.recorded = 0
        self.cleared = False
        self.enqueued = False

    async def check(self, _identifier: str) -> LockoutStatus:
        return self._lockout

    async def record_failure(self, _identifier: str) -> FailedAttemptStatus:
        self.recorded += 1
        return self._failure

    async def clear(self, _identifier: str) -> None:
        self.cleared = True

    async def enqueue_lockout_notification(self, _identifier: str) -> None:
        self.enqueued = True


# ---------------------------------------------------------------------------
# Validación en el boundary (port: código no numérico rechazado antes de tocar Supabase)
# ---------------------------------------------------------------------------


class TestBoundaryValidation:
    def test_rechaza_codigo_mfa_no_numerico(self):
        with pytest.raises(ValidationError):
            VerifyLoginRequest(code="abcdef")

    def test_rechaza_codigo_setup_no_numerico(self):
        with pytest.raises(ValidationError):
            VerifySetupRequest(factor_id="factor-1", code="12 456")

    def test_acepta_codigo_de_seis_digitos(self):
        assert VerifyLoginRequest(code="123456").code == "123456"

    def test_verify_setup_acepta_factor_id_camel_case_del_frontend(self):
        """lib/api/auth-api.ts envía {"factorId", "code"}; el modelo lo acepta."""
        request = VerifySetupRequest.model_validate(
            {"factorId": "factor-1", "code": "123456"}
        )
        assert request.factor_id == "factor-1"

    def test_verify_setup_acepta_factor_id_snake_case(self):
        request = VerifySetupRequest.model_validate(
            {"factor_id": "factor-1", "code": "123456"}
        )
        assert request.factor_id == "factor-1"


# ---------------------------------------------------------------------------
# verify_mfa_login (port de los casos de auth-actions.test.ts)
# ---------------------------------------------------------------------------


class TestVerifyMfaLogin:
    async def test_cierra_sesion_cuando_supabase_rechaza_totp(self):
        mfa = FakeMfa(
            totp_factors=[SimpleNamespace(id="factor-1")],
            challenge_and_verify_error=Exception("invalid totp"),
        )
        auth = FakeAuth(mfa=mfa)
        client = FakeClient(auth=auth)

        with pytest.raises(MfaVerificationFailedError) as exc_info:
            await service.verify_mfa_login(client, "123456")

        assert exc_info.value.code == "MFA_VERIFICATION_FAILED"
        assert exc_info.value.status_code == 401
        assert auth.sign_out_calls == 1

    async def test_no_afirma_fallo_mfa_si_supabase_no_confirma_sign_out(self):
        mfa = FakeMfa(
            totp_factors=[SimpleNamespace(id="factor-1")],
            challenge_and_verify_error=Exception("invalid totp"),
        )
        auth = FakeAuth(mfa=mfa, sign_out_error="network error")
        client = FakeClient(auth=auth)

        with pytest.raises(SignOutFailedError) as exc_info:
            await service.verify_mfa_login(client, "123456")

        assert exc_info.value.code == "SIGN_OUT_FAILED"
        assert exc_info.value.status_code == 503
        assert auth.sign_out_calls == 1

    async def test_falla_si_no_hay_factor_totp(self):
        auth = FakeAuth(mfa=FakeMfa(totp_factors=[]))
        client = FakeClient(auth=auth)

        with pytest.raises(MfaVerificationFailedError):
            await service.verify_mfa_login(client, "123456")
        assert auth.sign_out_calls == 1

    async def test_rechaza_rol_no_clinico(self):
        auth = FakeAuth()
        client = FakeClient(
            auth=auth, table_data={**PROFILE, "role": "recepcionista"}
        )

        with pytest.raises(RoleAuthorizationError):
            await service.verify_mfa_login(client, "123456")

    async def test_exito_devuelve_sesion_aal2(self):
        verify_response = SimpleNamespace(
            access_token=_jwt_with_aal("aal2"), refresh_token="rt2"
        )
        mfa = FakeMfa(
            totp_factors=[SimpleNamespace(id="factor-1")],
            challenge_and_verify_result=verify_response,
        )
        client = FakeClient(auth=FakeAuth(mfa=mfa))

        result = await service.verify_mfa_login(client, "123456")

        assert result.redirect_to == "/dashboard"
        assert result.session is not None
        assert result.session.refresh_token == "rt2"

    async def test_falla_si_aal_no_llega_a_aal2(self):
        verify_response = SimpleNamespace(
            access_token=_jwt_with_aal("aal1"), refresh_token="rt2"
        )
        mfa = FakeMfa(
            totp_factors=[SimpleNamespace(id="factor-1")],
            challenge_and_verify_result=verify_response,
        )
        auth = FakeAuth(mfa=mfa)
        client = FakeClient(auth=auth)

        with pytest.raises(MfaVerificationFailedError):
            await service.verify_mfa_login(client, "123456")
        assert auth.sign_out_calls == 1


# ---------------------------------------------------------------------------
# verify_mfa_setup
# ---------------------------------------------------------------------------


class TestVerifyMfaSetup:
    async def test_marca_mfa_enabled_solo_tras_aal2(self):
        verify_response = SimpleNamespace(
            access_token=_jwt_with_aal("aal2"), refresh_token="rt2"
        )
        mfa = FakeMfa(
            challenge_result=SimpleNamespace(id="challenge-1"),
            verify_result=verify_response,
        )
        client = FakeClient(auth=FakeAuth(mfa=mfa))
        admin = FakeClient(auth=FakeAuth())

        result = await service.verify_mfa_setup(client, admin, "factor-1", "123456")

        assert result.redirect_to == "/dashboard"
        assert admin._query.update_values == {"mfa_enabled": True}

    async def test_no_marca_mfa_enabled_si_falla_challenge(self):
        mfa = FakeMfa(challenge_error=Exception("boom"))
        client = FakeClient(auth=FakeAuth(mfa=mfa))
        admin = FakeClient(auth=FakeAuth())

        with pytest.raises(MfaVerificationFailedError):
            await service.verify_mfa_setup(client, admin, "factor-1", "123456")
        assert admin._query.update_values is None


# ---------------------------------------------------------------------------
# enroll_mfa
# ---------------------------------------------------------------------------


class TestEnrollMfa:
    async def test_limpia_factores_no_verificados_antes_de_enrolar(self):
        enroll_result = SimpleNamespace(
            id="factor-new",
            totp=SimpleNamespace(
                qr_code="data:image/svg+xml;utf8,<svg/>",
                secret="SECRET",
                uri="otpauth://totp/x",
            ),
        )
        mfa = FakeMfa(
            all_factors=[
                SimpleNamespace(id="f-old", status="unverified"),
                SimpleNamespace(id="f-ok", status="verified"),
            ],
            enroll_result=enroll_result,
        )
        client = FakeClient(auth=FakeAuth(mfa=mfa))

        result = await service.enroll_mfa(client)

        assert mfa.unenrolled == ["f-old"]
        assert result.factor_id == "factor-new"
        assert result.secret == "SECRET"


# ---------------------------------------------------------------------------
# login
# ---------------------------------------------------------------------------


class TestLogin:
    async def test_cuenta_bloqueada_no_envia_credenciales(self):
        auth = FakeAuth()
        client = FakeClient(auth=auth)
        attempts = FakeAttemptStore(
            lockout=LockoutStatus(is_locked=True, remaining_seconds=600)
        )

        with pytest.raises(AccountLockedError) as exc_info:
            await service.login(client, attempts, "a@b.com", "secret")

        assert exc_info.value.status_code == 423
        assert "10 minutos" in exc_info.value.message
        assert auth.sign_in_calls == 0

    async def test_credenciales_invalidas_registran_intento(self):
        auth = FakeAuth(sign_in_error=Exception("invalid login"))
        client = FakeClient(auth=auth)
        attempts = FakeAttemptStore(
            failure=FailedAttemptStatus(
                is_locked=False,
                remaining_seconds=0,
                attempts_left=3,
                triggered_lockout=False,
            )
        )

        with pytest.raises(InvalidCredentialsError) as exc_info:
            await service.login(client, attempts, "a@b.com", "wrong")

        assert "Quedan 3 intentos." in exc_info.value.message
        assert attempts.recorded == 1
        assert not attempts.cleared

    async def test_bloqueo_tras_intentos_encola_notificacion(self):
        auth = FakeAuth(sign_in_error=Exception("invalid login"))
        client = FakeClient(auth=auth)
        attempts = FakeAttemptStore(
            failure=FailedAttemptStatus(
                is_locked=True,
                remaining_seconds=900,
                attempts_left=0,
                triggered_lockout=True,
            )
        )

        with pytest.raises(AccountLockedError) as exc_info:
            await service.login(client, attempts, "a@b.com", "wrong")

        assert "15 minutos" in exc_info.value.message
        assert attempts.enqueued

    async def test_admin_sin_mfa_redirige_a_setup_y_limpia_intentos(self):
        auth = FakeAuth()
        client = FakeClient(
            auth=auth, table_data={**PROFILE, "full_name": "Dra. Pérez", "mfa_enabled": False}
        )
        attempts = FakeAttemptStore()

        result = await service.login(client, attempts, "a@b.com", "secret")

        assert result.redirect_to == "/setup-mfa"
        assert result.mfa_required is True
        assert result.session.access_token == "at"
        assert attempts.cleared

    async def test_cuenta_inactiva_cierra_sesion(self):
        auth = FakeAuth()
        client = FakeClient(auth=auth, table_data={**PROFILE, "is_active": False})
        attempts = FakeAttemptStore()

        with pytest.raises(AccountInactiveError):
            await service.login(client, attempts, "a@b.com", "secret")
        assert auth.sign_out_calls == 1


# ---------------------------------------------------------------------------
# logout / cancel (port: no afirmar éxito si el proveedor falla)
# ---------------------------------------------------------------------------


class TestSessionTermination:
    async def test_logout_no_afirma_exito_cuando_proveedor_falla(self):
        auth = FakeAuth(sign_out_error="network error")
        client = FakeClient(auth=auth)

        with pytest.raises(SignOutFailedError) as exc_info:
            await service.logout(client)

        assert exc_info.value.code == "SIGN_OUT_FAILED"
        assert auth.sign_out_calls == 1

    async def test_cancel_mfa_cierra_sesion(self):
        auth = FakeAuth()
        client = FakeClient(auth=auth)

        await service.cancel_mfa(client)
        assert auth.sign_out_calls == 1
