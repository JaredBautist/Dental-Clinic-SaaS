# Graph Report - DENTAL CLINIC  (2026-10-18)

## Corpus Check
- 128 files · ~87,083 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1152 nodes · 2105 edges · 88 communities (61 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `902146fa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Estructuras de Datos y Control de Flujo en el Backend Python
- service.py
- appointments.actions.ts
- test_auth_service.py
- odontogram.actions.ts
- pacientes/page.tsx
- reports.actions.ts
- Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto
- 9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)
- patients.actions.ts
- withErrorHandling
- 6.1 Esquema `public` (Tablas de Negocio)
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- 4. Requisitos Funcionales Detallados
- scripts
- fast-check
- 6. Arquitectura de Base de Datos y Supabase
- types/domain.ts
- 🦷 Dental Clinic SaaS
- Components and Interfaces
- Architecture
- @vitejs/plugin-react
- rules/graphify.md
- workflows/graphify.md
- proxy.ts
- auth-api.ts
- package.json
- run_all_migrations.sql
- main.py
- Correctness Properties
- security-headers.property.test.ts
- router.py
- DentalClinicError
- auth.actions.ts
- compilerOptions
- decide_access
- requireRole
- Documento de Diseño Técnico: Dental Clinic SaaS
- Requirements
- Esquema PostgreSQL Completo
- login-attempt-store.ts
- Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto
- 9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)
- devDependencies
- password-validation.property.test.ts
- 6.1 Esquema `public` (Tablas de Negocio)
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- dependencies
- 4. Requisitos Funcionales Detallados
- 013_fix_security_foundation.sql
- Dental Clinic SaaS — Agent Configuration
- ADR-001: Contexto de autorización, MFA y RLS
- Categorías de Pruebas
- users
- Implementation Plan: Dental Clinic SaaS
- appointments
- bootstrap_supabase.sql
- 6. Arquitectura de Base de Datos y Supabase
- 001_create_clinics.sql
- 003_create_patients.sql
- clinical_attachments
- odontogram_states
- Flujo de Autenticación y Manejo de Sesiones
- Error Handling
- custom_tooth_statuses
- run_migrations.sh
- core/__init__.py
- app/__init__.py
- tests/__init__.py
- eslint.config.mjs
- postcss.config.mjs
- 010_create_audit_logs.sql
- appointments
- audit_logs
- clinical_attachments
- custom_tooth_statuses
- odontogram_states
- clinical_entries
- clinics
- patients
- users

## God Nodes (most connected - your core abstractions)
1. `DentalClinicError` - 56 edges
2. `withErrorHandling()` - 43 edges
3. `requireRole()` - 37 edges
4. `cn()` - 36 edges
5. `Correctness Properties` - 27 edges
6. `FakeAuth` - 23 edges
7. `createAuditLog()` - 23 edges
8. `react` - 22 edges
9. `vitest` - 21 edges
10. `FakeClient` - 20 edges

## Surprising Connections (you probably didn't know these)
- `handleVerify()` --calls--> `verifyMfaSetupAction()`  [EXTRACTED]
  app/(auth)/setup-mfa/page.tsx → lib/api/auth-api.ts
- `handleCancel()` --calls--> `cancelMfaAction()`  [EXTRACTED]
  app/(auth)/setup-mfa/page.tsx → lib/api/auth-api.ts
- `handleVerify()` --calls--> `verifyMfaLoginAction()`  [EXTRACTED]
  app/(auth)/verify-mfa/page.tsx → lib/api/auth-api.ts
- `handleCancel()` --calls--> `cancelMfaAction()`  [EXTRACTED]
  app/(auth)/verify-mfa/page.tsx → lib/api/auth-api.ts
- `Sidebar()` --calls--> `cn()`  [EXTRACTED]
  components/layout/Sidebar.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (88 total, 20 thin omitted)

### Community 0 - "Estructuras de Datos y Control de Flujo en el Backend Python"
Cohesion: 0.07
Nodes (27): 1. Condicionales (`if`, `elif`, `else` y Expresiones Ternarias), 2. Bucles e Iteraciones (`for`, List Comprehensions), 3. Tuplas (`tuple`: Inmutabilidad, Desempaquetado y Hashing), 4. Colas (`Queue` / FIFO — First In, First Out), 5. Pilas (`Stack` / LIFO — Last In, First Out), A. Control de Fuerza Bruta y Roles Clínicos, A. Desempaquetado de Encabezado Authorization (`str.partition`), A. Limpieza de Factores TOTP Huérfanos (+19 more)

### Community 1 - "service.py"
Cohesion: 0.06
Nodes (55): _first_row(), LoginAttemptStore, Any, AsyncClient, Store persistente de intentos de login — port de lib/auth/login-attempt-…, Adapter de persistencia para las RPC atómicas de intentos de login., cancel_mfa(), _confirm_aal2() (+47 more)

### Community 2 - "appointments.actions.ts"
Cohesion: 0.15
Nodes (14): AppointmentConflictError, appointmentSchema, calculateSuggestedSlots(), cancelAppointmentAction(), CancelAppointmentInput, cancelSchema, createAppointmentAction(), CreateAppointmentInput (+6 more)

### Community 3 - "test_auth_service.py"
Cohesion: 0.07
Nodes (22): FailedAttemptStatus, LockoutStatus, FakeAttemptStore, FakeAuth, FakeClient, FakeMfa, FakePostgrest, FakeQuery (+14 more)

### Community 4 - "odontogram.actions.ts"
Cohesion: 0.15
Nodes (13): ConcurrencyConflictError, CreateCustomStatusInput, createCustomToothStatusAction(), customStatusSchema, FDI_TOOTH_CODES, getOdontogramStateAction(), listCustomToothStatusesAction(), saveToothStateAction() (+5 more)

### Community 5 - "pacientes/page.tsx"
Cohesion: 0.06
Nodes (63): AppointmentForm(), AppointmentsPage(), dentists, mockAppointments, statusColors, statusLabels, ClinicConfigPage(), mockClinic (+55 more)

### Community 6 - "reports.actions.ts"
Cohesion: 0.21
Nodes (11): ReportRangeLimitError, AppointmentStatusReportResult, AttendedPatientsReportResult, getAppointmentStatusReportAction(), getAttendedPatientsReportAction(), ReportFilterInput, reportFilterSchema, validateDateRangeLimit() (+3 more)

### Community 7 - "Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto"
Cohesion: 0.15
Nodes (12): 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 3. Stack Tecnológico y Herramientas, 5. Requisitos No Funcionales y Arquitectura de Seguridad, 8. Estado Actual del Desarrollo y Siguientes Pasos, Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto (+4 more)

### Community 8 - "9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)"
Cohesion: 0.15
Nodes (13): 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales, 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, 9.1 Actores y Roles Participantes, 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding), 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA, 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC), 9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica (+5 more)

### Community 9 - "patients.actions.ts"
Cohesion: 0.18
Nodes (11): BIOLOGICAL_SEXES, DOCUMENT_TYPES, getPatientByIdAction(), PatientInput, patientSchema, searchPatientsAction(), UpdatePatientInput, mocks (+3 more)

### Community 10 - "withErrorHandling"
Cohesion: 0.26
Nodes (10): getClinicAction(), registerClinicAction(), RegisterClinicInput, registerClinicSchema, updateClinicAction(), UpdateClinicInput, updateClinicSchema, withErrorHandling() (+2 more)

### Community 11 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.18
Nodes (11): 10. `public.audit_logs`, 1. `public.clinics`, 2. `public.users`, 3. `public.patients`, 4. `public.appointments`, 5. `public.clinical_records`, 6.1 Esquema `public` (Tablas de Negocio), 6. `public.clinical_entries` (+3 more)

### Community 12 - "7. Estructura del Proyecto y Desglose Archivo por Archivo"
Cohesion: 0.18
Nodes (11): 7.1 Raíz del Proyecto, 7.2 Directorio `app/` (Next.js App Router), 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 7.4 Directorio `types/` y `errors/`, 7.5 Directorio `components/`, 7.6 Directorio `supabase/` (Migraciones y Edge Functions), 7.7 Directorio `__tests__/` (Suites de Pruebas), 7.8 Directorio `.kiro/` (Especificaciones del Proyecto) (+3 more)

### Community 13 - "4. Requisitos Funcionales Detallados"
Cohesion: 0.20
Nodes (10): 4.1 Módulo 1: Registro y Gestión de Consultorios (Tenants), 4.2 Módulo 2: Usuarios, Autenticación, MFA y RBAC, 4.3 Módulo 3: Gestión de Pacientes, 4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones, 4.5 Módulo 5: Historia Clínica y Entradas Odontológicas, 4.6 Módulo 6: Archivos Adjuntos e Imágenes Médicas (Storage), 4.7 Módulo 7: Odontograma Digital y Estados Personalizados, 4.8 Módulo 8: Registro Inmutable de Auditoría (+2 more)

### Community 14 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:db, test:run

### Community 15 - "fast-check"
Cohesion: 0.29
Nodes (3): fast-check, TenantRecord, uuidArb

### Community 16 - "6. Arquitectura de Base de Datos y Supabase"
Cohesion: 0.40
Nodes (5): 6.2 Esquema `private` (Seguridad Interna y Bloqueos), 6.3 Funciones SQL y Triggers, 6.4 Políticas RLS (Row Level Security), 6.5 Supabase Storage, 6. Arquitectura de Base de Datos y Supabase

### Community 17 - "types/domain.ts"
Cohesion: 0.13
Nodes (18): ENTRY_TYPES, getClinicalHistoryAction(), saveClinicalEntryAction(), SaveClinicalEntryInput, saveClinicalEntrySchema, requireAuthUser(), VALID_ROLES, mocks (+10 more)

### Community 18 - "🦷 Dental Clinic SaaS"
Cohesion: 0.05
Nodes (36): 🏢 1. Gestión de Consultorios (Multitenencia), 👥 2. Gestión de Usuarios y Roles, 🔐 3. Autenticación y Control de Sesiones, 🧑‍⚕️ 4. Gestión de Pacientes, 📅 5. Gestión de Citas, 🏥 6. Historia Clínica Odontológica, 🦷 7. Odontograma Digital, 🔒 8. Seguridad y Trazabilidad (+28 more)

### Community 19 - "Components and Interfaces"
Cohesion: 0.40
Nodes (5): Components and Interfaces, Diseño del Odontograma SVG, Estrategia Server Actions vs Route Handlers, Estructura de Componentes Principales, Interfaces TypeScript Principales

### Community 20 - "Architecture"
Cohesion: 0.50
Nodes (4): Architecture, Decisiones de Arquitectura Clave, Diagrama de Componentes, Diagrama de Flujo de Solicitud

### Community 27 - "proxy.ts"
Cohesion: 0.08
Nodes (32): LoginResult, LoginResult, AccessDecision, AccessInput, AccessProfile, AuthenticationErrorLike, AuthenticatorAssuranceLevel, clinicalMfaDestination() (+24 more)

### Community 44 - "auth-api.ts"
Cohesion: 0.09
Nodes (31): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+23 more)

### Community 45 - "package.json"
Cohesion: 0.12
Nodes (15): name, private, version, clsx, eslint, eslint-config-next, react-dom, @supabase/supabase-js (+7 more)

### Community 51 - "run_all_migrations.sql"
Cohesion: 0.12
Nodes (25): clinical_records, set_clinical_records_updated_at, clinics, patients, update_updated_at_column, clinical_entries, clinics, patients (+17 more)

### Community 73 - "main.py"
Cohesion: 0.08
Nodes (31): get_settings(), Igual que proxy.ts: sin configuración de Supabase se falla cerrado (503)., Settings, AuthConfigurationUnavailableError, get_admin_client(), get_anon_client(), get_user_client(), AsyncClient (+23 more)

### Community 85 - "Correctness Properties"
Cohesion: 0.07
Nodes (27): Correctness Properties, Property 10: Unicidad de Historia Clínica por Paciente, Property 11: Inmutabilidad de Registros Clínicos y de Auditoría, Property 12: Trazabilidad de Correcciones Clínicas, Property 13: Ordenamiento Cronológico de la Historia Clínica, Property 14: Validación de Archivos Adjuntos, Property 15: Control de Concurrencia Optimista, Property 16: Inmutabilidad del Historial del Odontograma (Append-Only) (+19 more)

### Community 96 - "security-headers.property.test.ts"
Cohesion: 0.31
Nodes (5): metadata, createSecurityHeaders(), nextConfig, securityHeaders, next

### Community 125 - "router.py"
Cohesion: 0.13
Nodes (23): Módulo de autenticación y MFA — port de lib/actions/auth.actions.ts., cancel_endpoint(), enroll_endpoint(), login_endpoint(), logout_endpoint(), _ok(), Any, AsyncClient (+15 more)

### Community 126 - "DentalClinicError"
Cohesion: 0.15
Nodes (16): AccountLockedError, DentalClinicError, ImmutableRecordError, InvalidCredentialsError, RoleAuthorizationError, TenantIsolationError, UniqueDocumentError, ValidationError (+8 more)

### Community 168 - "auth.actions.ts"
Cohesion: 0.13
Nodes (18): cancelMfaAction(), createPersistentAttemptStore(), enrollMfaAction(), failMfaVerification(), loginSchema, logoutAction(), requireClinicalUser(), USER_ROLES (+10 more)

### Community 184 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 203 - "decide_access"
Cohesion: 0.24
Nodes (10): AccessDecision, AccessInput, AccessProfile, _clinical_mfa_destination(), decide_access(), Política de acceso — port 1:1 de lib/auth/access-policy.ts. Función pura, sin…, Decide el acceso observable para una ruta sin depender de Next.js ni Supabase.…, Port 1:1 de __tests__/unit/access-policy.test.ts. (+2 more)

### Community 204 - "requireRole"
Cohesion: 0.15
Nodes (22): POST(), signedUrlRequestSchema, ALLOWED_FILE_TYPES, listEntryAttachmentsAction(), uploadAttachmentAction(), UploadAttachmentInput, uploadAttachmentSchema, createUserAction() (+14 more)

### Community 228 - "Documento de Diseño Técnico: Dental Clinic SaaS"
Cohesion: 0.18
Nodes (10): Clasificación de Errores, Control de Concurrencia Optimista, Detección de Conectividad, Documento de Diseño Técnico: Dental Clinic SaaS, Estructura de Rutas (Next.js App Router), Manejo de Errores y Conectividad, Middleware de Autenticación, Overview (+2 more)

### Community 229 - "Requirements"
Cohesion: 0.08
Nodes (24): Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación (+16 more)

### Community 300 - "Esquema PostgreSQL Completo"
Cohesion: 0.08
Nodes (26): `appointments`, `audit_logs` (inmutables), `clinical_entries` (inmutables), `clinical_records`, `clinics`, Data Models, Diagrama Entidad-Relación, Esquema PostgreSQL Completo (+18 more)

### Community 301 - "login-attempt-store.ts"
Cohesion: 0.21
Nodes (8): FailedAttemptRow, FailedAttemptStatus, hashLoginIdentifier(), LockoutRow, LockoutStatus, RpcError, RpcInvoker, RpcResult

### Community 342 - "Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto"
Cohesion: 0.15
Nodes (12): 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 3. Stack Tecnológico y Herramientas, 5. Requisitos No Funcionales y Arquitectura de Seguridad, 8. Estado Actual del Desarrollo y Siguientes Pasos, Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto (+4 more)

### Community 343 - "9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)"
Cohesion: 0.15
Nodes (13): 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales, 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, 9.1 Actores y Roles Participantes, 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding), 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA, 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC), 9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica (+5 more)

### Community 396 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, fast-check, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+4 more)

### Community 448 - "password-validation.property.test.ts"
Cohesion: 0.22
Nodes (9): PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), alphanumericArb, digitCharArb, lowerCharArb, specialCharArb, upperCharArb (+1 more)

### Community 449 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.18
Nodes (11): 10. `public.audit_logs`, 1. `public.clinics`, 2. `public.users`, 3. `public.patients`, 4. `public.appointments`, 5. `public.clinical_records`, 6.1 Esquema `public` (Tablas de Negocio), 6. `public.clinical_entries` (+3 more)

### Community 450 - "7. Estructura del Proyecto y Desglose Archivo por Archivo"
Cohesion: 0.18
Nodes (11): 7.1 Raíz del Proyecto, 7.2 Directorio `app/` (Next.js App Router), 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 7.4 Directorio `types/` y `errors/`, 7.5 Directorio `components/`, 7.6 Directorio `supabase/` (Migraciones y Edge Functions), 7.7 Directorio `__tests__/` (Suites de Pruebas), 7.8 Directorio `.kiro/` (Especificaciones del Proyecto) (+3 more)

### Community 505 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, clsx, lucide-react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js (+2 more)

### Community 506 - "4. Requisitos Funcionales Detallados"
Cohesion: 0.20
Nodes (10): 4.1 Módulo 1: Registro y Gestión de Consultorios (Tenants), 4.2 Módulo 2: Usuarios, Autenticación, MFA y RBAC, 4.3 Módulo 3: Gestión de Pacientes, 4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones, 4.5 Módulo 5: Historia Clínica y Entradas Odontológicas, 4.6 Módulo 6: Archivos Adjuntos e Imágenes Médicas (Storage), 4.7 Módulo 7: Odontograma Digital y Estados Personalizados, 4.8 Módulo 8: Registro Inmutable de Auditoría (+2 more)

### Community 507 - "013_fix_security_foundation.sql"
Cohesion: 0.22
Nodes (3): public.users, private.current_clinic_id(), private.current_user_role()

### Community 508 - "Dental Clinic SaaS — Agent Configuration"
Cohesion: 0.22
Nodes (8): Dental Clinic SaaS — Agent Configuration, Invocation Rule, Key Architectural Principles, Mandatory Default Skills (Frontend / UI / UX), Project Context Reference, Project Overview, Python Auth API (`backend/`), Technology Stack

### Community 548 - "ADR-001: Contexto de autorización, MFA y RLS"
Cohesion: 0.22
Nodes (8): ADR-001: Contexto de autorización, MFA y RLS, Consecuencias, Contexto, Criterios de regresión, Decisión, Estado, Opciones consideradas, Referencias

### Community 549 - "Categorías de Pruebas"
Cohesion: 0.22
Nodes (9): 1. Pruebas de Propiedades (Property-Based Tests) — `fast-check`, 2. Pruebas de Ejemplo (Unit Tests) — Vitest, 3. Pruebas de Integración — Supabase local (docker), 4. Pruebas de Humo (Smoke Tests), Categorías de Pruebas, Configuración de fast-check, Enfoque Dual, Estrategia de Mocks para Supabase (+1 more)

### Community 619 - "users"
Cohesion: 0.29
Nodes (6): set_users_updated_at, auth, auth.users, clinics, update_updated_at_column, users

### Community 634 - "Implementation Plan: Dental Clinic SaaS"
Cohesion: 0.33
Nodes (5): Implementation Plan: Dental Clinic SaaS, Notes, Overview, Task Dependency Graph, Tasks

### Community 635 - "appointments"
Cohesion: 0.40
Nodes (4): appointments, clinics, patients, users

### Community 636 - "bootstrap_supabase.sql"
Cohesion: 0.40
Nodes (3): auth.users, storage.buckets, storage.objects

### Community 653 - "6. Arquitectura de Base de Datos y Supabase"
Cohesion: 0.40
Nodes (5): 6.2 Esquema `private` (Seguridad Interna y Bloqueos), 6.3 Funciones SQL y Triggers, 6.4 Políticas RLS (Row Level Security), 6.5 Supabase Storage, 6. Arquitectura de Base de Datos y Supabase

### Community 654 - "001_create_clinics.sql"
Cohesion: 0.40
Nodes (3): clinics, set_clinics_updated_at, update_updated_at_column

### Community 655 - "003_create_patients.sql"
Cohesion: 0.40
Nodes (4): patients, set_patients_updated_at, clinics, update_updated_at_column

### Community 656 - "clinical_attachments"
Cohesion: 0.40
Nodes (4): clinical_attachments, clinical_entries, clinics, patients

### Community 657 - "odontogram_states"
Cohesion: 0.40
Nodes (4): odontogram_states, clinics, patients, users

### Community 677 - "Flujo de Autenticación y Manejo de Sesiones"
Cohesion: 0.50
Nodes (4): Diagrama de Flujo de Autenticación, Flujo de Autenticación y Manejo de Sesiones, Headers de Seguridad HTTP, Manejo de Inactividad (30 minutos)

### Community 678 - "Error Handling"
Cohesion: 0.50
Nodes (4): Error Handling, Flujo de Manejo de Errores en el Cliente, Jerarquía de Errores del Sistema, Manejo de Errores en Server Actions

## Knowledge Gaps
- **428 isolated node(s):** `roleArb`, `uuidArb`, `activeUserArb`, `upperCharArb`, `lowerCharArb` (+423 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 607 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `auth.actions.ts` to `password-validation.property.test.ts`, `security-headers.property.test.ts`, `appointments.actions.ts`, `odontogram.actions.ts`, `reports.actions.ts`, `patients.actions.ts`, `withErrorHandling`, `requireRole`, `package.json`, `login-attempt-store.ts`, `fast-check`, `types/domain.ts`, `proxy.ts`, `DentalClinicError`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `react` connect `pacientes/page.tsx` to `auth-api.ts`, `package.json`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `zod` connect `requireRole` to `appointments.actions.ts`, `odontogram.actions.ts`, `reports.actions.ts`, `auth.actions.ts`, `patients.actions.ts`, `withErrorHandling`, `package.json`, `types/domain.ts`, `DentalClinicError`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `roleArb`, `uuidArb`, `activeUserArb` to the rest of the system?**
  _428 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Estructuras de Datos y Control de Flujo en el Backend Python` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05860805860805861 - nodes in this community are weakly interconnected._
- **Should `test_auth_service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06716417910447761 - nodes in this community are weakly interconnected._