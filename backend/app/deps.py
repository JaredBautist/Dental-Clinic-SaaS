"""Dependencias de FastAPI: clientes Supabase por request.

- `get_anon_client`: llave anónima pública (login).
- `get_admin_client`: service role — SOLO servidor (RPC de lockout, mfa_enabled).
- `get_user_client`: sesión del usuario vía Bearer — RLS y MFA actúan como ese usuario.
"""
from typing import Optional

from fastapi import Header
from supabase import AsyncClient, create_async_client

from app.config import get_settings
from app.core.errors import (
    AuthConfigurationUnavailableError,
    AuthenticationRequiredError,
)


async def get_anon_client() -> AsyncClient:
    settings = get_settings()
    if not settings.configuration_ready:
        raise AuthConfigurationUnavailableError()
    return await create_async_client(settings.supabase_url, settings.supabase_anon_key)


async def get_admin_client() -> AsyncClient:
    settings = get_settings()
    if not settings.configuration_ready or not settings.supabase_service_role_key:
        raise AuthConfigurationUnavailableError()
    return await create_async_client(
        settings.supabase_url, settings.supabase_service_role_key
    )


async def get_user_client(
    authorization: str = Header(default=""),
    x_refresh_token: Optional[str] = Header(default=None),
) -> AsyncClient:
    """Reconstruye la sesión del usuario a partir de los tokens enviados por el frontend.

    El navegador conserva la sesión oficial (cookies vía @supabase/ssr); aquí se
    clona para que las operaciones MFA y las consultas RLS actúen como ese usuario.
    """
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token or not x_refresh_token:
        raise AuthenticationRequiredError()

    client = await get_anon_client()
    try:
        await client.auth.set_session(token, x_refresh_token)
    except Exception as exc:
        raise AuthenticationRequiredError() from exc
    # Garantiza que PostgREST use el JWT del usuario (RLS activo).
    client.postgrest.auth(token)
    return client
