# login

> 26 nodes · cohesion 0.14

## Key Concepts

- **login()** (24 connections) — `backend/app/auth/service.py`
- **login_attempts.py** (14 connections) — `backend/app/auth/login_attempts.py`
- **LoginAttemptStore** (13 connections) — `backend/app/auth/login_attempts.py`
- **._rpc()** (7 connections) — `backend/app/auth/login_attempts.py`
- **LoginAttemptStoreError** (7 connections) — `backend/app/core/errors.py`
- **security.py** (7 connections) — `backend/app/core/security.py`
- **hash_login_identifier()** (7 connections) — `backend/app/core/security.py`
- **.check()** (6 connections) — `backend/app/auth/login_attempts.py`
- **.record_failure()** (6 connections) — `backend/app/auth/login_attempts.py`
- **decode_aal_claim()** (6 connections) — `backend/app/core/security.py`
- **_first_row()** (5 connections) — `backend/app/auth/login_attempts.py`
- **.clear()** (4 connections) — `backend/app/auth/login_attempts.py`
- **jwt** (4 connections)
- **.enqueue_lockout_notification()** (3 connections) — `backend/app/auth/login_attempts.py`
- **.__init__()** (2 connections) — `backend/app/auth/login_attempts.py`
- **Any** (2 connections)
- **LoginResult** (2 connections) — `backend/app/auth/service.py`
- **hashlib** (2 connections)
- **math** (2 connections)
- **AsyncClient** (1 connections)
- **Store persistente de intentos de login — port de lib/auth/login-attempt-…** (1 connections) — `backend/app/auth/login_attempts.py`
- **Adapter de persistencia para las RPC atómicas de intentos de login.** (1 connections) — `backend/app/auth/login_attempts.py`
- **Port de loginAction con protección de intentos fallidos persistente.** (1 connections) — `backend/app/auth/service.py`
- **Utilidades de seguridad — port de hashLoginIdentifier + lectura del claim AAL.** (1 connections) — `backend/app/core/security.py`
- **Lee el claim `aal` del JWT emitido por Supabase GoTrue. No verifica la firma:…** (1 connections) — `backend/app/core/security.py`
- *... and 1 more nodes in this community*

## Relationships

- [service.py](service.py.md) (20 shared connections)
- [test_auth_service.py](test_auth_service.py.md) (11 shared connections)
- [router.py](router.py.md) (4 shared connections)
- [test_api_contract.py](test_api_contract.py.md) (3 shared connections)
- [decide_access](decide_access.md) (1 shared connections)
- [FakeAuth](FakeAuth.md) (1 shared connections)

## Source Files

- `backend/app/auth/login_attempts.py`
- `backend/app/auth/service.py`
- `backend/app/core/errors.py`
- `backend/app/core/security.py`

## Audit Trail

- EXTRACTED: 76 (89%)
- INFERRED: 9 (11%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*