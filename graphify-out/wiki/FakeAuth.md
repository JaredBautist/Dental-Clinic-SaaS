# FakeAuth

> 53 nodes · cohesion 0.08

## Key Concepts

- **FakeAuth** (23 connections) — `backend/tests/test_auth_service.py`
- **FakeClient** (20 connections) — `backend/tests/test_auth_service.py`
- **FakeMfa** (18 connections) — `backend/tests/test_auth_service.py`
- **Any** (15 connections)
- **FakeQuery** (11 connections) — `backend/tests/test_auth_service.py`
- **TestLogin** (11 connections) — `backend/tests/test_auth_service.py`
- **TestVerifyMfaLogin** (10 connections) — `backend/tests/test_auth_service.py`
- **Exception** (8 connections)
- **.test_bloqueo_tras_intentos_encola_notificacion()** (6 connections) — `backend/tests/test_auth_service.py`
- **.test_credenciales_invalidas_registran_intento()** (6 connections) — `backend/tests/test_auth_service.py`
- **.__init__()** (5 connections) — `backend/tests/test_auth_service.py`
- **_jwt_with_aal()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_cuenta_bloqueada_no_envia_credenciales()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_cierra_sesion_cuando_supabase_rechaza_totp()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_exito_devuelve_sesion_aal2()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_falla_si_aal_no_llega_a_aal2()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_no_afirma_fallo_mfa_si_supabase_no_confirma_sign_out()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_marca_mfa_enabled_solo_tras_aal2()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_no_marca_mfa_enabled_si_falla_challenge()** (5 connections) — `backend/tests/test_auth_service.py`
- **.__init__()** (4 connections) — `backend/tests/test_auth_service.py`
- **.test_limpia_factores_no_verificados_antes_de_enrolar()** (4 connections) — `backend/tests/test_auth_service.py`
- **.test_admin_sin_mfa_redirige_a_setup_y_limpia_intentos()** (4 connections) — `backend/tests/test_auth_service.py`
- **.test_cuenta_inactiva_cierra_sesion()** (4 connections) — `backend/tests/test_auth_service.py`
- **TestSessionTermination** (4 connections) — `backend/tests/test_auth_service.py`
- **.test_falla_si_no_hay_factor_totp()** (4 connections) — `backend/tests/test_auth_service.py`
- *... and 28 more nodes in this community*

## Relationships

- [test_auth_service.py](test_auth_service.py.md) (11 shared connections)
- [LoginAttemptStore](LoginAttemptStore.md) (9 shared connections)
- [service.py](service.py.md) (8 shared connections)

## Source Files

- `backend/tests/test_auth_service.py`

## Audit Trail

- EXTRACTED: 130 (93%)
- INFERRED: 10 (7%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*