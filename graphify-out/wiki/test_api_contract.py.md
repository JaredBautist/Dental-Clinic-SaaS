# test_api_contract.py

> 28 nodes · cohesion 0.11

## Key Concepts

- **test_api_contract.py** (12 connections) — `backend/tests/test_api_contract.py`
- **deps.py** (11 connections) — `backend/app/deps.py`
- **get_user_client()** (7 connections) — `backend/app/deps.py`
- **get_settings()** (6 connections) — `backend/app/config.py`
- **AuthConfigurationUnavailableError** (6 connections) — `backend/app/core/errors.py`
- **get_admin_client()** (6 connections) — `backend/app/deps.py`
- **get_anon_client()** (6 connections) — `backend/app/deps.py`
- **Settings** (5 connections) — `backend/app/config.py`
- **config.py** (4 connections) — `backend/app/config.py`
- **_AuthWithoutSession** (4 connections) — `backend/tests/test_api_contract.py`
- **AsyncClient** (3 connections)
- **_client_without_session()** (3 connections) — `backend/tests/test_api_contract.py`
- **.configuration_ready()** (2 connections) — `backend/app/config.py`
- **.get_user()** (2 connections) — `backend/tests/test_api_contract.py`
- **Any** (2 connections)
- **test_verify_setup_acepta_factor_id_en_camel_case_como_el_frontend()** (2 connections) — `backend/tests/test_api_contract.py`
- **Igual que proxy.ts: sin configuración de Supabase se falla cerrado (503).** (1 connections) — `backend/app/config.py`
- **.cors_origin_list()** (1 connections) — `backend/app/config.py`
- **Dependencias de FastAPI: clientes Supabase por request. - `get_anon_client`:…** (1 connections) — `backend/app/deps.py`
- **Reconstruye la sesión del usuario a partir de los tokens enviados por el…** (1 connections) — `backend/app/deps.py`
- **Smoke tests del contrato HTTP de la API (sin tocar Supabase).** (1 connections) — `backend/tests/test_api_contract.py`
- **El servicio convierte cualquier fallo de get_user en 401, lo que permite…** (1 connections) — `backend/tests/test_api_contract.py`
- **Regresión: lib/api/auth-api.ts envía {"factorId", "code"} (camelCase); el…** (1 connections) — `backend/tests/test_api_contract.py`
- **test_health_responde_ok()** (1 connections) — `backend/tests/test_api_contract.py`
- **test_verify_login_rechaza_codigo_no_numerico_en_el_boundary()** (1 connections) — `backend/tests/test_api_contract.py`
- *... and 3 more nodes in this community*

## Relationships

- [service.py](service.py.md) (6 shared connections)
- [router.py](router.py.md) (4 shared connections)
- [main.py](main.py.md) (3 shared connections)

## Source Files

- `backend/app/config.py`
- `backend/app/core/errors.py`
- `backend/app/deps.py`
- `backend/tests/test_api_contract.py`

## Audit Trail

- EXTRACTED: 52 (98%)
- INFERRED: 1 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*