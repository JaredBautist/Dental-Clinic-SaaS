# Esquema PostgreSQL Completo

> 12 nodes · cohesion 0.17

## Key Concepts

- **Esquema PostgreSQL Completo** (12 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Función de Trigger `updated_at`** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `appointments` (Citas)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `audit_logs` (Registros de Auditoría — inmutables)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `clinical_attachments` (Adjuntos de Entradas Clínicas)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `clinical_entries` (Entradas Clínicas — inmutables)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `clinical_records` (Historias Clínicas — cabecera)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `clinics` (Consultorios)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `custom_tooth_statuses` (Estados Personalizados del Odontograma)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `odontogram_states` (Estados del Odontograma)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `patients` (Pacientes)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`
- **Tabla: `users` (Usuarios)** (1 connections) — `.kiro/specs/dental-clinic-saas/design.md`

## Relationships

- [Políticas RLS](Políticas_RLS.md) (1 shared connections)

## Source Files

- `.kiro/specs/dental-clinic-saas/design.md`

## Audit Trail

- EXTRACTED: 12 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*