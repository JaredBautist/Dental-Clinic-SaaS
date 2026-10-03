# test_auth_service.py

> 23 nodes · cohesion 0.13

## Key Concepts

- **test_auth_service.py** (29 connections) — `backend/tests/test_auth_service.py`
- **VerifyLoginRequest** (9 connections) — `backend/app/auth/schemas.py`
- **VerifySetupRequest** (8 connections) — `backend/app/auth/schemas.py`
- **TestBoundaryValidation** (8 connections) — `backend/tests/test_auth_service.py`
- **schemas.py** (7 connections) — `backend/app/auth/schemas.py`
- **LoginRequest** (4 connections) — `backend/app/auth/schemas.py`
- **FakePostgrest** (4 connections) — `backend/tests/test_auth_service.py`
- **_validate_totp_code()** (3 connections) — `backend/app/auth/schemas.py`
- **.code_format()** (3 connections) — `backend/app/auth/schemas.py`
- **.code_format()** (3 connections) — `backend/app/auth/schemas.py`
- **BaseModel** (3 connections)
- **.test_acepta_codigo_de_seis_digitos()** (2 connections) — `backend/tests/test_auth_service.py`
- **.test_rechaza_codigo_mfa_no_numerico()** (2 connections) — `backend/tests/test_auth_service.py`
- **.test_rechaza_codigo_setup_no_numerico()** (2 connections) — `backend/tests/test_auth_service.py`
- **.test_verify_setup_acepta_factor_id_camel_case_del_frontend()** (2 connections) — `backend/tests/test_auth_service.py`
- **TestEnrollMfa** (2 connections) — `backend/tests/test_auth_service.py`
- **field_validator** (2 connections)
- **Esquemas de entrada — equivalentes a los Zod schemas de auth.actions.ts. El…** (1 connections) — `backend/app/auth/schemas.py`
- **.auth()** (1 connections) — `backend/tests/test_auth_service.py`
- **.__init__()** (1 connections) — `backend/tests/test_auth_service.py`
- **Tests del servicio de auth/MFA con clientes Supabase falsos (sin red). Port de…** (1 connections) — `backend/tests/test_auth_service.py`
- **lib/api/auth-api.ts envía {"factorId", "code"}; el modelo lo acepta.** (1 connections) — `backend/tests/test_auth_service.py`
- **.test_verify_setup_acepta_factor_id_snake_case()** (1 connections) — `backend/tests/test_auth_service.py`

## Relationships

- [FakeAuth](FakeAuth.md) (11 shared connections)
- [router.py](router.py.md) (8 shared connections)
- [service.py](service.py.md) (8 shared connections)
- [LoginAttemptStore](LoginAttemptStore.md) (4 shared connections)

## Source Files

- `backend/app/auth/schemas.py`
- `backend/tests/test_auth_service.py`

## Audit Trail

- EXTRACTED: 60 (92%)
- INFERRED: 5 (8%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*