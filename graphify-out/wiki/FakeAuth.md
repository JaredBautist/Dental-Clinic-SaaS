# FakeAuth

> 48 nodes · cohesion 0.09

## Key Concepts

- **FakeAuth** (23 connections) — `backend/tests/test_auth_service.py`
- **FakeClient** (20 connections) — `backend/tests/test_auth_service.py`
- **FakeMfa** (18 connections) — `backend/tests/test_auth_service.py`
- **Any** (15 connections)
- **verify_mfa_login()** (14 connections) — `backend/app/auth/service.py`
- **FakeQuery** (11 connections) — `backend/tests/test_auth_service.py`
- **TestVerifyMfaLogin** (10 connections) — `backend/tests/test_auth_service.py`
- **_jwt_with_aal()** (6 connections) — `backend/tests/test_auth_service.py`
- **.test_exito_devuelve_sesion_aal2()** (6 connections) — `backend/tests/test_auth_service.py`
- **.test_falla_si_aal_no_llega_a_aal2()** (6 connections) — `backend/tests/test_auth_service.py`
- **.test_marca_mfa_enabled_solo_tras_aal2()** (6 connections) — `backend/tests/test_auth_service.py`
- **.__init__()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_limpia_factores_no_verificados_antes_de_enrolar()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_cierra_sesion_cuando_supabase_rechaza_totp()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_falla_si_no_hay_factor_totp()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_no_afirma_fallo_mfa_si_supabase_no_confirma_sign_out()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_no_marca_mfa_enabled_si_falla_challenge()** (5 connections) — `backend/tests/test_auth_service.py`
- **.__init__()** (4 connections) — `backend/tests/test_auth_service.py`
- **TestSessionTermination** (4 connections) — `backend/tests/test_auth_service.py`
- **.test_cancel_mfa_cierra_sesion()** (4 connections) — `backend/tests/test_auth_service.py`
- **.test_logout_no_afirma_exito_cuando_proveedor_falla()** (4 connections) — `backend/tests/test_auth_service.py`
- **.test_rechaza_rol_no_clinico()** (4 connections) — `backend/tests/test_auth_service.py`
- **TestVerifyMfaSetup** (4 connections) — `backend/tests/test_auth_service.py`
- **.__init__()** (3 connections) — `backend/tests/test_auth_service.py`
- **.get_user()** (2 connections) — `backend/tests/test_auth_service.py`
- *... and 23 more nodes in this community*

## Relationships

- [test_auth_service.py](test_auth_service.py.md) (20 shared connections)
- [service.py](service.py.md) (16 shared connections)
- [router.py](router.py.md) (1 shared connections)
- [login](login.md) (1 shared connections)

## Source Files

- `backend/app/auth/service.py`
- `backend/tests/test_auth_service.py`

## Audit Trail

- EXTRACTED: 129 (96%)
- INFERRED: 5 (4%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*