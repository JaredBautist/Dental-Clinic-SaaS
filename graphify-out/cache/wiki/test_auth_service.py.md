# test_auth_service.py

> 23 nodes · cohesion 0.15

## Key Concepts

- **test_auth_service.py** (33 connections) — `backend/tests/test_auth_service.py`
- **FakeAttemptStore** (13 connections) — `backend/tests/test_auth_service.py`
- **TestLogin** (11 connections) — `backend/tests/test_auth_service.py`
- **FailedAttemptStatus** (10 connections) — `backend/app/auth/login_attempts.py`
- **LockoutStatus** (9 connections) — `backend/app/auth/login_attempts.py`
- **.test_bloqueo_tras_intentos_encola_notificacion()** (6 connections) — `backend/tests/test_auth_service.py`
- **.test_credenciales_invalidas_registran_intento()** (6 connections) — `backend/tests/test_auth_service.py`
- **.test_cuenta_bloqueada_no_envia_credenciales()** (6 connections) — `backend/tests/test_auth_service.py`
- **.test_admin_sin_mfa_redirige_a_setup_y_limpia_intentos()** (5 connections) — `backend/tests/test_auth_service.py`
- **.test_cuenta_inactiva_cierra_sesion()** (5 connections) — `backend/tests/test_auth_service.py`
- **FakePostgrest** (4 connections) — `backend/tests/test_auth_service.py`
- **auth/__init__.py** (3 connections) — `backend/app/auth/__init__.py`
- **.__init__()** (3 connections) — `backend/tests/test_auth_service.py`
- **.check()** (2 connections) — `backend/tests/test_auth_service.py`
- **.record_failure()** (2 connections) — `backend/tests/test_auth_service.py`
- **.auth()** (2 connections) — `backend/tests/test_auth_service.py`
- **TestEnrollMfa** (2 connections) — `backend/tests/test_auth_service.py`
- **Módulo de autenticación y MFA — port de lib/actions/auth.actions.ts.** (1 connections) — `backend/app/auth/__init__.py`
- **.clear()** (1 connections) — `backend/tests/test_auth_service.py`
- **.enqueue_lockout_notification()** (1 connections) — `backend/tests/test_auth_service.py`
- **.__init__()** (1 connections) — `backend/tests/test_auth_service.py`
- **Tests del servicio de auth/MFA con clientes Supabase falsos (sin red). Port de…** (1 connections) — `backend/tests/test_auth_service.py`
- **pytest** (1 connections)

## Relationships

- [FakeAuth](FakeAuth.md) (20 shared connections)
- [login](login.md) (11 shared connections)
- [service.py](service.py.md) (11 shared connections)
- [router.py](router.py.md) (5 shared connections)
- [test_api_contract.py](test_api_contract.py.md) (2 shared connections)
- [withErrorHandling](withErrorHandling.md) (1 shared connections)

## Source Files

- `backend/app/auth/__init__.py`
- `backend/app/auth/login_attempts.py`
- `backend/tests/test_auth_service.py`

## Audit Trail

- EXTRACTED: 81 (91%)
- INFERRED: 8 (9%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*