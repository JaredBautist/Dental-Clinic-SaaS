# Hosted Release Tasks

- [ ] Verify provider connections and the source revision.
- [x] Add narrowly scoped CSP configuration for the hosted auth API and cover malformed and insecure origins.
- [x] Verify builds, test suites, and the FastAPI production start command.
- [ ] Deploy the API, configure the frontend origin, and verify its health endpoint.
- [ ] Configure Vercel, deploy the Next.js revision, and verify the landing, CORS, CSP and auth response.

Local checks passed: 100 TypeScript tests, 32 Python tests, production Next.js build, deployment-style startup, both health endpoints, CSP, CORS allow/deny and the login validation response. Hosted checks are pending provider access.
