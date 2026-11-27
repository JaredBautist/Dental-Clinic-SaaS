# Graph Report - DENTAL CLINIC  (2026-11-27)

## Corpus Check
- 207 files · ~805,237 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .kiro 1, .ico 1)

## Summary
- 1528 nodes · 4007 edges · 95 communities (71 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 217 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83faa3e2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Estructuras de Datos y Control de Flujo en el Backend Python
- service.py
- Tasks
- test_auth_service.py
- patients-client.tsx
- dashboard/page.tsx
- reports.actions.ts
- 6.1 Esquema `public` (Tablas de Negocio)
- saveClinicalEntryAction
- types/domain.ts
- create-clinic-user-form.tsx
- Button
- history-client.tsx
- login-attempt-store.ts
- scripts
- FakeAuth
- AppointmentsClient
- server-action-wrapper.ts
- 🦷 Dental Clinic SaaS
- patients.actions.ts
- router.py
- @vitejs/plugin-react
- FakeAttemptStore
- test_api_contract.py
- withErrorHandling
- consultorios-client.tsx
- UserRole
- clinic.actions.ts
- 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice
- clinical-documents.tsx
- seed-clinical.mjs
- OdontogramClient
- router.py
- Clinic
- test_auth_service.py
- test_api_contract.py
- Public Landing and Load Performance Design
- fast-check
- jwt-claims.property.test.ts
- 4. Requisitos Funcionales Detallados
- dashboard.actions.ts
- Clinical Workspaces and Platform Administration
- auth-api.ts
- package.json
- Manejo de Errores y Conectividad
- Platform user editor
- admin-dashboard.test.tsx
- Rollout on Render and Vercel
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- Sidebar clinic switcher
- security-headers.property.test.ts
- app/page.tsx
- Flujo de Autenticación y Manejo de Sesiones
- Error Handling
- Responsive Role Dashboards Design
- setup-mfa/layout.tsx
- verify-mfa/layout.tsx
- Hosted Release Design
- hosted-release/requirements.md
- hosted-release/tasks.md
- public-landing-performance/requirements.md
- public-landing-performance/tasks.md
- role-dashboards-responsive/requirements.md
- role-dashboards-responsive/tasks.md
- main.py
- Correctness Properties
- app/layout.tsx
- test_auth_service.py
- auth.actions.ts
- compilerOptions
- decide_access
- createClient
- Documento de Diseño Técnico: Dental Clinic SaaS
- Requirements
- Esquema PostgreSQL Completo
- DentalClinicError
- 6.1 Esquema `public` (Tablas de Negocio)
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
1. `DentalClinicError` - 88 edges
2. `createClient()` - 65 edges
3. `withErrorHandling()` - 64 edges
4. `Button` - 55 edges
5. `requireRole()` - 54 edges
6. `cn()` - 50 edges
7. `next` - 42 edges
8. `react` - 39 edges
9. `Tasks` - 36 edges
10. `PageHeader()` - 34 edges

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

## Communities (95 total, 24 thin omitted)

### Community 0 - "Estructuras de Datos y Control de Flujo en el Backend Python"
Cohesion: 0.07
Nodes (26): 1. Condicionales (`if`, `elif`, `else` y Expresiones Ternarias), 2. Bucles e Iteraciones (`for`, List Comprehensions), 3. Tuplas (`tuple`: Inmutabilidad, Desempaquetado y Hashing), 4. Colas (`Queue` / FIFO — First In, First Out), 5. Pilas (`Stack` / LIFO — Last In, First Out), A. Control de Fuerza Bruta y Roles Clínicos, A. Desempaquetado de Encabezado Authorization (`str.partition`), A. Limpieza de Factores TOTP Huérfanos (+18 more)

### Community 1 - "service.py"
Cohesion: 0.12
Nodes (23): _confirm_aal2(), enroll_mfa(), EnrollResult, _fail_mfa(), _is_valid_profile(), logout(), MfaVerifyResult, _require_clinical_user() (+15 more)

### Community 2 - "Tasks"
Cohesion: 0.15
Nodes (16): AppointmentConflictError, ImmutableRecordError, 9.6 Fase 5: Agendamiento de Citas y Resolución de Conflictos Horarios, Tasks, appointmentSchema, calculateSuggestedSlots(), cancelAppointmentAction(), CancelAppointmentInput (+8 more)

### Community 4 - "patients-client.tsx"
Cohesion: 0.13
Nodes (34): ACTION_LABELS, AuditClient(), clearFilters(), handleEntityTypeChange(), handleResultChange(), refresh(), ENTITY_TYPE_LABELS, formatTimestamp() (+26 more)

### Community 5 - "dashboard/page.tsx"
Cohesion: 0.13
Nodes (34): ClinicConfigClient(), handleSubmit(), resetForm(), ClinicConfigPage(), CreateClinicForm(), handleSubmit(), CreatedClinic, EMPTY_FORM (+26 more)

### Community 6 - "reports.actions.ts"
Cohesion: 0.10
Nodes (28): AppointmentsPage(), metadata, todayRangeIso(), AgendaAppointment, DashboardError(), STATUS_LABELS, STATUS_ORDER, runReport() (+20 more)

### Community 7 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.04
Nodes (45): 10. `public.audit_logs`, 1. `public.clinics`, 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 2. `public.users`, 3. `public.patients` (+37 more)

### Community 8 - "saveClinicalEntryAction"
Cohesion: 0.10
Nodes (24): ConcurrencyConflictError, 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, 9.1 Actores y Roles Participantes, 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding), 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA, 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC), 9.7 Fase 6: Atención Odontológica, Odontograma e Inmutabilidad Médica (+16 more)

### Community 9 - "types/domain.ts"
Cohesion: 0.21
Nodes (18): HistoryClientProps, OdontogramClientProps, SurfaceSelection, FormState, PatientsClientProps, 7.4 Directorio `types/` y `errors/`, 7.4 Directorio `types/` y `errors/`, Appointment (+10 more)

### Community 10 - "create-clinic-user-form.tsx"
Cohesion: 0.21
Nodes (9): CreateClinicUserForm(), handleBlur(), handleSubmit(), validateField(), metadata, NewClinicUserPage(), NewClinicUserPageProps, DocumentUpload() (+1 more)

### Community 11 - "Button"
Cohesion: 0.13
Nodes (8): _first_row(), LoginAttemptStore, login(), LoginResult, LoginAttemptStoreError, decode_aal_claim(), hash_login_identifier(), Resumen Matricial

### Community 12 - "history-client.tsx"
Cohesion: 0.18
Nodes (13): ENTRY_FORM_TYPES, ENTRY_TYPE_LABELS, ENTRY_TYPE_VARIANTS, formatDate(), HistoryClient(), closeEntryModal(), handleSaveEntry(), refreshHistory() (+5 more)

### Community 13 - "login-attempt-store.ts"
Cohesion: 0.19
Nodes (9): createLoginAttemptStore(), FailedAttemptRow, FailedAttemptStatus, hashLoginIdentifier(), LockoutRow, LockoutStatus, RpcError, RpcInvoker (+1 more)

### Community 14 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, keep-alive, lint, seed:clinical, seed:staff, seed:users (+4 more)

### Community 15 - "FakeAuth"
Cohesion: 0.15
Nodes (8): cancel_mfa(), verify_mfa_login(), FakeAuth, FakeClient, _jwt_with_aal(), TestSessionTermination, TestVerifyMfaLogin, TestVerifyMfaSetup

### Community 16 - "AppointmentsClient"
Cohesion: 0.17
Nodes (16): AppointmentsClient(), applySuggestedSlot(), goToday(), handleCancel(), handleCreate(), handleReschedule(), loadDay(), navigate() (+8 more)

### Community 17 - "server-action-wrapper.ts"
Cohesion: 0.16
Nodes (11): ValidationError, auditFiltersSchema, ENTRY_TYPES, SaveClinicalEntryInput, saveClinicalEntrySchema, AuthorizationFailureEvent, AuthorizationFailureRecorder, persistAuthorizationFailure() (+3 more)

### Community 18 - "🦷 Dental Clinic SaaS"
Cohesion: 0.04
Nodes (44): 1. Clonar el repositorio y configurar variables de entorno, 🏢 1. Gestión de Consultorios (Multitenencia), 1. Pruebas Frontend en TypeScript (Vitest - 74 pruebas), 2. Configurar y levantar el Microservicio Python (Backend), 👥 2. Gestión de Usuarios y Roles, 2. Pruebas Backend en Python (Pytest - 32 pruebas), 🔐 3. Autenticación y Control de Sesiones, 3. Configurar y levantar la aplicación Next.js (Frontend) (+36 more)

### Community 19 - "patients.actions.ts"
Cohesion: 0.20
Nodes (12): handleSave(), UniqueDocumentError, 9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica, BIOLOGICAL_SEXES, createPatientAction(), DOCUMENT_TYPES, PatientInput, patientSchema (+4 more)

### Community 20 - "router.py"
Cohesion: 0.29
Nodes (10): cancel_endpoint(), enroll_endpoint(), login_endpoint(), logout_endpoint(), _ok(), reset_endpoint(), _session_payload(), verify_login_endpoint() (+2 more)

### Community 22 - "FakeAttemptStore"
Cohesion: 0.30
Nodes (4): FailedAttemptStatus, LockoutStatus, FakeAttemptStore, TestLogin

### Community 23 - "test_api_contract.py"
Cohesion: 0.16
Nodes (3): _AuthWithoutSession, _client_without_session(), test_verify_setup_acepta_factor_id_en_camel_case_como_el_frontend()

### Community 25 - "withErrorHandling"
Cohesion: 0.12
Nodes (38): POST(), handleSubmit(), Subdirectorios de Seguridad, Auditoría y Supabase, clinicDataSchema, clinicIdSchema, createClinicUserAction(), CreateClinicUserInput, createClinicUserSchema (+30 more)

### Community 26 - "consultorios-client.tsx"
Cohesion: 0.09
Nodes (39): STATUS_BADGE, STATUS_LABELS, SuggestedSlot, ClinicFormState, EMPTY_USER_FORM, ROLE_LABELS, FieldErrors, ROLE_HINTS (+31 more)

### Community 27 - "UserRole"
Cohesion: 0.08
Nodes (38): AuditClientProps, AppointmentsClientProps, UserFormState, FormState, AuditLogEntry, AuditLogFilters, LoginResult, AccessDecision (+30 more)

### Community 28 - "clinic.actions.ts"
Cohesion: 0.10
Nodes (23): signedUrlRequestSchema, save(), ALLOWED_FILE_TYPES, UploadAttachmentInput, uploadAttachmentSchema, CreateClinicInput, createClinicSchema, UpdateClinicInput (+15 more)

### Community 29 - "🦷 Dental Clinic SaaS — Python Auth & MFA Microservice"
Cohesion: 0.22
Nodes (8): 1. Autenticación (`/auth`), 2. Autenticación Multifactor TOTP (`/mfa`), 3. Salud y Diagnóstico (`/health`), 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice, 📋 Endpoints de la API, ⚙️ Estructura del Microservicio, 🚀 Instalación y Ejecución, 🧪 Pruebas Automatizadas

### Community 31 - "clinical-documents.tsx"
Cohesion: 0.23
Nodes (8): EntryAttachment, renderPatientPdf(), paragraph(), PatientReportPreview, ReportSection, reportSections, DocumentReceipt, pdf-lib

### Community 32 - "seed-clinical.mjs"
Cohesion: 0.05
Nodes (65): @supabase/supabase-js, envPath, startedAt, addDays(), ADDRESSES, admin, auditRow(), bogotaNowTime() (+57 more)

### Community 33 - "OdontogramClient"
Cohesion: 0.43
Nodes (8): OdontogramClient(), closeEditor(), handleSave(), openEditor(), renderTooth(), stateFor(), rectPath(), zoneRect()

### Community 34 - "router.py"
Cohesion: 0.22
Nodes (9): `appointments`, `audit_logs` (inmutables), `clinical_entries` (inmutables), `clinical_records`, `clinics`, `odontogram_states` (inmutables — append only), `patients`, Políticas RLS (+1 more)

### Community 35 - "Clinic"
Cohesion: 0.25
Nodes (9): ClinicConfigClientProps, ConsultoriosClientProps, CreateClinicUserFormProps, CreatedUser, UsersClientProps, Props, AdminClinicDetail, Clinic (+1 more)

### Community 37 - "test_api_contract.py"
Cohesion: 0.25
Nodes (7): Administrative dashboard clinic selection, ADR-001 — Documents independent of clinical notes, ADR-002 — Separate platform authorization, Clinical Workspaces and Platform Administration Design, Current behavior and proposed experience, Module layout, Proposed contracts and data

### Community 38 - "Public Landing and Load Performance Design"
Cohesion: 0.29
Nodes (6): ADR-001 — Optimize rendering without changing authentication, Landing, Local verification, Pre-implementation evidence, Proposed layout, Public Landing and Load Performance Design

### Community 39 - "fast-check"
Cohesion: 0.29
Nodes (3): fast-check, TenantRecord, uuidArb

### Community 40 - "jwt-claims.property.test.ts"
Cohesion: 0.29
Nodes (4): activeUserArb, roleArb, uuidArb, JWTClaims

### Community 41 - "4. Requisitos Funcionales Detallados"
Cohesion: 0.40
Nodes (5): Data Models, Diagrama Entidad-Relación, Estructura de Buckets, Políticas de Storage, Supabase Storage

### Community 42 - "dashboard.actions.ts"
Cohesion: 0.25
Nodes (5): DashboardStats, getDashboardStatsAction(), Column, eq(), mocks

### Community 43 - "Clinical Workspaces and Platform Administration"
Cohesion: 0.50
Nodes (3): Acceptance criteria, Clinical Workspaces and Platform Administration, Proposed business rules to approve

### Community 44 - "auth-api.ts"
Cohesion: 0.07
Nodes (44): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+36 more)

### Community 45 - "package.json"
Cohesion: 0.12
Nodes (15): eslintConfig, name, private, version, clsx, eslint, eslint-config-next, tailwind-merge (+7 more)

### Community 46 - "Manejo de Errores y Conectividad"
Cohesion: 0.50
Nodes (4): Clasificación de Errores, Control de Concurrencia Optimista, Detección de Conectividad, Manejo de Errores y Conectividad

### Community 47 - "Platform user editor"
Cohesion: 0.33
Nodes (5): Approved behavior, Design decision, Dialog presentation, Platform user editor, Tasks and checks

### Community 48 - "admin-dashboard.test.tsx"
Cohesion: 0.33
Nodes (5): react-dom, dashboard(), mocks, north, south

### Community 49 - "Rollout on Render and Vercel"
Cohesion: 0.40
Nodes (4): Render, Rollout on Render and Vercel, Vercel, Verification

### Community 53 - "Sidebar clinic switcher"
Cohesion: 0.40
Nodes (4): Acceptance criteria, Design and tasks, Presentation, Sidebar clinic switcher

### Community 54 - "security-headers.property.test.ts"
Cohesion: 0.70
Nodes (3): createSecurityHeaders(), nextConfig, securityHeaders

### Community 56 - "Flujo de Autenticación y Manejo de Sesiones"
Cohesion: 0.50
Nodes (4): Diagrama de Flujo de Autenticación, Flujo de Autenticación y Manejo de Sesiones, Headers de Seguridad HTTP, Manejo de Inactividad (30 minutos)

### Community 57 - "Error Handling"
Cohesion: 0.50
Nodes (4): Error Handling, Flujo de Manejo de Errores en el Cliente, Jerarquía de Errores del Sistema, Manejo de Errores en Server Actions

### Community 58 - "Responsive Role Dashboards Design"
Cohesion: 0.50
Nodes (3): ADR-001 — Adapt to the content width, Module boundaries, Responsive Role Dashboards Design

### Community 73 - "main.py"
Cohesion: 0.16
Nodes (5): domain_error_handler(), _error_payload(), health(), unhandled_error_handler(), validation_error_handler()

### Community 85 - "Correctness Properties"
Cohesion: 0.07
Nodes (27): Correctness Properties, Property 10: Unicidad de Historia Clínica por Paciente, Property 11: Inmutabilidad de Registros Clínicos y de Auditoría, Property 12: Trazabilidad de Correcciones Clínicas, Property 13: Ordenamiento Cronológico de la Historia Clínica, Property 14: Validación de Archivos Adjuntos, Property 15: Control de Concurrencia Optimista, Property 16: Inmutabilidad del Historial del Odontograma (Append-Only) (+19 more)

### Community 125 - "test_auth_service.py"
Cohesion: 0.17
Nodes (4): _validate_totp_code(), VerifyLoginRequest, VerifySetupRequest, TestBoundaryValidation

### Community 168 - "auth.actions.ts"
Cohesion: 0.12
Nodes (21): AccountLockedError, InvalidCredentialsError, RoleAuthorizationError, TenantIsolationError, cancelMfaAction(), createPersistentAttemptStore(), enrollMfaAction(), failMfaVerification() (+13 more)

### Community 184 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 203 - "decide_access"
Cohesion: 0.21
Nodes (6): AccessDecision, AccessInput, AccessProfile, _clinical_mfa_destination(), decide_access(), TestDecideAccess

### Community 204 - "createClient"
Cohesion: 0.13
Nodes (31): ClinicalHistoryPage(), metadata, ReportRangeLimitError, 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales, Subdirectorio `lib/actions/` (Server Actions de Negocio), listAppointmentsAction(), listEntryAttachmentsAction() (+23 more)

### Community 228 - "Documento de Diseño Técnico: Dental Clinic SaaS"
Cohesion: 0.12
Nodes (15): Architecture, Components and Interfaces, Decisiones de Arquitectura Clave, Diagrama de Componentes, Diagrama de Flujo de Solicitud, Diseño del Odontograma SVG, Documento de Diseño Técnico: Dental Clinic SaaS, Estrategia Server Actions vs Route Handlers (+7 more)

### Community 229 - "Requirements"
Cohesion: 0.08
Nodes (24): Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación (+16 more)

### Community 300 - "Esquema PostgreSQL Completo"
Cohesion: 0.17
Nodes (12): Esquema PostgreSQL Completo, Función de Trigger `updated_at`, Tabla: `appointments` (Citas), Tabla: `audit_logs` (Registros de Auditoría — inmutables), Tabla: `clinical_attachments` (Adjuntos de Entradas Clínicas), Tabla: `clinical_entries` (Entradas Clínicas — inmutables), Tabla: `clinical_records` (Historias Clínicas — cabecera), Tabla: `clinics` (Consultorios) (+4 more)

### Community 301 - "DentalClinicError"
Cohesion: 0.32
Nodes (15): GET(), POST(), reportRequest, POST(), DentalClinicError, documentError(), documentBucket, documentReceiptFields (+7 more)

### Community 342 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.04
Nodes (45): 10. `public.audit_logs`, 1. `public.clinics`, 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 2. `public.users`, 3. `public.patients` (+37 more)

### Community 396 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, fast-check, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+4 more)

### Community 448 - "password-validation.property.test.ts"
Cohesion: 0.22
Nodes (9): PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), alphanumericArb, digitCharArb, lowerCharArb, specialCharArb, upperCharArb (+1 more)

### Community 450 - "deps.py"
Cohesion: 0.18
Nodes (8): get_settings(), Settings, AuthConfigurationUnavailableError, get_admin_client(), get_anon_client(), get_user_client(), 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA), 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA)

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
Cohesion: 0.11
Nodes (27): dynamic, LoginLayout(), metadata, AuditPage(), metadata, CreateClinicPage(), metadata, ConsultoriosPage() (+19 more)

## Knowledge Gaps
- **7 isolated node(s):** `tw-animate-css`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 661 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ServerActionResult` connect `server-action-wrapper.ts` to `deps.py`, `Tasks`, `auth.actions.ts`, `dashboard.actions.ts`, `createClient`, `clinic.actions.ts`, `patients.actions.ts`, `withErrorHandling`, `Dental Clinic SaaS — Agent Configuration`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `withErrorHandling()` (e.g. with `5. Requisitos No Funcionales y Arquitectura de Seguridad` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`withErrorHandling()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `tw-animate-css`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Estructuras de Datos y Control de Flujo en el Backend Python` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `Tasks` connect `Tasks` to `test_auth_service.py`, `reports.actions.ts`, `saveClinicalEntryAction`, `auth.actions.ts`, `jwt-claims.property.test.ts`, `types/domain.ts`, `createClient`, `auth-api.ts`, `history-client.tsx`, `server-action-wrapper.ts`, `patients.actions.ts`, `withErrorHandling`, `Implementation Plan: Dental Clinic SaaS`, `UserRole`, `clinic.actions.ts`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `requireRole()` (e.g. with `Subdirectorios de Seguridad, Auditoría y Supabase` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`requireRole()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12375533428165007 - nodes in this community are weakly interconnected._