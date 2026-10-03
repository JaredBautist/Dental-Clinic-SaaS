"""Smoke tests del contrato HTTP de la API (sin tocar Supabase)."""
from types import SimpleNamespace
from typing import Any

from fastapi.testclient import TestClient

from app.deps import get_admin_client, get_user_client
from app.main import app


class _AuthWithoutSession:
    """El servicio convierte cualquier fallo de get_user en 401, lo que
    permite afirmar que el cuerpo superó la validación del boundary."""

    async def get_user(self) -> Any:
        raise Exception("no session")


def _client_without_session() -> Any:
    return SimpleNamespace(auth=_AuthWithoutSession())


# El boundary de validación debe rechazar el cuerpo inválido sin ejecutar
# la dependencia real de Supabase (que exigiría sesión/configuración).
app.dependency_overrides[get_user_client] = _client_without_session
app.dependency_overrides[get_admin_client] = _client_without_session

client = TestClient(app)


def test_health_responde_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_verify_login_rechaza_codigo_no_numerico_en_el_boundary():
    response = client.post("/mfa/verify-login", json={"code": "abcdef"})
    assert response.status_code == 422
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert "6 dígitos" in payload["error"]["message"]


def test_verify_setup_acepta_factor_id_en_camel_case_como_el_frontend():
    """Regresión: lib/api/auth-api.ts envía {"factorId", "code"} (camelCase);
    el boundary debe aceptarlo y continuar hacia el servicio (401 sin sesión)."""
    response = client.post("/mfa/verify-setup", json={"factorId": "f-1", "code": "123456"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_verify_setup_acepta_factor_id_en_snake_case():
    response = client.post(
        "/mfa/verify-setup", json={"factor_id": "f-1", "code": "123456"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_verify_setup_rechaza_cuerpo_sin_factor_id():
    response = client.post("/mfa/verify-setup", json={"code": "123456"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
