# DentalClinicError

> God node · 38 connections · `errors/domain.ts`

**Community:** [DentalClinicError](DentalClinicError.md)

## Connections by Relation

### calls
- terminateSession() `EXTRACTED`
- loginAction() `EXTRACTED`
- requireClinicalUser() `EXTRACTED`
- failMfaVerification() `EXTRACTED`
- enrollMfaAction() `EXTRACTED`
- createUserAction() `EXTRACTED`
- deactivateUserAction() `EXTRACTED`
- cancelAppointmentAction() `EXTRACTED`
- createAppointmentAction() `EXTRACTED`
- listAppointmentsAction() `EXTRACTED`
- getClinicAction() `EXTRACTED`
- updateClinicAction() `EXTRACTED`
- createPatientAction() `EXTRACTED`
- listPatientsAction() `EXTRACTED`
- searchPatientsAction() `EXTRACTED`
- updatePatientAction() `EXTRACTED`
- listUsersAction() `EXTRACTED`
- updateUserAction() `EXTRACTED`

### contains
- errors/domain.ts `EXTRACTED`

### imports
- [auth.actions.ts](auth.actions.ts.md) `EXTRACTED`
- [users.actions.ts](users.actions.ts.md) `EXTRACTED`
- patients.actions.ts `EXTRACTED`
- server-action-wrapper.ts `EXTRACTED`
- appointments.actions.ts `EXTRACTED`
- clinic.actions.ts `EXTRACTED`
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
- AuthorizationSecurityContext `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*