# DentalClinicError

> God node · 67 connections · `errors/domain.ts`

**Community:** [auth.actions.ts](auth.actions.ts.md)

## Connections by Relation

### calls
- saveClinicalEntryAction() `EXTRACTED`
- createAppointmentAction() `EXTRACTED`
- getAppointmentStatusReportAction() `EXTRACTED`
- getAttendedPatientsReportAction() `EXTRACTED`
- saveToothStateAction() `EXTRACTED`
- createPatientAction() `EXTRACTED`
- createUserAction() `EXTRACTED`
- deactivateUserAction() `EXTRACTED`
- listUsersAction() `EXTRACTED`
- cancelAppointmentAction() `EXTRACTED`
- rescheduleAppointmentAction() `EXTRACTED`
- updateClinicAction() `EXTRACTED`
- getClinicalHistoryAction() `EXTRACTED`
- updatePatientAction() `EXTRACTED`
- createClinicUserAction() `EXTRACTED`
- listAppointmentsAction() `EXTRACTED`
- uploadAttachmentAction() `EXTRACTED`
- updateUserAction() `EXTRACTED`
- getAdminClinicDetailAction() `EXTRACTED`
- createClinicAction() `EXTRACTED`
- *…and 19 more `calls` connection(s) not listed (lowest-degree first to go)*

### contains
- errors/domain.ts `EXTRACTED`

### imports
- [admin-clinics.actions.ts](admin-clinics.actions.ts.md) `EXTRACTED`
- [auth.actions.ts](auth.actions.ts.md) `EXTRACTED`
- patients.actions.ts `EXTRACTED`
- [appointments.actions.ts](appointments.actions.ts.md) `EXTRACTED`
- odontogram.actions.ts `EXTRACTED`
- users.actions.ts `EXTRACTED`
- [clinic.actions.ts](clinic.actions.ts.md) `EXTRACTED`
- require-user.ts `EXTRACTED`
- clinical.actions.ts `EXTRACTED`
- [reports.actions.ts](reports.actions.ts.md) `EXTRACTED`
- [server-action-wrapper.ts](server-action-wrapper.ts.md) `EXTRACTED`
- attachments.actions.ts `EXTRACTED`
- audit.actions.ts `EXTRACTED`
- dashboard.actions.ts `EXTRACTED`
- session-termination.ts `EXTRACTED`

### inherits
- UniqueDocumentError `EXTRACTED`
- ConcurrencyConflictError `EXTRACTED`
- ReportRangeLimitError `EXTRACTED`
- AppointmentConflictError `EXTRACTED`
- RoleAuthorizationError `EXTRACTED`
- AccountLockedError `EXTRACTED`
- InvalidCredentialsError `EXTRACTED`
- ValidationError `EXTRACTED`
- TenantIsolationError `EXTRACTED`
- ImmutableRecordError `EXTRACTED`

### method
- .constructor() `EXTRACTED`

### references
- AuthorizationSecurityContext `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*