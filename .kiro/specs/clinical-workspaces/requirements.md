# Clinical Workspaces and Platform Administration

Status: Approved for implementation. The authenticated users covered here are clinic staff and platform operators. “Patient record” means a record opened by staff; a patient login portal is outside this release.

## Acceptance criteria

| ID | Requirement |
| --- | --- |
| CW-01 | WHEN reception opens Patients, the system SHALL show search, registration, appointment and document actions appropriate to the current clinic. Its home SHALL prioritize today's agenda, appointment status and pending confirmations. Reception SHALL retain the existing written intake flow. |
| CW-02 | WHEN reception selects a patient in its clinic, the system SHALL accept a valid PDF as an external history document without requiring a clinical note. It SHALL show upload progress or a pending state, success or actionable errors, and minimal submission metadata. It SHALL restrict clinical content and document downloads to authorized clinical staff. |
| CW-03 | WHEN a dentist opens Patients, the system SHALL show a labeled “Historia clínica” action. The record SHALL show identity, contact, available medical background and relevant dates, with separate sections for notes, odontogram and documents. WHEN data is missing, the system SHALL distinguish an empty history from a load failure. The dentist SHALL be able to keep writing clinical entries. |
| CW-04 | WHEN a dentist generates a patient report, the system SHALL preview the selected sections, create a PDF from authorized data, save it to the patient's document list with author and timestamp, and permit later download. A failed save SHALL preserve the ability to retry without publishing a duplicate. |
| CW-05 | WHEN a dentist opens either operational report or requests an export, the system SHALL scope results to that dentist and clinic based on the authenticated session. A supplied different dentist identifier SHALL be denied. The UI SHALL identify the signed-in dentist and omit the all-dentists selector. Date filters SHALL use calendar days in America/Bogota. |
| CW-06 | WHEN an authorized platform operator with AAL2 opens the platform panel, the system SHALL allow them to create and manage clinics and staff, including dentists and receptionists, and manage subscription plan, status, start and end dates. Changes SHALL be audited. Tenant administrators SHALL manage their own clinic only. |
| CW-07 | WHEN a user requests a patient, report, file, clinic or staff record outside their authorized scope, the server and its database/storage access rules SHALL deny it. Platform permissions SHALL grant access to administrative data only. |
| CW-08 | WHEN staff use a phone, keyboard, assistive technology or reduced-motion preference, the affected workflows SHALL preserve readable labels, logical navigation, visible focus, status announcements and access to primary actions. The application SHALL use light surfaces regardless of the system theme and target WCAG AA contrast. WHEN staff type in a dialog, the active field SHALL keep focus as its value changes. |

## Proposed business rules to approve

- Reception can write intake information and upload external PDFs. Dentists author clinical notes, open clinical PDFs and generate patient reports.
- Clinical records and historical reports remain unchanged when subscription dates change. The first release tracks plan, dates and manual status, with an expired indicator. Payments and automatic suspension require a separate decision.
- Platform access is granted explicitly to designated accounts with MFA. Existing clinic administrators are not promoted automatically.
- “My reports” refers to both operational report screens. Patient reports remain in the patient record for authorized clinicians in its clinic.
