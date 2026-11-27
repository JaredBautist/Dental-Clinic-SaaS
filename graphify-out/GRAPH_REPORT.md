# Graph Report - DENTAL CLINIC  (2026-11-27)

## Corpus Check
- 207 files · ~805,237 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .kiro 1, .ico 1)

## Summary
- 1687 nodes · 4237 edges · 118 communities (84 shown, 34 thin omitted)
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
- FakeAuth
- patients-client.tsx
- dashboard/page.tsx
- plataforma/page.tsx
- 6.1 Esquema `public` (Tablas de Negocio)
- saveClinicalEntryAction
- types/domain.ts
- run_all_migrations.sql
- Button
- Button
- login-attempt-store.ts
- scripts
- consultorios/page.tsx
- AppointmentsClient
- patients.actions.ts
- 🦷 Dental Clinic SaaS
- 013_fix_security_foundation.sql
- Sidebar.tsx
- @vitejs/plugin-react
- FakeAttemptStore
- test_api_contract.py
- withErrorHandling
- react
- proxy.ts
- DentalClinicError
- 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice
- access-policy.ts
- clinical-documents.tsx
- seed-clinical.mjs
- OdontogramClient
- router.py
- users-client.tsx
- 015_clinical_workspaces.sql
- test_api_contract.py
- Public Landing and Load Performance Design
- UserRole
- jwt-claims.property.test.ts
- 4. Requisitos Funcionales Detallados
- appointments
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
- config.py
- next
- Flujo de Autenticación y Manejo de Sesiones
- Error Handling
- Responsive Role Dashboards Design
- users
- patients
- Hosted Release Design
- hosted-release/requirements.md
- hosted-release/tasks.md
- public-landing-performance/requirements.md
- public-landing-performance/tasks.md
- role-dashboards-responsive/requirements.md
- role-dashboards-responsive/tasks.md
- clinical_attachments
- odontogram_states
- bootstrap_supabase.sql
- Principales Ubicaciones
- Principales Ubicaciones
- main.py
- 010_create_audit_logs.sql
- 001_create_clinics.sql
- custom_tooth_statuses
- BiologicalSex
- ToothSurface
- Correctness Properties
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
- PageHeader
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

## Communities (118 total, 34 thin omitted)

### Community 0 - "Estructuras de Datos y Control de Flujo en el Backend Python"
Cohesion: 0.12
Nodes (16): 1. Condicionales (`if`, `elif`, `else` y Expresiones Ternarias), 4. Colas (`Queue` / FIFO — First In, First Out), 5. Pilas (`Stack` / LIFO — Last In, First Out), A. Control de Fuerza Bruta y Roles Clínicos, A. Patrón Transactional Outbox (Cola Persistente de Notificaciones de Bloqueo), A. Pila de Middlewares de FastAPI / Starlette (Middleware Stack), B. Call Stack y Desapilado de Excepciones (*Stack Unwinding* LIFO), B. Cola de Tareas Asíncronas del Event Loop (`asyncio`) (+8 more)

### Community 1 - "service.py"
Cohesion: 0.08
Nodes (24): cancel_mfa(), _confirm_aal2(), enroll_mfa(), EnrollResult, _fail_mfa(), _is_valid_profile(), logout(), MfaVerifyResult (+16 more)

### Community 2 - "Tasks"
Cohesion: 0.18
Nodes (12): AppointmentConflictError, 9.6 Fase 5: Agendamiento de Citas y Resolución de Conflictos Horarios, appointmentSchema, calculateSuggestedSlots(), CancelAppointmentInput, cancelSchema, createAppointmentAction(), CreateAppointmentInput (+4 more)

### Community 3 - "FakeAuth"
Cohesion: 0.08
Nodes (9): verify_mfa_login(), FakeAuth, FakeClient, FakeMfa, FakeQuery, _jwt_with_aal(), TestSessionTermination, TestVerifyMfaLogin (+1 more)

### Community 4 - "patients-client.tsx"
Cohesion: 0.11
Nodes (39): ACTION_LABELS, AuditClient(), clearFilters(), handleEntityTypeChange(), handleResultChange(), refresh(), ENTITY_TYPE_LABELS, formatTimestamp() (+31 more)

### Community 5 - "dashboard/page.tsx"
Cohesion: 0.13
Nodes (34): ClinicConfigClient(), handleSubmit(), resetForm(), ClinicConfigPage(), CreateClinicForm(), handleSubmit(), ClinicFormState, clinicToForm() (+26 more)

### Community 6 - "plataforma/page.tsx"
Cohesion: 0.20
Nodes (12): AppointmentsPage(), metadata, todayRangeIso(), PlatformPage(), Subscription, runReport(), runReport(), calendar (+4 more)

### Community 7 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.04
Nodes (45): 10. `public.audit_logs`, 1. `public.clinics`, 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 2. `public.users`, 3. `public.patients` (+37 more)

### Community 8 - "saveClinicalEntryAction"
Cohesion: 0.08
Nodes (28): ConcurrencyConflictError, 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría, 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia, 9.1 Actores y Roles Participantes, 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding), 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA, 9.7 Fase 6: Atención Odontológica, Odontograma e Inmutabilidad Médica, 9.8 Fase 7: Correcciones Auditables de Historia Clínica (Append-Only) (+20 more)

### Community 9 - "types/domain.ts"
Cohesion: 0.19
Nodes (21): ENTRY_FORM_TYPES, ENTRY_TYPE_LABELS, ENTRY_TYPE_VARIANTS, formatDate(), HistoryClientProps, patientAge(), OdontogramClientProps, PatientsClientProps (+13 more)

### Community 10 - "run_all_migrations.sql"
Cohesion: 0.08
Nodes (41): clinical_records, idx_clinical_records_clinic_patient, set_clinical_records_updated_at, clinical_entries, idx_clinical_entries_clinic_patient, idx_clinical_entries_record, appointments, audit_logs (+33 more)

### Community 11 - "Button"
Cohesion: 0.13
Nodes (8): _first_row(), LoginAttemptStore, login(), LoginResult, LoginAttemptStoreError, decode_aal_claim(), hash_login_identifier(), Resumen Matricial

### Community 12 - "Button"
Cohesion: 0.17
Nodes (12): DashboardError(), HistoryClient(), closeEntryModal(), handleSaveEntry(), refreshHistory(), NotFound(), ClinicalDocuments(), previewReport() (+4 more)

### Community 13 - "login-attempt-store.ts"
Cohesion: 0.19
Nodes (9): createLoginAttemptStore(), FailedAttemptRow, FailedAttemptStatus, hashLoginIdentifier(), LockoutRow, LockoutStatus, RpcError, RpcInvoker (+1 more)

### Community 14 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, keep-alive, lint, seed:clinical, seed:staff, seed:users (+4 more)

### Community 15 - "consultorios/page.tsx"
Cohesion: 0.20
Nodes (15): CreateClinicPage(), metadata, ConsultoriosPage(), ConsultoriosPageProps, metadata, DashboardPage(), DashboardLayout(), dynamic (+7 more)

### Community 16 - "AppointmentsClient"
Cohesion: 0.12
Nodes (24): AppointmentsClient(), applySuggestedSlot(), goToday(), handleCancel(), handleCreate(), handleReschedule(), loadDay(), navigate() (+16 more)

### Community 17 - "patients.actions.ts"
Cohesion: 0.08
Nodes (23): ValidationError, ALLOWED_FILE_TYPES, UploadAttachmentInput, uploadAttachmentSchema, auditFiltersSchema, DashboardStats, getDashboardStatsAction(), BIOLOGICAL_SEXES (+15 more)

### Community 18 - "🦷 Dental Clinic SaaS"
Cohesion: 0.04
Nodes (44): 1. Clonar el repositorio y configurar variables de entorno, 🏢 1. Gestión de Consultorios (Multitenencia), 1. Pruebas Frontend en TypeScript (Vitest - 74 pruebas), 2. Configurar y levantar el Microservicio Python (Backend), 👥 2. Gestión de Usuarios y Roles, 2. Pruebas Backend en Python (Pytest - 32 pruebas), 🔐 3. Autenticación y Control de Sesiones, 3. Configurar y levantar la aplicación Next.js (Frontend) (+36 more)

### Community 19 - "013_fix_security_foundation.sql"
Cohesion: 0.16
Nodes (10): enforce_clinical_record_version_update, private.current_clinic_id(), private.current_user_role(), private.enforce_clinical_record_version_update(), private.login_attempts, private.security_notification_outbox, public.check_login_lockout(), public.custom_access_token_hook() (+2 more)

### Community 20 - "Sidebar.tsx"
Cohesion: 0.20
Nodes (13): NavItem, navItems, ROLE_LABELS, Sidebar(), handleLogout(), SidebarProps, logoutAction(), clinicSwitchHref() (+5 more)

### Community 22 - "FakeAttemptStore"
Cohesion: 0.16
Nodes (6): FailedAttemptStatus, LockoutStatus, FakeAttemptStore, FakePostgrest, TestEnrollMfa, TestLogin

### Community 23 - "test_api_contract.py"
Cohesion: 0.16
Nodes (3): _AuthWithoutSession, _client_without_session(), test_verify_setup_acepta_factor_id_en_camel_case_como_el_frontend()

### Community 25 - "withErrorHandling"
Cohesion: 0.08
Nodes (39): POST(), signedUrlRequestSchema, handleSubmit(), save(), 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC), clinicDataSchema, clinicIdSchema, createClinicUserAction() (+31 more)

### Community 26 - "react"
Cohesion: 0.12
Nodes (26): CreatedClinic, EMPTY_FORM, FormState, CreateClinicUserForm(), handleBlur(), handleSubmit(), CreatedUser, FieldErrors (+18 more)

### Community 27 - "proxy.ts"
Cohesion: 0.19
Nodes (14): isUnauthenticatedError(), AUTH_CONTEXT_HEADERS, buildVerifiedRequestHeaders(), stripUntrustedAuthHeaders(), VerifiedClaims, config, copyResponseCookies(), createRedirect() (+6 more)

### Community 28 - "DentalClinicError"
Cohesion: 0.26
Nodes (11): DentalClinicError, ImmutableRecordError, requirePlatformAccess(), subscriptionSchema, updateSubscription(), credentialsSchema, getPlatformUserEmailAction(), requireTarget() (+3 more)

### Community 29 - "🦷 Dental Clinic SaaS — Python Auth & MFA Microservice"
Cohesion: 0.22
Nodes (8): 1. Autenticación (`/auth`), 2. Autenticación Multifactor TOTP (`/mfa`), 3. Salud y Diagnóstico (`/health`), 🦷 Dental Clinic SaaS — Python Auth & MFA Microservice, 📋 Endpoints de la API, ⚙️ Estructura del Microservicio, 🚀 Instalación y Ejecución, 🧪 Pruebas Automatizadas

### Community 30 - "access-policy.ts"
Cohesion: 0.17
Nodes (14): AccessDecision, AccessInput, AccessProfile, AuthenticationErrorLike, AuthenticatorAssuranceLevel, clinicalMfaDestination(), decideAccess(), isClinicalRole() (+6 more)

### Community 31 - "clinical-documents.tsx"
Cohesion: 0.29
Nodes (6): renderPatientPdf(), paragraph(), PatientReportPreview, ReportSection, reportSections, pdf-lib

### Community 32 - "seed-clinical.mjs"
Cohesion: 0.05
Nodes (65): @supabase/supabase-js, envPath, startedAt, addDays(), ADDRESSES, admin, auditRow(), bogotaNowTime() (+57 more)

### Community 33 - "OdontogramClient"
Cohesion: 0.20
Nodes (14): FdiToothCode, LOWER_ROW, OdontogramClient(), closeEditor(), handleSave(), openEditor(), renderTooth(), stateFor() (+6 more)

### Community 34 - "router.py"
Cohesion: 0.22
Nodes (9): `appointments`, `audit_logs` (inmutables), `clinical_entries` (inmutables), `clinical_records`, `clinics`, `odontogram_states` (inmutables — append only), `patients`, Políticas RLS (+1 more)

### Community 35 - "users-client.tsx"
Cohesion: 0.19
Nodes (13): roleConfig, UserForm(), UsersClientProps, Modal(), ModalProps, useFocusTrap(), Select, SelectProps (+5 more)

### Community 36 - "015_clinical_workspaces.sql"
Cohesion: 0.24
Nodes (8): audit_clinical_document, clinical_documents_patient_date, private.audit_clinical_document(), private.platform_operators, private.protect_clinic_subscription(), protect_clinic_subscription, public.clinical_documents, public.has_platform_access()

### Community 37 - "test_api_contract.py"
Cohesion: 0.25
Nodes (7): Administrative dashboard clinic selection, ADR-001 — Documents independent of clinical notes, ADR-002 — Separate platform authorization, Clinical Workspaces and Platform Administration Design, Current behavior and proposed experience, Module layout, Proposed contracts and data

### Community 38 - "Public Landing and Load Performance Design"
Cohesion: 0.29
Nodes (6): ADR-001 — Optimize rendering without changing authentication, Landing, Local verification, Pre-implementation evidence, Proposed layout, Public Landing and Load Performance Design

### Community 39 - "UserRole"
Cohesion: 0.18
Nodes (12): AuditClientProps, AppointmentsClientProps, UserFormState, FormState, AuditLogEntry, AuditLogFilters, LoginResult, LoginResult (+4 more)

### Community 40 - "jwt-claims.property.test.ts"
Cohesion: 0.29
Nodes (4): activeUserArb, roleArb, uuidArb, JWTClaims

### Community 41 - "4. Requisitos Funcionales Detallados"
Cohesion: 0.40
Nodes (5): Data Models, Diagrama Entidad-Relación, Estructura de Buckets, Políticas de Storage, Supabase Storage

### Community 42 - "appointments"
Cohesion: 0.27
Nodes (6): appointments, idx_appointments_clinic_id, idx_appointments_dentist_date, idx_appointments_patient, idx_appointments_status, set_appointments_updated_at

### Community 43 - "Clinical Workspaces and Platform Administration"
Cohesion: 0.50
Nodes (3): Acceptance criteria, Clinical Workspaces and Platform Administration, Proposed business rules to approve

### Community 44 - "auth-api.ts"
Cohesion: 0.14
Nodes (24): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+16 more)

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
Cohesion: 0.20
Nodes (10): ClinicConfigClientProps, ConsultoriosClientProps, CreateClinicUserFormProps, AdminClinicDetail, react-dom, dashboard(), mocks, north (+2 more)

### Community 49 - "Rollout on Render and Vercel"
Cohesion: 0.40
Nodes (4): Render, Rollout on Render and Vercel, Vercel, Verification

### Community 53 - "Sidebar clinic switcher"
Cohesion: 0.40
Nodes (4): Acceptance criteria, Design and tasks, Presentation, Sidebar clinic switcher

### Community 55 - "next"
Cohesion: 0.09
Nodes (7): metadata, metadata, metadata, metadata, workflow, SessionTimer(), next

### Community 56 - "Flujo de Autenticación y Manejo de Sesiones"
Cohesion: 0.50
Nodes (4): Diagrama de Flujo de Autenticación, Flujo de Autenticación y Manejo de Sesiones, Headers de Seguridad HTTP, Manejo de Inactividad (30 minutos)

### Community 57 - "Error Handling"
Cohesion: 0.50
Nodes (4): Error Handling, Flujo de Manejo de Errores en el Cliente, Jerarquía de Errores del Sistema, Manejo de Errores en Server Actions

### Community 58 - "Responsive Role Dashboards Design"
Cohesion: 0.50
Nodes (3): ADR-001 — Adapt to the content width, Module boundaries, Responsive Role Dashboards Design

### Community 59 - "users"
Cohesion: 0.36
Nodes (4): idx_users_clinic_id, idx_users_clinic_role, set_users_updated_at, users

### Community 60 - "patients"
Cohesion: 0.48
Nodes (5): idx_patients_clinic_id, idx_patients_document, idx_patients_search, patients, set_patients_updated_at

### Community 68 - "clinical_attachments"
Cohesion: 0.38
Nodes (3): clinical_attachments, idx_clinical_attachments_clinic_patient, idx_clinical_attachments_entry

### Community 69 - "odontogram_states"
Cohesion: 0.38
Nodes (3): idx_odontogram_clinic_patient, idx_odontogram_latest, odontogram_states

### Community 70 - "bootstrap_supabase.sql"
Cohesion: 0.33
Nodes (3): auth.users, storage.buckets, storage.objects

### Community 71 - "Principales Ubicaciones"
Cohesion: 0.40
Nodes (5): 2. Bucles e Iteraciones (`for`, List Comprehensions), A. Limpieza de Factores TOTP Huérfanos, B. Comprensión de Listas (List Comprehension con `for` filtrado), C. Búsqueda de Mensaje en Errores de Validación de Pydantic, Principales Ubicaciones

### Community 72 - "Principales Ubicaciones"
Cohesion: 0.40
Nodes (5): 3. Tuplas (`tuple`: Inmutabilidad, Desempaquetado y Hashing), A. Desempaquetado de Encabezado Authorization (`str.partition`), B. Comprobación Inmutable de Claims con Tuplas, C. Tuplas Inmutables de Pertenencia y Configuración, Principales Ubicaciones

### Community 73 - "main.py"
Cohesion: 0.16
Nodes (5): domain_error_handler(), _error_payload(), health(), unhandled_error_handler(), validation_error_handler()

### Community 74 - "010_create_audit_logs.sql"
Cohesion: 0.70
Nodes (4): audit_logs, idx_audit_clinic_timestamp, idx_audit_entity, idx_audit_user

### Community 75 - "001_create_clinics.sql"
Cohesion: 0.83
Nodes (3): clinics, set_clinics_updated_at, update_updated_at_column()

### Community 77 - "BiologicalSex"
Cohesion: 0.67
Nodes (3): FormState, BiologicalSex, DocumentType

### Community 85 - "Correctness Properties"
Cohesion: 0.07
Nodes (27): Correctness Properties, Property 10: Unicidad de Historia Clínica por Paciente, Property 11: Inmutabilidad de Registros Clínicos y de Auditoría, Property 12: Trazabilidad de Correcciones Clínicas, Property 13: Ordenamiento Cronológico de la Historia Clínica, Property 14: Validación de Archivos Adjuntos, Property 15: Control de Concurrencia Optimista, Property 16: Inmutabilidad del Historial del Odontograma (Append-Only) (+19 more)

### Community 125 - "test_auth_service.py"
Cohesion: 0.14
Nodes (14): cancel_endpoint(), enroll_endpoint(), login_endpoint(), logout_endpoint(), _ok(), reset_endpoint(), _session_payload(), verify_login_endpoint() (+6 more)

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
Cohesion: 0.15
Nodes (43): ClinicalHistoryPage(), handleSave(), ReportRangeLimitError, UniqueDocumentError, 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales, 9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica, Subdirectorio `lib/actions/` (Server Actions de Negocio) (+35 more)

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
Cohesion: 0.19
Nodes (18): GET(), POST(), reportRequest, POST(), metadata, ENTRY_TYPES, SaveClinicalEntryInput, saveClinicalEntrySchema (+10 more)

### Community 342 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.04
Nodes (45): 10. `public.audit_logs`, 1. `public.clinics`, 1. Visión General del Proyecto, 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema, 2. `public.users`, 3. `public.patients` (+37 more)

### Community 396 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, fast-check, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+4 more)

### Community 448 - "password-validation.property.test.ts"
Cohesion: 0.11
Nodes (15): PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), createSecurityHeaders(), nextConfig, securityHeaders, fast-check, alphanumericArb (+7 more)

### Community 450 - "deps.py"
Cohesion: 0.35
Nodes (7): get_settings(), AuthConfigurationUnavailableError, get_admin_client(), get_anon_client(), get_user_client(), 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA), 7.6 Directorio `backend/` (Microservicio Python FastAPI de Autenticación y MFA)

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

### Community 722 - "PageHeader"
Cohesion: 0.15
Nodes (21): dynamic, LoginLayout(), metadata, AuditPage(), metadata, metadata, NewClinicUserPage(), NewClinicUserPageProps (+13 more)

## Knowledge Gaps
- **7 isolated node(s):** `tw-animate-css`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 708 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ServerActionResult` connect `patients.actions.ts` to `deps.py`, `Tasks`, `auth.actions.ts`, `saveClinicalEntryAction`, `createClient`, `DentalClinicError`, `withErrorHandling`, `Dental Clinic SaaS — Agent Configuration`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `withErrorHandling()` (e.g. with `5. Requisitos No Funcionales y Arquitectura de Seguridad` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`withErrorHandling()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `tw-animate-css`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Estructuras de Datos y Control de Flujo en el Backend Python` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `Tasks` connect `createClient` to `Tasks`, `UserRole`, `saveClinicalEntryAction`, `auth.actions.ts`, `types/domain.ts`, `jwt-claims.property.test.ts`, `ToothSurface`, `AppointmentsClient`, `patients.actions.ts`, `FakeAttemptStore`, `next`, `withErrorHandling`, `Implementation Plan: Dental Clinic SaaS`, `DentalClinicError`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `requireRole()` (e.g. with `Subdirectorios de Seguridad, Auditoría y Supabase` and `Subdirectorios de Seguridad, Auditoría y Supabase`) actually correct?**
  _`requireRole()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08272859216255443 - nodes in this community are weakly interconnected._