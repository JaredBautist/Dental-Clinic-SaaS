# Platform user editor

## Approved behavior

- When a platform operator opens Edit from Usuarios or Consultorios, show the target clinic and allow editing name, role, sign-in email and an optional new password.
- When only the email changes, preserve the password. When only the password changes, preserve the email and MFA enrollment.
- When the operator lacks platform access with MFA or the target belongs to another clinic, deny credential reads and writes. Return only the target email on read.
- When validation or Auth rejects an update, keep the editor open and describe the error. Keep credential values out of audit records.

## Design decision

Use one dialog with independent profile and credential saves. Profile data belongs to public.users and credentials belong to Supabase Auth. Separate saves avoid reporting a combined edit as successful when one store rejects it. Update email and password together in one Auth Admin request when both change. Read the email on demand, avoiding a lookup for every row. Keep ordinary administrator workflows intact.

## Tasks and checks

1. Exercise platform access, tenant mismatch, malformed values, duplicate email, email-only, password-only and combined changes against mocked provider boundaries.
2. Add scoped credential actions and extend the existing profile action to accept full name, retaining last-administrator protection.
3. Connect both lists to the same accessible light-mode modal. Check opening, typing, saving, error recovery and cancel.
4. Run the regression suite, type/build checks and targeted lint. Use synthetic users only.

## Dialog presentation

When space permits, place name and role on the same row. Stack fields on small screens. Identify the clinic in the header and group each save button with its fields. Keep both forms keyboard accessible and use the existing light blue and slate palette.
