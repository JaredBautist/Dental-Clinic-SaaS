# withErrorHandling

> 48 nodes · cohesion 0.13

## Key Concepts

- **withErrorHandling()** (59 connections) — `lib/server-action-wrapper.ts`
- **requireRole()** (51 connections) — `lib/auth/require-user.ts`
- **Tasks** (36 connections) — `.kiro/specs/dental-clinic-saas/tasks.md`
- **users.actions.ts** (30 connections) — `lib/actions/users.actions.ts`
- **createAuditLog()** (29 connections) — `lib/audit.ts`
- **Subdirectorio `lib/actions/` (Server Actions de Negocio)** (27 connections) — `.kiro/PROJECT_CONTEXT_FULL.md`
- **Subdirectorio `lib/actions/` (Server Actions de Negocio)** (27 connections) — `PROJECT_CONTEXT_FULL.md`
- **createAdminClient()** (24 connections) — `lib/supabase/admin.ts`
- **UniqueDocumentError** (16 connections) — `errors/domain.ts`
- **createPatientAction()** (16 connections) — `lib/actions/patients.actions.ts`
- **createUserAction()** (15 connections) — `lib/actions/users.actions.ts`
- **deactivateUserAction()** (14 connections) — `lib/actions/users.actions.ts`
- **listUsersAction()** (14 connections) — `lib/actions/users.actions.ts`
- **cancelAppointmentAction()** (13 connections) — `lib/actions/appointments.actions.ts`
- **rescheduleAppointmentAction()** (13 connections) — `lib/actions/appointments.actions.ts`
- **updateClinicAction()** (13 connections) — `lib/actions/clinic.actions.ts`
- **updatePatientAction()** (13 connections) — `lib/actions/patients.actions.ts`
- **listAppointmentsAction()** (12 connections) — `lib/actions/appointments.actions.ts`
- **uploadAttachmentAction()** (12 connections) — `lib/actions/attachments.actions.ts`
- **updateUserAction()** (12 connections) — `lib/actions/users.actions.ts`
- **searchPatientsAction()** (11 connections) — `lib/actions/patients.actions.ts`
- **listAdminClinicsAction()** (10 connections) — `lib/actions/admin-clinics.actions.ts`
- **updateAdminClinicUserAction()** (10 connections) — `lib/actions/admin-clinics.actions.ts`
- **getOdontogramStateAction()** (10 connections) — `lib/actions/odontogram.actions.ts`
- **requireAuthUser()** (10 connections) — `lib/auth/require-user.ts`
- *... and 23 more nodes in this community*

## Relationships

- [createClient](createClient.md) (64 shared connections)
- [auth.actions.ts](auth.actions.ts.md) (43 shared connections)
- [saveClinicalEntryAction](saveClinicalEntryAction.md) (22 shared connections)
- [admin-clinics.actions.ts](admin-clinics.actions.ts.md) (22 shared connections)
- [patients-client.tsx](patients-client.tsx.md) (19 shared connections)
- [appointments.actions.ts](appointments.actions.ts.md) (16 shared connections)
- [consultorios-client.tsx](consultorios-client.tsx.md) (15 shared connections)
- [reports.actions.ts](reports.actions.ts.md) (15 shared connections)
- [clinic.actions.ts](clinic.actions.ts.md) (14 shared connections)
- [getShellProfile](getShellProfile.md) (8 shared connections)
- [6.1 Esquema `public` (Tablas de Negocio)](6.1_Esquema_`public`_Tablas_de_Negocio.md) (6 shared connections)
- [AppointmentsClient](AppointmentsClient.md) (6 shared connections)

## Source Files

- `.kiro/PROJECT_CONTEXT_FULL.md`
- `.kiro/specs/dental-clinic-saas/tasks.md`
- `PROJECT_CONTEXT_FULL.md`
- `__tests__/unit/patients-actions.test.ts`
- `__tests__/unit/users-actions.test.ts`
- `app/(dashboard)/consultorios/consultorios-client.tsx`
- `app/(dashboard)/pacientes/patients-client.tsx`
- `app/(dashboard)/usuarios/users-client.tsx`
- `errors/domain.ts`
- `lib/actions/admin-clinics.actions.ts`
- `lib/actions/appointments.actions.ts`
- `lib/actions/attachments.actions.ts`
- `lib/actions/clinic.actions.ts`
- `lib/actions/odontogram.actions.ts`
- `lib/actions/patients.actions.ts`
- `lib/actions/users.actions.ts`
- `lib/audit.ts`
- `lib/auth/require-user.ts`
- `lib/server-action-wrapper.ts`
- `lib/supabase/admin.ts`

## Audit Trail

- EXTRACTED: 315 (73%)
- INFERRED: 115 (27%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*