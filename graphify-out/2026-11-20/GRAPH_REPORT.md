# Graph Report - DENTAL CLINIC  (2026-11-20)

## Corpus Check
- 186 files · ~112,923 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 5, .example 2, .kiro 1)

## Summary
- 1390 nodes · 3691 edges · 81 communities (66 shown, 15 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 215 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6974caf4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Estructuras de Datos y Control de Flujo en el Backend Python
- service.py
- appointments.actions.ts
- test_auth_service.py
- patients-client.tsx
- consultorios-client.tsx
- status-client.tsx
- 6.1 Esquema `public` (Tablas de Negocio)
- clinical.actions.ts
- patients.actions.ts
- Button
- login_attempts.py
- types/domain.ts
- verify_mfa_setup
- scripts
- login
- AppointmentsClient
- odontogram.actions.ts
- 🦷 Dental Clinic SaaS
- Components and Interfaces
- router.py
- @vitejs/plugin-react
- access-policy.ts
- test_api_contract.py
- admin-clinics.actions.ts
- appointments-client.tsx
- proxy.ts
- clinic.actions.ts
- 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice
- jwt-claims.property.test.ts
- HistoryClient
- seed-users.mjs
- config.py
- Políticas RLS
- Clinic
- UserRole
- Clinical Workspaces and Platform Administration Design
- AuditLogEntry
- Principales Ubicaciones
- Principales Ubicaciones
- Data Models
- dashboard-actions.test.ts
- Clinical Workspaces and Platform Administration
- auth-api.ts
- package.json
- Manejo de Errores y Conectividad
- setup-mfa/layout.tsx
- verify-mfa/layout.tsx
- BiologicalSex
- Clinical Workspaces and Platform Administration Tasks
- rollout.md
- main.py
- Correctness Properties
- app/layout.tsx
- test_auth_service.py
- auth.actions.ts
- compilerOptions
- decide_access
- DentalClinicError
- Documento de Diseño Técnico: Dental Clinic SaaS
- Requirements
- Esquema PostgreSQL Completo
- service.ts
- 6.1 Esquema `public` (Tablas de Negocio)
- users.actions.ts
- devDependencies
- password-validation.property.test.ts
- deps.py
- dependencies
- Dental Clinic SaaS — Agent Configuration
- ADR-001: Contexto de autorización, MFA y RLS
- Categorías de Pruebas
- Implementation Plan: Dental Clinic SaaS
- run_migrations.sh
- next
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `DentalClinicError` - 84 edges
2. `createClient()` - 66 edges
3. `withErrorHandling()` - 61 edges
4. `requireRole()` - 54 edges
5. `Button` - 53 edges
6. `cn()` - 50 edges
7. `next` - 41 edges
8. `react` - 36 edges
9. `Tasks` - 36 edges
10. `PageHeader()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `4.3 Módulo 3: Gestión de Pacientes` --references--> `UniqueDocumentError`  [INFERRED]
  .kiro/PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `4.3 Módulo 3: Gestión de Pacientes` --references--> `UniqueDocumentError`  [INFERRED]
  PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones` --references--> `AppointmentConflictError`  [INFERRED]
  PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `4.5 Módulo 5: Historia Clínica y Entradas Odontológicas` --references--> `ConcurrencyConflictError`  [INFERRED]
  .kiro/PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `4.5 Módulo 5: Historia Clínica y Entradas Odontológicas` --references--> `ConcurrencyConflictError`  [INFERRED]
  PROJECT_CONTEXT_FULL.md → errors/domain.ts

## Import Cycles
- None detected.

## Communities (81 total, 15 thin omitted)

### Community 0 - "Estructuras de Datos y Control de Flujo en el Backend Python"
Cohesion: 0.12
Nodes (16): 1. Condicionales (`if`, `elif`, `else` y Expresiones Ternarias), 4. Colas (`Queue` / FIFO — First In, First Out), 5. Pilas (`Stack` / LIFO — Last In, First Out), A. Control de Fuerza Bruta y Roles Clínicos, A. Patrón Transactional Outbox (Cola Persistente de Notificaciones de Bloqueo), A. Pila de Middlewares de FastAPI / Starlette (Middleware Stack), B. Call Stack y Desapilado de Excepciones (*Stack Unwinding* LIFO), B. Cola de Tareas Asíncronas del Event Loop (`asyncio`) (+8 more)

### Community 1 - "service.py"
Cohesion: 0.12
Nodes (15): enroll_mfa(), EnrollResult, _is_valid_profile(), _require_clinical_user(), AccountInactiveError, AccountLockedError, AuthenticationRequiredError, AuthProfileUnavailableError (+7 more)

### Community 2 - "appointments.actions.ts"
Cohesion: 0.17
Nodes (13): AppointmentConflictError, 4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones, 9.6 Fase 5: Agendamiento de Citas y Resolución de Conflictos Horarios, appointmentSchema, calculateSuggestedSlots(), CancelAppointmentInput, cancelSchema, createAppointmentAction() (+5 more)

### Community 3 - "test_auth_service.py"
Cohesion: 0.09
Nodes (8): verify_mfa_login(), FakeAuth, FakeClient, FakeMfa, FakeQuery, _jwt_with_aal(), TestVerifyMfaLogin, TestVerifyMfaSetup

### Community 4 - "patients-client.tsx"
Cohesion: 0.13
Nodes (36): ACTION_LABELS, AuditClient(), clearFilters(), handleEntityTypeChange(), handleResultChange(), refresh(), ENTITY_TYPE_LABELS, formatTimestamp() (+28 more)

### Community 5 - "consultorios-client.tsx"
Cohesion: 0.14
Nodes (34): ClinicConfigClient(), handleSubmit(), resetForm(), ClinicConfigPage(), ClinicFormState, clinicToForm(), ConsultoriosClient(), applyDetail() (+26 more)

### Community 6 - "status-client.tsx"
Cohesion: 0.12
Nodes (23): AppointmentsPage(), metadata, todayRangeIso(), STATUS_LABELS, STATUS_ORDER, StatusReportClient(), runReport(), StatusReportClientProps (+15 more)

### Community 7 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.04
Nodes (44): 10. `public.audit_logs`, 1. `public.clinics`, 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 2. `public.users`, 3. `public.patients` (+36 more)

### Community 8 - "clinical.actions.ts"
Cohesion: 0.07
Nodes (31): ConcurrencyConflictError, 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, 9.1 Actores y Roles Participantes, 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding), 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA, 9.7 Fase 6: Atención Odontológica, Odontograma e Inmutabilidad Médica (+23 more)

### Community 9 - "patients.actions.ts"
Cohesion: 0.20
Nodes (11): handleSave(), UniqueDocumentError, 9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica, BIOLOGICAL_SEXES, createPatientAction(), DOCUMENT_TYPES, PatientInput, patientSchema (+3 more)

### Community 10 - "Button"
Cohesion: 0.12
Nodes (23): CreatedClinic, EMPTY_FORM, FormState, CreateClinicUserForm(), handleBlur(), handleSubmit(), FieldErrors, ROLE_HINTS (+15 more)

### Community 11 - "login_attempts.py"
Cohesion: 0.15
Nodes (5): _first_row(), LoginAttemptStore, LoginAttemptStoreError, decode_aal_claim(), hash_login_identifier()

### Community 12 - "types/domain.ts"
Cohesion: 0.19
Nodes (21): ENTRY_FORM_TYPES, ENTRY_TYPE_LABELS, ENTRY_TYPE_VARIANTS, formatDate(), HistoryClientProps, OdontogramClientProps, PatientsClientProps, EntryAttachment (+13 more)

### Community 13 - "verify_mfa_setup"
Cohesion: 0.14
Nodes (10): cancel_mfa(), _confirm_aal2(), _fail_mfa(), logout(), MfaVerifyResult, reset_mfa(), SessionTokens, _sign_out_or_raise() (+2 more)

### Community 14 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, seed:users, start, test, test:db (+1 more)

### Community 15 - "login"
Cohesion: 0.23
Nodes (6): FailedAttemptStatus, LockoutStatus, login(), LoginResult, FakeAttemptStore, TestLogin

### Community 16 - "AppointmentsClient"
Cohesion: 0.18
Nodes (15): AppointmentsClient(), applySuggestedSlot(), goToday(), handleCreate(), handleReschedule(), loadDay(), navigate(), openCreate() (+7 more)

### Community 17 - "odontogram.actions.ts"
Cohesion: 0.09
Nodes (27): POST(), signedUrlRequestSchema, AgendaAppointment, SurfaceSelection, auditFiltersSchema, DashboardStats, DashboardTodayAppointment, CreateCustomStatusInput (+19 more)

### Community 18 - "🦷 Dental Clinic SaaS"
Cohesion: 0.05
Nodes (41): 1. Clonar el repositorio y configurar variables de entorno, 🏢 1. Gestión de Consultorios (Multitenencia), 1. Pruebas Frontend en TypeScript (Vitest - 74 pruebas), 2. Configurar y levantar el Microservicio Python (Backend), 👥 2. Gestión de Usuarios y Roles, 2. Pruebas Backend en Python (Pytest - 32 pruebas), 🔐 3. Autenticación y Control de Sesiones, 3. Configurar y levantar la aplicación Next.js (Frontend) (+33 more)

### Community 19 - "Components and Interfaces"
Cohesion: 0.40
Nodes (5): Components and Interfaces, Diseño del Odontograma SVG, Estrategia Server Actions vs Route Handlers, Estructura de Componentes Principales, Interfaces TypeScript Principales

### Community 20 - "router.py"
Cohesion: 0.31
Nodes (9): cancel_endpoint(), enroll_endpoint(), login_endpoint(), logout_endpoint(), _ok(), reset_endpoint(), _session_payload(), verify_login_endpoint() (+1 more)

### Community 22 - "access-policy.ts"
Cohesion: 0.17
Nodes (14): AccessDecision, AccessInput, AuthenticationErrorLike, AuthenticatorAssuranceLevel, clinicalMfaDestination(), decideAccess(), isClinicalRole(), isRoleAllowedForPath() (+6 more)

### Community 23 - "test_api_contract.py"
Cohesion: 0.16
Nodes (3): _AuthWithoutSession, _client_without_session(), test_verify_setup_acepta_factor_id_en_camel_case_como_el_frontend()

### Community 25 - "admin-clinics.actions.ts"
Cohesion: 0.12
Nodes (23): handleCreateUser(), handleUserUpdate(), clinicDataSchema, clinicIdSchema, createClinicUserAction(), CreateClinicUserInput, createClinicUserSchema, getAdminClinicDetailAction() (+15 more)

### Community 26 - "appointments-client.tsx"
Cohesion: 0.11
Nodes (20): STATUS_BADGE, STATUS_LABELS, SuggestedSlot, FdiToothCode, LOWER_ROW, rectPath(), STANDARD_STATUSES, SURFACE_LABELS (+12 more)

### Community 27 - "proxy.ts"
Cohesion: 0.21
Nodes (13): isUnauthenticatedError(), AUTH_CONTEXT_HEADERS, buildVerifiedRequestHeaders(), stripUntrustedAuthHeaders(), config, copyResponseCookies(), createRedirect(), isUserRole() (+5 more)

### Community 28 - "clinic.actions.ts"
Cohesion: 0.21
Nodes (10): handleSubmit(), save(), createClinicAction(), CreateClinicInput, createClinicSchema, UpdateClinicInput, updateClinicSchema, requirePlatformAccess() (+2 more)

### Community 29 - "🦷 Dental Clinic SaaS — Python Auth & MFA Microservice"
Cohesion: 0.22
Nodes (8): 1. Autenticación (`/auth`), 2. Autenticación Multifactor TOTP (`/mfa`), 3. Salud y Diagnóstico (`/health`), 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice, 📋 Endpoints de la API, ⚙️ Estructura del Microservicio, 🚀 Instalación y Ejecución, 🧪 Pruebas Automatizadas

### Community 30 - "jwt-claims.property.test.ts"
Cohesion: 0.29
Nodes (4): activeUserArb, roleArb, uuidArb, JWTClaims

### Community 31 - "HistoryClient"
Cohesion: 0.29
Nodes (10): HistoryClient(), closeEntryModal(), handleSaveEntry(), patientAge(), OdontogramClient(), closeEditor(), handleSave(), openEditor() (+2 more)

### Community 32 - "seed-users.mjs"
Cohesion: 0.22
Nodes (7): @supabase/supabase-js, admin, envPath, getTargetClinic(), main(), SEED_USERS, migrationPath

### Community 34 - "Políticas RLS"
Cohesion: 0.22
Nodes (9): `appointments`, `audit_logs` (inmutables), `clinical_entries` (inmutables), `clinical_records`, `clinics`, `odontogram_states` (inmutables — append only), `patients`, Políticas RLS (+1 more)

### Community 35 - "Clinic"
Cohesion: 0.29
Nodes (8): ClinicConfigClientProps, ConsultoriosClientProps, CreateClinicUserFormProps, CreatedUser, UsersClientProps, AdminClinicDetail, Clinic, UserProfile

### Community 36 - "UserRole"
Cohesion: 0.29
Nodes (7): AppointmentsClientProps, UserFormState, FormState, LoginResult, AccessProfile, VerifiedClaims, UserRole

### Community 37 - "Clinical Workspaces and Platform Administration Design"
Cohesion: 0.29
Nodes (6): ADR-001 — Documents independent of clinical notes, ADR-002 — Separate platform authorization, Clinical Workspaces and Platform Administration Design, Current behavior and proposed experience, Module layout, Proposed contracts and data

### Community 38 - "AuditLogEntry"
Cohesion: 0.50
Nodes (5): AuditClientProps, AuditLogEntry, AuditLogFilters, AuditEntityType, AuditResult

### Community 39 - "Principales Ubicaciones"
Cohesion: 0.40
Nodes (5): 2. Bucles e Iteraciones (`for`, List Comprehensions), A. Limpieza de Factores TOTP Huérfanos, B. Comprensión de Listas (List Comprehension con `for` filtrado), C. Búsqueda de Mensaje en Errores de Validación de Pydantic, Principales Ubicaciones

### Community 40 - "Principales Ubicaciones"
Cohesion: 0.40
Nodes (5): 3. Tuplas (`tuple`: Inmutabilidad, Desempaquetado y Hashing), A. Desempaquetado de Encabezado Authorization (`str.partition`), B. Comprobación Inmutable de Claims con Tuplas, C. Tuplas Inmutables de Pertenencia y Configuración, Principales Ubicaciones

### Community 41 - "Data Models"
Cohesion: 0.40
Nodes (5): Data Models, Diagrama Entidad-Relación, Estructura de Buckets, Políticas de Storage, Supabase Storage

### Community 43 - "Clinical Workspaces and Platform Administration"
Cohesion: 0.50
Nodes (3): Acceptance criteria, Clinical Workspaces and Platform Administration, Proposed business rules to approve

### Community 44 - "auth-api.ts"
Cohesion: 0.07
Nodes (43): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+35 more)

### Community 45 - "package.json"
Cohesion: 0.12
Nodes (16): eslintConfig, name, private, version, clsx, eslint, eslint-config-next, react-dom (+8 more)

### Community 46 - "Manejo de Errores y Conectividad"
Cohesion: 0.50
Nodes (4): Clasificación de Errores, Control de Concurrencia Optimista, Detección de Conectividad, Manejo de Errores y Conectividad

### Community 49 - "BiologicalSex"
Cohesion: 0.67
Nodes (3): FormState, BiologicalSex, DocumentType

### Community 73 - "main.py"
Cohesion: 0.16
Nodes (5): domain_error_handler(), _error_payload(), health(), unhandled_error_handler(), validation_error_handler()

### Community 85 - "Correctness Properties"
Cohesion: 0.07
Nodes (27): Correctness Properties, Property 10: Unicidad de Historia Clínica por Paciente, Property 11: Inmutabilidad de Registros Clínicos y de Auditoría, Property 12: Trazabilidad de Correcciones Clínicas, Property 13: Ordenamiento Cronológico de la Historia Clínica, Property 14: Validación de Archivos Adjuntos, Property 15: Control de Concurrencia Optimista, Property 16: Inmutabilidad del Historial del Odontograma (Append-Only) (+19 more)

### Community 125 - "test_auth_service.py"
Cohesion: 0.12
Nodes (7): LoginRequest, _validate_totp_code(), VerifyLoginRequest, VerifySetupRequest, FakePostgrest, TestBoundaryValidation, TestEnrollMfa

### Community 168 - "auth.actions.ts"
Cohesion: 0.11
Nodes (22): AccountLockedError, ImmutableRecordError, InvalidCredentialsError, RoleAuthorizationError, TenantIsolationError, cancelMfaAction(), createPersistentAttemptStore(), enrollMfaAction() (+14 more)

### Community 184 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 203 - "decide_access"
Cohesion: 0.21
Nodes (6): AccessDecision, AccessInput, AccessProfile, _clinical_mfa_destination(), decide_access(), TestDecideAccess

### Community 204 - "DentalClinicError"
Cohesion: 0.19
Nodes (40): handleCancel(), refreshHistory(), ClinicalHistoryPage(), metadata, handleToggleActive(), refreshUsers(), DentalClinicError, ReportRangeLimitError (+32 more)

### Community 228 - "Documento de Diseño Técnico: Dental Clinic SaaS"
Cohesion: 0.13
Nodes (14): Architecture, Decisiones de Arquitectura Clave, Diagrama de Componentes, Diagrama de Flujo de Solicitud, Documento de Diseño Técnico: Dental Clinic SaaS, Error Handling, Estructura de Rutas (Next.js App Router), Flujo de Manejo de Errores en el Cliente (+6 more)

### Community 229 - "Requirements"
Cohesion: 0.08
Nodes (24): Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación (+16 more)

### Community 300 - "Esquema PostgreSQL Completo"
Cohesion: 0.17
Nodes (12): Esquema PostgreSQL Completo, Función de Trigger `updated_at`, Tabla: `appointments` (Citas), Tabla: `audit_logs` (Registros de Auditoría — inmutables), Tabla: `clinical_attachments` (Adjuntos de Entradas Clínicas), Tabla: `clinical_entries` (Entradas Clínicas — inmutables), Tabla: `clinical_records` (Historias Clínicas — cabecera), Tabla: `clinics` (Consultorios) (+4 more)

### Community 301 - "service.ts"
Cohesion: 0.09
Nodes (31): GET(), POST(), reportRequest, POST(), ClinicalDocuments(), previewReport(), submit(), FailedAttemptRow (+23 more)

### Community 342 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.04
Nodes (45): 10. `public.audit_logs`, 1. `public.clinics`, 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 2. `public.users`, 3. `public.patients` (+37 more)

### Community 343 - "users.actions.ts"
Cohesion: 0.20
Nodes (9): handleSubmit(), 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC), createUserAction(), CreateUserInput, createUserSchema, UpdateUserInput, updateUserSchema, 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC) (+1 more)

### Community 396 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, fast-check, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+4 more)

### Community 448 - "password-validation.property.test.ts"
Cohesion: 0.11
Nodes (15): PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), createSecurityHeaders(), nextConfig, securityHeaders, fast-check, alphanumericArb (+7 more)

### Community 450 - "deps.py"
Cohesion: 0.32
Nodes (8): get_settings(), AuthConfigurationUnavailableError, get_admin_client(), get_anon_client(), get_user_client(), Resumen Matricial, 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA), 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA)

### Community 505 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, clsx, lucide-react, next, pdf-lib, react, react-dom, @supabase/ssr (+4 more)

### Community 508 - "Dental Clinic SaaS — Agent Configuration"
Cohesion: 0.22
Nodes (8): Dental Clinic SaaS — Agent Configuration, Invocation Rule, Key Architectural Principles, Mandatory Default Skills (Frontend / UI / UX), Project Context Reference, Project Overview, Python Auth API (`backend/`), Technology Stack

### Community 548 - "ADR-001: Contexto de autorización, MFA y RLS"
Cohesion: 0.22
Nodes (8): ADR-001: Contexto de autorización, MFA y RLS, Consecuencias, Contexto, Criterios de regresión, Decisión, Estado, Opciones consideradas, Referencias

### Community 549 - "Categorías de Pruebas"
Cohesion: 0.22
Nodes (9): 1. Pruebas de Propiedades (Property-Based Tests) — `fast-check`, 2. Pruebas de Ejemplo (Unit Tests) — Vitest, 3. Pruebas de Integración — Supabase local (docker), 4. Pruebas de Humo (Smoke Tests), Categorías de Pruebas, Configuración de fast-check, Enfoque Dual, Estrategia de Mocks para Supabase (+1 more)

### Community 634 - "Implementation Plan: Dental Clinic SaaS"
Cohesion: 0.40
Nodes (4): Implementation Plan: Dental Clinic SaaS, Notes, Overview, Task Dependency Graph

### Community 722 - "next"
Cohesion: 0.10
Nodes (25): dynamic, LoginLayout(), metadata, AuditPage(), metadata, CreateClinicForm(), CreateClinicPage(), metadata (+17 more)

## Knowledge Gaps
- **8 isolated node(s):** `react-dom`, `tw-animate-css`, `@tailwindcss/postcss`, `@types/node`, `@types/react` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 596 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tasks` connect `DentalClinicError` to `appointments.actions.ts`, `UserRole`, `clinical.actions.ts`, `auth.actions.ts`, `patients.actions.ts`, `auth-api.ts`, `types/domain.ts`, `odontogram.actions.ts`, `users.actions.ts`, `admin-clinics.actions.ts`, `Implementation Plan: Dental Clinic SaaS`, `test_auth_service.py`, `jwt-claims.property.test.ts`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `withErrorHandling()` (e.g. with `5. Requisitos No Funcionales y Arquitectura de Seguridad` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`withErrorHandling()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react-dom`, `tw-animate-css`, `@tailwindcss/postcss` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Estructuras de Datos y Control de Flujo en el Backend Python` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `ServerActionResult` connect `odontogram.actions.ts` to `deps.py`, `appointments.actions.ts`, `auth.actions.ts`, `clinical.actions.ts`, `patients.actions.ts`, `clinic.actions.ts`, `users.actions.ts`, `admin-clinics.actions.ts`, `Dental Clinic SaaS — Agent Configuration`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `requireRole()` (e.g. with `Subdirectorios de Seguridad, Auditoría y Supabase` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`requireRole()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._