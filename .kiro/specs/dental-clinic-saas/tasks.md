# Implementation Plan: Dental Clinic SaaS

## Overview

Implementación incremental de la plataforma web SaaS multiempresa para gestión de consultorios odontológicos. El plan sigue el orden de dependencias naturales: infraestructura base → base de datos → autenticación → módulos de negocio → testing.

Stack: Next.js 14+ con TypeScript (App Router), Supabase (Auth, PostgreSQL, RLS, Storage, Edge Functions), Vercel, Vitest + fast-check, Zod.

---

## Tasks

- [x] 1. Configuración de infraestructura base del proyecto
  - [x] 1.1 Inicializar proyecto Next.js 14 con TypeScript y configurar estructura de carpetas
    - Crear proyecto con `create-next-app` usando App Router y TypeScript estricto
    - Configurar `tsconfig.json` con rutas absolutas (`@/`)
    - Crear estructura de carpetas: `app/`, `app/(auth)/`, `app/(dashboard)/`, `app/api/`, `lib/`, `types/`, `components/`, `__tests__/`
    - Instalar dependencias: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `vitest`, `fast-check`, `@vitejs/plugin-react`
    - _Requisitos: 1.1_

  - [x] 1.2 Configurar variables de entorno y cliente Supabase para servidor y cliente
    - Crear `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`
    - Implementar `lib/supabase/server.ts` con `createServerClient` usando `@supabase/ssr` (cookies)
    - Implementar `lib/supabase/client.ts` con `createBrowserClient` (solo `anon key`)
    - Implementar `lib/supabase/admin.ts` con `createAdminClient` usando `service_role_key` (solo server-side)
    - Verificar que `SUPABASE_SERVICE_ROLE_KEY` no esté prefijada con `NEXT_PUBLIC_`
    - _Requisitos: 8.2, 8.3_

  - [x] 1.3 Configurar headers de seguridad HTTP en `next.config.ts`
    - Implementar función `headers()` en `next.config.ts` con: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options` y `Referrer-Policy`
    - Configurar CSP con `connect-src` apuntando a `*.supabase.co`
    - Configurar HSTS con `max-age=63072000; includeSubDomains; preload`
    - _Requisitos: 3.6, 3.7_

  - [x] 1.4 Escribir prueba de propiedad P25: Headers de seguridad HTTP
    - **Propiedad 25: Headers de Seguridad HTTP Presentes en Todas las Respuestas**
    - **Valida: Requisito 3.7**
    - Crear `__tests__/properties/security-headers.property.test.ts`
    - Verificar con fast-check que todas las rutas incluyen los cuatro headers requeridos con sus valores configurados

  - [x] 1.5 Implementar boundary de autenticación (Proxy de Next.js 16)
    - Crear `proxy.ts` en la raíz del proyecto (reemplazo vigente de `middleware.ts`)
    - Verificar sesión válida para todas las rutas bajo `/(dashboard)`
    - Redirigir a `/login` si no hay sesión o está expirada
    - Verificar estado MFA para roles `administrador` y `odontologo`; redirigir a `/setup-mfa` o `/verify-mfa` según corresponda
    - Inyectar `clinic_id`, `user_id` y `user_role` verificados en headers internos para Server Components
    - Configurar `matcher` para excluir recursos estáticos; las rutas públicas y de autenticación se deciden explícitamente en la política de acceso
    - _Requisitos: 2.7, 2.8, 3.1, 3.5_

  - [x] 1.6 Crear tipos de dominio TypeScript compartidos
    - Crear `types/domain.ts` con: `UserRole`, `AppointmentStatus`, `ClinicalEntryType`, `ToothSurface`, `ToothStatus`, `AuditAction`, `JWTClaims`, `AuditRecord`
    - Crear `errors/domain.ts` con la jerarquía de errores: `DentalClinicError`, `TenantIsolationError`, `RoleAuthorizationError`, `UniqueDocumentError`, `AppointmentConflictError`, `ConcurrencyConflictError`, `ImmutableRecordError`, `ValidationError`, `ReportRangeLimitError`
    - _Requisitos: 1.1, 2.1_

  - [x] 1.7 Implementar wrapper genérico de Server Actions con manejo de errores
    - Crear `lib/server-action-wrapper.ts` con función `withErrorHandling`
    - Capturar errores de dominio (`DentalClinicError`) y errores inesperados
    - Registrar log de auditoría para errores HTTP 403 automáticamente
    - No exponer detalles de error interno al cliente
    - _Requisitos: 8.4_

- [x] 2. Migraciones de base de datos y políticas RLS
  - [x] 2.1 Crear migración SQL para tablas base: `clinics` y `users`
    - Crear `supabase/migrations/001_create_clinics.sql` con tabla `clinics`, trigger `set_clinics_updated_at` y función `update_updated_at_column()`
    - Crear `supabase/migrations/002_create_users.sql` con tabla `users` (extiende `auth.users`), índices `idx_users_clinic_id` e `idx_users_clinic_role`
    - _Requisitos: 1.3, 2.1_

  - [x] 2.2 Crear migración SQL para tabla `patients` con índice GIN de búsqueda full-text
    - Crear `supabase/migrations/003_create_patients.sql`
    - Incluir constraint `UNIQUE (clinic_id, document_type, document_number)`
    - Crear índice `idx_patients_search` usando `GIN(to_tsvector('spanish', ...))`
    - Crear índices `idx_patients_clinic_id` e `idx_patients_document`
    - _Requisitos: 4.3, 4.7_

  - [x] 2.3 Crear migración SQL para tabla `appointments` con exclusion constraint
    - Crear `supabase/migrations/004_create_appointments.sql`
    - Habilitar extensión `btree_gist` con `CREATE EXTENSION IF NOT EXISTS btree_gist`
    - Crear columna generada `ends_at GENERATED ALWAYS AS (scheduled_at + (duration_min * interval '1 minute')) STORED`
    - Crear exclusion constraint `no_overlap_appointments` con `EXCLUDE USING gist(dentist_id WITH =, tstzrange(scheduled_at, ends_at, '[)') WITH &&) WHERE (status IN ('programada','confirmada','en_curso'))`
    - Crear índices necesarios
    - _Requisitos: 5.1, 5.4_

  - [x] 2.4 Crear migraciones SQL para tablas clínicas e historial del odontograma
    - Crear `supabase/migrations/005_create_clinical_records.sql` con `clinical_records` (constraint `UNIQUE(clinic_id, patient_id)`)
    - Crear `supabase/migrations/006_create_clinical_entries.sql` con `clinical_entries` (sin `updated_at`, constraint de consistencia `correction_entry_consistency`)
    - Crear `supabase/migrations/007_create_clinical_attachments.sql` con `clinical_attachments`
    - Crear `supabase/migrations/008_create_odontogram_states.sql` con `odontogram_states` (append-only, sin `updated_at`)
    - Crear `supabase/migrations/009_create_custom_tooth_statuses.sql` con `custom_tooth_statuses`
    - _Requisitos: 6.1, 6.2, 6.3, 7.2, 7.3_

  - [x] 2.5 Crear migración SQL para tabla `audit_logs` (inmutable)
    - Crear `supabase/migrations/010_create_audit_logs.sql`
    - Sin claves foráneas en `clinic_id` ni `user_id` (preservar si entidad se elimina)
    - Sin `updated_at` intencional
    - Crear índices `idx_audit_clinic_timestamp`, `idx_audit_entity`, `idx_audit_user`
    - _Requisitos: 8.4, 8.5_

  - [x] 2.6 Crear migración SQL con todas las políticas RLS
    - Crear `supabase/migrations/011_rls_policies.sql`
    - Habilitar RLS en todas las tablas: `clinics`, `users`, `patients`, `appointments`, `clinical_records`, `clinical_entries`, `clinical_attachments`, `odontogram_states`, `custom_tooth_statuses`, `audit_logs`
    - Implementar políticas SELECT/INSERT/UPDATE diferenciadas por rol para cada tabla según el diseño
    - Denegar UPDATE y DELETE sobre `clinical_entries`, `odontogram_states` y `audit_logs` (no crear políticas → rechazadas por defecto)
    - Denegar DELETE sobre `users` (se desactiva, no se elimina)
    - _Requisitos: 2.10, 6.3, 7.7, 8.1, 8.5_

  - [x] 2.7 Configurar bucket privado de Supabase Storage y sus políticas
    - Crear `supabase/migrations/012_storage_policies.sql`
    - Crear bucket `clinical-files` como privado (no público)
    - Implementar política `storage_insert_clinical`: solo `administrador` u `odontologo` del mismo `clinic_id`
    - Implementar política `storage_select_clinical`: misma restricción de rol y `clinic_id`
    - _Requisitos: 6.8, 8.1_

  - [x]* 2.8 Escribir prueba de propiedad P1: Aislamiento completo de tenants
    - **Propiedad 1: Aislamiento Completo de Tenants**
    - **Valida: Requisitos 1.4, 2.4, 4.8, 5.11, 7.8, 8.1, 9.6**
    - Crear `__tests__/properties/tenant-isolation.property.test.ts`
    - Generar con fast-check pares `(userClinicId, registros con clinic_ids mixtos)` y verificar que la función de filtrado por RLS solo retorna filas del `clinic_id` del usuario

  - [x] 2.9 Validar migraciones y garantías de seguridad contra PostgreSQL real
    - Crear un bootstrap mínimo de los esquemas `auth` y `storage` requeridos por las migraciones
    - Aplicar secuencialmente las migraciones `001` a `013` sobre PostgreSQL 15 desechable
    - Verificar con aserciones SQL el aislamiento RLS, las claves compuestas entre tenants, los permisos clínicos, la inmutabilidad, el lockout persistente y el Custom Access Token Hook
    - Ejecutar mediante `npm run test:db`, eliminando siempre el contenedor al finalizar
    - _Requisitos: 1.4, 2.4, 2.9, 2.10, 3.2, 6.3, 8.1, 8.5_

- [ ] 3. Autenticación y control de sesiones
  - [ ] 3.1 Implementar páginas de login con validación de intentos fallidos
    - Crear `app/(auth)/login/page.tsx` con formulario de email + contraseña
    - Implementar Server Action `loginAction` que usa `supabase.auth.signInWithPassword`
    - Implementar contador de intentos fallidos: tras 5 intentos consecutivos, bloquear durante 15 minutos y enviar notificación al email del administrador del consultorio
    - Verificar disponibilidad del servidor via `GET /api/health` antes de procesar credenciales
    - Mostrar mensajes de error específicos sin revelar si la cuenta existe
    - Estado: lockout persistente implementado; falta conectar un worker/proveedor de correo que procese `private.security_notification_outbox`
    - _Requisitos: 3.1, 3.2, 10.3_

  - [x]* 3.2 Escribir prueba de propiedad P22: Validación de contraseñas
    - **Propiedad 22: Validación de Contraseñas**
    - **Valida: Requisito 3.3**
    - Crear `__tests__/properties/password-validation.property.test.ts`
    - Usar fast-check para generar cadenas válidas e inválidas; verificar que la función de validación acepta exactamente las contraseñas que cumplen ≥10 chars + mayúscula + minúscula + dígito + especial, y rechaza todas las demás indicando los requisitos incumplidos

  - [x] 3.3 Implementar flujo de configuración y verificación MFA
    - Crear `app/(auth)/setup-mfa/page.tsx` con flujo TOTP obligatorio para `administrador` y `odontologo`
    - Implementar `supabase.auth.mfa.enroll()` para configuración inicial
    - Crear `app/(auth)/verify-mfa/page.tsx` para verificación TOTP en cada inicio de sesión
    - Implementar `supabase.auth.mfa.challenge()` + `supabase.auth.mfa.verify()` y confirmar AAL2 para validar el código
    - Si usuario abandona o falla el flujo MFA: cerrar sesión con `supabase.auth.signOut()` y redirigir a login
    - Actualizar campo `mfa_enabled = true` en tabla `users` al completar la configuración
    - _Requisitos: 2.7, 2.8_

  - [ ]* 3.4 Escribir prueba de propiedad P24: Integridad del JWT emitido
    - **Propiedad 24: Integridad del JWT Emitido**
    - **Valida: Requisito 2.9**
    - Crear `__tests__/properties/jwt-claims.property.test.ts`
    - Verificar con fast-check que para cualquier usuario autenticado correctamente, el JWT contiene `clinic_id`, `user_id` y `user_role`, con valores idénticos a `users.clinic_id`, `users.id` y `users.role`
    - Estado: hook SQL validado localmente; falta aplicar la migración en el proyecto Supabase alojado, habilitar allí el Custom Access Token Hook y validarlo contra un JWT real

  - [x] 3.5 Implementar cierre de sesión por inactividad (SessionTimer) y expiración de sesión
    - Crear `components/session/SessionTimer.tsx` como Client Component
    - Escuchar eventos `click`, `keydown`, `mousemove`, `touchstart` para reiniciar timer
    - Al cumplir 30 minutos sin eventos: ejecutar una Server Action que confirme `supabase.auth.signOut()` antes de redirigir a `/login`
    - Almacenar timestamp de última actividad en estado React (no en `localStorage`)
    - Implementar manejo de token expirado/revocado: redirigir a login y limpiar datos de sesión del navegador
    - _Requisitos: 3.4, 3.5_

  - [x] 3.6 Implementar Route Handler `GET /api/health` para verificación de disponibilidad
    - Crear `app/api/health/route.ts` que retorna `{ status: 'ok' }` con HTTP 200
    - Usar para verificar conectividad antes de login y desde el detector offline
    - _Requisitos: 10.3_

- [ ] 4. Gestión de consultorios (multitenencia)
  - [ ] 4.1 Implementar Server Action para registro de consultorio y creación de admin inicial
    - Crear `lib/actions/clinic.actions.ts` con `registerClinicAction`
    - Crear `clinic` + usuario administrador en una transacción (usando RPC de Supabase)
    - Asignar `clinic_id` único generado por el servidor (UUID)
    - Enviar credenciales iniciales por email via `supabase.auth.admin.inviteUserByEmail`
    - Validar con Zod: nombre ≤120 chars, teléfono 7-15 dígitos, email válido ≤254 chars, dirección ≤255 chars
    - Rechazar formulario con campos obligatorios vacíos o inválidos, indicar campos con error, no persistir datos parciales
    - _Requisitos: 1.1, 1.2, 1.8_

  - [ ] 4.2 Implementar página de configuración del consultorio
    - Crear `app/(dashboard)/clinica/configuracion/page.tsx` (solo administrador)
    - Implementar Server Action `updateClinicAction` con validación Zod
    - Mostrar formulario con los campos: nombre, dirección, teléfono, email
    - Confirmar actualización con los valores guardados (round-trip)
    - _Requisitos: 1.6, 1.7_

  - [ ]* 4.3 Escribir prueba de propiedad P2: Round-trip de datos del consultorio
    - **Propiedad 2: Round-Trip de Datos del Consultorio**
    - **Valida: Requisitos 1.6, 1.7**
    - Crear `__tests__/properties/clinic-roundtrip.property.test.ts`
    - Usar fast-check para generar conjuntos válidos de datos de consultorio y verificar que los datos recuperados son byte a byte idénticos a los enviados

  - [ ]* 4.4 Escribir prueba de propiedad P3: Rechazo de datos obligatorios ausentes o inválidos
    - **Propiedad 3: Rechazo de Datos Obligatorios Ausentes o Inválidos**
    - **Valida: Requisitos 1.8, 4.2, 5.3**
    - Crear `__tests__/properties/mandatory-fields.property.test.ts`
    - Generar con fast-check entidades con al menos un campo obligatorio ausente o inválido; verificar que el sistema rechaza y no persiste datos parciales, indicando los campos con error

- [ ] 5. Checkpoint — Verificar infraestructura base
  - Asegurarse de que todas las migraciones se aplican sin errores con `supabase db push`
  - Verificar que el middleware redirige correctamente según estado de sesión y MFA
  - Verificar que los headers de seguridad están presentes en las respuestas
  - Preguntar al usuario si hay dudas antes de continuar.

- [ ] 6. Gestión de usuarios y roles
  - [ ] 6.1 Implementar CRUD de usuarios (solo administrador)
    - Crear `lib/actions/users.actions.ts` con `createUserAction`, `updateUserAction`, `deactivateUserAction`
    - `createUserAction`: asociar usuario al `clinic_id` del administrador, asignar exactamente un rol válido, rechazar roles inválidos con lista de roles aceptados
    - `updateUserAction`: solo administrador puede modificar usuarios del mismo consultorio
    - Validar con Zod: `full_name` ≤200 chars, `role` uno de los tres válidos
    - Registrar `Registro_Auditoria` en cada operación (`create`, `update`)
    - _Requisitos: 2.2, 2.3_

  - [ ] 6.2 Implementar desactivación de usuario con protección del último administrador
    - En `deactivateUserAction`: verificar que no es el único `administrador` activo del consultorio antes de desactivar
    - Si es el único admin activo: rechazar con mensaje "el consultorio debe conservar al menos un administrador activo"
    - Al desactivar: revocar sesión activa via `supabase.auth.admin.signOut(userId)` en plazo máximo de 60 segundos
    - Impedir nuevos inicios de sesión verificando `is_active = false` en middleware
    - _Requisitos: 2.5, 2.6_

  - [ ]* 6.3 Escribir prueba de propiedad P23: Protección del último administrador activo
    - **Propiedad 23: Protección del Último Administrador Activo**
    - **Valida: Requisito 2.6**
    - Crear `__tests__/properties/last-admin-protection.property.test.ts`
    - Usar fast-check para generar consultorios con exactamente un admin activo y verificar que cualquier intento de desactivarlo es rechazado con el mensaje correspondiente

  - [ ]* 6.4 Escribir prueba de propiedad P7: Control de acceso por rol
    - **Propiedad 7: Control de Acceso por Rol**
    - **Valida: Requisitos 2.3, 6.9, 7.7, 9.5**
    - Crear `__tests__/properties/role-authorization.property.test.ts`
    - Verificar con fast-check que recepcionista y odontólogo son rechazados en operaciones reservadas para administrador

  - [ ] 6.5 Crear páginas de gestión de usuarios
    - Crear `app/(dashboard)/usuarios/page.tsx`: lista de usuarios del consultorio (solo admin)
    - Crear `app/(dashboard)/usuarios/nuevo/page.tsx`: formulario de creación de usuario
    - Crear `app/(dashboard)/usuarios/[userId]/page.tsx`: edición y desactivación de usuario
    - Aplicar verificación de rol `administrador` en Server Components; mostrar "Acceso denegado" para otros roles
    - _Requisitos: 2.1, 2.2, 2.3_

- [ ] 7. Gestión de pacientes
  - [ ] 7.1 Implementar Server Actions CRUD de pacientes con validación Zod
    - Crear `lib/actions/patients.actions.ts` con `createPatientAction` y `updatePatientAction`
    - Validar campos obligatorios: `full_name` ≤200 chars, `document_type` de lista predefinida (`CC`, `TI`, `CE`, `PA`, `RC`, `NIT`), `document_number` ≤20 chars alfanuméricos, `birth_date` no futura, `biological_sex` de lista predefinida, `phone_primary` 7-15 dígitos
    - Verificar unicidad de `(clinic_id, document_type, document_number)` antes de insertar; si duplicado, rechazar mostrando nombre e ID del paciente existente
    - Almacenar bajo el `clinic_id` del usuario autenticado y confirmar con `id` asignado
    - Registrar `Registro_Auditoria` con `action = 'create'` o `'update'`
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.6_

  - [ ]* 7.2 Escribir prueba de propiedad P4: Unicidad de documento de paciente por consultorio
    - **Propiedad 4: Unicidad de Documento de Paciente por Consultorio**
    - **Valida: Requisitos 4.3, 4.4**
    - Crear `__tests__/properties/patient-document-uniqueness.property.test.ts`
    - Usar fast-check para generar pares de pacientes con mismo `(clinic_id, document_type, document_number)` y verificar que el segundo registro es rechazado con nombre e ID del existente

  - [ ]* 7.3 Escribir prueba de propiedad P5: Round-trip de datos de entidades clínicas
    - **Propiedad 5: Round-Trip de Datos de Entidades Clínicas**
    - **Valida: Requisitos 4.1, 6.2, 7.2, 7.9**
    - Crear `__tests__/properties/clinical-entities-roundtrip.property.test.ts`
    - Verificar que datos de paciente, cita, entrada clínica y estado de odontograma recuperados son idénticos a los insertados

  - [ ] 7.4 Implementar búsqueda full-text de pacientes
    - Crear `lib/actions/patients.actions.ts` función `searchPatientsAction`
    - Usar índice GIN `idx_patients_search` con `to_tsvector('spanish', ...)` para búsqueda por nombre o documento
    - Activar búsqueda con ≥2 caracteres; retornar hasta 50 coincidencias ordenadas por `full_name`
    - Filtrar por `clinic_id` del JWT; tiempo de respuesta máximo 2 segundos para ≤10 000 pacientes
    - _Requisitos: 4.7, 4.8_

  - [ ] 7.5 Crear páginas de gestión de pacientes
    - Crear `app/(dashboard)/pacientes/page.tsx`: lista con campo de búsqueda y resultados paginados
    - Crear `app/(dashboard)/pacientes/nuevo/page.tsx`: formulario de registro de paciente con `PatientForm` (Client Component con validación Zod)
    - Crear `app/(dashboard)/pacientes/[pacienteId]/page.tsx`: perfil del paciente con acceso a historia clínica y odontograma
    - _Requisitos: 4.1, 4.7_

- [ ] 8. Gestión de citas
  - [ ] 8.1 Implementar Server Action para creación de citas con detección de conflictos
    - Crear `lib/actions/appointments.actions.ts` con `createAppointmentAction`
    - Validar campos obligatorios con Zod: `paciente_id`, `odontologo_id`, `fecha` no anterior a hoy, `hora_inicio`, `duration_min` entre 15 y 480, `reason` ≤500 chars
    - Verificar conflicto de horario consultando citas activas del odontólogo (`programada`, `confirmada`, `en_curso`) que se solapen con `tstzrange`
    - Si hay conflicto: rechazar y retornar las próximas 3 franjas disponibles del mismo odontólogo
    - Registrar `Registro_Auditoria` con `action = 'create'`
    - La exclusion constraint de PostgreSQL actúa como segunda capa de protección
    - _Requisitos: 5.1, 5.2, 5.3, 5.10_

  - [ ]* 8.2 Escribir prueba de propiedad P8: Invariante de no solapamiento de citas
    - **Propiedad 8: Invariante de No Solapamiento de Citas**
    - **Valida: Requisitos 5.1, 5.4**
    - Crear `__tests__/properties/appointment-no-overlap.property.test.ts`
    - Usar fast-check para generar colecciones de citas activas del mismo odontólogo y verificar que para todo par `(A, B)`: `A.scheduled_at ≥ B.ends_at OR B.scheduled_at ≥ A.ends_at`

  - [ ] 8.3 Implementar reprogramación y cancelación de citas
    - Crear `rescheduleAppointmentAction`: verificar estado `programada` o `confirmada`, verificar disponibilidad nueva franja, actualizar estado a `reprogramada`, registrar `rescheduled_from`
    - Crear `cancelAppointmentAction`: requerir `cancel_reason` ≤255 chars, actualizar estado a `cancelada`, registrar `cancelled_by` y `cancelled_at`
    - Registrar `Registro_Auditoria` con `action = 'reschedule'` o `'cancel'` según corresponda
    - _Requisitos: 5.4, 5.5, 5.6, 5.10_

  - [ ]* 8.4 Escribir prueba de propiedad P9: Integridad de datos de cancelación de citas
    - **Propiedad 9: Integridad de Datos de Cancelación de Citas**
    - **Valida: Requisito 5.6**
    - Crear `__tests__/properties/appointment-cancellation.property.test.ts`
    - Usar fast-check para generar citas y motivos de cancelación; verificar que el registro resultante tiene `status = 'cancelada'`, `cancel_reason` correcto, `cancelled_by` del solicitante y `cancelled_at` no nulo

  - [ ] 8.5 Implementar Edge Function para transición automática de estados de citas
    - Crear `supabase/functions/auto-transition-appointments/index.ts`
    - Función cron (cada minuto o mediante pg_cron) que actualiza citas con `status IN ('programada','confirmada')` y `scheduled_at <= now()` a `status = 'en_curso'`
    - Usar `supabaseAdmin` con `service_role_key` para operar sin restricciones de RLS
    - _Requisitos: 5.8_

  - [ ] 8.6 Crear página de calendario de citas
    - Crear `app/(dashboard)/citas/page.tsx` con `AppointmentCalendar` (Client Component)
    - Integrar biblioteca de calendario (ej. `react-big-calendar`) con vistas por día/semana/mes
    - Filtros por odontólogo y rango de fechas; cargar citas del rango en ≤2 segundos
    - Crear `app/(dashboard)/citas/nueva/page.tsx` con formulario `AppointmentForm`
    - Crear `app/(dashboard)/citas/[citaId]/page.tsx` para detalle, reprogramación y cancelación
    - Mostrar solo citas del `clinic_id` del JWT
    - _Requisitos: 5.7, 5.9, 5.11_

- [ ] 9. Checkpoint — Verificar módulos de negocio base
  - Asegurarse de que los flujos de pacientes y citas funcionan end-to-end con pruebas unitarias
  - Verificar que la exclusion constraint de citas funciona correctamente en base de datos local
  - Preguntar al usuario si hay dudas antes de continuar.

- [ ] 10. Historia clínica odontológica
  - [ ] 10.1 Implementar Server Action para registro de entradas clínicas con control de concurrencia
    - Crear `lib/actions/clinical.actions.ts` con `saveClinicalEntryAction`
    - Crear automáticamente `clinical_records` si no existe para el paciente (UPSERT con `UNIQUE(clinic_id, patient_id)`)
    - Validar campos: `entry_type` de lista predefinida, `content` entre 1 y 5000 chars, `corrects_entry_id` solo para tipo `correccion`
    - Verificar `version`: si `expected_version !== version_actual` → rechazar con `CONCURRENCY_CONFLICT`, indicar `entry_id` o `record_id`, preservar contenido del formulario
    - Insertar entrada e incrementar `version` en transacción atómica via RPC de Supabase
    - Registrar `Registro_Auditoria` con `action = 'create'` o `'correccion'`
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.6, 6.11_

  - [ ]* 10.2 Escribir prueba de propiedad P10: Unicidad de historia clínica por paciente
    - **Propiedad 10: Unicidad de Historia Clínica por Paciente**
    - **Valida: Requisito 6.1**
    - Crear `__tests__/properties/clinical-record-uniqueness.property.test.ts`
    - Usar fast-check para generar múltiples entradas clínicas del mismo paciente y verificar que siempre existe exactamente 1 registro en `clinical_records` para `(clinic_id, patient_id)`

  - [ ]* 10.3 Escribir prueba de propiedad P11: Inmutabilidad de registros clínicos y de auditoría
    - **Propiedad 11: Inmutabilidad de Registros Clínicos y de Auditoría**
    - **Valida: Requisitos 6.3, 8.5**
    - Crear `__tests__/properties/immutability.property.test.ts`
    - Verificar con fast-check que todo intento de UPDATE o DELETE sobre `clinical_entries` o `audit_logs` es rechazado por RLS, independientemente del rol

  - [ ]* 10.4 Escribir prueba de propiedad P12: Trazabilidad de correcciones clínicas
    - **Propiedad 12: Trazabilidad de Correcciones Clínicas**
    - **Valida: Requisito 6.4**
    - Crear `__tests__/properties/clinical-correction-trace.property.test.ts`
    - Verificar que la entrada original permanece sin cambios y que existe una nueva con `entry_type = 'correccion'` y `corrects_entry_id` apuntando al original con `created_at` posterior

  - [ ]* 10.5 Escribir prueba de propiedad P13: Ordenamiento cronológico de la historia clínica
    - **Propiedad 13: Ordenamiento Cronológico de la Historia Clínica**
    - **Valida: Requisito 6.5**
    - Crear `__tests__/properties/clinical-chronological-order.property.test.ts`
    - Usar fast-check para generar listas de entradas con timestamps variados y verificar que el listado retornado cumple `E_i.created_at ≤ E_{i+1}.created_at` para todo par consecutivo

  - [ ] 10.6 Implementar gestión de archivos adjuntos a entradas clínicas
    - Crear `lib/actions/attachments.actions.ts` con `uploadAttachmentAction`
    - Validar tipo de archivo en servidor: solo `JPEG`, `PNG`, `PDF`, `DICOM`; tamaño máximo 20 MB (20 971 520 bytes)
    - Verificar que la entrada no tiene ya 10 adjuntos antes de aceptar uno nuevo
    - Almacenar en Supabase Storage bajo `clinical-files/{clinic_id}/{patient_id}/{entry_id}/{uuid}-{filename}`
    - Registrar metadatos en tabla `clinical_attachments`
    - Si validación falla: rechazar con error específico preservando el texto redactado en la entrada
    - _Requisitos: 6.7_

  - [ ]* 10.7 Escribir prueba de propiedad P14: Validación de archivos adjuntos
    - **Propiedad 14: Validación de Archivos Adjuntos**
    - **Valida: Requisito 6.7**
    - Crear `__tests__/properties/attachment-validation.property.test.ts`
    - Usar fast-check para generar archivos con tipos y tamaños arbitrarios; verificar que los inválidos son rechazados con error específico y que no se puede exceder el límite de 10 adjuntos por entrada

  - [ ] 10.8 Implementar Route Handler para generación de URLs firmadas de Storage
    - Crear `app/api/storage/signed-url/route.ts` (POST)
    - Usar `supabaseAdmin.storage.from('clinical-files').createSignedUrl(storagePath, 900)` exactamente 900 segundos
    - Verificar que el `storage_path` pertenece al `clinic_id` del usuario autenticado antes de generar URL
    - Si URL expirada: generar una nueva al momento de la solicitud
    - _Requisitos: 6.8, 8.6_

  - [ ]* 10.9 Escribir prueba de propiedad P17: Expiración máxima de URLs firmadas
    - **Propiedad 17: Expiración Máxima de URLs Firmadas**
    - **Valida: Requisitos 6.8, 8.6**
    - Crear `__tests__/properties/signed-url-expiry.property.test.ts`
    - Verificar con fast-check que el tiempo de expiración configurado es exactamente 900 segundos y nunca superior

  - [ ]* 10.10 Escribir prueba de propiedad P15: Control de concurrencia optimista
    - **Propiedad 15: Control de Concurrencia Optimista**
    - **Valida: Requisitos 6.11, 7.6, 10.5**
    - Crear `__tests__/properties/concurrency-control.property.test.ts`
    - Usar fast-check para generar versiones `expected_version ≠ version_actual` y verificar que la escritura es rechazada con `CONCURRENCY_CONFLICT` identificando el registro en conflicto

  - [ ] 10.11 Crear vista de historia clínica del paciente
    - Crear `app/(dashboard)/pacientes/[pacienteId]/historia-clinica/page.tsx` (Server Component, solo `administrador` y `odontologo`)
    - Renderizar entradas en orden cronológico ascendente, agrupando correcciones después de la entrada que corrigen
    - Incluir `ClinicalEntryForm` (Client Component) con campo `version` oculto para control de concurrencia
    - Incluir `FileAttachment` (Client Component) con validación de tipo/tamaño en cliente y servidor
    - Mostrar URLs firmadas de adjuntos (regenerar si expiradas)
    - _Requisitos: 6.5, 6.9, 6.10, 6.12_

- [ ] 11. Odontograma digital
  - [ ] 11.1 Implementar componente SVG interactivo `OdontogramCanvas`
    - Crear `components/odontogram/OdontogramCanvas.tsx` como Client Component
    - Renderizar exactamente 32 piezas dentales del adulto según nomenclatura FDI en cuatro cuadrantes visibles simultáneamente
    - Cada pieza: grupo `<g>` SVG con 5 zonas de superficie clicables (`oclusal`, `mesial`, `distal`, `vestibular`, `palatino_lingual`) y texto con código FDI de dos dígitos
    - Aplicar paleta de colores por estado (sano=blanco, caries=rojo, etc.)
    - Al hacer clic en superficie: abrir modal `ToothForm` con `pieza_id` y `superficie` pre-cargados
    - _Requisitos: 7.1, 7.5_

  - [ ] 11.2 Implementar Server Action para registro de estados del odontograma (append-only)
    - Crear `lib/actions/odontogram.actions.ts` con `saveToothStateAction`
    - Validar `tooth_code` contra los 32 códigos FDI válidos, `surface` de lista predefinida, `status` de lista predefinida o estados personalizados del consultorio (máx. 20 por consultorio)
    - Verificar `version`: si `expected_version` no coincide → rechazar con `CONCURRENCY_CONFLICT` indicando la pieza en conflicto
    - Insertar nuevo registro (sin UPDATE ni DELETE) — el historial es append-only
    - Registrar `Registro_Auditoria` con `action = 'create'`
    - _Requisitos: 7.2, 7.3, 7.6, 7.7_

  - [ ]* 11.3 Escribir prueba de propiedad P16: Inmutabilidad del historial del odontograma (append-only)
    - **Propiedad 16: Inmutabilidad del Historial del Odontograma (Append-Only)**
    - **Valida: Requisitos 7.3, 7.4**
    - Crear `__tests__/properties/odontogram-append-only.property.test.ts`
    - Usar fast-check para generar secuencias de actualizaciones sobre `(tooth_code, surface)` y verificar que el conteo de registros crece en exactamente 1 por operación y los anteriores permanecen sin cambios

  - [ ] 11.4 Implementar consulta de estado vigente del odontograma y gestión de estados personalizados
    - Crear `getOdontogramStateAction` que retorna el registro de `created_at` máximo por combinación `(pieza_id, superficie)` usando `idx_odontogram_latest`
    - Implementar CRUD de estados personalizados (`custom_tooth_statuses`) con límite de 20 por consultorio
    - Implementar `ToothForm` (Client Component) con campos `tratamiento_propuesto` y `tratamiento_realizado` mostrados con etiquetas distintas
    - _Requisitos: 7.4, 7.5, 7.9_

  - [ ] 11.5 Crear página de odontograma del paciente
    - Crear `app/(dashboard)/pacientes/[pacienteId]/odontograma/page.tsx` (solo `administrador` y `odontologo`)
    - Integrar `OdontogramCanvas` con estado React local actualizado tras respuesta exitosa del servidor
    - Mostrar solo odontogramas del `clinic_id` del JWT
    - Rechazar acceso de recepcionista con HTTP 403
    - _Requisitos: 7.7, 7.8_

- [ ] 12. Seguridad, auditoría y conectividad offline
  - [ ] 12.1 Implementar función centralizada de registro de auditoría
    - Crear `lib/audit.ts` con función `createAuditLog(params: AuditRecord)` que inserta en `audit_logs` usando `supabaseAdmin` (service_role)
    - La función garantiza los 9 campos obligatorios: `id`, `clinic_id`, `user_id`, `role`, `entity_type`, `entity_id`, `action`, `timestamp`, `result`
    - Integrar en todas las Server Actions existentes que aún no llamen a esta función
    - _Requisitos: 8.4_

  - [ ]* 12.2 Escribir prueba de propiedad P6: Completitud e integridad del registro de auditoría
    - **Propiedad 6: Completitud e Integridad del Registro de Auditoría**
    - **Valida: Requisitos 4.6, 5.10, 6.6, 8.4**
    - Crear `__tests__/properties/audit-completeness.property.test.ts`
    - Usar fast-check para generar operaciones de escritura sobre entidades de negocio y verificar que existe exactamente un `audit_log` con los 9 campos requeridos para cada operación

  - [ ] 12.3 Implementar componente `OfflineBanner` con detección de conectividad
    - Crear `components/connectivity/OfflineBanner.tsx` como Client Component
    - Escuchar eventos `navigator.onLine` (`online`/`offline`)
    - Al detectar offline: mostrar barra persistente "Sin conexión" en parte superior, deshabilitar todos los controles que inicien operaciones de escritura
    - Al detectar reconexión: verificar con `GET /api/health`; si HTTP 200 → ocultar banner, mostrar "Conectado" por 3 segundos, rehabilitar controles de escritura
    - Preservar datos en formularios en curso durante la transición
    - _Requisitos: 8.7, 10.1, 10.2_

  - [ ]* 12.4 Escribir prueba de propiedad P21: Round-trip de conectividad (offline → online)
    - **Propiedad 21: Round-Trip de Conectividad (Offline → Online)**
    - **Valida: Requisito 10.2**
    - Crear `__tests__/properties/connectivity-roundtrip.property.test.ts`
    - Verificar que al restaurar conexión el banner se oculta, los controles se rehabilitan y los datos de formularios en curso se preservan

  - [ ] 12.5 Implementar manejo de timeout de operaciones de escritura (10 segundos)
    - Crear `lib/fetch-with-timeout.ts` con función que aplica `AbortController` con timeout de 10 segundos
    - Si la operación no recibe respuesta en 10 segundos: marcar como fallida, preservar formulario con datos ingresados, mostrar botón "Reintentar", no mostrar indicador de éxito
    - Integrar en todos los formularios del dashboard que realicen operaciones de escritura
    - _Requisitos: 8.8, 10.4_

  - [ ]* 12.6 Escribir prueba de propiedad P18: Preservación de estado de UI ante fallo del servidor
    - **Propiedad 18: Preservación de Estado de UI ante Fallo del Servidor**
    - **Valida: Requisitos 8.8, 10.4, 10.6**
    - Crear `__tests__/properties/ui-error-preservation.property.test.ts`
    - Simular timeouts y errores HTTP no-2xx con fast-check; verificar ausencia de indicador de éxito, preservación de datos del formulario y presencia de opción de reintento

  - [ ] 12.7 Integrar `OfflineBanner` y `SessionTimer` en el layout del dashboard
    - Crear/actualizar `app/(dashboard)/layout.tsx` incluyendo `OfflineBanner` y `SessionTimer`
    - Verificar que sidebar y navbar están presentes y accesibles según rol
    - Asegurar que los datos de historia clínica y odontograma nunca se persisten en `localStorage`, `IndexedDB` ni caché de service worker
    - _Requisitos: 8.9, 10.1_

- [ ] 13. Reportes operativos
  - [ ] 13.1 Implementar Server Actions para reportes de pacientes atendidos y distribución de citas
    - Crear `lib/actions/reports.actions.ts` con `getAttendedPatientsReportAction` y `getAppointmentStatusReportAction`
    - `getAttendedPatientsReportAction`: COUNT de citas con `status = 'completada'` en `[fecha_inicio, fecha_fin]`, con filtro opcional por `dentist_id`, solo datos del `clinic_id` del usuario
    - `getAppointmentStatusReportAction`: GROUP BY `status` en el rango de fechas, retornar distribución de todos los estados
    - Validar que el rango de fechas no supere 365 días; si supera → rechazar sin ejecutar la consulta, indicar límite de 12 meses
    - Retornar datos en ≤5 segundos para rangos ≤12 meses
    - _Requisitos: 9.1, 9.2, 9.3, 9.5, 9.6_

  - [ ]* 13.2 Escribir prueba de propiedad P19: Corrección de filtros en reportes operativos
    - **Propiedad 19: Corrección de Filtros en Reportes Operativos**
    - **Valida: Requisitos 9.1, 9.2**
    - Crear `__tests__/properties/report-filters.property.test.ts`
    - Usar fast-check para generar colecciones de citas con estados y fechas variadas; verificar que todos los resultados del reporte tienen `status = 'completada'` dentro del rango y que la suma de grupos del reporte de distribución iguala el total de citas del rango

  - [ ]* 13.3 Escribir prueba de propiedad P20: Validación del rango de fechas en reportes
    - **Propiedad 20: Validación del Rango de Fechas en Reportes**
    - **Valida: Requisito 9.3**
    - Crear `__tests__/properties/report-date-range.property.test.ts`
    - Usar fast-check para generar rangos de fechas con diferencia > 365 días; verificar que el sistema rechaza la solicitud sin ejecutar la consulta

  - [ ] 13.4 Crear páginas de reportes operativos
    - Crear `app/(dashboard)/reportes/pacientes-atendidos/page.tsx` con formulario de filtros (fecha inicio, fecha fin, odontólogo opcional) y tabla/gráfico de resultados
    - Crear `app/(dashboard)/reportes/estado-citas/page.tsx` con gráfico de distribución por estado
    - Aplicar guard de rol: solo `administrador` u `odontologo`; rechazar `recepcionista` con HTTP 403
    - Mostrar mensaje de error con opción de reintento si la consulta falla
    - _Requisitos: 9.1, 9.2, 9.4, 9.5_

- [ ] 14. Testing: pruebas de propiedades restantes y pruebas unitarias complementarias
  - [ ] 14.1 Configurar Vitest y fast-check con setup global
    - Crear/actualizar `vitest.config.ts` con `globals: true`, `environment: 'node'`
    - Crear `__tests__/setup.ts` con `fc.configureGlobal({ numRuns: 100, verbose: true })`
    - Crear `__mocks__/supabase.ts` con mock de `@supabase/supabase-js` que simula filtrado por `clinic_id`, RLS y constraints
    - _Requisitos: (estrategia de testing del diseño)_

  - [ ]* 14.2 Escribir prueba de propiedad P6 (auditoría) complementaria
    - Ya cubierta en tarea 12.2 — verificar cobertura completa de entidades

  - [ ]* 14.3 Escribir pruebas unitarias para flujos de autenticación y control de sesiones
    - Crear `__tests__/unit/auth.test.ts`
    - Cubrir: flujo completo de autenticación con MFA (admin, odontólogo, recepcionista), abandono del flujo MFA → cierre de sesión, 5 intentos fallidos → bloqueo 15 min + notificación admin, inactividad 30 min → cierre automático
    - _Requisitos: 3.2, 3.4, 2.7, 2.8_

  - [ ]* 14.4 Escribir pruebas unitarias para flujos de citas y odontograma
    - Crear `__tests__/unit/appointments.test.ts`: verificar sugerencia de 3 franjas alternativas ante conflicto
    - Crear `__tests__/unit/odontogram.test.ts`: verificar renderizado de `OdontogramCanvas` con exactamente 32 piezas FDI
    - _Requisitos: 5.2, 7.1_

  - [ ]* 14.5 Escribir pruebas de humo (smoke tests) para verificaciones críticas
    - Crear `__tests__/smoke/schema.smoke.test.ts`: verificar columna `clinic_id` en todas las tablas, RLS habilitado (`rowsecurity = true`), ausencia de `service_role_key` en bundle del cliente
    - Crear `__tests__/smoke/odontogram.smoke.test.ts`: verificar que `OdontogramCanvas` renderiza exactamente 32 elementos con códigos FDI válidos
    - _Requisitos: 8.1, 8.2, 7.1_

- [ ] 15. Checkpoint final — Integración y verificación completa
  - Ejecutar suite completa de pruebas con `vitest --run` y verificar que todas pasan
  - Verificar que el layout del dashboard incluye `OfflineBanner` y `SessionTimer` correctamente
  - Revisar que no existe ninguna referencia a `service_role_key` en variables con prefijo `NEXT_PUBLIC_`
  - Preguntar al usuario si hay ajustes o funcionalidades adicionales antes de considerar el plan completo.

---

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- Cada tarea referencia los requisitos específicos para trazabilidad completa.
- Las propiedades de corrección P1–P25 del `design.md` están asignadas a sub-tareas específicas; cada prueba de propiedad usa `fast-check` con mínimo 100 iteraciones.
- Los checkpoints aseguran validación incremental antes de continuar con módulos dependientes.
- Las pruebas de propiedades no realizan llamadas reales a Supabase; usan el mock en `__mocks__/supabase.ts`.
- Las pruebas de integración con Supabase CLI local están fuera del alcance de este plan de tareas de código y se ejecutan manualmente con `supabase start`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.6"] },
    { "id": 2, "tasks": ["1.3", "1.5", "1.7", "2.1"] },
    { "id": 3, "tasks": ["1.4", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 4, "tasks": ["2.6", "2.7", "3.1", "3.6"] },
    { "id": 5, "tasks": ["2.8", "3.2", "3.3", "4.1"] },
    { "id": 6, "tasks": ["3.4", "3.5", "4.2", "6.1"] },
    { "id": 7, "tasks": ["4.3", "4.4", "6.2", "6.4", "6.5", "7.1"] },
    { "id": 8, "tasks": ["6.3", "7.2", "7.4", "8.1"] },
    { "id": 9, "tasks": ["7.3", "7.5", "8.2", "8.3", "10.1"] },
    { "id": 10, "tasks": ["8.4", "8.5", "8.6", "10.2", "10.3", "10.4", "10.5", "11.1"] },
    { "id": 11, "tasks": ["10.6", "10.10", "11.2", "12.1"] },
    { "id": 12, "tasks": ["10.7", "10.8", "10.9", "11.3", "12.2", "12.3"] },
    { "id": 13, "tasks": ["10.11", "11.4", "12.4", "12.5"] },
    { "id": 14, "tasks": ["11.5", "12.6", "12.7", "13.1", "14.1"] },
    { "id": 15, "tasks": ["12.8", "13.2", "13.3", "14.3", "14.4", "14.5"] },
    { "id": 16, "tasks": ["13.4"] }
  ]
}
```
