# LoginAttemptStore

> 29 nodes · cohesion 0.12

## Key Concepts

- **LoginAttemptStore** (13 connections) — `backend/app/auth/login_attempts.py`
- **FakeAttemptStore** (13 connections) — `backend/tests/test_auth_service.py`
- **login_attempts.py** (12 connections) — `backend/app/auth/login_attempts.py`
- **FailedAttemptStatus** (8 connections) — `backend/app/auth/login_attempts.py`
- **LockoutStatus** (8 connections) — `backend/app/auth/login_attempts.py`
- **._rpc()** (7 connections) — `backend/app/auth/login_attempts.py`
- **LoginAttemptStoreError** (7 connections) — `backend/app/core/errors.py`
- **hash_login_identifier()** (6 connections) — `backend/app/core/security.py`
- **_first_row()** (5 connections) — `backend/app/auth/login_attempts.py`
- **.check()** (5 connections) — `backend/app/auth/login_attempts.py`
- **.record_failure()** (5 connections) — `backend/app/auth/login_attempts.py`
- **security.py** (5 connections) — `backend/app/core/security.py`
- **.__init__()** (5 connections) — `backend/tests/test_auth_service.py`
- **decode_aal_claim()** (4 connections) — `backend/app/core/security.py`
- **.clear()** (3 connections) — `backend/app/auth/login_attempts.py`
- **.enqueue_lockout_notification()** (2 connections) — `backend/app/auth/login_attempts.py`
- **.__init__()** (2 connections) — `backend/app/auth/login_attempts.py`
- **Any** (2 connections)
- **.check()** (2 connections) — `backend/tests/test_auth_service.py`
- **.record_failure()** (2 connections) — `backend/tests/test_auth_service.py`
- **LockoutStatus** (2 connections)
- **AsyncClient** (1 connections)
- **Store persistente de intentos de login — port de lib/auth/login-attempt-…** (1 connections) — `backend/app/auth/login_attempts.py`
- **Adapter de persistencia para las RPC atómicas de intentos de login.** (1 connections) — `backend/app/auth/login_attempts.py`
- **Utilidades de seguridad — port de hashLoginIdentifier + lectura del claim AAL.** (1 connections) — `backend/app/core/security.py`
- *... and 4 more nodes in this community*

## Relationships

- [service.py](service.py.md) (10 shared connections)
- [FakeAuth](FakeAuth.md) (9 shared connections)
- [test_auth_service.py](test_auth_service.py.md) (4 shared connections)
- [router.py](router.py.md) (3 shared connections)

## Source Files

- `backend/app/auth/login_attempts.py`
- `backend/app/core/errors.py`
- `backend/app/core/security.py`
- `backend/tests/test_auth_service.py`

## Audit Trail

- EXTRACTED: 69 (91%)
- INFERRED: 7 (9%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*