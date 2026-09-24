# DentalClinicError

> God node · 21 connections · `errors/domain.ts`

**Community:** [auth.actions.ts](auth.actions.ts.md)

## Connections by Relation

### calls
- [loginAction()](loginAction.md) `EXTRACTED`
- [terminateSession()](terminateSession.md) `EXTRACTED`
- requireClinicalUser() `EXTRACTED`
- enrollMfaAction() `EXTRACTED`
- failMfaVerification() `EXTRACTED`

### contains
- errors/domain.ts `EXTRACTED`

### imports
- [auth.actions.ts](auth.actions.ts.md) `EXTRACTED`
- server-action-wrapper.ts `EXTRACTED`
- session-termination.ts `EXTRACTED`

### inherits
- AccountLockedError `EXTRACTED`
- InvalidCredentialsError `EXTRACTED`
- RoleAuthorizationError `EXTRACTED`
- ValidationError `EXTRACTED`
- TenantIsolationError `EXTRACTED`
- UniqueDocumentError `EXTRACTED`
- AppointmentConflictError `EXTRACTED`
- ConcurrencyConflictError `EXTRACTED`
- ImmutableRecordError `EXTRACTED`
- ReportRangeLimitError `EXTRACTED`

### method
- .constructor() `EXTRACTED`

### references
- [AuthorizationSecurityContext](AuthorizationSecurityContext.md) `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*