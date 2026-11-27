# Sidebar clinic switcher

## Acceptance criteria

- When a platform operator opens the sidebar on desktop or mobile, show a labeled clinic selector beneath the logo using the authorized clinic list already provided by the dashboard layout.
- When the operator selects a clinic from Dashboard, Consultorios, Plataforma or Usuarios, navigate directly to the same section for that clinic. The URL, sidebar, mobile header and displayed data must agree. Browser Back must restore the previous selection.
- When Usuarios changes clinic, refresh the list and clear the previous clinic’s editor. Every staff action must target the selected clinic and verify membership and permissions on the server.
- When an operator switches from an account-only screen such as Auditoría or Configuración, open the selected clinic’s Consultorios page. Make that destination clear at the selector.
- When a user lacks platform access, show their assigned clinic as plain text. An untrusted URL parameter cannot grant access to another clinic.

## Design and tasks

1. Extend the shared URL-based clinic selection contract. Reuse the layout’s list and the existing clinic-scoped staff actions.
2. Add an accessible native select to the sidebar shared by desktop and mobile. On mobile, close the drawer after navigation.
3. Scope Usuarios reads and mutations, including refresh, creation and activation, before enabling same-section switching there.
4. Test switching between two clinics, browser Back, invalid clinic IDs, non-platform access and keyboard interaction in both layouts.
