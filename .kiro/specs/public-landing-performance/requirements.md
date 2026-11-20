# Public Landing and Load Performance

Status: Approved and implemented locally.

| ID | Acceptance criterion |
| --- | --- |
| LP-01 | WHEN a visitor opens the public landing, the interface SHALL explain how reception, dentistry and platform administration manage appointments, clinical records and multiple clinics in Spanish. It SHALL show only product capabilities present in the application. |
| LP-02 | WHEN a visitor needs access, the header, hero and closing CTA SHALL link to the existing login. The landing SHALL preserve existing authenticated redirects and clinic isolation. |
| LP-03 | WHEN visitors use mobile, desktop, a keyboard or a dark system preference, the landing SHALL remain light, readable and navigable, with visible focus, meaningful alt text and no horizontal overflow. |
| LP-04 | WHEN the landing loads, the hero photograph SHALL use locally served responsive images with a reserved aspect ratio and the secondary photograph SHALL load lazily. The landing SHALL add no client JavaScript dependencies or third-party requests for images or fonts. |
| LP-05 | WHEN rendering the private dashboard and Patients routes, the application SHALL reuse verified reads within the current render where safe. Authorization, inactive account handling, AAL2 checks and scope SHALL continue to work for each request and mutation. |
| LP-06 | WHEN comparing the production builds locally, report median TTFB, LCP, transferred bytes and authenticated Supabase request counts under equivalent test conditions, including any trade-off from adding images. |
