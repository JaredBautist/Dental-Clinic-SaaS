# Clinical Workspaces and Platform Administration Tasks

- [x] **1. Personal reports (CW-05, CW-07).** Write regression tests for unfiltered and supplied foreign dentist IDs, exports, and Bogotá day boundaries. Fix both server actions and clients. Test two dentists within one clinic and a second clinic, including direct database access if appointment RLS changes.
- [ ] **2. File authorization and storage (CW-02, CW-04, CW-07).** Define boundary schemas and migration. Verify valid PDFs, malformed and oversized files, duplicate retries, unauthorized downloads, foreign patient IDs and storage failure recovery.
- [x] **3. Record and reception workflows (CW-01–04, CW-08).** Build the mobile and desktop layouts using existing primitives, intake text, upload, clinical record sections and report preview/save/download. Add a regression test for distinguishing empty history from a failed fetch. Verify both roles in a browser with synthetic data.
- [x] **4. Platform scope and subscriptions (CW-06, CW-07).** Provision an explicit operator in the test environment, verify AAL2, review privileged callers and scope existing admin operations before linking the new panel. Test operator actions, local administrator denial across clinics, subscription date validation, and audit events. Validate migrations and rollback against synthetic data.
- [ ] **5. Release checks (CW-01–08).** Run the affected TypeScript, backend auth and database suites. Verify desktop and phone layouts at 375, 768 and 1440 px, keyboard and focus order, light theme contrast with either system preference and reduced motion. Exercise direct links and downloads as two clinics and each permitted role. Refresh Graphify after implementation.


## Verification recorded

- Report scope regression tests, PDF rendering and validation, Next.js build, backend authentication suite and PostgreSQL security integration passed locally.
- Chromium checked role-specific screens at 375, 768 and 1440 px with synthetic identities, including menu focus and Escape. A loopback fixture verified PDF upload, same-request retry, report persistence and download authorization. PostgreSQL independently exercised database policies.
- Live Supabase Storage retries and cross-tenant download validation still require an isolated Supabase environment. Rollout requires applying migration 015 and provisioning the designated platform operator.
- The shared dialog regression was reproduced and checked in Chromium with controlled inputs. Typing retained focus, Tab wrapped, Escape returned focus, and the dark system preference preserved the light palette.
