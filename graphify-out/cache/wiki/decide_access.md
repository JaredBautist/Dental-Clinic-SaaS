# decide_access

> 20 nodes · cohesion 0.21

## Key Concepts

- **decide_access()** (12 connections) — `backend/app/auth/access_policy.py`
- **AccessInput** (10 connections) — `backend/app/auth/access_policy.py`
- **access_policy.py** (9 connections) — `backend/app/auth/access_policy.py`
- **TestDecideAccess** (8 connections) — `backend/tests/test_access_policy.py`
- **test_access_policy.py** (7 connections) — `backend/tests/test_access_policy.py`
- **_clinical_mfa_destination()** (5 connections) — `backend/app/auth/access_policy.py`
- **dataclasses** (4 connections)
- **AccessProfile** (3 connections) — `backend/app/auth/access_policy.py`
- **.test_envia_a_setup_cuando_rol_clinico_no_configuro_mfa()** (3 connections) — `backend/tests/test_access_policy.py`
- **.test_exige_verificacion_cuando_hay_mfa_pero_sesion_en_aal1()** (3 connections) — `backend/tests/test_access_policy.py`
- **.test_falla_cerrado_cuando_falta_configuracion_de_supabase()** (3 connections) — `backend/tests/test_access_policy.py`
- **.test_permite_ruta_protegida_solo_despues_de_aal2()** (3 connections) — `backend/tests/test_access_policy.py`
- **.test_protege_apis_distintas_del_health_check()** (3 connections) — `backend/tests/test_access_policy.py`
- **.test_rechaza_perfiles_inactivos_aunque_exista_sesion_valida()** (3 connections) — `backend/tests/test_access_policy.py`
- **AccessDecision** (2 connections) — `backend/app/auth/access_policy.py`
- **AuthenticatorAssuranceLevel** (1 connections)
- **Política de acceso — port 1:1 de lib/auth/access-policy.ts. Función pura, sin…** (1 connections) — `backend/app/auth/access_policy.py`
- **Decide el acceso observable para una ruta sin depender de Next.js ni Supabase.…** (1 connections) — `backend/app/auth/access_policy.py`
- **Port 1:1 de __tests__/unit/access-policy.test.ts.** (1 connections) — `backend/tests/test_access_policy.py`
- **RedirectLocation** (1 connections)

## Relationships

- [test_api_contract.py](test_api_contract.py.md) (1 shared connections)
- [login](login.md) (1 shared connections)
- [service.py](service.py.md) (1 shared connections)

## Source Files

- `backend/app/auth/access_policy.py`
- `backend/tests/test_access_policy.py`

## Audit Trail

- EXTRACTED: 42 (98%)
- INFERRED: 1 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*