# Graph Report - DENTAL CLINIC  (2026-09-22)

## Corpus Check
- 72 files · ~39,649 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 489 nodes · 645 edges · 36 communities (18 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8312b018`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- auth.actions.ts
- proxy.ts
- package.json
- vitest
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

## God Nodes (most connected - your core abstractions)
1. `Correctness Properties` - 27 edges
2. `DentalClinicError` - 21 edges
3. `🦷 Dental Clinic SaaS` - 19 edges
4. `compilerOptions` - 16 edges
5. `vitest` - 13 edges
6. `Esquema PostgreSQL Completo` - 12 edges
7. `Documento de Diseño Técnico: Dental Clinic SaaS` - 11 edges
8. `Requirements` - 11 edges
9. `withErrorHandling()` - 10 edges
10. `proxy()` - 10 edges

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

## Communities (36 total, 6 thin omitted)

### Community 0 - "auth.actions.ts"
Cohesion: 0.09
Nodes (31): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+23 more)

### Community 1 - "proxy.ts"
Cohesion: 0.10
Nodes (26): LoginResult, AccessDecision, AccessInput, AccessProfile, AuthenticationErrorLike, AuthenticatorAssuranceLevel, clinicalMfaDestination(), decideAccess() (+18 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (43): dependencies, lucide-react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, zod (+35 more)

### Community 3 - "vitest"
Cohesion: 0.08
Nodes (19): metadata, PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), createSecurityHeaders(), nextConfig, securityHeaders, fast-check (+11 more)

### Community 4 - "types/domain.ts"
Cohesion: 0.08
Nodes (23): activeUserArb, roleArb, uuidArb, Appointment, AppointmentStatus, AuditAction, AuditEntityType, AuditRecord (+15 more)

### Community 5 - "clinics"
Cohesion: 0.13
Nodes (16): auth, auth.users, clinics, set_clinics_updated_at, update_updated_at_column(), set_users_updated_at, users, patients (+8 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "DentalClinicError"
Cohesion: 0.12
Nodes (18): AccountLockedError, AppointmentConflictError, ConcurrencyConflictError, DentalClinicError, ImmutableRecordError, InvalidCredentialsError, ReportRangeLimitError, RoleAuthorizationError (+10 more)

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

## Knowledge Gaps
- **238 isolated node(s):** `roleArb`, `uuidArb`, `activeUserArb`, `upperCharArb`, `lowerCharArb` (+233 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 307 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `auth.actions.ts`, `proxy.ts`, `package.json`, `types/domain.ts`, `DentalClinicError`, `login-attempt-store.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Documento de Diseño Técnico: Dental Clinic SaaS` connect `Documento de Diseño Técnico: Dental Clinic SaaS` to `Correctness Properties`, `Esquema PostgreSQL Completo`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `zod` connect `DentalClinicError` to `auth.actions.ts`, `package.json`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `roleArb`, `uuidArb`, `activeUserArb` to the rest of the system?**
  _238 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09191919191919191 - nodes in this community are weakly interconnected._
- **Should `proxy.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10420168067226891 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._