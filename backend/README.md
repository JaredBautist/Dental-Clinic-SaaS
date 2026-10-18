# 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice

Microservicio asíncrono desarrollado con **FastAPI**, **Pydantic v2** y **supabase-py** para la gestión de autenticación, control de fuerza bruta y enrolamiento/verificación de autenticación de dos factores (MFA TOTP) asegurando nivel de aseguramiento AAL2.

---

## 📋 Endpoints de la API

Todos los endpoints retornan una estructura unificada compatible con el contrato `ServerActionResult<T>` del frontend Next.js:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### 1. Autenticación (`/auth`)

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Inicia sesión con email y contraseña, valida intentos de bloqueo y verifica si el usuario requiere MFA (AAL1 vs AAL2) | No |
| `POST` | `/auth/logout` | Revoca la sesión activa en Supabase Auth y limpia el contexto del usuario | Sí (Bearer Token) |

### 2. Autenticación Multifactor TOTP (`/mfa`)

| Método | Endpoint | Descripción | Requiere Auth |
|---|---|---|---|
| `POST` | `/mfa/enroll` | Limpia factores `unverified` previos y genera un nuevo factor TOTP con código QR en base64 para Google Authenticator u otras apps | Sí (AAL1) |
| `POST` | `/mfa/verify-setup` | Valida el primer código TOTP de 6 dígitos para confirmar el factor y marca `mfa_enabled = true` en `users` | Sí (AAL1) |
| `POST` | `/mfa/verify-login` | Valida el código TOTP durante el flujo de inicio de sesión elevando la sesión a nivel AAL2 | Sí (AAL1) |
| `POST` | `/mfa/cancel` | Cancela el flujo intermedio de autenticación si el usuario desiste | Sí (AAL1) |
| `POST` | `/mfa/reset` | Resetea administrativamente los factores MFA en caso de pérdida o desincronización | Sí (Admin) |

### 3. Salud y Diagnóstico (`/health`)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Chequeo de salud del servicio con timestamp y versión |

---

## ⚙️ Estructura del Microservicio

```
backend/
├── app/
│   ├── main.py                # FastAPI app, CORS middleware, handlers de excepciones
│   ├── config.py              # Pydantic Settings con validación de .env
│   ├── deps.py                # Inyección de dependencias (clientes Supabase anon, admin y user)
│   ├── auth/
│   │   ├── router.py          # Endpoints HTTP REST
│   │   ├── service.py         # Lógica de negocio (login, logout, TOTP, QR base64)
│   │   ├── schemas.py         # Modelos Pydantic v2 para validación de requests/responses
│   │   └── login_attempts.py  # Control de bloqueo por intentos fallidos (15 min)
│   └── core/
│       ├── errors.py          # Clases DentalClinicError y códigos semánticos
│       └── logging.py         # Configuración estructurada de logs
├── tests/
│   ├── conftest.py            # Fixtures de pruebas y mocks de Supabase
│   ├── test_access_policy.py  # Verificación de matriz de roles (Admin, Odontólogo, Recepcionista)
│   ├── test_api_contract.py   # Validación de respuestas JSON contra contratos TypeScript
│   └── test_auth_service.py   # Pruebas unitarias de login, lockout y MFA
├── requirements.txt           # Dependencias de producción
└── .env                       # Variables de entorno
```

---

## 🚀 Instalación y Ejecución

```bash
# 1. Crear entorno virtual
python3 -m venv .venv
source .venv/bin/activate       # En Windows: .venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Iniciar servidor de desarrollo en puerto 8001
uvicorn app.main:app --reload --port 8001
```

---

## 🧪 Pruebas Automatizadas

```bash
# Ejecutar suite de pruebas con Pytest
.venv/bin/pytest tests/ -v
```

Todas las 32 pruebas validan:
- ✅ Cumplimiento del contrato JSON contra el frontend Next.js.
- ✅ Manejo de credenciales inválidas y bloqueo de cuenta por 5 intentos fallidos consecutivos.
- ✅ Enrolamiento TOTP y generación de códigos QR válidos.
- ✅ Verificación AAL2 obligatoria para `administrador` y `odontologo`.
- ✅ Políticas de acceso RBAC por rol clínico.
