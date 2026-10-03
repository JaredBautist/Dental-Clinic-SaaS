# Dental Clinic SaaS — Agent Configuration

## Project Overview
Dental Clinic SaaS is a multi-tenant web platform for managing private dental clinics. Built with Next.js 15, React 19, Tailwind CSS v4, Supabase (PostgreSQL + Auth + Storage), and TypeScript.

## Mandatory Default Skills (Frontend / UI / UX)

**Whenever this agent works on any frontend, UI, UX, design, animation, or component task, it MUST invoke these three skills by default:**

1. **`ui-ux-pro-max`** — UI/UX design intelligence for interfaces, components, design systems, accessibility, responsive layout, typography, color, and stack-specific UI implementation.
2. **`design-taste-frontend`** — Anti-slop frontend skill. Prevents templated, generic, or ugly designs. Enforces real design systems, contextual aesthetics, and strict pre-flight checks.
3. **`emil-design-eng`** — Design engineering philosophy focusing on UI polish, component design, animation decisions, and invisible details that make software feel great.

### Invocation Rule
```
Before writing ANY frontend code, component, page, or design-related file, 
invoke: skill(name="ui-ux-pro-max"), skill(name="design-taste-frontend"), 
and skill(name="emil-design-eng").
```

## Project Context Reference
- **Full technical documentation:** `PROJECT_CONTEXT_FULL.md` (read this for full project context, architecture, database schema, API design, and requirements)
- **Environment variables:** `.env.local`
- **Database migrations:** `supabase/migrations/`

## Technology Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- Zod v4 (validation)
- Lucide React (icons)
- TypeScript 5
- Python 3.14 + FastAPI + supabase-py (`backend/` — auth & MFA API)

## Python Auth API (`backend/`)
- FastAPI service that owns the auth/MFA flows (login, lockout, MFA enroll/verify/cancel, logout); port of `lib/actions/auth.actions.ts` using `supabase-py`.
- Frontend calls it via `lib/api/auth-api.ts` (same `ServerActionResult` contract); browser session is synced with `supabase.auth.setSession()` so `proxy.ts` keeps working unchanged.
- Env: `NEXT_PUBLIC_AUTH_API_URL` (frontend) and `backend/.env` (SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY — service role only here).
- Run: `cd backend && .venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000`
- Tests: `cd backend && .venv/Scripts/python.exe -m pytest`

## Key Architectural Principles
- Multi-tenant isolation via `clinic_id` + PostgreSQL RLS
- Server Actions with Zod validation
- Row Level Security (RLS) on all tables
- Immutable clinical records (append-only)
- MFA (TOTP) mandatory for admin and odontologo roles; AAL2 enforced per-request by `proxy.ts`
- Service role key ONLY on server (Next.js server and `backend/` FastAPI — never client)
