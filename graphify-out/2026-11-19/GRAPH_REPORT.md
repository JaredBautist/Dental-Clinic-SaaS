# Graph Report - DENTAL CLINIC  (2026-11-13)

## Corpus Check
- 161 files · ~104,236 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 4, .example 2, .kiro 1)

## Summary
- 1293 nodes · 3274 edges · 77 communities (65 shown, 12 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 217 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bdce1731`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Estructuras de Datos y Control de Flujo en el Backend Python
- service.py
- appointments.actions.ts
- FakeMfa
- patients-client.tsx
- consultorios-client.tsx
- reports.actions.ts
- 6.1 Esquema `public` (Tablas de Negocio)
- users.actions.ts
- types/domain.ts
- getShellProfile
- cn
- 7.4 Directorio `types/` y `errors/`
- Button
- scripts
- login
- FakeAuth
- odontogram.actions.ts
- 🦷 Dental Clinic SaaS
- Components and Interfaces
- main.py
- @vitejs/plugin-react
- AppointmentsClient
- router.py
- admin-clinics.actions.ts
- react
- proxy.ts
- access-policy.ts
- 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice
- jwt-claims.property.test.ts
- FakeAttemptStore
- test_api_contract.py
- AuditClient
- seed-users.mjs
- Políticas RLS
- UserRole
- test_auth_service.py
- OdontogramClient
- (dashboard)/layout.tsx
- pacientes-atendidos/page.tsx
- AppointmentStatus
- Data Models
- auth-api.ts
- package.json
- Manejo de Errores y Conectividad
- deps.py
- Correctness Properties
- app/layout.tsx
- schemas.py
- require-user.ts
- auth.actions.ts
- compilerOptions
- decide_access
- withErrorHandling
- Documento de Diseño Técnico: Dental Clinic SaaS
- Requirements
- Esquema PostgreSQL Completo
- login-attempt-store.ts
- 6.1 Esquema `public` (Tablas de Negocio)
- 9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)
- devDependencies
- password-validation.property.test.ts
- dependencies
- Dental Clinic SaaS — Agent Configuration
- ADR-001: Contexto de autorización, MFA y RLS
- Categorías de Pruebas
- Implementation Plan: Dental Clinic SaaS
- Flujo de Autenticación y Manejo de Sesiones
- run_migrations.sh
- next
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `DentalClinicError` - 67 edges
2. `withErrorHandling()` - 59 edges
3. `createClient()` - 57 edges
4. `requireRole()` - 51 edges
5. `cn()` - 50 edges
6. `Tasks` - 36 edges
7. `Button` - 35 edges
8. `next` - 35 edges
9. `react` - 32 edges
10. `AppointmentsClient()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Manejo de Inactividad (30 minutos)` --references--> `SessionTimer()`  [INFERRED]
  .kiro/specs/dental-clinic-saas/design.md → components/session/SessionTimer.tsx
- `4.3 Módulo 3: Gestión de Pacientes` --references--> `UniqueDocumentError`  [INFERRED]
  .kiro/PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `4.3 Módulo 3: Gestión de Pacientes` --references--> `UniqueDocumentError`  [INFERRED]
  PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones` --references--> `AppointmentConflictError`  [INFERRED]
  .kiro/PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones` --references--> `AppointmentConflictError`  [INFERRED]
  PROJECT_CONTEXT_FULL.md → errors/domain.ts

## Import Cycles
- None detected.

## Communities (77 total, 12 thin omitted)

### Community 0 - "Estructuras de Datos y Control de Flujo en el Backend Python"
Cohesion: 0.07
Nodes (26): 1. Condicionales (`if`, `elif`, `else` y Expresiones Ternarias), 2. Bucles e Iteraciones (`for`, List Comprehensions), 3. Tuplas (`tuple`: Inmutabilidad, Desempaquetado y Hashing), 4. Colas (`Queue` / FIFO — First In, First Out), 5. Pilas (`Stack` / LIFO — Last In, First Out), A. Control de Fuerza Bruta y Roles Clínicos, A. Desempaquetado de Encabezado Authorization (`str.partition`), A. Limpieza de Factores TOTP Huérfanos (+18 more)

### Community 1 - "service.py"
Cohesion: 0.12
Nodes (23): _confirm_aal2(), enroll_mfa(), EnrollResult, _fail_mfa(), _is_valid_profile(), logout(), MfaVerifyResult, _require_clinical_user() (+15 more)

### Community 2 - "appointments.actions.ts"
Cohesion: 0.14
Nodes (14): AppointmentConflictError, 9.6 Fase 5: Agendamiento de Citas y Resolución de Conflictos Horarios, appointmentSchema, calculateSuggestedSlots(), CancelAppointmentInput, cancelSchema, createAppointmentAction(), CreateAppointmentInput (+6 more)

### Community 4 - "patients-client.tsx"
Cohesion: 0.13
Nodes (39): ACTION_LABELS, ENTITY_TYPE_LABELS, calculateAge(), DOCUMENT_TYPE_OPTIONS, documentTypeLabel(), EMPTY_FORM, PatientsClient(), openEditPatient() (+31 more)

### Community 5 - "consultorios-client.tsx"
Cohesion: 0.14
Nodes (34): ClinicConfigClient(), handleSubmit(), resetForm(), ClinicConfigPage(), ClinicFormState, clinicToForm(), ConsultoriosClient(), applyDetail() (+26 more)

### Community 6 - "reports.actions.ts"
Cohesion: 0.30
Nodes (9): ReportRangeLimitError, 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales, getAppointmentStatusReportAction(), getAttendedPatientsReportAction(), ReportFilterInput, reportFilterSchema, validateDateRangeLimit(), 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales (+1 more)

### Community 7 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.04
Nodes (45): 10. `public.audit_logs`, 1. `public.clinics`, 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 2. `public.users`, 3. `public.patients` (+37 more)

### Community 8 - "users.actions.ts"
Cohesion: 0.20
Nodes (9): handleSubmit(), 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC), createUserAction(), CreateUserInput, createUserSchema, UpdateUserInput, updateUserSchema, 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC) (+1 more)

### Community 9 - "types/domain.ts"
Cohesion: 0.21
Nodes (11): AuditClientProps, SurfaceSelection, FormState, AuditLogEntry, AuditLogFilters, AuditEntityType, AuditResult, BiologicalSex (+3 more)

### Community 10 - "getShellProfile"
Cohesion: 0.22
Nodes (10): dynamic, LoginLayout(), metadata, AppointmentsPage(), metadata, todayRangeIso(), metadata, PatientsPage() (+2 more)

### Community 11 - "cn"
Cohesion: 0.08
Nodes (36): STATUS_BADGE, STATUS_LABELS, SuggestedSlot, ENTRY_FORM_TYPES, ENTRY_TYPE_LABELS, ENTRY_TYPE_VARIANTS, formatDate(), HistoryClient() (+28 more)

### Community 12 - "7.4 Directorio `types/` y `errors/`"
Cohesion: 0.22
Nodes (17): ClinicConfigClientProps, ConsultoriosClientProps, HistoryClientProps, OdontogramClientProps, PatientsClientProps, UsersClientProps, 7.4 Directorio `types/` y `errors/`, AdminClinicDetail (+9 more)

### Community 13 - "Button"
Cohesion: 0.12
Nodes (19): CreateClinicForm(), handleSubmit(), CreatedClinic, EMPTY_FORM, FormState, CreateClinicPage(), metadata, ConsultoriosPage() (+11 more)

### Community 14 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, seed:users, start, test, test:db (+1 more)

### Community 15 - "login"
Cohesion: 0.13
Nodes (8): _first_row(), LoginAttemptStore, login(), LoginResult, LoginAttemptStoreError, decode_aal_claim(), hash_login_identifier(), Resumen Matricial

### Community 16 - "FakeAuth"
Cohesion: 0.15
Nodes (8): cancel_mfa(), verify_mfa_login(), FakeAuth, FakeClient, _jwt_with_aal(), TestSessionTermination, TestVerifyMfaLogin, TestVerifyMfaSetup

### Community 17 - "odontogram.actions.ts"
Cohesion: 0.13
Nodes (18): ConcurrencyConflictError, 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.1 Actores y Roles Participantes, 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding), 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA, 9.7 Fase 6: Atención Odontológica, Odontograma e Inmutabilidad Médica, 9.8 Fase 7: Correcciones Auditables de Historia Clínica (Append-Only), 9.9 Fase 8: Carga y Almacenamiento Seguro de Radiografías (Storage) (+10 more)

### Community 18 - "🦷 Dental Clinic SaaS"
Cohesion: 0.05
Nodes (41): 1. Clonar el repositorio y configurar variables de entorno, 🏢 1. Gestión de Consultorios (Multitenencia), 1. Pruebas Frontend en TypeScript (Vitest - 74 pruebas), 2. Configurar y levantar el Microservicio Python (Backend), 👥 2. Gestión de Usuarios y Roles, 2. Pruebas Backend en Python (Pytest - 32 pruebas), 🔐 3. Autenticación y Control de Sesiones, 3. Configurar y levantar la aplicación Next.js (Frontend) (+33 more)

### Community 19 - "Components and Interfaces"
Cohesion: 0.40
Nodes (5): Components and Interfaces, Diseño del Odontograma SVG, Estrategia Server Actions vs Route Handlers, Estructura de Componentes Principales, Interfaces TypeScript Principales

### Community 20 - "main.py"
Cohesion: 0.16
Nodes (5): domain_error_handler(), _error_payload(), health(), unhandled_error_handler(), validation_error_handler()

### Community 22 - "AppointmentsClient"
Cohesion: 0.17
Nodes (16): AppointmentsClient(), applySuggestedSlot(), goToday(), handleCancel(), handleCreate(), handleReschedule(), loadDay(), navigate() (+8 more)

### Community 23 - "router.py"
Cohesion: 0.31
Nodes (9): cancel_endpoint(), enroll_endpoint(), login_endpoint(), logout_endpoint(), _ok(), reset_endpoint(), _session_payload(), verify_login_endpoint() (+1 more)

### Community 25 - "admin-clinics.actions.ts"
Cohesion: 0.12
Nodes (23): clinicDataSchema, clinicIdSchema, createClinicUserAction(), CreateClinicUserInput, createClinicUserSchema, getAdminClinicDetailAction(), listAdminClinicsAction(), updateAdminClinicAction() (+15 more)

### Community 26 - "react"
Cohesion: 0.26
Nodes (9): NavItem, navItems, ROLE_LABELS, Sidebar(), handleLogout(), SidebarProps, SessionTimer(), logoutAction() (+1 more)

### Community 27 - "proxy.ts"
Cohesion: 0.21
Nodes (13): isUnauthenticatedError(), AUTH_CONTEXT_HEADERS, buildVerifiedRequestHeaders(), stripUntrustedAuthHeaders(), config, copyResponseCookies(), createRedirect(), isUserRole() (+5 more)

### Community 28 - "access-policy.ts"
Cohesion: 0.19
Nodes (13): AccessDecision, AccessInput, AuthenticationErrorLike, AuthenticatorAssuranceLevel, clinicalMfaDestination(), decideAccess(), isClinicalRole(), isRoleAllowedForPath() (+5 more)

### Community 29 - "🦷 Dental Clinic SaaS — Python Auth & MFA Microservice"
Cohesion: 0.18
Nodes (10): GET(), POST(), 1. Autenticación (`/auth`), 2. Autenticación Multifactor TOTP (`/mfa`), 3. Salud y Diagnóstico (`/health`), 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice, 📋 Endpoints de la API, ⚙️ Estructura del Microservicio (+2 more)

### Community 30 - "jwt-claims.property.test.ts"
Cohesion: 0.29
Nodes (4): activeUserArb, roleArb, uuidArb, JWTClaims

### Community 31 - "FakeAttemptStore"
Cohesion: 0.30
Nodes (4): FailedAttemptStatus, LockoutStatus, FakeAttemptStore, TestLogin

### Community 32 - "test_api_contract.py"
Cohesion: 0.16
Nodes (3): _AuthWithoutSession, _client_without_session(), test_verify_setup_acepta_factor_id_en_camel_case_como_el_frontend()

### Community 34 - "AuditClient"
Cohesion: 0.31
Nodes (10): AuditClient(), clearFilters(), handleEntityTypeChange(), handleResultChange(), refresh(), formatTimestamp(), metadataPreview(), AuditPage() (+2 more)

### Community 35 - "seed-users.mjs"
Cohesion: 0.22
Nodes (7): @supabase/supabase-js, admin, envPath, getTargetClinic(), main(), SEED_USERS, migrationPath

### Community 36 - "Políticas RLS"
Cohesion: 0.22
Nodes (9): `appointments`, `audit_logs` (inmutables), `clinical_entries` (inmutables), `clinical_records`, `clinics`, `odontogram_states` (inmutables — append only), `patients`, Políticas RLS (+1 more)

### Community 37 - "UserRole"
Cohesion: 0.25
Nodes (8): AppointmentsClientProps, UserFormState, AccessProfile, RouteRoleRule, AuthenticatedUserContext, VerifiedClaims, Appointment, UserRole

### Community 39 - "OdontogramClient"
Cohesion: 0.52
Nodes (7): OdontogramClient(), closeEditor(), handleSave(), openEditor(), renderTooth(), stateFor(), zoneRect()

### Community 40 - "(dashboard)/layout.tsx"
Cohesion: 0.40
Nodes (3): DashboardLayout(), dynamic, DashboardShell()

### Community 41 - "pacientes-atendidos/page.tsx"
Cohesion: 0.40
Nodes (5): AttendedReportClientProps, AttendedPatientsReportPage(), metadata, monthRangeIso(), AttendedPatientsReportResult

### Community 42 - "AppointmentStatus"
Cohesion: 0.40
Nodes (5): AgendaAppointment, StatusReportClientProps, DashboardTodayAppointment, AppointmentStatusReportResult, AppointmentStatus

### Community 43 - "Data Models"
Cohesion: 0.40
Nodes (5): Data Models, Diagrama Entidad-Relación, Estructura de Buckets, Políticas de Storage, Supabase Storage

### Community 44 - "auth-api.ts"
Cohesion: 0.13
Nodes (25): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+17 more)

### Community 45 - "package.json"
Cohesion: 0.12
Nodes (16): eslintConfig, name, private, version, clsx, eslint, eslint-config-next, react-dom (+8 more)

### Community 46 - "Manejo de Errores y Conectividad"
Cohesion: 0.50
Nodes (4): Clasificación de Errores, Control de Concurrencia Optimista, Detección de Conectividad, Manejo de Errores y Conectividad

### Community 73 - "deps.py"
Cohesion: 0.17
Nodes (8): get_settings(), Settings, AuthConfigurationUnavailableError, get_admin_client(), get_anon_client(), get_user_client(), 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA), 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA)

### Community 85 - "Correctness Properties"
Cohesion: 0.07
Nodes (27): Correctness Properties, Property 10: Unicidad de Historia Clínica por Paciente, Property 11: Inmutabilidad de Registros Clínicos y de Auditoría, Property 12: Trazabilidad de Correcciones Clínicas, Property 13: Ordenamiento Cronológico de la Historia Clínica, Property 14: Validación de Archivos Adjuntos, Property 15: Control de Concurrencia Optimista, Property 16: Inmutabilidad del Historial del Odontograma (Append-Only) (+19 more)

### Community 125 - "schemas.py"
Cohesion: 0.18
Nodes (5): LoginRequest, _validate_totp_code(), VerifyLoginRequest, VerifySetupRequest, TestBoundaryValidation

### Community 126 - "require-user.ts"
Cohesion: 0.11
Nodes (21): signedUrlRequestSchema, ALLOWED_FILE_TYPES, UploadAttachmentInput, uploadAttachmentSchema, auditFiltersSchema, ENTRY_TYPES, SaveClinicalEntryInput, saveClinicalEntrySchema (+13 more)

### Community 168 - "auth.actions.ts"
Cohesion: 0.12
Nodes (22): AccountLockedError, DentalClinicError, ImmutableRecordError, InvalidCredentialsError, RoleAuthorizationError, TenantIsolationError, ValidationError, cancelMfaAction() (+14 more)

### Community 184 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 203 - "decide_access"
Cohesion: 0.21
Nodes (6): AccessDecision, AccessInput, AccessProfile, _clinical_mfa_destination(), decide_access(), TestDecideAccess

### Community 204 - "withErrorHandling"
Cohesion: 0.18
Nodes (37): ClinicalHistoryPage(), metadata, handleSave(), UniqueDocumentError, 9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica, Subdirectorio `lib/actions/` (Server Actions de Negocio), Tasks, cancelAppointmentAction() (+29 more)

### Community 228 - "Documento de Diseño Técnico: Dental Clinic SaaS"
Cohesion: 0.13
Nodes (14): Architecture, Decisiones de Arquitectura Clave, Diagrama de Componentes, Diagrama de Flujo de Solicitud, Documento de Diseño Técnico: Dental Clinic SaaS, Error Handling, Estructura de Rutas (Next.js App Router), Flujo de Manejo de Errores en el Cliente (+6 more)

### Community 229 - "Requirements"
Cohesion: 0.08
Nodes (24): Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación (+16 more)

### Community 300 - "Esquema PostgreSQL Completo"
Cohesion: 0.17
Nodes (12): Esquema PostgreSQL Completo, Función de Trigger `updated_at`, Tabla: `appointments` (Citas), Tabla: `audit_logs` (Registros de Auditoría — inmutables), Tabla: `clinical_attachments` (Adjuntos de Entradas Clínicas), Tabla: `clinical_entries` (Entradas Clínicas — inmutables), Tabla: `clinical_records` (Historias Clínicas — cabecera), Tabla: `clinics` (Consultorios) (+4 more)

### Community 301 - "login-attempt-store.ts"
Cohesion: 0.17
Nodes (10): createPersistentAttemptStore(), createLoginAttemptStore(), FailedAttemptRow, FailedAttemptStatus, hashLoginIdentifier(), LockoutRow, LockoutStatus, RpcError (+2 more)

### Community 342 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.04
Nodes (45): 10. `public.audit_logs`, 1. `public.clinics`, 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 2. `public.users`, 3. `public.patients` (+37 more)

### Community 343 - "9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)"
Cohesion: 0.14
Nodes (14): 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, Subdirectorios de Seguridad, Auditoría y Supabase, requireAuthUser(), 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, 9.1 Actores y Roles Participantes (+6 more)

### Community 396 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, fast-check, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+4 more)

### Community 448 - "password-validation.property.test.ts"
Cohesion: 0.11
Nodes (15): PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), createSecurityHeaders(), nextConfig, securityHeaders, fast-check, alphanumericArb (+7 more)

### Community 505 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, clsx, lucide-react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js (+3 more)

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

### Community 677 - "Flujo de Autenticación y Manejo de Sesiones"
Cohesion: 0.50
Nodes (4): Diagrama de Flujo de Autenticación, Flujo de Autenticación y Manejo de Sesiones, Headers de Seguridad HTTP, Manejo de Inactividad (30 minutos)

### Community 723 - "next"
Cohesion: 0.14
Nodes (4): metadata, metadata, features, next

## Knowledge Gaps
- **8 isolated node(s):** `react-dom`, `tw-animate-css`, `@tailwindcss/postcss`, `@types/node`, `@types/react` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 561 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tasks` connect `withErrorHandling` to `appointments.actions.ts`, `react`, `UserRole`, `test_auth_service.py`, `reports.actions.ts`, `auth.actions.ts`, `users.actions.ts`, `AppointmentStatus`, `types/domain.ts`, `odontogram.actions.ts`, `jwt-claims.property.test.ts`, `admin-clinics.actions.ts`, `Implementation Plan: Dental Clinic SaaS`, `require-user.ts`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `withErrorHandling()` (e.g. with `5. Requisitos No Funcionales y Arquitectura de Seguridad` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`withErrorHandling()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react-dom`, `tw-animate-css`, `@tailwindcss/postcss` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Estructuras de Datos y Control de Flujo en el Backend Python` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `ServerActionResult` connect `require-user.ts` to `appointments.actions.ts`, `reports.actions.ts`, `auth.actions.ts`, `deps.py`, `users.actions.ts`, `withErrorHandling`, `odontogram.actions.ts`, `admin-clinics.actions.ts`, `Dental Clinic SaaS — Agent Configuration`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `requireRole()` (e.g. with `Subdirectorios de Seguridad, Auditoría y Supabase` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`requireRole()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12375533428165007 - nodes in this community are weakly interconnected._