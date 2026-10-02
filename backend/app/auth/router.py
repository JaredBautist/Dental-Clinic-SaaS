"""Endpoints HTTP — mismo contrato que ServerActionResult del frontend TypeScript.

Éxito: 200 {"success": true, "data": {...}}
Error:  status {"success": false, "error": {"code", "message", "statusCode"}}
(los errores se producen en app/main.py vía exception handlers)
"""
from typing import Any, Optional

from fastapi import APIRouter, Depends
from supabase import AsyncClient

from app.auth import service
from app.auth.login_attempts import LoginAttemptStore
from app.auth.schemas import LoginRequest, VerifyLoginRequest, VerifySetupRequest
from app.deps import get_admin_client, get_anon_client, get_user_client

router = APIRouter()


def _ok(data: Any) -> dict:
    return {"success": True, "data": data}


def _session_payload(session: Optional[service.SessionTokens]) -> Optional[dict]:
    if session is None:
        return None
    return {
        "accessToken": session.access_token,
        "refreshToken": session.refresh_token,
    }


@router.post("/auth/login")
async def login_endpoint(
    body: LoginRequest,
    client: AsyncClient = Depends(get_anon_client),
    admin: AsyncClient = Depends(get_admin_client),
) -> dict:
    result = await service.login(
        client, LoginAttemptStore(admin), body.email, body.password
    )
    return _ok(
        {
            "redirectTo": result.redirect_to,
            "role": result.role,
            "clinicId": result.clinic_id,
            "userId": result.user_id,
            "fullName": result.full_name,
            "mfaRequired": result.mfa_required,
            "session": _session_payload(result.session),
        }
    )


@router.post("/auth/logout")
async def logout_endpoint(client: AsyncClient = Depends(get_user_client)) -> dict:
    await service.logout(client)
    return _ok({"success": True})


@router.post("/mfa/enroll")
async def enroll_endpoint(client: AsyncClient = Depends(get_user_client)) -> dict:
    result = await service.enroll_mfa(client)
    return _ok(
        {
            "factorId": result.factor_id,
            "qrCode": result.qr_code,
            "secret": result.secret,
            "uri": result.uri,
        }
    )


@router.post("/mfa/verify-setup")
async def verify_setup_endpoint(
    body: VerifySetupRequest,
    client: AsyncClient = Depends(get_user_client),
    admin: AsyncClient = Depends(get_admin_client),
) -> dict:
    result = await service.verify_mfa_setup(client, admin, body.factor_id, body.code)
    return _ok(
        {
            "success": True,
            "redirectTo": result.redirect_to,
            "session": _session_payload(result.session),
        }
    )


@router.post("/mfa/verify-login")
async def verify_login_endpoint(
    body: VerifyLoginRequest, client: AsyncClient = Depends(get_user_client)
) -> dict:
    result = await service.verify_mfa_login(client, body.code)
    return _ok(
        {
            "success": True,
            "redirectTo": result.redirect_to,
            "session": _session_payload(result.session),
        }
    )


@router.post("/mfa/cancel")
async def cancel_endpoint(client: AsyncClient = Depends(get_user_client)) -> dict:
    await service.cancel_mfa(client)
    return _ok({"success": True})
