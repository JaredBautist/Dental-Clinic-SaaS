# Graph Report - DENTAL CLINIC  (2026-11-20)

## Corpus Check
- 189 files · ~117,484 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .kiro 1, .ico 1)

## Summary
- 1458 nodes · 3826 edges · 77 communities (66 shown, 11 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 215 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b5c2ff4b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Estructuras de Datos y Control de Flujo en el Backend Python
- service.py
- AppointmentConflictError
- test_auth_service.py
- patients-client.tsx
- dashboard/page.tsx
- reports.actions.ts
- 6.1 Esquema `public` (Tablas de Negocio)
- 9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)
- Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto
- create-clinic-user-form.tsx
- Button
- history-client.tsx
- login-attempt-store.ts
- scripts
- FakeAuth
- AppointmentsClient
- types/domain.ts
- 🦷 Dental Clinic SaaS
- Components and Interfaces
- router.py
- @vitejs/plugin-react
- Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto
- 4. Requisitos Funcionales Detallados
- next
- server-action-wrapper.ts
- UserRole
- FakeMfa
- 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice
- odontogram.actions.ts
- 4. Requisitos Funcionales Detallados
- seed-clinical.mjs
- ReportRangeLimitError
- router.py
- consultorios-client.tsx
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- test_api_contract.py
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- eslint.config.mjs
- 4. Requisitos Funcionales Detallados
- users.actions.ts
- Clinical Workspaces and Platform Administration
- auth-api.ts
- package.json
- Manejo de Errores y Conectividad
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- main.py
- Correctness Properties
- app/layout.tsx
- test_auth_service.py
- auth.actions.ts
- compilerOptions
- decide_access
- withErrorHandling
- Documento de Diseño Técnico: Dental Clinic SaaS
- Requirements
- Esquema PostgreSQL Completo
- DentalClinicError
- 6.1 Esquema `public` (Tablas de Negocio)
- 9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)
- devDependencies
- password-validation.property.test.ts
- deps.py
- dependencies
- Dental Clinic SaaS — Agent Configuration
- ADR-001: Contexto de autorización, MFA y RLS
- Categorías de Pruebas
- Implementation Plan: Dental Clinic SaaS
- run_migrations.sh
- createClient
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
- `4.5 Módulo 5: Historia Clínica y Entradas Odontológicas` --references--> `ConcurrencyConflictError`  [INFERRED]
  .kiro/PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `4.5 Módulo 5: Historia Clínica y Entradas Odontológicas` --references--> `ConcurrencyConflictError`  [INFERRED]
  PROJECT_CONTEXT_FULL.md → errors/domain.ts
- `9.9 Fase 8: Carga y Almacenamiento Seguro de Radiografías (Storage)` --references--> `uploadAttachmentAction()`  [INFERRED]
  .kiro/PROJECT_CONTEXT_FULL.md → lib/actions/attachments.actions.ts

## Import Cycles
- None detected.

## Communities (77 total, 11 thin omitted)

### Community 0 - "Estructuras de Datos y Control de Flujo en el Backend Python"
Cohesion: 0.07
Nodes (26): 1. Condicionales (`if`, `elif`, `else` y Expresiones Ternarias), 2. Bucles e Iteraciones (`for`, List Comprehensions), 3. Tuplas (`tuple`: Inmutabilidad, Desempaquetado y Hashing), 4. Colas (`Queue` / FIFO — First In, First Out), 5. Pilas (`Stack` / LIFO — Last In, First Out), A. Control de Fuerza Bruta y Roles Clínicos, A. Desempaquetado de Encabezado Authorization (`str.partition`), A. Limpieza de Factores TOTP Huérfanos (+18 more)

### Community 1 - "service.py"
Cohesion: 0.08
Nodes (24): cancel_mfa(), _confirm_aal2(), enroll_mfa(), EnrollResult, _fail_mfa(), _is_valid_profile(), logout(), MfaVerifyResult (+16 more)

### Community 2 - "AppointmentConflictError"
Cohesion: 0.33
Nodes (5): AppointmentConflictError, 4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones, 9.6 Fase 5: Agendamiento de Citas y Resolución de Conflictos Horarios, 4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones, 9.6 Fase 5: Agendamiento de Citas y Resolución de Conflictos Horarios

### Community 4 - "patients-client.tsx"
Cohesion: 0.13
Nodes (35): ACTION_LABELS, AuditClient(), clearFilters(), handleEntityTypeChange(), handleResultChange(), refresh(), ENTITY_TYPE_LABELS, formatTimestamp() (+27 more)

### Community 5 - "dashboard/page.tsx"
Cohesion: 0.15
Nodes (32): ClinicConfigClient(), handleSubmit(), resetForm(), CreateClinicForm(), CreatedClinic, EMPTY_FORM, FormState, AdminDashboard() (+24 more)

### Community 6 - "reports.actions.ts"
Cohesion: 0.14
Nodes (23): todayRangeIso(), DashboardError(), AppointmentStatusReportPage(), metadata, runReport(), AttendedReportClient(), runReport(), AttendedReportClientProps (+15 more)

### Community 7 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.12
Nodes (16): 10. `public.audit_logs`, 1. `public.clinics`, 2. `public.users`, 3. `public.patients`, 4. `public.appointments`, 5. `public.clinical_records`, 6.1 Esquema `public` (Tablas de Negocio), 6.2 Esquema `private` (Seguridad Interna y Bloqueos) (+8 more)

### Community 8 - "9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)"
Cohesion: 0.22
Nodes (9): 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, 9.1 Actores y Roles Participantes, 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding), 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA, 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC), 9.8 Fase 7: Correcciones Auditables de Historia Clínica (Append-Only), 9.9 Fase 8: Carga y Almacenamiento Seguro de Radiografías (Storage) (+1 more)

### Community 9 - "Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto"
Cohesion: 0.15
Nodes (12): 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 3. Stack Tecnológico y Herramientas, 5. Requisitos No Funcionales y Arquitectura de Seguridad, 8. Estado Actual del Desarrollo y Siguientes Pasos, Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto (+4 more)

### Community 10 - "create-clinic-user-form.tsx"
Cohesion: 0.16
Nodes (14): CreateClinicUserForm(), handleBlur(), handleSubmit(), CreatedUser, FieldErrors, ROLE_HINTS, ROLE_LABELS, validateField() (+6 more)

### Community 11 - "Button"
Cohesion: 0.14
Nodes (7): _first_row(), LoginAttemptStore, login(), LoginResult, LoginAttemptStoreError, decode_aal_claim(), hash_login_identifier()

### Community 12 - "history-client.tsx"
Cohesion: 0.06
Nodes (49): ENTRY_FORM_TYPES, ENTRY_TYPE_LABELS, ENTRY_TYPE_VARIANTS, formatDate(), HistoryClient(), closeEntryModal(), handleSaveEntry(), refreshHistory() (+41 more)

### Community 13 - "login-attempt-store.ts"
Cohesion: 0.19
Nodes (8): FailedAttemptRow, FailedAttemptStatus, hashLoginIdentifier(), LockoutRow, LockoutStatus, RpcError, RpcInvoker, RpcResult

### Community 14 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, keep-alive, lint, seed:clinical, seed:staff, seed:users (+4 more)

### Community 15 - "FakeAuth"
Cohesion: 0.12
Nodes (11): FailedAttemptStatus, LockoutStatus, verify_mfa_login(), FakeAttemptStore, FakeAuth, FakeClient, _jwt_with_aal(), TestLogin (+3 more)

### Community 16 - "AppointmentsClient"
Cohesion: 0.17
Nodes (16): AppointmentsClient(), applySuggestedSlot(), goToday(), handleCancel(), handleCreate(), handleReschedule(), loadDay(), navigate() (+8 more)

### Community 17 - "types/domain.ts"
Cohesion: 0.07
Nodes (39): AuditClientProps, AgendaAppointment, FormState, StatusReportClientProps, appointmentSchema, calculateSuggestedSlots(), CancelAppointmentInput, cancelSchema (+31 more)

### Community 18 - "🦷 Dental Clinic SaaS"
Cohesion: 0.04
Nodes (44): 1. Clonar el repositorio y configurar variables de entorno, 🏢 1. Gestión de Consultorios (Multitenencia), 1. Pruebas Frontend en TypeScript (Vitest - 74 pruebas), 2. Configurar y levantar el Microservicio Python (Backend), 👥 2. Gestión de Usuarios y Roles, 2. Pruebas Backend en Python (Pytest - 32 pruebas), 🔐 3. Autenticación y Control de Sesiones, 3. Configurar y levantar la aplicación Next.js (Frontend) (+36 more)

### Community 19 - "Components and Interfaces"
Cohesion: 0.40
Nodes (5): Components and Interfaces, Diseño del Odontograma SVG, Estrategia Server Actions vs Route Handlers, Estructura de Componentes Principales, Interfaces TypeScript Principales

### Community 20 - "router.py"
Cohesion: 0.29
Nodes (10): cancel_endpoint(), enroll_endpoint(), login_endpoint(), logout_endpoint(), _ok(), reset_endpoint(), _session_payload(), verify_login_endpoint() (+2 more)

### Community 22 - "Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto"
Cohesion: 0.15
Nodes (12): 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 3. Stack Tecnológico y Herramientas, 5. Requisitos No Funcionales y Arquitectura de Seguridad, 8. Estado Actual del Desarrollo y Siguientes Pasos, Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto (+4 more)

### Community 23 - "4. Requisitos Funcionales Detallados"
Cohesion: 0.25
Nodes (8): 4.1 Módulo 1: Registro y Gestión de Consultorios (Tenants), 4.2 Módulo 2: Usuarios, Autenticación, MFA y RBAC, 4.3 Módulo 3: Gestión de Pacientes, 4.5 Módulo 5: Historia Clínica y Entradas Odontológicas, 4.6 Módulo 6: Archivos Adjuntos e Imágenes Médicas (Storage), 4.7 Módulo 7: Odontograma Digital y Estados Personalizados, 4.8 Módulo 8: Registro Inmutable de Auditoría, 4. Requisitos Funcionales Detallados

### Community 25 - "next"
Cohesion: 0.08
Nodes (30): POST(), signedUrlRequestSchema, CreateClinicPage(), metadata, handleCreateUser(), handleUserUpdate(), ConsultoriosPage(), ConsultoriosPageProps (+22 more)

### Community 26 - "server-action-wrapper.ts"
Cohesion: 0.13
Nodes (23): STATUS_BADGE, STATUS_LABELS, SuggestedSlot, SubscriptionForm(), DocumentUpload(), AlertProps, AlertTone, TONE_STYLES (+15 more)

### Community 27 - "UserRole"
Cohesion: 0.08
Nodes (34): AppointmentsClientProps, UserFormState, FormState, LoginResult, AccessDecision, AccessInput, AccessProfile, AuthenticationErrorLike (+26 more)

### Community 28 - "FakeMfa"
Cohesion: 0.15
Nodes (15): ClinicConfigPage(), handleSubmit(), save(), createClinicAction(), CreateClinicInput, createClinicSchema, getClinicAction(), UpdateClinicInput (+7 more)

### Community 29 - "🦷 Dental Clinic SaaS — Python Auth & MFA Microservice"
Cohesion: 0.22
Nodes (8): 1. Autenticación (`/auth`), 2. Autenticación Multifactor TOTP (`/mfa`), 3. Salud y Diagnóstico (`/health`), 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice, 📋 Endpoints de la API, ⚙️ Estructura del Microservicio, 🚀 Instalación y Ejecución, 🧪 Pruebas Automatizadas

### Community 30 - "odontogram.actions.ts"
Cohesion: 0.25
Nodes (6): CreateCustomStatusInput, customStatusSchema, FDI_TOOTH_CODES, saveToothStateSchema, SURFACES, mocks

### Community 31 - "4. Requisitos Funcionales Detallados"
Cohesion: 0.25
Nodes (8): 4.1 Módulo 1: Registro y Gestión de Consultorios (Tenants), 4.2 Módulo 2: Usuarios, Autenticación, MFA y RBAC, 4.3 Módulo 3: Gestión de Pacientes, 4.5 Módulo 5: Historia Clínica y Entradas Odontológicas, 4.6 Módulo 6: Archivos Adjuntos e Imágenes Médicas (Storage), 4.7 Módulo 7: Odontograma Digital y Estados Personalizados, 4.8 Módulo 8: Registro Inmutable de Auditoría, 4. Requisitos Funcionales Detallados

### Community 32 - "seed-clinical.mjs"
Cohesion: 0.05
Nodes (65): @supabase/supabase-js, envPath, startedAt, addDays(), ADDRESSES, admin, auditRow(), bogotaNowTime() (+57 more)

### Community 33 - "ReportRangeLimitError"
Cohesion: 0.29
Nodes (6): ReportRangeLimitError, 4.9 Módulo 9: Reportes Analíticos Operativos, 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales, validateDateRangeLimit(), 4.9 Módulo 9: Reportes Analíticos Operativos, 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales

### Community 34 - "router.py"
Cohesion: 0.22
Nodes (9): `appointments`, `audit_logs` (inmutables), `clinical_entries` (inmutables), `clinical_records`, `clinics`, `odontogram_states` (inmutables — append only), `patients`, Políticas RLS (+1 more)

### Community 35 - "consultorios-client.tsx"
Cohesion: 0.22
Nodes (13): ClinicConfigClientProps, ClinicFormState, clinicToForm(), ConsultoriosClient(), applyDetail(), handleClinicSave(), selectClinic(), ConsultoriosClientProps (+5 more)

### Community 36 - "7. Estructura del Proyecto y Desglose Archivo por Archivo"
Cohesion: 0.29
Nodes (7): 7.1 Raíz del Proyecto, 7.2 Directorio `app/` (Next.js App Router), 7.5 Directorio `components/`, 7.7 Directorio `supabase/` (Migraciones y Edge Functions), 7.8 Directorio `__tests__/` (Suites de Pruebas Frontend en TypeScript), 7.9 Directorio `.kiro/` (Especificaciones del Proyecto), 7. Estructura del Proyecto y Desglose Archivo por Archivo

### Community 37 - "test_api_contract.py"
Cohesion: 0.29
Nodes (6): ADR-001 — Documents independent of clinical notes, ADR-002 — Separate platform authorization, Clinical Workspaces and Platform Administration Design, Current behavior and proposed experience, Module layout, Proposed contracts and data

### Community 38 - "7. Estructura del Proyecto y Desglose Archivo por Archivo"
Cohesion: 0.29
Nodes (7): 7.1 Raíz del Proyecto, 7.2 Directorio `app/` (Next.js App Router), 7.5 Directorio `components/`, 7.7 Directorio `supabase/` (Migraciones y Edge Functions), 7.8 Directorio `__tests__/` (Suites de Pruebas Frontend en TypeScript), 7.9 Directorio `.kiro/` (Especificaciones del Proyecto), 7. Estructura del Proyecto y Desglose Archivo por Archivo

### Community 39 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 41 - "4. Requisitos Funcionales Detallados"
Cohesion: 0.40
Nodes (5): Data Models, Diagrama Entidad-Relación, Estructura de Buckets, Políticas de Storage, Supabase Storage

### Community 42 - "users.actions.ts"
Cohesion: 0.14
Nodes (11): DashboardPage(), UsersPage(), refreshUsers(), getDashboardStatsAction(), CreateUserInput, createUserSchema, listUsersAction(), UpdateUserInput (+3 more)

### Community 43 - "Clinical Workspaces and Platform Administration"
Cohesion: 0.50
Nodes (3): Acceptance criteria, Clinical Workspaces and Platform Administration, Proposed business rules to approve

### Community 44 - "auth-api.ts"
Cohesion: 0.07
Nodes (41): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+33 more)

### Community 45 - "package.json"
Cohesion: 0.14
Nodes (13): name, private, version, clsx, react-dom, tailwind-merge, tailwindcss, @tailwindcss/postcss (+5 more)

### Community 46 - "Manejo de Errores y Conectividad"
Cohesion: 0.50
Nodes (4): Clasificación de Errores, Control de Concurrencia Optimista, Detección de Conectividad, Manejo de Errores y Conectividad

### Community 73 - "main.py"
Cohesion: 0.08
Nodes (8): domain_error_handler(), _error_payload(), health(), unhandled_error_handler(), validation_error_handler(), _AuthWithoutSession, _client_without_session(), test_verify_setup_acepta_factor_id_en_camel_case_como_el_frontend()

### Community 85 - "Correctness Properties"
Cohesion: 0.07
Nodes (27): Correctness Properties, Property 10: Unicidad de Historia Clínica por Paciente, Property 11: Inmutabilidad de Registros Clínicos y de Auditoría, Property 12: Trazabilidad de Correcciones Clínicas, Property 13: Ordenamiento Cronológico de la Historia Clínica, Property 14: Validación de Archivos Adjuntos, Property 15: Control de Concurrencia Optimista, Property 16: Inmutabilidad del Historial del Odontograma (Append-Only) (+19 more)

### Community 96 - "app/layout.tsx"
Cohesion: 0.12
Nodes (4): metadata, metadata, metadata, features

### Community 125 - "test_auth_service.py"
Cohesion: 0.12
Nodes (6): _validate_totp_code(), VerifyLoginRequest, VerifySetupRequest, FakePostgrest, TestBoundaryValidation, TestEnrollMfa

### Community 168 - "auth.actions.ts"
Cohesion: 0.10
Nodes (23): AccountLockedError, ImmutableRecordError, InvalidCredentialsError, RoleAuthorizationError, TenantIsolationError, cancelMfaAction(), createPersistentAttemptStore(), enrollMfaAction() (+15 more)

### Community 184 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 203 - "decide_access"
Cohesion: 0.21
Nodes (6): AccessDecision, AccessInput, AccessProfile, _clinical_mfa_destination(), decide_access(), TestDecideAccess

### Community 204 - "withErrorHandling"
Cohesion: 0.13
Nodes (42): handleSave(), handleSubmit(), handleToggleActive(), ConcurrencyConflictError, UniqueDocumentError, ValidationError, 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica (+34 more)

### Community 228 - "Documento de Diseño Técnico: Dental Clinic SaaS"
Cohesion: 0.13
Nodes (14): Architecture, Decisiones de Arquitectura Clave, Diagrama de Componentes, Diagrama de Flujo de Solicitud, Documento de Diseño Técnico: Dental Clinic SaaS, Error Handling, Estructura de Rutas (Next.js App Router), Flujo de Manejo de Errores en el Cliente (+6 more)

### Community 229 - "Requirements"
Cohesion: 0.08
Nodes (24): Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación (+16 more)

### Community 300 - "Esquema PostgreSQL Completo"
Cohesion: 0.17
Nodes (12): Esquema PostgreSQL Completo, Función de Trigger `updated_at`, Tabla: `appointments` (Citas), Tabla: `audit_logs` (Registros de Auditoría — inmutables), Tabla: `clinical_attachments` (Adjuntos de Entradas Clínicas), Tabla: `clinical_entries` (Entradas Clínicas — inmutables), Tabla: `clinical_records` (Historias Clínicas — cabecera), Tabla: `clinics` (Consultorios) (+4 more)

### Community 301 - "DentalClinicError"
Cohesion: 0.35
Nodes (14): GET(), POST(), reportRequest, POST(), DentalClinicError, documentError(), documentBucket, documentRequest (+6 more)

### Community 342 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.12
Nodes (16): 10. `public.audit_logs`, 1. `public.clinics`, 2. `public.users`, 3. `public.patients`, 4. `public.appointments`, 5. `public.clinical_records`, 6.1 Esquema `public` (Tablas de Negocio), 6.2 Esquema `private` (Seguridad Interna y Bloqueos) (+8 more)

### Community 343 - "9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)"
Cohesion: 0.22
Nodes (9): 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, 9.1 Actores y Roles Participantes, 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding), 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA, 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC), 9.8 Fase 7: Correcciones Auditables de Historia Clínica (Append-Only), 9.9 Fase 8: Carga y Almacenamiento Seguro de Radiografías (Storage) (+1 more)

### Community 396 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, fast-check, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+4 more)

### Community 448 - "password-validation.property.test.ts"
Cohesion: 0.08
Nodes (19): PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), createSecurityHeaders(), nextConfig, securityHeaders, fast-check, activeUserArb (+11 more)

### Community 450 - "deps.py"
Cohesion: 0.16
Nodes (9): get_settings(), Settings, AuthConfigurationUnavailableError, get_admin_client(), get_anon_client(), get_user_client(), Resumen Matricial, 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA) (+1 more)

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

### Community 722 - "createClient"
Cohesion: 0.14
Nodes (24): dynamic, LoginLayout(), metadata, AuditPage(), metadata, AppointmentsPage(), metadata, ClinicalHistoryPage() (+16 more)

## Knowledge Gaps
- **8 isolated node(s):** `react-dom`, `tw-animate-css`, `@tailwindcss/postcss`, `@types/node`, `@types/react` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 616 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ServerActionResult` connect `types/domain.ts` to `deps.py`, `auth.actions.ts`, `users.actions.ts`, `FakeMfa`, `createClient`, `next`, `Dental Clinic SaaS — Agent Configuration`, `odontogram.actions.ts`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `withErrorHandling()` (e.g. with `5. Requisitos No Funcionales y Arquitectura de Seguridad` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`withErrorHandling()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react-dom`, `tw-animate-css`, `@tailwindcss/postcss` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Estructuras de Datos y Control de Flujo en el Backend Python` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `Tasks` connect `withErrorHandling` to `password-validation.property.test.ts`, `ReportRangeLimitError`, `AppointmentConflictError`, `reports.actions.ts`, `auth.actions.ts`, `auth-api.ts`, `history-client.tsx`, `types/domain.ts`, `next`, `Implementation Plan: Dental Clinic SaaS`, `UserRole`, `test_auth_service.py`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `requireRole()` (e.g. with `Subdirectorios de Seguridad, Auditoría y Supabase` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`requireRole()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08272859216255443 - nodes in this community are weakly interconnected._