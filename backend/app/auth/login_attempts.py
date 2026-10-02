"""Store persistente de intentos de login — port de lib/auth/login-attempt-store.ts.

Usa las MISMAS funciones RPC atómicas de PostgreSQL que el backend TypeScript:
`check_login_lockout`, `record_failed_login_attempt`, `clear_login_attempts`
y `enqueue_login_lockout_notification`. Se invoca con el cliente administrativo
(service role), que nunca sale del servidor.
"""
from dataclasses import dataclass
from typing import Any

from supabase import AsyncClient

from app.core.errors import LoginAttemptStoreError
from app.core.security import hash_login_identifier


@dataclass(frozen=True)
class LockoutStatus:
    is_locked: bool
    remaining_seconds: int


@dataclass(frozen=True)
class FailedAttemptStatus(LockoutStatus):
    attempts_left: int
    triggered_lockout: bool


def _first_row(data: Any, operation: str) -> dict:
    if not isinstance(data, list) or len(data) != 1:
        raise LoginAttemptStoreError(f"Respuesta inválida al {operation}")
    return data[0]


class LoginAttemptStore:
    """Adapter de persistencia para las RPC atómicas de intentos de login."""

    def __init__(self, admin_client: AsyncClient) -> None:
        self._admin = admin_client

    async def _rpc(self, function_name: str, parameters: dict, operation: str) -> Any:
        try:
            result = await self._admin.rpc(function_name, parameters).execute()
        except Exception as exc:
            raise LoginAttemptStoreError(f"No se pudo {operation}") from exc
        return result.data

    async def check(self, identifier: str) -> LockoutStatus:
        operation = "verificar el límite de intentos de autenticación"
        row = _first_row(
            await self._rpc(
                "check_login_lockout",
                {"p_identifier_hash": hash_login_identifier(identifier)},
                operation,
            ),
            operation,
        )
        return LockoutStatus(
            is_locked=row["is_locked"], remaining_seconds=row["remaining_seconds"]
        )

    async def record_failure(self, identifier: str) -> FailedAttemptStatus:
        operation = "registrar el intento fallido de autenticación"
        row = _first_row(
            await self._rpc(
                "record_failed_login_attempt",
                {"p_identifier_hash": hash_login_identifier(identifier)},
                operation,
            ),
            operation,
        )
        return FailedAttemptStatus(
            is_locked=row["is_locked"],
            attempts_left=row["attempts_left"],
            remaining_seconds=row["remaining_seconds"],
            triggered_lockout=row["triggered_lockout"],
        )

    async def clear(self, identifier: str) -> None:
        await self._rpc(
            "clear_login_attempts",
            {"p_identifier_hash": hash_login_identifier(identifier)},
            "limpiar los intentos fallidos de autenticación",
        )

    async def enqueue_lockout_notification(self, identifier: str) -> None:
        await self._rpc(
            "enqueue_login_lockout_notification",
            {"p_target_email": identifier.strip().lower()},
            "encolar la notificación de bloqueo",
        )
