# auth.actions.ts

> 35 nodes · cohesion 0.12

## Key Concepts

- **DentalClinicError** (67 connections) — `errors/domain.ts`
- **auth.actions.ts** (33 connections) — `lib/actions/auth.actions.ts`
- **errors/domain.ts** (29 connections) — `errors/domain.ts`
- **vitest** (23 connections) — `package.json`
- **server-action-wrapper.test.ts** (10 connections) — `__tests__/unit/server-action-wrapper.test.ts`
- **RoleAuthorizationError** (9 connections) — `errors/domain.ts`
- **loginAction()** (8 connections) — `lib/actions/auth.actions.ts`
- **terminateSession()** (8 connections) — `lib/auth/session-termination.ts`
- **requireClinicalUser()** (7 connections) — `lib/actions/auth.actions.ts`
- **session-termination.ts** (7 connections) — `lib/auth/session-termination.ts`
- **AccountLockedError** (6 connections) — `errors/domain.ts`
- **InvalidCredentialsError** (6 connections) — `errors/domain.ts`
- **ValidationError** (6 connections) — `errors/domain.ts`
- **auth-actions.test.ts** (6 connections) — `__tests__/unit/auth-actions.test.ts`
- **TenantIsolationError** (5 connections) — `errors/domain.ts`
- **failMfaVerification()** (5 connections) — `lib/actions/auth.actions.ts`
- **logoutAction()** (5 connections) — `lib/actions/auth.actions.ts`
- **verifyMfaLoginAction()** (5 connections) — `lib/actions/auth.actions.ts`
- **verifyMfaSetupAction()** (5 connections) — `lib/actions/auth.actions.ts`
- **ImmutableRecordError** (4 connections) — `errors/domain.ts`
- **cancelMfaAction()** (4 connections) — `lib/actions/auth.actions.ts`
- **createPersistentAttemptStore()** (4 connections) — `lib/actions/auth.actions.ts`
- **enrollMfaAction()** (4 connections) — `lib/actions/auth.actions.ts`
- **session-termination.test.ts** (3 connections) — `__tests__/unit/session-termination.test.ts`
- **.constructor()** (1 connections) — `errors/domain.ts`
- *... and 10 more nodes in this community*

## Relationships

- [withErrorHandling](withErrorHandling.md) (43 shared connections)
- [createClient](createClient.md) (28 shared connections)
- [server-action-wrapper.ts](server-action-wrapper.ts.md) (9 shared connections)
- [admin-clinics.actions.ts](admin-clinics.actions.ts.md) (7 shared connections)
- [reports.actions.ts](reports.actions.ts.md) (7 shared connections)
- [appointments.actions.ts](appointments.actions.ts.md) (6 shared connections)
- [clinic.actions.ts](clinic.actions.ts.md) (5 shared connections)
- [saveClinicalEntryAction](saveClinicalEntryAction.md) (5 shared connections)
- [login-attempt-store.ts](login-attempt-store.ts.md) (5 shared connections)
- [password-validation.property.test.ts](password-validation.property.test.ts.md) (3 shared connections)
- [types/domain.ts](types-domain.ts.md) (2 shared connections)
- [consultorios-client.tsx](consultorios-client.tsx.md) (2 shared connections)

## Source Files

- `__tests__/unit/auth-actions.test.ts`
- `__tests__/unit/server-action-wrapper.test.ts`
- `__tests__/unit/session-termination.test.ts`
- `errors/domain.ts`
- `lib/actions/auth.actions.ts`
- `lib/auth/session-termination.ts`
- `package.json`

## Audit Trail

- EXTRACTED: 203 (99%)
- INFERRED: 3 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*