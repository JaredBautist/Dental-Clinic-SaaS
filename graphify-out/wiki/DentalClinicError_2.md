# DentalClinicError

> God node · 56 connections · `errors/domain.ts`

**Community:** [DentalClinicError](DentalClinicError.md)

## Connections by Relation

### calls
- createAppointmentAction() `EXTRACTED`
- terminateSession() `EXTRACTED`
- loginAction() `EXTRACTED`
- requireClinicalUser() `EXTRACTED`
- saveClinicalEntryAction() `EXTRACTED`
- saveToothStateAction() `EXTRACTED`
- createPatientAction() `EXTRACTED`
- createUserAction() `EXTRACTED`
- deactivateUserAction() `EXTRACTED`
- cancelAppointmentAction() `EXTRACTED`
- rescheduleAppointmentAction() `EXTRACTED`
- uploadAttachmentAction() `EXTRACTED`
- registerClinicAction() `EXTRACTED`
- updateClinicAction() `EXTRACTED`
- updatePatientAction() `EXTRACTED`
- getAppointmentStatusReportAction() `EXTRACTED`
- getAttendedPatientsReportAction() `EXTRACTED`
- failMfaVerification() `EXTRACTED`
- getClinicAction() `EXTRACTED`
- getClinicalHistoryAction() `EXTRACTED`
- *…and 11 more `calls` connection(s) not listed (lowest-degree first to go)*

### contains
- errors/domain.ts `EXTRACTED`

### imports
- [auth.actions.ts](auth.actions.ts.md) `EXTRACTED`
- appointments.actions.ts `EXTRACTED`
- odontogram.actions.ts `EXTRACTED`
- patients.actions.ts `EXTRACTED`
- users.actions.ts `EXTRACTED`
- clinic.actions.ts `EXTRACTED`
- clinical.actions.ts `EXTRACTED`
- require-user.ts `EXTRACTED`
- attachments.actions.ts `EXTRACTED`
- reports.actions.ts `EXTRACTED`
- server-action-wrapper.ts `EXTRACTED`
- session-termination.ts `EXTRACTED`

### inherits
- RoleAuthorizationError `EXTRACTED`
- ConcurrencyConflictError `EXTRACTED`
- UniqueDocumentError `EXTRACTED`
- AccountLockedError `EXTRACTED`
- AppointmentConflictError `EXTRACTED`
- InvalidCredentialsError `EXTRACTED`
- ReportRangeLimitError `EXTRACTED`
- ValidationError `EXTRACTED`
- TenantIsolationError `EXTRACTED`
- ImmutableRecordError `EXTRACTED`

### method
- .constructor() `EXTRACTED`

### references
- AuthorizationSecurityContext `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*