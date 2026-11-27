# service.py

> 52 nodes · cohesion 0.09

## Key Concepts

- **service.py** (39 connections) — `backend/app/auth/service.py`
- **errors.py** (19 connections) — `backend/app/core/errors.py`
- **DentalClinicError** (18 connections) — `backend/app/core/errors.py`
- **_require_clinical_user()** (13 connections) — `backend/app/auth/service.py`
- **.__init__()** (13 connections) — `backend/app/core/errors.py`
- **verify_mfa_setup()** (12 connections) — `backend/app/auth/service.py`
- **AsyncClient** (11 connections)
- **_confirm_aal2()** (9 connections) — `backend/app/auth/service.py`
- **enroll_mfa()** (9 connections) — `backend/app/auth/service.py`
- **_fail_mfa()** (8 connections) — `backend/app/auth/service.py`
- **_sign_out_or_raise()** (8 connections) — `backend/app/auth/service.py`
- **AccountInactiveError** (8 connections) — `backend/app/core/errors.py`
- **MfaVerificationFailedError** (8 connections) — `backend/app/core/errors.py`
- **SignOutFailedError** (8 connections) — `backend/app/core/errors.py`
- **AccountLockedError** (7 connections) — `backend/app/core/errors.py`
- **AuthenticationRequiredError** (7 connections) — `backend/app/core/errors.py`
- **InvalidCredentialsError** (7 connections) — `backend/app/core/errors.py`
- **RoleAuthorizationError** (7 connections) — `backend/app/core/errors.py`
- **cancel_mfa()** (6 connections) — `backend/app/auth/service.py`
- **logout()** (6 connections) — `backend/app/auth/service.py`
- **AuthProfileUnavailableError** (6 connections) — `backend/app/core/errors.py`
- **reset_mfa()** (5 connections) — `backend/app/auth/service.py`
- **InvalidMfaCodeError** (5 connections) — `backend/app/core/errors.py`
- **MfaEnrollmentFailedError** (5 connections) — `backend/app/core/errors.py`
- **_is_valid_profile()** (4 connections) — `backend/app/auth/service.py`
- *... and 27 more nodes in this community*

## Relationships

- [login](login.md) (20 shared connections)
- [FakeAuth](FakeAuth.md) (16 shared connections)
- [test_auth_service.py](test_auth_service.py.md) (11 shared connections)
- [test_api_contract.py](test_api_contract.py.md) (8 shared connections)
- [router.py](router.py.md) (7 shared connections)
- [main.py](main.py.md) (4 shared connections)
- [decide_access](decide_access.md) (1 shared connections)
- [Estructuras de Datos y Control de Flujo en el Backend Python](Estructuras_de_Datos_y_Control_de_Flujo_en_el_Backend_Python.md) (1 shared connections)

## Source Files

- `backend/app/auth/service.py`
- `backend/app/core/errors.py`

## Audit Trail

- EXTRACTED: 170 (94%)
- INFERRED: 11 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*