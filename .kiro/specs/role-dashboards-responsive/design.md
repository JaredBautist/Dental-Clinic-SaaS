# Responsive Role Dashboards Design

Status: Proposed for approval.

Keep the light palette, existing identity, typography and component primitives. Treat the mobile dashboards as daily work screens. Place the most useful action or section near the top and use desktop density only when the content area can accommodate it.

| Current behavior | Proposed behavior | Reason |
| --- | --- | --- |
| The reception schedule heading begins at y=837 px at 320 and 375 px in the fixture. | Keep registration and appointment buttons within reach, compact the summary cards and bring the schedule above secondary content. | Staff can reach reception's main tasks without crossing a tall stack of metrics. |
| The dentist's schedule heading begins at y=801 px at 375 px. Appointment names are clipped at 320, 375 and 1024 px. | Show the schedule and patient record shortcut sooner. Let long names wrap and put time and status on a second line when the row is narrow. | The row stays legible when the sidebar reduces available width. |
| The administrative selector is approximately 95 px wide at 320 px and 150 px at 375 px. | Stack the labeled selector and the submit button on narrow screens. Use consistent wrapping for clinic and staff names. | Choosing from several clinics stays legible and the selected context is clear. |
| The platform clinic list occupies the space before the selected detail on phones. | Use compact selection above the active clinic details on phones. Retain the list and detail layout when both have enough space. | The operator can choose a clinic and reach its subscription without scrolling past the entire list. |

## Module boundaries

| Path | Responsibility |
| --- | --- |
| `app/(dashboard)/dashboard/page.tsx` | Role-specific layout, dashboard actions and responsive appointment rows. |
| `app/(dashboard)/plataforma/` | Compact clinic selection and responsive subscription form. |
| `components/layout/DashboardShell.tsx` and `Sidebar.tsx` | Shared navigation, focus management and content width. |
| `components/ui/` | Reuse existing primitives. Prefer dashboard-specific class overrides over global changes to all consumers. |

## ADR-001 — Adapt to the content width

**Context.** A 1024 px viewport can leave a much smaller dashboard column once the sidebar is present.

**Options considered.** Viewport-only breakpoints are simple but caused clipping at desktop entry width. Duplicating markup by device would create parallel navigation and accessibility paths.

**Decision.** Keep a single semantic layout and base multi-column density on available content width where practical. Stack controls and wrap text in narrow regions. Keep primary actions in the natural focus order.

**Consequences.** The middle widths and landscape need separate checks. The calendar, patient record, reports and backend actions are outside this redesign. Verify the existing shortcuts into those routes.
