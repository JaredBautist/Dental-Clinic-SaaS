# router.py

> 32 nodes · cohesion 0.14

## Key Concepts

- **router.py** (25 connections) — `backend/app/auth/router.py`
- **_ok()** (9 connections) — `backend/app/auth/router.py`
- **schemas.py** (9 connections) — `backend/app/auth/schemas.py`
- **VerifyLoginRequest** (9 connections) — `backend/app/auth/schemas.py`
- **login_endpoint()** (8 connections) — `backend/app/auth/router.py`
- **verify_setup_endpoint()** (8 connections) — `backend/app/auth/router.py`
- **VerifySetupRequest** (8 connections) — `backend/app/auth/schemas.py`
- **TestBoundaryValidation** (8 connections) — `backend/tests/test_auth_service.py`
- **AsyncClient** (7 connections)
- **verify_login_endpoint()** (7 connections) — `backend/app/auth/router.py`
- **post** (7 connections)
- **cancel_endpoint()** (5 connections) — `backend/app/auth/router.py`
- **enroll_endpoint()** (5 connections) — `backend/app/auth/router.py`
- **logout_endpoint()** (5 connections) — `backend/app/auth/router.py`
- **reset_endpoint()** (5 connections) — `backend/app/auth/router.py`
- **_session_payload()** (5 connections) — `backend/app/auth/router.py`
- **LoginRequest** (4 connections) — `backend/app/auth/schemas.py`
- **_validate_totp_code()** (4 connections) — `backend/app/auth/schemas.py`
- **.code_format()** (3 connections) — `backend/app/auth/schemas.py`
- **.code_format()** (3 connections) — `backend/app/auth/schemas.py`
- **BaseModel** (3 connections)
- **.test_acepta_codigo_de_seis_digitos()** (2 connections) — `backend/tests/test_auth_service.py`
- **.test_rechaza_codigo_mfa_no_numerico()** (2 connections) — `backend/tests/test_auth_service.py`
- **.test_rechaza_codigo_setup_no_numerico()** (2 connections) — `backend/tests/test_auth_service.py`
- **.test_verify_setup_acepta_factor_id_camel_case_del_frontend()** (2 connections) — `backend/tests/test_auth_service.py`
- *... and 7 more nodes in this community*

## Relationships

- [service.py](service.py.md) (7 shared connections)
- [test_api_contract.py](test_api_contract.py.md) (6 shared connections)
- [test_auth_service.py](test_auth_service.py.md) (5 shared connections)
- [login](login.md) (4 shared connections)
- [main.py](main.py.md) (2 shared connections)
- [FakeAuth](FakeAuth.md) (1 shared connections)
- [Estructuras de Datos y Control de Flujo en el Backend Python](Estructuras_de_Datos_y_Control_de_Flujo_en_el_Backend_Python.md) (1 shared connections)

## Source Files

- `backend/app/auth/router.py`
- `backend/app/auth/schemas.py`
- `backend/tests/test_auth_service.py`

## Audit Trail

- EXTRACTED: 88 (93%)
- INFERRED: 7 (7%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*