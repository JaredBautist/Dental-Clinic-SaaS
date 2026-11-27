# Dental Clinic SaaS — Documentación técnica / Technical documentation

**Edición / Edition:** 27 de noviembre de 2026 · revisión del código / source revision `83faa3e`.

**ES.** Dental Clinic permite a recepción registrar pacientes y organizar citas, al odontólogo documentar la atención y al administrador gestionar el personal. Un operador de plataforma puede administrar varios consultorios. Para entender el recorrido de un dato hay que distinguir tres lugares de ejecución: FastAPI autentica, Next.js presenta la interfaz y ejecuta las operaciones clínicas en el servidor, y Supabase conserva identidades, filas y archivos.

**EN.** Dental Clinic lets reception staff register patients and schedule appointments, dentists document care, and administrators manage staff. A platform operator can administer multiple clinics. A request can cross three execution boundaries: FastAPI handles authentication, Next.js renders the interface and runs clinical operations on the server, and Supabase stores identities, relational data and files.

| Contenido / Contents | Pregunta que responde / Question answered |
|---|---|
| [1. Backend](#backend) | ¿Qué ejecuta Python y qué devuelve? / What does Python run and return? |
| [2. Temas estudiados / Course topics](#topics) | ¿Dónde se aplica cada concepto? / Where is each concept applied? |
| [3. Frontend](#frontend) | ¿Cómo pasa una acción de pantalla al servidor? / How does a screen action reach the server? |
| [4. Supabase](#supabase) | ¿Dónde se guardan y protegen los datos? / Where is data stored and protected? |
| [5. Flujos / Workflows](#flows) | ¿Cómo se relacionan los módulos en un caso real? / How do modules work together? |
| [6. Operación y pruebas / Operations and tests](#ops) | ¿Cómo se ejecuta y qué se puede verificar? / How do you run and verify it? |

<a id="backend"></a>

## 1. Backend Python — FastAPI, autenticación y MFA / Authentication and MFA

### 1.1 De la petición al servicio / From request to service

| Componente / Component | Español | English |
|---|---|---|
| [main.py](backend/app/main.py) | Crea la aplicación FastAPI, instala CORS con orígenes configurados, registra rutas y traduce excepciones a HTTP. | Constructs the FastAPI app, configures allowed CORS origins, mounts routes and translates exceptions into HTTP responses. |
| [config.py](backend/app/config.py) | `Settings` carga configuración con Pydantic Settings. `get_settings` reutiliza la configuración mediante caché. | `Settings` loads configuration through Pydantic Settings. `get_settings` caches the settings object. |
| [deps.py](backend/app/deps.py) | Las dependencias construyen clientes asíncronos anónimos, de usuario o administrativos. `get_user_client` reconstruye la sesión y pasa el JWT a PostgREST para que se apliquen las políticas del usuario. | Dependencies construct anonymous, user-scoped or administrative async clients. `get_user_client` restores the session and supplies the JWT to PostgREST so user policies apply. |
| [schemas.py](backend/app/auth/schemas.py) y [router.py](backend/app/auth/router.py) | Los modelos validan correo, longitud y código TOTP de seis dígitos. El router recibe JSON, resuelve dependencias, llama al servicio y adapta los resultados a campos como `redirectTo`. | Models validate email, length and six-digit TOTP codes. The router accepts JSON, resolves dependencies, calls the service and maps results to fields such as `redirectTo`. |
| [service.py](backend/app/auth/service.py) | Orquesta login, cierre y ciclo de vida de MFA. Las clases de resultado transportan sesión, identidad del usuario y destino de navegación. | Orchestrates login, logout and MFA lifecycle. Result classes carry session tokens, user identity and navigation decisions. |
| [login_attempts.py](backend/app/auth/login_attempts.py) y [security.py](backend/app/core/security.py) | `LoginAttemptStore` adapta llamadas a funciones PostgreSQL. El identificador de intento se normaliza y resume mediante hash. La lectura del claim `aal` interpreta el token devuelto por el proveedor. | `LoginAttemptStore` adapts calls to PostgreSQL functions. The login identifier is normalized and hashed. The AAL reader interprets the token returned by the provider. |
| [errors.py](backend/app/core/errors.py) | Las excepciones de dominio distinguen credenciales inválidas, bloqueo, errores de MFA y errores de infraestructura. | Domain exceptions distinguish invalid credentials, lockout, MFA failures and infrastructure errors. |

**ES — Un inicio de sesión.** El navegador envía correo y contraseña a FastAPI. Antes de intentar autenticar, `login` consulta el bloqueo persistente. Si Supabase rechaza las credenciales, se registra el fallo. El umbral de cinco intentos dispara un bloqueo de 15 minutos y se intenta encolar una notificación. Con credenciales válidas se consulta el perfil en `public.users`, se comprueban rol, consultorio y estado activo, y se limpian los intentos en el flujo exitoso. Recepción continúa al dashboard. Administradores y odontólogos pasan por configuración o verificación TOTP según su perfil. El adaptador del navegador sincroniza la sesión recibida con el cliente Supabase. [Servicio](backend/app/auth/service.py) · [RPC de bloqueo](supabase/migrations/013_fix_security_foundation.sql) · [Cliente web](lib/api/auth-api.ts)

**EN — One sign-in.** The browser posts email and password to FastAPI. Before authenticating, `login` checks persistent lockout state. A rejected credential attempt records a failure. The five-attempt threshold triggers a 15-minute lockout and an attempt to enqueue a notification. After successful authentication, the service reads the profile in `public.users`, checks role, clinic and active status, and clears failed attempts on the successful path. Reception proceeds to the dashboard. Administrators and dentists enroll in or verify TOTP according to their profile. The browser adapter synchronizes the returned session with the Supabase client. [Service](backend/app/auth/service.py) · [Lockout RPCs](supabase/migrations/013_fix_security_foundation.sql) · [Web client](lib/api/auth-api.ts)

### 1.2 Contrato HTTP / HTTP contract

Las rutas de sesión reciben `Authorization: Bearer <access-token>` y `X-Refresh-Token`. Los valores entre ángulos representan datos de ejecución. / Session routes take both headers. Angle-bracketed values stand for runtime data. [Dependencias / Dependencies](backend/app/deps.py)

| Método y ruta / Method and path | Entrada / Input | Resultado observable / Observable result |
|---|---|---|
| GET `/health` | Pública / Public | Devuelve / Returns `{"status":"ok"}`. Comprueba el proceso FastAPI / Checks the FastAPI process. |
| POST `/auth/login` | `email`, `password` | Identidad, rol, consultorio, sesión y próximo destino / Identity, role, clinic, session and next destination. |
| POST `/auth/logout` | Sesión / Session | Solicita el cierre al proveedor / Requests provider sign-out. |
| POST `/mfa/enroll` | Sesión clínica / Clinical-role session | Devuelve `factorId`, `qrCode`, `secret` y `uri` para configurar el autenticador / Returns enrollment material for the authenticator. |
| POST `/mfa/verify-setup` | Sesión, `factorId`, `code` | Verifica el factor, comprueba AAL2 y marca MFA en el perfil / Verifies the factor, checks AAL2 and marks MFA enabled. |
| POST `/mfa/verify-login` | Sesión, `code` | Verifica el factor TOTP existente y comprueba AAL2 / Verifies an existing TOTP factor and checks AAL2. |
| POST `/mfa/cancel` | Sesión / Session | Cancela el flujo mediante cierre de sesión / Cancels the flow by signing out. |
| POST `/mfa/reset` | Sesión clínica / Clinical-role session | Restablece el indicador del usuario e intenta retirar sus factores para un nuevo enrolamiento / Clears the user flag and attempts factor removal for re-enrollment. |

**ES.** Los endpoints de autenticación devuelven `success` y `data` en caso de éxito. Los errores transportan `success: false` y `error` con `code`, `message` y `statusCode`. Un código de cinco dígitos en `/mfa/verify-login` produce HTTP 422 por validación del cuerpo. La confirmación de AAL2 usa el JWT emitido tras verificar el factor o consulta el nivel actual al proveedor. En el restablecimiento, la eliminación de factores se intenta individualmente y puede fallar después de actualizar el perfil. [Router](backend/app/auth/router.py) · [Servicio](backend/app/auth/service.py) · [Pruebas del contrato](backend/tests/test_api_contract.py)

**EN.** Successful authentication endpoints return `success` and `data`. Failures contain `success: false` and an `error` with `code`, `message` and `statusCode`. A five-digit code on `/mfa/verify-login` yields HTTP 422 during body validation. AAL2 confirmation uses the JWT returned after verification or queries the provider for its current assurance level. During reset, individual factor removals are best effort and can fail after the profile is updated. [Router](backend/app/auth/router.py) · [Service](backend/app/auth/service.py) · [Contract tests](backend/tests/test_api_contract.py)

<a id="topics"></a>

## 2. Temas estudiados en el código / Course topics in the code

Las referencias apuntan al archivo y al símbolo para poder localizar el ejemplo aunque cambie la numeración de líneas. / Each reference identifies a file and symbol so readers can find the example after line numbers change.

| Tema / Topic | Ubicación verificable / Source | Aplicación en español | Application in English |
|---|---|---|---|
| Variables, tipos y operadores / Variables, types and operators | [service.py](backend/app/auth/service.py), `login` | Convierte segundos restantes en minutos mediante división, `math.ceil` y `max`. Así un bloqueo vigente nunca se presenta como cero minutos. | Division, `math.ceil` and `max` convert remaining seconds into minutes so an active lockout never displays as zero minutes. |
| Entrada, salida y validación / I/O and validation | [schemas.py](backend/app/auth/schemas.py), `LoginRequest`, `_validate_totp_code`; [main.py](backend/app/main.py), `validation_error_handler` | La entrada llega por JSON. Pydantic valida antes de delegar al servicio. La respuesta JSON y el estado HTTP comunican el resultado. | JSON provides input. Pydantic validates before dispatch to the service. JSON and HTTP status convey the result. |
| Condicionales y operadores lógicos / Branches and Boolean logic | [service.py](backend/app/auth/service.py), `login`, `enroll_mfa` | Un perfil inactivo exige cerrar la sesión. Una cadena QR que empieza por SVG sigue una rama de conversión diferente de un QR ya preparado. | An inactive profile triggers sign-out. Raw SVG takes a different conversion branch from an already prepared QR value. |
| Ciclo finito y `continue` / Bounded loop and `continue` | [service.py](backend/app/auth/service.py), `enroll_mfa` | Recorre factores existentes y omite los verificados durante la limpieza. Termina al agotar la colección. | Iterates existing factors, skipping verified ones during cleanup. Iteration ends when the collection is exhausted. |
| Cadenas y comprensión de listas / Strings and list comprehension | [config.py](backend/app/config.py), `Settings.cors_origin_list` | `split` separa los orígenes por comas, `strip` limpia espacios y el filtro descarta vacíos. | `split` separates comma-delimited origins, `strip` trims whitespace and the filter drops empty entries. |
| Lista, índice y longitud / List, index and length | [login_attempts.py](backend/app/auth/login_attempts.py), `_first_row` | Comprueba forma y cardinalidad de la respuesta RPC antes de leer `data[0]`. Una respuesta inesperada produce un error del adaptador. | Checks RPC result shape and cardinality before reading `data[0]`; malformed results raise an adapter error. |
| Añadir a una lista / Appending to a list | [test_auth_service.py](backend/tests/test_auth_service.py), doble de MFA con `append` | El doble guarda los factores retirados para comprobar la limpieza. Este ejemplo pertenece a pruebas. | The test double records removed factors so the test can assert cleanup. This example runs in tests. |
| Tuplas y desempaquetado / Tuples and unpacking | [deps.py](backend/app/deps.py), `get_user_client` | `scheme, _, token = authorization.partition(" ")` separa esquema y token e ignora el separador. | Three-value unpacking extracts scheme and token while discarding the separator. |
| Diccionarios y conjuntos / Dictionaries and sets | [service.py](backend/app/auth/service.py), `_is_valid_profile`, `login`, `verify_mfa_setup` | El perfil se lee por clave. La pertenencia a `CLINICAL_ROLES` determina el flujo MFA. Un diccionario expresa el cambio de `mfa_enabled`. | The profile is read by key. Membership in `CLINICAL_ROLES` selects the MFA flow. A dictionary expresses the flag update. |
| Funciones, parámetros y procedimientos / Functions, arguments and procedures | [service.py](backend/app/auth/service.py), `login`, `logout`, `_sign_out_or_raise` | `login` recibe dependencias y devuelve `LoginResult`; el cierre produce un efecto y propaga el fallo si el proveedor lo rechaza. | `login` takes dependencies and returns a `LoginResult`; sign-out performs an effect and propagates provider failure. |
| Clases y encapsulación / Classes and encapsulation | [login_attempts.py](backend/app/auth/login_attempts.py), `LoginAttemptStore`, `LockoutStatus`; [errors.py](backend/app/core/errors.py) | El adaptador encapsula el transporte RPC. Los objetos de estado y las excepciones nombran resultados específicos del dominio. | The adapter encapsulates RPC transport. State objects and exceptions name domain-specific outcomes. |
| Asincronía e inyección / Async I/O and dependency injection | [router.py](backend/app/auth/router.py), `login_endpoint` | `Depends` entrega los clientes; `await` espera operaciones de red. Las pruebas pueden sustituir estas dependencias. | `Depends` supplies clients; `await` waits for network I/O. Tests can substitute those dependencies. |
| Cola persistente y FIFO / Persistent queue and FIFO | [login_attempts.py](backend/app/auth/login_attempts.py), `enqueue_lockout_notification`; [migración 013](supabase/migrations/013_fix_security_foundation.sql) | Al alcanzarse el bloqueo se intenta insertar un aviso pendiente en el outbox. El repositorio demuestra el encolado; la entrega y el consumo en orden FIFO requerirían un consumidor verificable. | Lockout attempts to insert a pending outbox notification. The repository demonstrates enqueueing; delivery and FIFO consumption would require a verifiable consumer. |
| Pila y propagación LIFO / Stack and LIFO unwinding | [login_attempts.py](backend/app/auth/login_attempts.py), `_rpc`; [main.py](backend/app/main.py), `domain_error_handler` | Si falla una RPC, `raise ... from exc` conserva la causa. La excepción sale de llamadas anidadas hasta el manejador. La pila es la de ejecución de Python. | A failed RPC preserves its cause through `raise ... from exc`. The exception unwinds nested calls to a handler. The stack here is Python’s runtime call stack. |
| Búsqueda, filtrado y agregación / Lookup, filtering and aggregation | [clinic-selection.ts](lib/platform/clinic-selection.ts), `selectClinicForView`; [reports.actions.ts](lib/actions/reports.actions.ts) | Se busca el consultorio solicitado en la lista autorizada. En reportes se filtran citas por consultorio, profesional, estado y período antes del recuento. | The requested clinic is looked up in the authorized list. Reporting filters appointments by clinic, practitioner, status and date range before counting. |

<a id="frontend"></a>

## 3. Frontend y servidor web / Frontend and web server

**ES.** Next.js 16 y React 19 usan App Router y TypeScript. La portada pública vive en `app/page.tsx`. Los grupos `(auth)` y `(dashboard)` organizan rutas sin añadir segmentos a la URL. Las páginas servidor obtienen la sesión y los datos iniciales; los componentes cliente conservan estado de formularios, menús y modales. Tailwind CSS 4, componentes compartidos y Lucide dan forma al modo claro. El proxy aplica la política de acceso durante la navegación; las acciones también comprueban al actor en el servidor. [Dependencias](package.json) · [Shell](components/layout/DashboardShell.tsx) · [Proxy](proxy.ts) · [Autorización de acciones](lib/auth/require-user.ts)

**EN.** Next.js 16 and React 19 use the App Router and TypeScript. The public landing page lives at `app/page.tsx`. The `(auth)` and `(dashboard)` groups organize routes without adding URL segments. Server pages load the session and initial data; client components manage forms, menus and dialogs. Tailwind CSS 4, shared primitives and Lucide support the light interface. The proxy applies access policy during navigation; server actions independently check the actor. [Dependencies](package.json) · [Shell](components/layout/DashboardShell.tsx) · [Proxy](proxy.ts) · [Server authorization](lib/auth/require-user.ts)

| Vista / View | Español | English | Implementación / Implementation |
|---|---|---|---|
| Login y MFA | El cliente llama a FastAPI, procesa errores y sincroniza tokens antes de navegar. | The client calls FastAPI, handles errors and synchronizes tokens before navigating. | [Adaptador / Adapter](lib/api/auth-api.ts) |
| Dashboard | Recepción consulta actividad operativa; el odontólogo ve sus citas y pendientes; administración consulta personal del consultorio. | Reception sees operational activity, dentists see their appointments and pending work, and administrators see clinic staffing. | [Página / Page](app/%28dashboard%29/dashboard/page.tsx) · [Consultas / Queries](lib/actions/dashboard.actions.ts) |
| Consultorios, Usuarios y Plataforma | El selector conserva el consultorio en la URL de las cuatro vistas compatibles. En Auditoría y Configuración abre la ficha elegida. El operador con MFA puede editar credenciales; perfil y credenciales tienen guardados independientes. | The selector carries the clinic in the URL on four supported screens. From Audit or Settings it opens the chosen clinic detail. An MFA-authorized operator can edit credentials; profile and credential saves are independent. | [Selección / Selection](lib/platform/clinic-selection.ts) · [Editor](components/users/platform-user-editor.tsx) · [Credenciales / Credentials](lib/platform/user-credentials.actions.ts) |
| Pacientes y citas | Recepción registra identificación, contacto y antecedentes, agenda, reprograma y cancela. El odontólogo consulta su agenda. | Reception records identity, contact and history, books appointments, reschedules and cancels. Dentists consult their schedules. | [Pacientes / Patients](lib/actions/patients.actions.ts) · [Citas / Appointments](lib/actions/appointments.actions.ts) |
| Historia y odontograma | El odontólogo añade entradas clínicas y guarda estados por pieza. Una corrección conserva la referencia a la entrada anterior. | Dentists append clinical entries and save tooth states. A correction retains a reference to the earlier entry. | [Historia / History](lib/actions/clinical.actions.ts) · [Odontograma / Odontogram](lib/actions/odontogram.actions.ts) |
| Documentos | Recepción incorpora un PDF externo. El odontólogo genera un informe del paciente que queda archivado. Para descargar, la ruta exige odontólogo con AAL2, busca el documento por ID y consultorio, y redirige a una URL firmada de 60 segundos. | Reception uploads an external PDF. A dentist generates a patient report that is archived. Download requires a dentist with AAL2, looks up the document by ID and clinic, and redirects to a 60-second signed URL. | [Rutas / Routes](app/api/clinical-documents) · [Generador / Renderer](lib/clinical-documents/render-pdf.ts) |
| Reportes y auditoría | Los reportes operativos incluyen citas completadas y distribución por estado. El odontólogo consulta su propio ámbito. «Pacientes atendidos» cuenta citas completadas; un paciente con dos citas completadas aporta dos al total. Auditoría permite consultar eventos administrativos del consultorio. | Operational reports cover completed visits and status distribution. Dentists query their own scope. “Patients attended” counts completed appointments; two completed visits by one patient contribute two. Audit exposes clinic event records to authorized administrators. | [Reportes / Reports](lib/actions/reports.actions.ts) · [Auditoría / Audit](lib/actions/audit.actions.ts) |

<a id="supabase"></a>

## 4. Supabase — identidad, modelo relacional y archivos / Identity, relational model and files

| Recurso / Resource | Español | English |
|---|---|---|
| Auth, `public.users`, `clinics` | Auth gestiona credenciales y factores. El ID del perfil corresponde a Auth. El perfil relaciona consultorio, rol, estado y MFA. | Auth manages credentials and factors. Profile ID matches Auth ID. The profile associates the clinic, role, active status and MFA flag. |
| `private.platform_operators` y suscripción | El permiso de plataforma se comprueba en servidor con `has_platform_access`. Plan, estado y fechas son datos administrativos del consultorio. El código documentado permite gestionarlos; el cobro automático queda fuera de ese flujo. | The server checks the platform grant through `has_platform_access`. Plan, status and dates are administrative clinic fields. The implemented flow manages those fields; automatic charging is outside its scope. |
| `patients`, `appointments` | El documento del paciente es único por consultorio y tipo. Una cita asocia paciente, odontólogo, intervalo y estado. Una restricción de exclusión protege los intervalos activos del profesional. | A patient document is unique within clinic and document type. An appointment links patient, dentist, interval and status. An exclusion constraint protects the practitioner's active time intervals. |
| `clinical_records`, `clinical_entries` | La cabecera lleva versión. La acción compara la versión esperada y escribe la siguiente antes de insertar la entrada. Son operaciones sucesivas: la versión por sí sola no garantiza atomicidad entre ambas escrituras. | The record header holds a version. The action checks the expected version and writes the next one before inserting the entry. These are successive calls; versioning alone does not make both writes atomic. |
| `odontogram_states`, `custom_tooth_statuses` | Guardan observaciones por pieza y las definiciones de estados propios del consultorio. | Store tooth observations and clinic-specific status definitions. |
| `clinical_attachments`, `clinical_documents` y Storage | Los adjuntos de entradas usan `clinical-files`; los PDF externos y los informes usan `patient-documents`. El catálogo conserva autor, paciente y ruta. | Entry attachments use `clinical-files`; external PDFs and patient reports use `patient-documents`. The catalog records author, patient and storage path. |
| `audit_logs`, `private.login_attempts`, `private.security_notification_outbox` | Separan trazabilidad de operaciones, contadores persistentes de acceso y avisos pendientes. | Separate operation audit trails, persistent login counters and pending notifications. |

**ES.** Las migraciones 001–010 crean el modelo inicial. Las 011–012 definen RLS y Storage; 013 refuerza las políticas y el control de acceso, 014 ajusta responsabilidades de recepción y 015 introduce plataforma, suscripciones y documentos. La regla efectiva se obtiene aplicándolas en orden. El navegador utiliza la clave pública. Los clientes administrativos de Next.js y Python manejan la clave de servicio en servidor; los flujos que usan esos privilegios deben verificar rol y pertenencia antes de consultar o modificar datos. [Migraciones](supabase/migrations) · [Acceso de plataforma](lib/platform/access.ts) · [Cliente administrativo](lib/supabase/admin.ts)

**EN.** Migrations 001–010 create the initial model. Migrations 011–012 define RLS and Storage policies; 013 hardens authorization, 014 adjusts reception ownership, and 015 introduces platform access, subscriptions and documents. Apply them in order to obtain the effective rules. The browser uses the public key. The Next.js and Python administrative clients keep the service key on the server; privileged flows must check role and membership before reading or writing data. [Migrations](supabase/migrations) · [Platform access](lib/platform/access.ts) · [Administrative client](lib/supabase/admin.ts)

<a id="flows"></a>

## 5. Dos recorridos completos / Two end-to-end workflows

**A. Adjuntar la historia recibida en recepción.** La persona de recepción abre el paciente y selecciona un PDF. La ruta valida sesión, rol, pertenencia del paciente y archivo. El servicio intenta leer el PDF, exige al menos una página y aplica un máximo de 20 MiB en el código. Calcula SHA-256, sube el objeto privado y registra el comprobante en PostgreSQL. La clave de solicitud permite recuperar el resultado si se reintenta. El límite de la infraestructura HTTP también puede intervenir antes de llegar a la validación. [Carga](app/api/clinical-documents/route.ts) · [Servicio](lib/clinical-documents/service.ts)

**A. Attaching a record received at reception.** Reception opens the patient and chooses a PDF. The route checks session, role, patient membership and file. The service parses the PDF, requires at least one page and enforces a 20 MiB application limit. It hashes the bytes with SHA-256, uploads a private object and records a receipt in PostgreSQL. A request key allows retries to recover the result. HTTP infrastructure can impose an earlier upload limit. [Upload](app/api/clinical-documents/route.ts) · [Service](lib/clinical-documents/service.ts)

**B. Cambiar de consultorio y administrar el equipo.** El operador selecciona una clínica autorizada en la barra lateral. En Usuarios cambia la URL, se resuelve el ID contra la lista autorizada y se vuelve a cargar el personal. El lápiz permite guardar nombre y rol en el perfil, o correo y contraseña en Auth. Dejar vacía la contraseña conserva la actual. La auditoría del cambio de credenciales registra qué campos cambiaron. [Página de usuarios](app/%28dashboard%29/usuarios/page.tsx) · [Acciones de personal](lib/actions/admin-clinics.actions.ts) · [Acciones de credenciales](lib/platform/user-credentials.actions.ts)

**B. Switching clinics and managing staff.** The operator selects an authorized clinic in the sidebar. On Users, the URL changes, the server resolves the ID against the authorized list and reloads staff. The edit control can save name and role to the profile or email and password to Auth. Leaving the password empty preserves the existing one. The credential audit event records which fields changed. [Users page](app/%28dashboard%29/usuarios/page.tsx) · [Staff actions](lib/actions/admin-clinics.actions.ts) · [Credential actions](lib/platform/user-credentials.actions.ts)

<a id="ops"></a>

## 6. Ejecución, despliegue y evidencia / Running, deployment and evidence

**Entorno / Environment.** Next.js usa / uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_AUTH_API_URL` y / and the server-only `SUPABASE_SERVICE_ROLE_KEY`. FastAPI usa / uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y / and `CORS_ORIGINS`. Configura el origen del frontend y las claves del entorno de prueba antes de arrancar. / Configure the frontend origin and test-project keys before starting. [Config backend](backend/app/config.py) · [Ejemplo sin secretos / Environment template](backend/.env.example) · [Config frontend](next.config.ts)

**Backend local / Local backend** — desde la raíz, en una terminal / from repository root, in one terminal:

```sh
cd backend
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend local / Local frontend** — desde la raíz, en otra terminal / from repository root, in another terminal:

```sh
npm ci
npm run dev
```

Abre / Open `http://localhost:3000`. FastAPI publica el contrato en / exposes its contract at `http://localhost:8000/openapi.json` y la interfaz interactiva en / and its interactive interface at `http://localhost:8000/docs`.

| Verificación / Check | Comando o ubicación / Command or location | Evidencia / What it establishes |
|---|---|---|
| API Python | Desde / from `backend/`: `.venv/bin/python -m pytest -q` | Casos de servicio, política y contrato HTTP con dependencias de prueba / Service, policy and HTTP contract cases with test dependencies. [Tests](backend/tests) |
| Aplicación TypeScript | `npm run test:run` | Vitest ejecuta casos unitarios, pruebas de propiedades y smoke tests del repositorio / Vitest runs repository unit, property and smoke tests. [Tests](__tests__) |
| Compilación / Build | `npm run build` y / and `npm start` | Compila Next.js y permite servir el resultado / Builds Next.js and serves the output. |
| Migraciones y seguridad SQL / SQL migrations and security | `npm run test:db`, requiere / requires Docker | Crea un PostgreSQL 15 temporal, prepara un esquema Supabase de prueba, aplica las migraciones y ejecuta aserciones SQL / Starts temporary PostgreSQL 15, bootstraps a test Supabase schema, applies migrations and runs SQL assertions. [Runner](supabase/tests/run_migrations.sh) |
| Despliegue / Deployment | Vercel para Next.js; Render para FastAPI / Vercel for Next.js; Render for FastAPI | `render.yaml` define Python 3.14.10, raíz `backend`, Uvicorn y `/health`. El frontend tiene su propio `/api/health`. Cada endpoint confirma la respuesta de su servicio; login con MFA requiere una prueba independiente. / The blueprint defines Python 3.14.10, the backend root, Uvicorn and its health path. The frontend has a separate health route. An MFA sign-in needs a separate check. [Render](render.yaml) · [Frontend health](app/api/health/route.ts) |
| Operaciones programadas / Scheduled operations | GitHub Actions y función Edge / GitHub Actions and Edge Function | El workflow diario consulta la salud de Auth. La función Edge cambia citas programadas o confirmadas a `en_curso` cuando ha llegado su hora y alguien la invoca. Su código no acredita un cron activo. / The daily workflow checks Auth health. When invoked, the Edge Function moves due scheduled or confirmed appointments to `en_curso`. Its source alone does not establish an active scheduler. [Workflow](.github/workflows/supabase-keepalive.yml) · [Edge Function](supabase/functions/auto-transition-appointments/index.ts) |

**Guía de lectura para la presentación / Presentation reading path.** En la API, sigue `login_endpoint → login → LoginAttemptStore`; en la interfaz, sigue el selector hasta la consulta de Usuarios; en SQL, abre las migraciones 013–015 para contrastar permisos y persistencia. / In the API, follow `login_endpoint → login → LoginAttemptStore`; in the UI, follow the clinic selector through to the staff query; in SQL, read migrations 013–015 to connect authorization with persistence. [Árbol navegable del código / Navigable source tree](graphify-out/GRAPH_TREE.html)
