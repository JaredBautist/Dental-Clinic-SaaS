# Graph Report - PROYECTO DISEÑO FUNCIONAL  (2026-09-13)

## Corpus Check
- 65 files · ~18,500 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 318 nodes · 481 edges · 28 communities (12 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Auth Pages & User Interface
- Access Control & Role Policies
- Core Production Dependencies
- Security Headers & Password Validation
- Domain Entities & Property Tests
- Database Schema Core Migrations
- TypeScript Configuration
- Domain Errors & Audit Persistence
- Lockout & Login Attempt Store
- Development Tooling & Testing Stack
- PostgreSQL RLS & Security Functions
- Supabase Test Harness & Storage Mocks
- Migration Test Runner
- ESLint Configuration
- PostCSS Tailwind Configuration
- Audit Logs Table Definition

## God Nodes (most connected - your core abstractions)
1. `DentalClinicError` - 21 edges
2. `compilerOptions` - 16 edges
3. `vitest` - 13 edges
4. `withErrorHandling()` - 10 edges
5. `proxy()` - 10 edges
6. `UserRole` - 9 edges
7. `AuthorizationSecurityContext` - 9 edges
8. `loginAction()` - 9 edges
9. `clinics` - 9 edges
10. `terminateSession()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `DentalClinicError` --references--> `AuthorizationSecurityContext`  [EXTRACTED]
  errors/domain.ts → types/domain.ts
- `LoginResult` --references--> `UserRole`  [EXTRACTED]
  lib/actions/auth.actions.ts → types/domain.ts
- `VerifiedClaims` --references--> `UserRole`  [EXTRACTED]
  lib/auth/verified-headers.ts → types/domain.ts
- `AuthorizationFailureEvent` --inherits--> `AuthorizationSecurityContext`  [EXTRACTED]
  lib/audit/authorization-failure.ts → types/domain.ts
- `handleSubmit()` --calls--> `loginAction()`  [EXTRACTED]
  app/(auth)/login/page.tsx → lib/actions/auth.actions.ts

## Import Cycles
- None detected.

## Communities (28 total, 4 thin omitted)

### Community 0 - "Auth Pages & User Interface"
Cohesion: 0.07
Nodes (41): LoginPage(), handleSubmit(), SetupMfaPage(), handleCancel(), handleVerify(), loadMfaData(), VerifyMfaPage(), handleCancel() (+33 more)

### Community 1 - "Access Control & Role Policies"
Cohesion: 0.10
Nodes (26): LoginResult, AccessDecision, AccessInput, AccessProfile, AuthenticationErrorLike, AuthenticatorAssuranceLevel, clinicalMfaDestination(), decideAccess() (+18 more)

### Community 2 - "Core Production Dependencies"
Cohesion: 0.06
Nodes (30): dependencies, lucide-react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, zod (+22 more)

### Community 3 - "Security Headers & Password Validation"
Cohesion: 0.08
Nodes (19): metadata, PASSWORD_REQUIREMENTS, PasswordValidationResult, validatePassword(), createSecurityHeaders(), nextConfig, securityHeaders, fast-check (+11 more)

### Community 4 - "Domain Entities & Property Tests"
Cohesion: 0.08
Nodes (23): activeUserArb, roleArb, uuidArb, Appointment, AppointmentStatus, AuditAction, AuditEntityType, AuditRecord (+15 more)

### Community 5 - "Database Schema Core Migrations"
Cohesion: 0.13
Nodes (16): auth, auth.users, clinics, set_clinics_updated_at, update_updated_at_column(), set_users_updated_at, users, patients (+8 more)

### Community 6 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "Domain Errors & Audit Persistence"
Cohesion: 0.23
Nodes (9): AuthorizationFailureEvent, AuthorizationFailureRecorder, persistAuthorizationFailure(), ErrorHandlingOptions, ServerActionResult, createAdminClient(), @supabase/supabase-js, zod (+1 more)

### Community 8 - "Lockout & Login Attempt Store"
Cohesion: 0.21
Nodes (8): FailedAttemptRow, FailedAttemptStatus, hashLoginIdentifier(), LockoutRow, LockoutStatus, RpcError, RpcInvoker, RpcResult

### Community 9 - "Development Tooling & Testing Stack"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, fast-check, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+4 more)

### Community 10 - "PostgreSQL RLS & Security Functions"
Cohesion: 0.22
Nodes (3): public.users, private.current_clinic_id(), private.current_user_role()

### Community 11 - "Supabase Test Harness & Storage Mocks"
Cohesion: 0.40
Nodes (3): auth.users, storage.buckets, storage.objects

## Knowledge Gaps
- **109 isolated node(s):** `SignOutOperation`, `SignOutResult`, `AccessDecision`, `AccessInput`, `AuthenticationErrorLike` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 171 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Security Headers & Password Validation` to `Auth Pages & User Interface`, `Access Control & Role Policies`, `Core Production Dependencies`, `Domain Entities & Property Tests`, `Lockout & Login Attempt Store`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `zod` connect `Domain Errors & Audit Persistence` to `Auth Pages & User Interface`, `Core Production Dependencies`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Development Tooling & Testing Stack` to `Core Production Dependencies`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `SignOutOperation`, `SignOutResult`, `AccessDecision` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Pages & User Interface` be split into smaller, more focused modules?**
  _Cohesion score 0.06682692307692308 - nodes in this community are weakly interconnected._
- **Should `Access Control & Role Policies` be split into smaller, more focused modules?**
  _Cohesion score 0.10420168067226891 - nodes in this community are weakly interconnected._
- **Should `Core Production Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._