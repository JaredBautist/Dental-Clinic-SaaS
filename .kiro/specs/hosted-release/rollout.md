# Rollout on Render and Vercel

## Render

Connect the GitHub repository and use the root `render.yaml` Blueprint, or create a Python Web Service from `main` with root directory `backend`, the build and start commands in that file, and health check `/health`. Use the existing Supabase project. Set the variables in Render's service environment.

| Variable | Source |
| --- | --- |
| `SUPABASE_URL` | Same Supabase URL as the frontend. |
| `SUPABASE_ANON_KEY` | Supabase anon or publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server key. |
| `CORS_ORIGINS` | Exact Vercel origin (scheme and host, without a trailing slash). If the domain is not assigned yet, update this before testing login. |

## Vercel

Import the GitHub repository as a Next.js project from the repository root. Use `main` as the production branch and set the following variables for Production before the final build.

| Variable | Source |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase URL as Render. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon or publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server key. Keep the name private. |
| `NEXT_PUBLIC_AUTH_API_URL` | Render service HTTPS origin, without a trailing slash. |
| `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS origin on Vercel. |

Rebuild the frontend after replacing a public URL. Keep secret values in provider-managed settings. Vercel's default function payload limit is 4.5 MB including multipart overhead, so clinical uploads should be tested below that limit. Larger uploads require a separately validated storage flow or supported hosting configuration.

## Verification

Check that Vercel serves `/`, `/login` and `/api/health`. Check Render `/health` and a CORS preflight for `POST /auth/login` using the actual frontend origin. Confirm Vercel's `connect-src` includes the Render origin. Rehearse login, MFA and role navigation with a test account before calling the release fully verified.
