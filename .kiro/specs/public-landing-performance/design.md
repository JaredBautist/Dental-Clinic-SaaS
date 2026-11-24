# Public Landing and Load Performance Design

Status: Approved and implemented locally.

## Landing

Use an editorial two-column hero on desktop and a single column on phones. Headline direction: “Tu consultorio dental, en orden.” Use the application’s light slate surfaces, blue actions and cyan accent, with the current Dental Clinic name and system typography. Match the cyan-to-blue brand mark in the dashboard shell and sidebar. The primary action is “Iniciar sesión.” A secondary “Ver funciones” link scrolls to the existing product capabilities.

Use two original photographic assets. The hero shows a clinician at a workstation in a contemporary dental practice. The secondary image shows two staff members coordinating reception and the agenda. Use natural light and a consistent color treatment. Show no patient information, readable screen contents, brand marks, testimonials or simulated product screenshots.

After the hero, present the reception-to-dentistry workflow, followed by a section on managing multiple consultorios and assigning staff without mixing records. Close with the existing login route. Use copy that reflects the actual roles and avoid unsupported compliance claims.

## Proposed layout

| Path | Responsibility |
| --- | --- |
| `app/page.tsx` | Public landing, static rendering and route-specific metadata. |
| `public/landing/` | Optimized local photographs with responsive sizes. |
| `lib/auth/require-user.ts` and `lib/auth/shell-profile.ts` | Request-local reuse of verified session and shell profile reads where tests show duplicate calls. |
| `app/(dashboard)/layout.tsx` and selected route entry points | Verify shared render behavior and preserve loading, authorization and error states. |

## ADR-001 — Optimize rendering without changing authentication

**Context.** The landing is already static. In the private app, the layout and page both request the verified profile, and actions may repeat the same read during rendering.

**Options considered.** Caching rendered private responses across requests risks mixing tenant data. Trusting request headers instead of verified auth would widen the trust boundary. Caching repeated reads within the same server render can avoid duplicate calls with unchanged session semantics.

**Decision.** Keep the public page static with no component hydration introduced by the redesign. Measure the existing auth flow before applying request-local React caching. Preserve the proxy's verification and redirects. Keep mutation and inter-request checks uncached.

**Consequences.** Local TTFB on a warm process is already low, so improvements for private views will be assessed by the number of upstream calls as well as timing. A hero photograph adds bytes compared with the current text-only baseline. Target up to 160 KB desktop and 100 KB mobile for the hero response, with a 2.5 s lab LCP target at a declared mobile throttle. Use a warm process, fresh browser cache per run and the same test profile on both builds.

## Pre-implementation evidence

- The current production build returned a median warm TTFB of 4.2 ms on loopback over 15 anonymous requests. The HTML response body was 22,019 bytes before compression. This is a local server baseline only.
- The two generated concept photos are available in `public/landing/`. The hero WebP is 25,880 bytes at 640 px and 66,656 bytes at 1280 px. The reception photo is 25,384 bytes and 66,024 bytes at the same widths.
- The dashboard layout and page each call `getShellProfile()`, which reads the verified user and clinic. Browser LCP and fixture request counts are recorded below.


## Local verification

Chromium production builds, five anonymous navigations per version, warm Next.js process, browser cache disabled, 375 px viewport at DPR 2, 100 ms latency, 200,000 bytes/s download and 4× CPU throttle.

| Metric | Previous text-only landing | Landing with photos |
| --- | ---: | ---: |
| Median TTFB | 101.4 ms | 101.9 ms |
| Median LCP | 660 ms | 1,056 ms |
| Median transfer size | 165,455 B | 232,930 B |
| Median CLS | 0 | 0 |
| External requests | 0 | 0 |

The hero WebP selected at this viewport is 33,414 bytes at 768 px. The photos add transfer weight and the LCP remains under the 2.5 s lab target. Do not interpret this result as a field performance measurement.

In the authenticated fixture, the dentist dashboard made six Supabase requests instead of seven after dropping the patient count unused by that view. Reception keeps its count. The Patients route stayed at six requests because the framework already deduplicated the relevant HTTP reads. Shell profile computation is now shared per render. Authenticated, anonymous, inactive and AAL1 states, root redirects, and clinic-scoped queries were verified using two synthetic tenant identities.

Chromium passed the checks for 320, 375, 768 and 1440 px with a dark system preference and reduced motion, including the skip link, anchors, enabled login route, loaded hero and no page overflow. The initial palette ratios ranged from 5.32:1 to 14.68:1. Targeted lint, the Next.js production build and 93 tests passed.
