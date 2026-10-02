"""Política de acceso — port 1:1 de lib/auth/access-policy.ts.

Función pura, sin dependencias de FastAPI ni Supabase. La API la expone para
que otros servicios Python reutilicen exactamente la misma matriz de decisión
que el middleware de Next.js (proxy.ts).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

UserRole = Literal["administrador", "odontologo", "recepcionista"]
AuthenticatorAssuranceLevel = Optional[Literal["aal1", "aal2"]]
RedirectLocation = Literal["/login", "/dashboard", "/setup-mfa", "/verify-mfa"]

PUBLIC_PATHS = frozenset({"/", "/login", "/api/health"})
CLINICAL_ROLES = frozenset({"administrador", "odontologo"})


@dataclass(frozen=True)
class AccessProfile:
    id: str
    clinic_id: str
    role: UserRole
    is_active: bool
    mfa_enabled: bool


@dataclass(frozen=True)
class AccessInput:
    configuration_ready: bool
    pathname: str
    user_id: Optional[str]
    profile: Optional[AccessProfile]
    current_aal: AuthenticatorAssuranceLevel


@dataclass(frozen=True)
class AccessDecision:
    kind: Literal["allow", "redirect", "unavailable"]
    location: Optional[RedirectLocation] = None
    status: Optional[int] = None


def _clinical_mfa_destination(
    profile: AccessProfile, current_aal: AuthenticatorAssuranceLevel
) -> Optional[RedirectLocation]:
    if profile.role not in CLINICAL_ROLES:
        return None
    if not profile.mfa_enabled:
        return "/setup-mfa"
    if current_aal != "aal2":
        return "/verify-mfa"
    return None


def decide_access(input: AccessInput) -> AccessDecision:
    """Decide el acceso observable para una ruta sin depender de Next.js ni Supabase.

    Los perfiles inactivos, inconsistentes o sin configuración fallan de forma cerrada.
    """
    if not input.configuration_ready:
        return AccessDecision(kind="unavailable", status=503)

    is_public_path = input.pathname in PUBLIC_PATHS
    profile = input.profile
    if (
        input.user_id is None
        or profile is None
        or profile.id != input.user_id
        or not profile.is_active
    ):
        if is_public_path:
            return AccessDecision(kind="allow")
        return AccessDecision(kind="redirect", location="/login")

    mfa_destination = _clinical_mfa_destination(profile, input.current_aal)

    if input.pathname == "/setup-mfa":
        if profile.role not in CLINICAL_ROLES:
            return AccessDecision(kind="redirect", location="/dashboard")
        if not profile.mfa_enabled:
            return AccessDecision(kind="allow")
        if input.current_aal == "aal2":
            return AccessDecision(kind="redirect", location="/dashboard")
        return AccessDecision(kind="redirect", location="/verify-mfa")

    if input.pathname == "/verify-mfa":
        if profile.role not in CLINICAL_ROLES:
            return AccessDecision(kind="redirect", location="/dashboard")
        if not profile.mfa_enabled:
            return AccessDecision(kind="redirect", location="/setup-mfa")
        if input.current_aal == "aal2":
            return AccessDecision(kind="redirect", location="/dashboard")
        return AccessDecision(kind="allow")

    if input.pathname in ("/", "/login"):
        return AccessDecision(kind="redirect", location=mfa_destination or "/dashboard")

    if mfa_destination:
        return AccessDecision(kind="redirect", location=mfa_destination)

    return AccessDecision(kind="allow")
