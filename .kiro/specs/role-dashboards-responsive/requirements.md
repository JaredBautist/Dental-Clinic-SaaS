# Responsive Role Dashboards

Status: Proposed for approval.

Scope: the Reception, Dentistry and Administration variants of `/dashboard`, the shared navigation shell and the platform operator's `/plataforma` view.

| ID | Acceptance criterion |
| --- | --- |
| RD-01 | WHEN staff open the dashboard at 320–1440 px or rotate a phone to landscape, the page SHALL fit without horizontal page scrolling. Text and primary controls SHALL stay readable in the light theme regardless of system preference. |
| RD-02 | WHEN reception opens the dashboard on a 375 × 812 px phone, the actions to register a patient and create an appointment, and the heading for today's schedule, SHALL be visible within the initial viewport with representative content. Appointment rows SHALL show the patient, time and textual status. |
| RD-03 | WHEN a dentist opens the dashboard on a phone, the dashboard SHALL make today's schedule and the entry to patient records easy to reach. Long patient and staff names SHALL wrap in appointment rows, with the time and status still visible. Existing personal report links SHALL remain accessible. |
| RD-04 | WHEN a platform operator chooses a clinic on a phone, the selector and submit action SHALL have enough space to use at 320 px. The dashboard and management links SHALL follow the chosen clinic. In the platform view, the selected clinic and its subscription controls SHALL be easy to reach even with a long clinic list. |
| RD-05 | WHEN a user uses a touch screen or keyboard, primary controls SHALL offer a 44 px minimum target and visible focus. The mobile menu SHALL close with Escape, restore focus, and avoid leaving hidden controls in the tab order. |
| RD-06 | WHEN a tenant administrator, receptionist or dentist loads these views, existing data scopes SHALL remain enforced. Layout changes SHALL preserve URL-based clinic selection, authorization and actions. |
