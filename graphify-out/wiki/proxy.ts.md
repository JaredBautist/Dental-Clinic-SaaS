# proxy.ts

> 19 nodes · cohesion 0.19

## Key Concepts

- **proxy.ts** (20 connections) — `proxy.ts`
- **proxy()** (10 connections) — `proxy.ts`
- **verified-headers.ts** (8 connections) — `lib/auth/verified-headers.ts`
- **proxy.test.ts** (7 connections) — `__tests__/unit/proxy.test.ts`
- **buildVerifiedRequestHeaders()** (5 connections) — `lib/auth/verified-headers.ts`
- **stripUntrustedAuthHeaders()** (5 connections) — `lib/auth/verified-headers.ts`
- **@supabase/ssr** (5 connections) — `package.json`
- **verified-headers.test.ts** (4 connections) — `__tests__/unit/verified-headers.test.ts`
- **isUnauthenticatedError()** (3 connections) — `lib/auth/access-policy.ts`
- **copyResponseCookies()** (3 connections) — `proxy.ts`
- **createRedirect()** (3 connections) — `proxy.ts`
- **VerifiedClaims** (2 connections) — `lib/auth/verified-headers.ts`
- **isUserRole()** (2 connections) — `proxy.ts`
- **unavailableResponse()** (2 connections) — `proxy.ts`
- **AUTH_CONTEXT_HEADERS** (1 connections) — `lib/auth/verified-headers.ts`
- **config** (1 connections) — `proxy.ts`
- **USER_ROLES** (1 connections) — `proxy.ts`
- **mockedCreateServerClient** (1 connections) — `__tests__/unit/proxy.test.ts`
- **mockGetUserResult()** (1 connections) — `__tests__/unit/proxy.test.ts`

## Relationships

- [access-policy.ts](access-policy.ts.md) (6 shared connections)
- [UserRole](UserRole.md) (3 shared connections)
- [types/domain.ts](types-domain.ts.md) (2 shared connections)
- [next](next.md) (2 shared connections)
- [auth.actions.ts](auth.actions.ts.md) (2 shared connections)
- [package.json](package.json.md) (1 shared connections)
- [auth-api.ts](auth-api.ts.md) (1 shared connections)
- [createClient](createClient.md) (1 shared connections)

## Source Files

- `__tests__/unit/proxy.test.ts`
- `__tests__/unit/verified-headers.test.ts`
- `lib/auth/access-policy.ts`
- `lib/auth/verified-headers.ts`
- `package.json`
- `proxy.ts`

## Audit Trail

- EXTRACTED: 51 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*