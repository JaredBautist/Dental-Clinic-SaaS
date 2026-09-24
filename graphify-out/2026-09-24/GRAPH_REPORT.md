# Graph Report - DENTAL CLINIC  (2026-09-24)

## Corpus Check
- 93 files · ~56,626 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 635 nodes · 1065 edges · 50 communities (31 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `63fef148`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- auth.actions.ts
- proxy.ts
- package.json
- password-validation.property.test.ts
- types/domain.ts
- clinics
- compilerOptions
- DentalClinicError
- login-attempt-store.ts
- Documento de Diseño Técnico: Dental Clinic SaaS
- 013_fix_security_foundation.sql
- bootstrap_supabase.sql
- run_migrations.sh
- eslint.config.mjs
- postcss.config.mjs
- 010_create_audit_logs.sql
- 🦷 Dental Clinic SaaS
- Correctness Properties
- Esquema PostgreSQL Completo
- Requirements
- ADR-001: Contexto de autorización, MFA y RLS
- Implementation Plan: Dental Clinic SaaS
- rules/graphify.md
- workflows/graphify.md
- odontogram.actions.ts
- withErrorHandling
- patients.actions.ts
- server-action-wrapper.ts
- reports.actions.ts
- clinic.actions.ts
- requireRole
- 6.1 Esquema `public` (Tablas de Negocio)
- 7. Estructura del Proyecto y Desglose Archivo por Archivo
- Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto
- 4. Requisitos Funcionales Detallados
- 6. Arquitectura de Base de Datos y Supabase
- 2. Objetivos del Sistema

## God Nodes (most connected - your core abstractions)
1. `DentalClinicError` - 56 edges
2. `withErrorHandling()` - 43 edges
3. `requireRole()` - 37 edges
4. `Correctness Properties` - 27 edges
5. `createAuditLog()` - 23 edges
6. `vitest` - 21 edges
7. `🦷 Dental Clinic SaaS` - 19 edges
8. `createAdminClient()` - 17 edges
9. `compilerOptions` - 16 edges
10. `createClient()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `handleSubmit()` --calls--> `loginAction()`  [EXTRACTED]
  app/(auth)/login/page.tsx → lib/actions/auth.actions.ts
- `loadMfaData()` --calls--> `enrollMfaAction()`  [EXTRACTED]
  app/(auth)/setup-mfa/page.tsx → lib/actions/auth.actions.ts
- `handleVerify()` --calls--> `verifyMfaSetupAction()`  [EXTRACTED]
  app/(auth)/setup-mfa/page.tsx → lib/actions/auth.actions.ts
- `handleCancel()` --calls--> `cancelMfaAction()`  [EXTRACTED]
  app/(auth)/setup-mfa/page.tsx → lib/actions/auth.actions.ts
- `handleVerify()` --calls--> `verifyMfaLoginAction()`  [EXTRACTED]
  app/(auth)/verify-mfa/page.tsx → lib/actions/auth.actions.ts

## Import Cycles
- None detected.

## Communities (50 total, 6 thin omitted)

### Community 0 - "auth.actions.ts"
Cohesion: 0.08
Nodes (33): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+25 more)

### Community 1 - "proxy.ts"
Cohesion: 0.10
Nodes (27): LoginResult, AccessDecision, AccessInput, AccessProfile, AuthenticationErrorLike, AuthenticatorAssuranceLevel, clinicalMfaDestination(), decideAccess() (+19 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (43): dependencies, lucide-react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, zod (+35 more)

### Community 3 - "password-validation.property.test.ts"
Cohesion: 0.07
Nodes (21): metadata, PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), createSecurityHeaders(), nextConfig, securityHeaders, fast-check (+13 more)

### Community 4 - "types/domain.ts"
Cohesion: 0.15
Nodes (14): ENTRY_TYPES, getClinicalHistoryAction(), SaveClinicalEntryInput, saveClinicalEntrySchema, vitest, migrationPath, mocks, AuditRecord (+6 more)

### Community 5 - "clinics"
Cohesion: 0.13
Nodes (16): auth, auth.users, clinics, set_clinics_updated_at, update_updated_at_column(), set_users_updated_at, users, patients (+8 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "DentalClinicError"
Cohesion: 0.18
Nodes (15): AppointmentConflictError, DentalClinicError, appointmentSchema, calculateSuggestedSlots(), cancelAppointmentAction(), CancelAppointmentInput, cancelSchema, createAppointmentAction() (+7 more)

### Community 8 - "login-attempt-store.ts"
Cohesion: 0.21
Nodes (8): FailedAttemptRow, FailedAttemptStatus, hashLoginIdentifier(), LockoutRow, LockoutStatus, RpcError, RpcInvoker, RpcResult

### Community 9 - "Documento de Diseño Técnico: Dental Clinic SaaS"
Cohesion: 0.05
Nodes (36): 1. Pruebas de Propiedades (Property-Based Tests) — `fast-check`, 2. Pruebas de Ejemplo (Unit Tests) — Vitest, 3. Pruebas de Integración — Supabase local (docker), 4. Pruebas de Humo (Smoke Tests), Architecture, Categorías de Pruebas, Clasificación de Errores, Components and Interfaces (+28 more)

### Community 10 - "013_fix_security_foundation.sql"
Cohesion: 0.22
Nodes (3): public.users, private.current_clinic_id(), private.current_user_role()

### Community 11 - "bootstrap_supabase.sql"
Cohesion: 0.40
Nodes (3): auth.users, storage.buckets, storage.objects

### Community 28 - "🦷 Dental Clinic SaaS"
Cohesion: 0.05
Nodes (36): 🏢 1. Gestión de Consultorios (Multitenencia), 👥 2. Gestión de Usuarios y Roles, 🔐 3. Autenticación y Control de Sesiones, 🧑‍⚕️ 4. Gestión de Pacientes, 📅 5. Gestión de Citas, 🏥 6. Historia Clínica Odontológica, 🦷 7. Odontograma Digital, 🔒 8. Seguridad y Trazabilidad (+28 more)

### Community 29 - "Correctness Properties"
Cohesion: 0.07
Nodes (27): Correctness Properties, Property 10: Unicidad de Historia Clínica por Paciente, Property 11: Inmutabilidad de Registros Clínicos y de Auditoría, Property 12: Trazabilidad de Correcciones Clínicas, Property 13: Ordenamiento Cronológico de la Historia Clínica, Property 14: Validación de Archivos Adjuntos, Property 15: Control de Concurrencia Optimista, Property 16: Inmutabilidad del Historial del Odontograma (Append-Only) (+19 more)

### Community 30 - "Esquema PostgreSQL Completo"
Cohesion: 0.08
Nodes (26): `appointments`, `audit_logs` (inmutables), `clinical_entries` (inmutables), `clinical_records`, `clinics`, Data Models, Diagrama Entidad-Relación, Esquema PostgreSQL Completo (+18 more)

### Community 31 - "Requirements"
Cohesion: 0.08
Nodes (24): Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación, Criterios de Aceptación (+16 more)

### Community 32 - "ADR-001: Contexto de autorización, MFA y RLS"
Cohesion: 0.22
Nodes (8): ADR-001: Contexto de autorización, MFA y RLS, Consecuencias, Contexto, Criterios de regresión, Decisión, Estado, Opciones consideradas, Referencias

### Community 33 - "Implementation Plan: Dental Clinic SaaS"
Cohesion: 0.33
Nodes (5): Implementation Plan: Dental Clinic SaaS, Notes, Overview, Task Dependency Graph, Tasks

### Community 37 - "odontogram.actions.ts"
Cohesion: 0.12
Nodes (16): ConcurrencyConflictError, saveClinicalEntryAction(), CreateCustomStatusInput, createCustomToothStatusAction(), customStatusSchema, FDI_TOOTH_CODES, getOdontogramStateAction(), listCustomToothStatusesAction() (+8 more)

### Community 38 - "withErrorHandling"
Cohesion: 0.15
Nodes (16): ALLOWED_FILE_TYPES, listEntryAttachmentsAction(), uploadAttachmentAction(), UploadAttachmentInput, uploadAttachmentSchema, createUserAction(), CreateUserInput, createUserSchema (+8 more)

### Community 39 - "patients.actions.ts"
Cohesion: 0.15
Nodes (14): UniqueDocumentError, BIOLOGICAL_SEXES, createPatientAction(), DOCUMENT_TYPES, getPatientByIdAction(), PatientInput, patientSchema, searchPatientsAction() (+6 more)

### Community 40 - "server-action-wrapper.ts"
Cohesion: 0.23
Nodes (8): ValidationError, AuthorizationFailureEvent, AuthorizationFailureRecorder, persistAuthorizationFailure(), ErrorHandlingOptions, createAdminClient(), zod, AuthorizationSecurityContext

### Community 41 - "reports.actions.ts"
Cohesion: 0.21
Nodes (11): ReportRangeLimitError, AppointmentStatusReportResult, AttendedPatientsReportResult, getAppointmentStatusReportAction(), getAttendedPatientsReportAction(), ReportFilterInput, reportFilterSchema, validateDateRangeLimit() (+3 more)

### Community 42 - "clinic.actions.ts"
Cohesion: 0.24
Nodes (10): getClinicAction(), registerClinicAction(), RegisterClinicInput, registerClinicSchema, updateClinicAction(), UpdateClinicInput, updateClinicSchema, createAuditLog() (+2 more)

### Community 43 - "requireRole"
Cohesion: 0.29
Nodes (8): POST(), signedUrlRequestSchema, requireAuthUser(), requireRole(), VALID_ROLES, createClient(), AuditAction, AuditEntityType

### Community 44 - "6.1 Esquema `public` (Tablas de Negocio)"
Cohesion: 0.18
Nodes (11): 10. `public.audit_logs`, 1. `public.clinics`, 2. `public.users`, 3. `public.patients`, 4. `public.appointments`, 5. `public.clinical_records`, 6.1 Esquema `public` (Tablas de Negocio), 6. `public.clinical_entries` (+3 more)

### Community 45 - "7. Estructura del Proyecto y Desglose Archivo por Archivo"
Cohesion: 0.18
Nodes (11): 7.1 Raíz del Proyecto, 7.2 Directorio `app/` (Next.js App Router), 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth), 7.4 Directorio `types/` y `errors/`, 7.5 Directorio `components/`, 7.6 Directorio `supabase/` (Migraciones y Edge Functions), 7.7 Directorio `__tests__/` (Suites de Pruebas), 7.8 Directorio `.kiro/` (Especificaciones del Proyecto) (+3 more)

### Community 46 - "Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto"
Cohesion: 0.20
Nodes (9): 1. Visión General del Proyecto, 3. Stack Tecnológico y Herramientas, 5. Requisitos No Funcionales y Arquitectura de Seguridad, 8. Estado Actual del Desarrollo y Siguientes Pasos, Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto, Estado Actual:, Modelo Multi-Tenant, Siguientes Pasos Recomendados: (+1 more)

### Community 47 - "4. Requisitos Funcionales Detallados"
Cohesion: 0.20
Nodes (10): 4.1 Módulo 1: Registro y Gestión de Consultorios (Tenants), 4.2 Módulo 2: Usuarios, Autenticación, MFA y RBAC, 4.3 Módulo 3: Gestión de Pacientes, 4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones, 4.5 Módulo 5: Historia Clínica y Entradas Odontológicas, 4.6 Módulo 6: Archivos Adjuntos e Imágenes Médicas (Storage), 4.7 Módulo 7: Odontograma Digital y Estados Personalizados, 4.8 Módulo 8: Registro Inmutable de Auditoría (+2 more)

### Community 48 - "6. Arquitectura de Base de Datos y Supabase"
Cohesion: 0.40
Nodes (5): 6.2 Esquema `private` (Seguridad Interna y Bloqueos), 6.3 Funciones SQL y Triggers, 6.4 Políticas RLS (Row Level Security), 6.5 Supabase Storage, 6. Arquitectura de Base de Datos y Supabase

### Community 49 - "2. Objetivos del Sistema"
Cohesion: 0.67
Nodes (3): 2.1 Objetivo General, 2.2 Objetivos Específicos, 2. Objetivos del Sistema

## Knowledge Gaps
- **302 isolated node(s):** `roleArb`, `uuidArb`, `activeUserArb`, `upperCharArb`, `lowerCharArb` (+297 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 373 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `types/domain.ts` to `auth.actions.ts`, `proxy.ts`, `package.json`, `password-validation.property.test.ts`, `odontogram.actions.ts`, `withErrorHandling`, `DentalClinicError`, `login-attempt-store.ts`, `patients.actions.ts`, `clinic.actions.ts`, `reports.actions.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `zod` connect `server-action-wrapper.ts` to `auth.actions.ts`, `package.json`, `types/domain.ts`, `odontogram.actions.ts`, `withErrorHandling`, `DentalClinicError`, `patients.actions.ts`, `reports.actions.ts`, `clinic.actions.ts`, `requireRole`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `DentalClinicError` connect `DentalClinicError` to `auth.actions.ts`, `types/domain.ts`, `odontogram.actions.ts`, `withErrorHandling`, `patients.actions.ts`, `server-action-wrapper.ts`, `reports.actions.ts`, `clinic.actions.ts`, `requireRole`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `roleArb`, `uuidArb`, `activeUserArb` to the rest of the system?**
  _302 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07607843137254902 - nodes in this community are weakly interconnected._
- **Should `proxy.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._