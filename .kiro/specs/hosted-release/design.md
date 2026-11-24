# Hosted Release Design

## ADR-001 — Keep the existing browser auth contract

The frontend already calls the FastAPI authentication API directly, and the API has an origin allowlist. A same-origin proxy would add a new request path and deployment layer. Use the existing cross-origin contract. The production CSP allows only the HTTPS origin parsed from `NEXT_PUBLIC_AUTH_API_URL`, and the API allows the exact frontend origin through `CORS_ORIGINS`. Session setup, role checks and MFA stay in the existing flow.

Use the existing GitHub repository and Supabase project. Create no database or seed data as part of deployment. Keep `SUPABASE_SERVICE_ROLE_KEY` on the Vercel and FastAPI servers. Use production preview accounts or synthetic credentials for hosted smoke tests.
