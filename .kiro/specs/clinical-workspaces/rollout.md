# Local Verification and Rollout

The application adds `/plataforma`, personal report exports, and the patient Documents workflow. Apply migration `015_clinical_workspaces.sql` to the target database before deploying the application. The application checks the explicit platform grant and the current session's AAL2.

Provision the actual platform operator using the database owner in the target environment. Choose a dedicated, active administrator with enrolled MFA. Replace the placeholder with its verified profile ID.

```sql
INSERT INTO private.platform_operators (user_id)
SELECT id FROM public.users
WHERE id = '<verified-profile-uuid>'::uuid
  AND role = 'administrador' AND is_active AND mfa_enabled
ON CONFLICT DO NOTHING;
```

Verify a fresh AAL2 sign-in and confirm that a clinic administrator cannot create clinics or open the platform console. Subscription changes update administrative status and dates. They do not suspend service or charge customers.

The PDF upload limit is 20 MB in the application and in the private bucket. Confirm the deployment's request-body limit before exposing that limit to users. Generate PDFs and exercise receipt retries, downloads, and a connection interruption using synthetic records in the target environment. Use a separate clean-up job for catalog-free objects left by an interrupted write, after an interval that allows the uploader to retry.

If a rollback is needed after use, preserve the catalog, objects, grants and subscription fields. Do not deploy the previous application's privileged clinic actions as-is because they allow global administrator access. Revalidate RLS and platform access on the rollback build.
