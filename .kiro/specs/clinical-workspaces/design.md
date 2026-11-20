# Clinical Workspaces and Platform Administration Design

Status: Approved for implementation.

## Current behavior and proposed experience

| Before | After | Why |
| --- | --- | --- |
| The patient list uses an icon for clinical history. The history header surfaces technical versioning above patient details. | Give dentists a labeled history action. Put identity and relevant clinical facts first, then Notes, Odontogram and Documents. | The next action and patient context stay visible. |
| Reception cannot open the clinical route. Existing attachments belong to clinical entries. | Add a reception document intake action on the patient screen, independent of a clinical note. | Reception can deliver PDFs while clinical reading remains separate. |
| The attended-patients report loads the clinic's dentist list. Report actions filter by dentist only when a filter is passed. | Personal report surfaces identify the current dentist, show the active date range and provide download. Scope the query on the server. | Every report and export reflects the signed-in dentist. |
| The current administrator panel can query all clinics through a privileged client. | Move global operations behind explicit platform authorization. Give local administrators a clinic-scoped view. | Global administration is an explicit privilege with its own audit trail. |

Use the current navy and cyan identity with accessible accent variants, semantic surface/text/status tokens, and the existing system sans font. Use a single primary action per context, definition lists for patient facts, readable section headings and compact lists with clear empty states. Stack actions and facts on small screens. Keep navigation immediate and use brief, reduced-motion-aware feedback for occasional dialogs and save states. The local UI/UX design-system search supported an operations dashboard layout, clear focus and restrained density. Emil's interaction guidance informs feedback and focus management. Taste contributes a coherent visual direction; its music-video styling is outside this product. Apply Design Taste's hierarchy and contrast guidance to the existing UI primitives.

## Module layout

| Path | Responsibility |
| --- | --- |
| `app/(dashboard)/pacientes/` and `components/patients/` | Role-specific patient and record screens, upload and history forms. |
| `app/(dashboard)/reportes/` and `lib/actions/reports.actions.ts` | Personal operational report screens and existing action contracts. |
| `lib/clinical-documents/` and `app/api/clinical-documents/` | Document use cases, PDF validation and rendering, authorized upload and download handlers. |
| `app/(dashboard)/plataforma/` and `lib/platform/` | Platform console and platform-only use cases. |
| `lib/auth/`, `backend/app/`, and `supabase/migrations/` | Shared authorization, MFA and tenant policy changes. |

## Proposed contracts and data

- `POST /api/clinical-documents` accepts multipart `patientId`, `file` and `requestId`; returns a document receipt with ID, name, status and creation time. Author and clinic come from the session. Validate PDF size and contents on the server, use private storage, and serve uploaded PDFs as downloads. Show the enforced size limit in the form.
- `POST /api/clinical-documents/reports` accepts `patientId`, approved section identifiers and `requestId`; renders from current authorized patient data and returns the saved document receipt. Preview includes patient identification, optional medical background, clinical notes, odontogram summary and appointments. It excludes attached file contents.
- `GET /api/clinical-documents/{documentId}/download` rechecks clinical access, tenant and document ownership before issuing a short-lived private download. Errors use the project envelope with a machine code and HTTP status. Do not place patient information in object keys or logs.
- Add an append-only patient document catalog with clinic/patient composite foreign key, author, kind (external PDF or generated report), private object key, filename, size, timestamp and unique request key scoped to tenant and author. Existing entry attachments remain accessible under their existing clinical policy. Use a private upload path, then publish the catalog receipt and audit together. Reconcile an interrupted upload by request key and clean up unreferenced objects. Keep signed URLs out of persistence.
- Retain the existing report action response contracts. Normalize date filters to a half-open Bogotá date range. Derive dentist scope before reads and exports. First-release operational exports use CSV from the same authorized report data. Preserve the existing attended appointment count and label it explicitly as completed appointments unless a unique-patient metric is separately approved. Review appointment RLS so direct reads by dentists also respect assignment, and test appointment consumers before changing the policy.
- Store platform operator grants separately from clinic roles, with server-side verification of active grant and AAL2 in each privileged operation. Reuse existing clinic and staff management services after separating the global and local scopes. Store subscription metadata per clinic with validated dates and audited changes. Review login, MFA enrollment and proxy navigation across Next.js and FastAPI.

## ADR-001 — Documents independent of clinical notes

**Context.** Reception needs to submit a PDF without clinical edit permissions.

**Options considered.** A synthetic clinical entry for each PDF would mix administrative intake with authorship. Making the existing entry reference nullable would change a legacy contract shared by history and attachments.

**Decision.** Add patient-level documents and keep the existing entry attachment model. Use a repository for document metadata and storage/PDF adapters so use cases can be tested without Supabase.

**Consequences.** The Documents section combines two authorized sources. Migration rollback needs to preserve any newly uploaded objects and metadata.

## ADR-002 — Separate platform authorization

**Context.** The current administrator actions use the service role across clinics.

**Options considered.** Retaining global rights for every administrator preserves current behavior but makes clinic administrator accounts interchangeable with platform operators. Adding a global value to the tenant role enum couples platform access to the required tenant membership and JWT/RLS role checks.

**Decision.** Grant platform capabilities explicitly and apply an AAL2 guard. Use the operator role for administrative operations only. Review all callers of privileged clients and verify target clinic and staff linkage server-side.

**Consequences.** Roll out with a designated operator provisioned and verified before restricting the existing cross-clinic routes. Keep migration additive, test locks on indexes and constraints, and avoid a rollback that restores global access to all tenant administrators.

## Administrative dashboard clinic selection

When a platform operator has access to multiple clinics, the dashboard shall present a labeled clinic selector. `GET /dashboard?clinic=<uuid>` displays administrative details and personnel for a clinic in the authorized list. Without a valid selection, prefer the signed-in account's clinic. A tenant administrator shall remain scoped to their own clinic even if the URL names another one. The sidebar and mobile header show the same active clinic as Dashboard, Consultorios and Plataforma. Links among those pages preserve the selection. Account-scoped routes continue to display the account's clinic.

Reuse the scoped clinic listing and detail actions. A GET form keeps selection shareable and avoids client state or changes to the session's tenant. Patient and appointment reads remain outside this administrative dashboard.
