# Estructuras de Datos y Control de Flujo en el Backend Python

Este documento detalla exhaustivamente en qué partes del backend Python (`backend/app/` y base de datos relacional vinculada) se implementan **condicionales, bucles `for`, tuplas, colas (FIFO) y pilas (LIFO)**, indicando archivo, función, líneas de código y su justificación arquitectónica.

---

## 1. Condicionales (`if`, `elif`, `else` y Expresiones Ternarias)

Los condicionales son el mecanismo central de validación defensiva, control de acceso y bifurcación de flujo en la API de autenticación y seguridad.

### Principales Ubicaciones

#### A. Control de Fuerza Bruta y Roles Clínicos
- **Archivo:** [`backend/app/auth/service.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/service.py)
- **Función:** `login(client, attempts, email, password)` (Líneas 194–268)
- **Código:**
  ```python
  # 1. Comprobación de bloqueo previo
  if lockout.is_locked:
      raise AccountLockedError(max(1, math.ceil(lockout.remaining_seconds / 60)))

  # 2. Validación de credenciales
  if user is None or session is None:
      attempt = await attempts.record_failure(email)
      if attempt.triggered_lockout:
          try:
              await attempts.enqueue_lockout_notification(email)
          except Exception:
              logger.exception("[Login Lockout Outbox Error]")
          raise AccountLockedError(LOCKOUT_MINUTES)
      raise InvalidCredentialsError(attempt.attempts_left)

  # 3. Validación de integridad del perfil
  if not _is_valid_profile(profile):
      await _sign_out_or_raise(client, "No fue posible cerrar la sesión con un perfil inválido.")
      raise AuthProfileUnavailableError()

  # 4. Estado de la cuenta
  if profile.get("is_active") is not True:
      await _sign_out_or_raise(client, "No fue posible cerrar la sesión de la cuenta desactivada.")
      raise AccountInactiveError()

  # 5. Bifurcación según rol clínico
  redirect_to = "/dashboard"
  mfa_required = False
  if role in CLINICAL_ROLES:
      mfa_required = True
      redirect_to = "/verify-mfa" if profile.get("mfa_enabled") else "/setup-mfa"
  ```
- **Propósito:** Aplica bloqueo exponencial, validación estricta de cuenta activa y determina si el usuario requiere enrolar o verificar MFA según su rol (`administrador`, `odontologo`).

#### B. Normalización y Formato del Código QR (Condicionales en Cascada)
- **Archivo:** [`backend/app/auth/service.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/service.py)
- **Función:** `enroll_mfa(client)` (Líneas 325–338)
- **Código:**
  ```python
  if raw_qr:
      import base64
      prefix = "data:image/svg+xml;utf-8,"
      if raw_qr.startswith(prefix):
          svg_xml = raw_qr[len(prefix):]
          formatted_qr = f"data:image/svg+xml;base64,{base64.b64encode(svg_xml.encode('utf-8')).decode('ascii')}"
      elif raw_qr.startswith("<") or "svg" in raw_qr[:30]:
          formatted_qr = f"data:image/svg+xml;base64,{base64.b64encode(raw_qr.encode('utf-8')).decode('ascii')}"
      else:
          formatted_qr = raw_qr
  else:
      formatted_qr = ""
  ```
- **Propósito:** Detecta el formato devuelto por Supabase GoTrue (SVG en texto plano, data URI raw o URL) y lo convierte a Data URI Base64 para el frontend.

#### C. Política de Acceso y Rutas Protegidas
- **Archivo:** [`backend/app/auth/access_policy.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/access_policy.py)
- **Función:** `decide_access(input)` (Líneas 58–112)
- **Código:**
  ```python
  if not input.configuration_ready:
      return AccessDecision(kind="unavailable", status=503)

  if (
      input.user_id is None
      or input.profile is None
      or input.profile.id != input.user_id
      or not input.profile.is_active
  ):
      return AccessDecision(kind="allow") if is_public_path else AccessDecision(kind="redirect", location="/login")
  ```

#### D. Validación de Encabezados de Seguridad Bearer
- **Archivo:** [`backend/app/deps.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/deps.py)
- **Función:** `get_user_client(...)` (Líneas 44–47)
- **Código:**
  ```python
  scheme, _, token = authorization.partition(" ")
  if scheme.lower() != "bearer" or not token or not x_refresh_token:
      raise AuthenticationRequiredError()
  ```

---

## 2. Bucles e Iteraciones (`for`, List Comprehensions)

Los bucles `for` se utilizan para recorrer colecciones de factores de seguridad, listas de orígenes de red y suites de validación.

### Principales Ubicaciones

#### A. Limpieza de Factores TOTP Huérfanos
- **Archivo:** [`backend/app/auth/service.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/service.py)
- **Función:** `enroll_mfa(client)` (Líneas 288–297)
- **Código:**
  ```python
  for factor in all_factors:
      if getattr(factor, "status", None) != "unverified":
          continue
      try:
          await client.auth.mfa.unenroll({"factor_id": factor.id})
      except Exception:
          logger.warning(
              "[MFA Cleanup] No se pudo eliminar factor no verificado: %s",
              getattr(factor, "id", "?"),
          )
  ```
- **Propósito:** Itera sobre todos los factores asociados al usuario y des-enrola aquellos que quedaron en estado `unverified` por recargas de página o intentos previos, garantizando idempotencia.

#### B. Comprensión de Listas (List Comprehension con `for` filtrado)
- **Archivo:** [`backend/app/config.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/config.py)
- **Propiedad:** `cors_origin_list` (Líneas 33–36)
- **Código:**
  ```python
  @property
  def cors_origin_list(self) -> list[str]:
      return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
  ```
- **Propósito:** Itera sobre la cadena de texto separada por comas de la variable de entorno `CORS_ORIGINS`, aplicando saneamiento de espacios (`strip()`) y descartando entradas vacías.

#### C. Búsqueda de Mensaje en Errores de Validación de Pydantic
- **Archivo:** [`backend/app/main.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/main.py)
- **Función:** `validation_error_handler(request, exc)` (Líneas 60–67)
- **Código:**
  ```python
  errors = exc.errors()
  if errors:
      first_message = str(errors[0].get("msg", ""))
      first_message = first_message.removeprefix("Value error, ")
      if first_message:
          message = first_message
  ```

---

## 3. Tuplas (`tuple`: Inmutabilidad, Desempaquetado y Hashing)

Las tuplas son estructuras inmutables de longitud fija utilizadas para retornos de funciones, desempaquetado de cadenas de texto y conjuntos de pertenencia.

### Principales Ubicaciones

#### A. Desempaquetado de Encabezado Authorization (`str.partition`)
- **Archivo:** [`backend/app/deps.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/deps.py)
- **Función:** `get_user_client(...)` (Línea 44)
- **Código:**
  ```python
  scheme, _, token = authorization.partition(" ")
  ```
- **Propósito:** El método `.partition()` retorna una **tupla de 3 elementos** `(encabezado, separador, cola)`. Se realiza un *tuple unpacking* ignorando el separador con `_`.

#### B. Comprobación Inmutable de Claims con Tuplas
- **Archivo:** [`backend/app/core/security.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/core/security.py)
- **Función:** `decode_aal_claim(access_token)` (Líneas 23–24)
- **Código:**
  ```python
  aal = claims.get("aal")
  return aal if aal in ("aal1", "aal2") else None
  ```
- **Propósito:** Utiliza la **tupla inmutable `("aal1", "aal2")`** para validar de forma rápida en memoria que el claim de seguridad del token JWT pertenezca a los niveles válidos de aseguramiento de autenticación (Authenticator Assurance Level) sin incurrir en llamadas I/O de red.

#### C. Tuplas Inmutables de Pertenencia y Configuración
- **Archivo:** [`backend/app/auth/access_policy.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/access_policy.py) (Línea 100)
  ```python
  if input.pathname in ("/", "/login"):
  ```
- **Archivo:** [`backend/app/config.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/config.py) (Línea 23)
  ```python
  model_config = SettingsConfigDict(
      env_file=(".env", ".env.local"),  # Tupla inmutable de orden de carga de entornos
      case_sensitive=False,
  )
  ```

---

## 4. Colas (`Queue` / FIFO — First In, First Out)

Las colas garantizan que los eventos se procesen en estricto orden cronológico sin saturar los recursos ni bloquear peticiones críticas.

### Principales Ubicaciones

#### A. Patrón Transactional Outbox (Cola Persistente de Notificaciones de Bloqueo)
- **Archivo:** [`backend/app/auth/login_attempts.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/login_attempts.py)
- **Función:** `enqueue_lockout_notification(self, identifier)` (Líneas 86–91)
- **Código:**
  ```python
  async def enqueue_lockout_notification(self, identifier: str) -> None:
      await self._rpc(
          "enqueue_login_lockout_notification",
          {"p_target_email": identifier.strip().lower()},
          "encolar la notificación de bloqueo",
      )
  ```
- **Mecanismo Subyacente en Base de Datos (Cola FIFO):**
  - **Archivo:** [`supabase/migrations/013_fix_security_foundation.sql`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/supabase/migrations/013_fix_security_foundation.sql) (Líneas 549–601)
  - **Función RPC:** `public.enqueue_login_lockout_notification`
  - **Tabla Outbox:** `private.security_notification_outbox`
  - **Comportamiento FIFO:** Cuando una cuenta sufre un bloqueo de fuerza bruta (5 intentos fallidos), la función inserta un registro en la tabla cola `security_notification_outbox` con `status='pending'` y marca temporal `created_at`.
  - Los workers en segundo plano consumen los mensajes de esta cola en orden FIFO (`ORDER BY created_at ASC`), desacoplando el envío de correos electrónicos externos del ciclo de vida de la petición HTTP.

#### B. Cola de Tareas Asíncronas del Event Loop (`asyncio`)
- **Implementación:** Runtime de FastAPI / Uvicorn.
- **Comportamiento:** Cada petición concurrente (`POST /auth/login`, `POST /mfa/verify-setup`) genera una corrutina que el bucle de eventos (`asyncio`) coloca en su **cola de tareas pendientes (Ready Queue)**. Las tareas se despachan en orden FIFO a medida que se liberan los sockets de I/O de red con Supabase.

---

## 5. Pilas (`Stack` / LIFO — Last In, First Out)

Las pilas gestionan contextos anidados, capas de middleware y resolución de errores.

### Principales Ubicaciones

#### A. Pila de Middlewares de FastAPI / Starlette (Middleware Stack)
- **Archivo:** [`backend/app/main.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/main.py) (Líneas 30–36)
- **Código:**
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=settings.cors_origin_list,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **Comportamiento LIFO:**
  1. Las peticiones HTTP entrantes viajan **hacia abajo** en la pila: Middleware de Logging → CORS Middleware → Router.
  2. Las respuestas HTTP viajan **hacia arriba** en orden inverso LIFO (el último middleware en ser alcanzado por la petición es el primero en procesar la respuesta saliente).

#### B. Call Stack y Desapilado de Excepciones (*Stack Unwinding* LIFO)
- **Archivo:** [`backend/app/main.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/main.py) (Líneas 49–78)
- **Archivo:** [`backend/app/core/errors.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/core/errors.py)
- **Código:**
  ```python
  @app.exception_handler(DentalClinicError)
  async def domain_error_handler(_: Request, exc: DentalClinicError) -> JSONResponse:
      return _error_payload(exc.code, exc.message, exc.status_code)
  ```
- **Comportamiento LIFO:**
  Cuando en `service.py` se ejecuta `raise InvalidMfaCodeError(...)`, Python suspende la ejecución y desapila los marcos de activación de la llamada (*call stack frames*) desde el más profundo (`verify_mfa_setup` -> `verify_setup_endpoint` -> `FastAPI router` -> `exception_handler`) buscando en orden LIFO el manejador de excepciones activo más cercano.

#### C. Encadenamiento de Pila de Excepciones (`raise ... from exc`)
- **Archivo:** [`backend/app/auth/login_attempts.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/login_attempts.py) (Línea 45)
- **Código:**
  ```python
  try:
      result = await self._admin.rpc(function_name, parameters).execute()
  except Exception as exc:
      raise LoginAttemptStoreError(f"No se pudo {operation}") from exc
  ```
- **Propósito:** Almacena la causa original en `__cause__`, permitiendo inspeccionar la pila de llamadas anterior sin romper la abstracción hacia las capas superiores.

---

## Resumen Matricial

| Estructura / Control | Archivo Principal | Función / Uso | Rol en el Sistema |
| :--- | :--- | :--- | :--- |
| **Condicionales (`if/elif`)** | [`backend/app/auth/service.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/service.py) | `login()`, `enroll_mfa()` | Bloqueo por fuerza bruta, validación de estado activo y ruteo a MFA |
| **Bucles `for`** | [`backend/app/auth/service.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/service.py) | `enroll_mfa()` | Iteración y limpieza de factores huérfanos `unverified` |
| **List Comprehensions** | [`backend/app/config.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/config.py) | `cors_origin_list` | Parseo, saneamiento e iteración de dominios CORS |
| **Tuplas (`tuple`)** | [`backend/app/deps.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/deps.py) | `get_user_client()` | Desempaquetado de `authorization.partition(" ")` `(scheme, sep, token)` |
| **Tuplas de Validación** | [`backend/app/core/security.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/core/security.py) | `decode_aal_claim()` | Validación de claims de seguridad con `("aal1", "aal2")` |
| **Colas (FIFO)** | [`backend/app/auth/login_attempts.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/auth/login_attempts.py) | `enqueue_lockout_notification()` | Cola Transactional Outbox en PostgreSQL para procesar alertas |
| **Pilas (LIFO)** | [`backend/app/main.py`](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/backend/app/main.py) | `app.add_middleware()`, Handlers | Pila de Middlewares HTTP y desapilado de Call Stack en excepciones |
