# Hosted Release

- WHEN the Next.js frontend is built for Vercel, the browser SHALL be able to connect to the configured HTTPS authentication API origin. Existing CSP rules SHALL continue to apply.
- WHEN the FastAPI backend is built as a hosted web service, it SHALL bind to the provider's port, serve `/health`, and accept cross-origin auth calls from the configured frontend origin.
- WHEN release configuration is committed, it SHALL contain variable names and commands only. Secret values SHALL remain in local environment files or in provider-managed settings.
- Hosted release verification SHALL check frontend and API health separately, confirm the browser auth request contract, and distinguish synthetic smoke checks from an authenticated login/MFA rehearsal.
