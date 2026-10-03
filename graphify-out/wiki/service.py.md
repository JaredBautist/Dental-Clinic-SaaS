# service.py

> 58 nodes · cohesion 0.08

## Key Concepts

- **service.py** (35 connections) — `backend/app/auth/service.py`
- **errors.py** (19 connections) — `backend/app/core/errors.py`
- **DentalClinicError** (18 connections) — `backend/app/core/errors.py`
- **login()** (13 connections) — `backend/app/auth/service.py`
- **_require_clinical_user()** (13 connections) — `backend/app/auth/service.py`
- **.__init__()** (13 connections) — `backend/app/core/errors.py`
- **AsyncClient** (11 connections)
- **_confirm_aal2()** (9 connections) — `backend/app/auth/service.py`
- **verify_mfa_login()** (9 connections) — `backend/app/auth/service.py`
- **verify_mfa_setup()** (9 connections) — `backend/app/auth/service.py`
- **_fail_mfa()** (8 connections) — `backend/app/auth/service.py`
- **_sign_out_or_raise()** (8 connections) — `backend/app/auth/service.py`
- **AccountInactiveError** (8 connections) — `backend/app/core/errors.py`
- **MfaVerificationFailedError** (8 connections) — `backend/app/core/errors.py`
- **SignOutFailedError** (8 connections) — `backend/app/core/errors.py`
- **enroll_mfa()** (7 connections) — `backend/app/auth/service.py`
- **AccountLockedError** (7 connections) — `backend/app/core/errors.py`
- **AuthenticationRequiredError** (7 connections) — `backend/app/core/errors.py`
- **InvalidCredentialsError** (7 connections) — `backend/app/core/errors.py`
- **RoleAuthorizationError** (7 connections) — `backend/app/core/errors.py`
- **AuthProfileUnavailableError** (6 connections) — `backend/app/core/errors.py`
- **InvalidMfaCodeError** (6 connections) — `backend/app/core/errors.py`
- **cancel_mfa()** (5 connections) — `backend/app/auth/service.py`
- **logout()** (5 connections) — `backend/app/auth/service.py`
- **reset_mfa()** (5 connections) — `backend/app/auth/service.py`
- *... and 33 more nodes in this community*

## Relationships

- [LoginAttemptStore](LoginAttemptStore.md) (10 shared connections)
- [router.py](router.py.md) (9 shared connections)
- [test_auth_service.py](test_auth_service.py.md) (8 shared connections)
- [FakeAuth](FakeAuth.md) (8 shared connections)
- [test_api_contract.py](test_api_contract.py.md) (6 shared connections)
- [main.py](main.py.md) (3 shared connections)

## Source Files

- `backend/app/auth/service.py`
- `backend/app/core/errors.py`

## Audit Trail

- EXTRACTED: 168 (94%)
- INFERRED: 10 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*