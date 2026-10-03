"""Port 1:1 de __tests__/unit/access-policy.test.ts."""
from dataclasses import replace

from app.auth.access_policy import AccessInput, AccessProfile, decide_access

ACTIVE_ADMIN = AccessProfile(
    id="11111111-1111-4111-8111-111111111111",
    clinic_id="22222222-2222-4222-8222-222222222222",
    role="administrador",
    is_active=True,
    mfa_enabled=True,
)


class TestDecideAccess:
    def test_falla_cerrado_cuando_falta_configuracion_de_supabase(self):
        decision = decide_access(
            AccessInput(
                configuration_ready=False,
                pathname="/dashboard",
                user_id=None,
                profile=None,
                current_aal=None,
            )
        )
        assert decision.kind == "unavailable"
        assert decision.status == 503

    def test_protege_apis_distintas_del_health_check(self):
        decision = decide_access(
            AccessInput(
                configuration_ready=True,
                pathname="/api/storage/signed-url",
                user_id=None,
                profile=None,
                current_aal=None,
            )
        )
        assert decision.kind == "redirect"
        assert decision.location == "/login"

    def test_envia_a_setup_cuando_rol_clinico_no_configuro_mfa(self):
        decision = decide_access(
            AccessInput(
                configuration_ready=True,
                pathname="/dashboard",
                user_id=ACTIVE_ADMIN.id,
                profile=replace(ACTIVE_ADMIN, mfa_enabled=False),
                current_aal="aal1",
            )
        )
        assert decision.kind == "redirect"
        assert decision.location == "/setup-mfa"

    def test_exige_verificacion_cuando_hay_mfa_pero_sesion_en_aal1(self):
        decision = decide_access(
            AccessInput(
                configuration_ready=True,
                pathname="/dashboard",
                user_id=ACTIVE_ADMIN.id,
                profile=ACTIVE_ADMIN,
                current_aal="aal1",
            )
        )
        assert decision.kind == "redirect"
        assert decision.location == "/verify-mfa"

    def test_permite_ruta_protegida_solo_despues_de_aal2(self):
        decision = decide_access(
            AccessInput(
                configuration_ready=True,
                pathname="/dashboard",
                user_id=ACTIVE_ADMIN.id,
                profile=ACTIVE_ADMIN,
                current_aal="aal2",
            )
        )
        assert decision.kind == "allow"

    def test_rechaza_perfiles_inactivos_aunque_exista_sesion_valida(self):
        decision = decide_access(
            AccessInput(
                configuration_ready=True,
                pathname="/dashboard",
                user_id=ACTIVE_ADMIN.id,
                profile=replace(ACTIVE_ADMIN, is_active=False),
                current_aal="aal2",
            )
        )
        assert decision.kind == "redirect"
        assert decision.location == "/login"
