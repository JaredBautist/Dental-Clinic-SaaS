# Dental Clinic SaaS — Documentación Técnica Integral y Contexto del Proyecto

> **Versión del Documento:** 1.0.0  
> **Fecha de Actualización:** 24 de Septiembre, 2026  
> **Ubicación:** `.kiro/PROJECT_CONTEXT_FULL.md`  
> **Estado del Proyecto:** Backend Completo (100%), Base de Datos Migrada y Verificada en Supabase, Pruebas Automatizadas 74/74 Aprobadas.

---

## Índice General

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Objetivos del Sistema](#2-objetivos-del-sistema)
   - [2.1 Objetivo General](#21-objetivo-general)
   - [2.2 Objetivos Específicos](#22-objetivos-específicos)
3. [Stack Tecnológico y Herramientas](#3-stack-tecnológico-y-herramientas)
4. [Requisitos Funcionales Detallados](#4-requisitos-funcionales-detallados)
   - [4.1 Módulo 1: Registro y Gestión de Consultorios (Tenants)](#41-módulo-1-registro-y-gestión-de-consultorios-tenants)
   - [4.2 Módulo 2: Usuarios, Autenticación, MFA y RBAC](#42-módulo-2-usuarios-autenticación-mfa-y-rbac)
   - [4.3 Módulo 3: Gestión de Pacientes](#43-módulo-3-gestión-de-pacientes)
   - [4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones](#44-módulo-4-gestión-de-citas-odontológicas-y-transiciones)
   - [4.5 Módulo 5: Historia Clínica y Entradas Odontológicas](#45-módulo-5-historia-clínica-y-entradas-odontológicas)
   - [4.6 Módulo 6: Archivos Adjuntos e Imágenes Médicas (Storage)](#46-módulo-6-archivos-adjuntos-e-imágenes-médicas-storage)
   - [4.7 Módulo 7: Odontograma Digital y Estados Personalizados](#47-módulo-7-odontograma-digital-y-estados-personalizados)
   - [4.8 Módulo 8: Registro Inmutable de Auditoría](#48-módulo-8-registro-inmutable-de-auditoría)
   - [4.9 Módulo 9: Reportes Analíticos Operativos](#49-módulo-9-reportes-analíticos-operativos)
5. [Requisitos No Funcionales y Arquitectura de Seguridad](#5-requisitos-no-funcionales-y-arquitectura-de-seguridad)
6. [Arquitectura de Base de Datos y Supabase](#6-arquitectura-de-base-de-datos-y-supabase)
   - [6.1 Esquema `public` (Tablas de Negocio)](#61-esquema-public-tablas-de-negocio)
   - [6.2 Esquema `private` (Seguridad Interna y Bloqueos)](#62-esquema-private-seguridad-interna-y-bloqueos)
   - [6.3 Funciones SQL y Triggers](#63-funciones-sql-y-triggers)
   - [6.4 Políticas RLS (Row Level Security)](#64-políticas-rls-row-level-security)
   - [6.5 Supabase Storage](#65-supabase-storage)
7. [Estructura del Proyecto y Desglose Archivo por Archivo](#7-estructura-del-proyecto-y-desglose-archivo-por-archivo)
   - [7.1 Raíz del Proyecto](#71-raíz-del-proyecto)
   - [7.2 Directorio `app/` (Next.js App Router)](#72-directorio-app-nextjs-app-router)
   - [7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth)](#73-directorio-lib-lógica-de-dominio-server-actions-y-auth)
   - [7.4 Directorio `types/` y `errors/`](#74-directorio-types-y-errors)
   - [7.5 Directorio `components/`](#75-directorio-components)
   - [7.6 Directorio `supabase/` (Migraciones y Edge Functions)](#76-directorio-supabase-migraciones-y-edge-functions)
   - [7.7 Directorio `__tests__/` (Suites de Pruebas)](#77-directorio-__tests__-suites-de-pruebas)
   - [7.8 Directorio `.kiro/` (Especificaciones del Proyecto)](#78-directorio-kiro-especificaciones-del-proyecto)
8. [Estado Actual del Desarrollo y Siguientes Pasos](#8-estado-actual-del-desarrollo-y-siguientes-pasos)
9. [Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)](#9-caso-de-uso-maestro-end-to-end-ciclo-de-vida-completo-del-saas)
   - [9.1 Actores y Roles Participantes](#91-actores-y-roles-participantes)
   - [9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding)](#92-fase-1-onboarding-y-registro-del-consultorio-tenant-onboarding)
   - [9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA](#93-fase-2-primer-inicio-de-sesión-y-configuración-obligatoria-de-mfa)
   - [9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC)](#94-fase-3-gestión-de-equipo-médico-y-asignación-de-roles-rbac)
   - [9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica](#95-fase-4-recepción-registro-del-paciente-y-apertura-de-historia-clínica)
   - [9.6 Fase 5: Agendamiento de Citas y Resolución de Conflictos Horarios](#96-fase-5-agendamiento-de-citas-y-resolución-de-conflictos-horarios)
   - [9.7 Fase 6: Atención Odontológica, Odontograma e Inmutabilidad Médica](#97-fase-6-atención-odontológica-odontograma-e-inmutabilidad-médica)
   - [9.8 Fase 7: Correcciones Auditables de Historia Clínica (Append-Only)](#98-fase-7-correcciones-auditables-de-historia-clínica-append-only)
   - [9.9 Fase 8: Carga y Almacenamiento Seguro de Radiografías (Storage)](#99-fase-8-carga-y-almacenamiento-seguro-de-radiografías-storage)
   - [9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría](#910-fase-9-cierre-de-cita-y-registro-inmutable-de-auditoría)
   - [9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales](#911-fase-10-inteligencia-operativa-y-reportes-gerenciales)
   - [9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia](#912-fase-11-escenarios-de-ciberseguridad-y-resiliencia)

---

## 1. Visión General del Proyecto

**Dental Clinic SaaS** es una solución web empresarial multitenant (Software as a Service) orientada a consultorios y clínicas odontológicas. Permite a los consultorios gestionar de manera digital, eficiente y segura todas sus operaciones: expediente clínico digital, odontograma interactivo, agenda de citas médicas, almacenamiento de radiografías y documentos clínicos, control de usuarios con roles específicos, y generación de reportes operativos.

### Modelo Multi-Tenant
* **Aislamiento Físico y Lógico:** Cada consultorio registrado representa un tenant (`clinic_id`).
* **Seguridad Nativa en Base de Datos:** Los datos están estrictamente aislados mediante **PostgreSQL Row Level Security (RLS)** y llaves foráneas compuestas. Ningún usuario de un consultorio puede visualizar, modificar ni inferir datos de otro consultorio, incluso ante vulnerabilidades a nivel de aplicación.

---

## 2. Objetivos del Sistema

### 2.1 Objetivo General
Desarrollar una plataforma SaaS multi-tenant robusta, segura y de alto rendimiento que digitalice y optimice la gestión clínica y administrativa de consultorios odontológicos, garantizando el cumplimiento normativo en salud (HIPAA / estándares de privacidad médica), la inmutabilidad de los historiales clínicos y una experiencia de usuario fluida para administradores, odontólogos y recepcionistas.

### 2.2 Objetivos Específicos
1. **Aislamiento Multi-Tenant Estricto:** Implementar políticas RLS no recursivas y llaves foráneas compuestas `(clinic_id, id)` en todas las entidades de la base de datos para evitar fugas de información inter-clínicas.
2. **Control de Acceso Basado en Roles (RBAC):** Configurar y hacer cumplir exactamente 3 roles del sistema: `administrador`, `odontologo` y `recepcionista`, aplicando el principio de menor privilegio.
3. **Autenticación Fuerte y Seguridad:** Exigir Autenticación Multifactor (MFA/TOTP) obligatoria en el primer inicio de sesión para roles con acceso clínico (`administrador` y `odontologo`), protección contra fuerza bruta con bloqueo temporal (15 min / 5 intentos) y cierre de sesión seguro en cascada.
4. **Integridad de Historia Clínica:** Diseñar un registro clínico inmutable de tipo *append-only* (solo inserciones cronológicas y correcciones referenciales; prohibidos `UPDATE` y `DELETE` sobre entradas clínicas) respaldado por control de concurrencia optimista mediante números de versión atómicos.
5. **Odontograma Interactivo Avanzado:** Proveer la representación digital de las 32 piezas dentales estándar (nomenclatura FDI) con sus 6 superficies anatómicas, estados clínicos estándar y capacidad de definir estados personalizados por clínica (máximo 20).
6. **Almacenamiento Seguro de Imágenes Médicas:** Gestionar la carga de radiografías (DICOM, JPEG, PNG) y documentos (PDF) hasta 20 MB en un bucket privado de Supabase Storage, sirviendo los archivos exclusivamente mediante URLs firmadas temporales con expiración máxima de 15 minutos (900 segundos).
7. **Trazabilidad Total (Auditoría Inmutable):** Registrar de forma automática y asíncrona un log de auditoría estructurado (9 campos obligatorios) para cada acción de creación, actualización o eliminación en la plataforma, denegando modificaciones a este registro.
8. **Automatización Operativa:** Transicionar automáticamente el estado de las citas odontológicas cumplida su hora de inicio mediante Edge Functions programadas.

---

## 3. Stack Tecnológico y Herramientas

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Web** | Next.js 15 (App Router) | Arquitectura moderna con Server Components, Server Actions y Route Handlers. |
| **Librería UI** | React 19 | Interfaces interactivas y reactivas en el cliente. |
| **Estilos** | Tailwind CSS v4 + Lucide React | Sistema de diseño responsivo, limpio y conjunto de iconos accesibles. |
| **BaaS / Base de Datos** | Supabase (PostgreSQL 17) | Base de datos relacional, motor de autenticación, RLS nativo y Storage. |
| **Autenticación** | Supabase Auth + MFA (TOTP) | Manejo de sesiones, JWT claims firmados y doble factor con Authenticator. |
| **Almacenamiento** | Supabase Storage (`clinical-files`) | Bucket privado para imágenes de diagnóstico y adjuntos clínicos. |
| **Edge Compute** | Supabase Edge Functions (Deno) | Tareas en segundo plano y cron jobs (`auto-transition-appointments`). |
| **Validación** | Zod v4 | Validación rigurosa de esquemas en todas las Server Actions y APIs. |
| **Testing** | Vitest + Fast-Check | Pruebas unitarias, property-based testing y smoke tests (74 tests pasando). |
| **Mapeo Arquitectural**| Graphify | Grafo de conocimiento de dependencias, nodos y comunidades del código. |

---

## 4. Requisitos Funcionales Detallados

### 4.1 Módulo 1: Registro y Gestión de Consultorios (Tenants)
* **RF-1.1 Registro Inicial:** Creación del consultorio (`name`, `address`, `phone`, `email`). Se genera automáticamente un `clinic_id` único (UUID v4).
* **RF-1.2 Creación del Administrador Inicial:** El registro del consultorio crea atómicamente el usuario inicial con rol `administrador` en Supabase Auth y en `public.users`. Si la creación del usuario falla, se aplica rollback defensivo eliminando la clínica.
* **RF-1.3 Actualización de Consultorio:** Solo el usuario con rol `administrador` de la clínica puede modificar los datos institucionales (nombre máx 120 caracteres, dirección máx 255, teléfono 7-15 dígitos, correo máx 254).
* **RF-1.4 Consulta de Datos:** Cualquier usuario activo de la clínica puede ver los datos de su propio consultorio; el acceso a otros consultorios es denegado por RLS.

### 4.2 Módulo 2: Usuarios, Autenticación, MFA y RBAC
* **RF-2.1 Roles del Sistema:** Exactamente 3 roles soportados: `administrador`, `odontologo`, `recepcionista`.
* **RF-2.2 Creación de Usuarios:** Solo el `administrador` puede invitar/crear nuevos usuarios dentro de su consultorio (`clinic_id`).
* **RF-2.3 Modificación y Desactivación:** Los usuarios se desactivan (`is_active = false`), nunca se eliminan físicamente de la base de datos para preservar la integridad referencial y de auditoría.
* **RF-2.4 Protección del Último Administrador:** El sistema impide desactivar o remover el rol al último administrador activo del consultorio.
* **RF-2.5 Revocación de Sesión Inmediata:** Al desactivar a un usuario, su sesión en Supabase Auth se revoca inmediatamente (`admin.signOut(id)`).
* **RF-2.6 Protección contra Fuerza Bruta:** Tras 5 intentos fallidos consecutivos de login, la cuenta se bloquea por 15 minutos en `private.login_attempts`, notificando al administrador vía `private.security_notification_outbox`.
* **RF-2.7 MFA Obligatorio:** Los roles `administrador` y `odontologo` son redirigidos obligatoriamente a `/setup-mfa` en su primer login. No pueden acceder a ninguna funcionalidad clínica ni operativa hasta verificar su código TOTP de 6 dígitos.
* **RF-2.8 Verificación de MFA en cada Login:** Usuarios con `mfa_enabled = true` deben ingresar su código de 6 dígitos en `/verify-mfa` antes de recibir una sesión válida.

### 4.3 Módulo 3: Gestión de Pacientes
* **RF-3.1 Registro de Pacientes:** Permite registrar nombre completo, tipo de documento (`CC`, `TI`, `CE`, `PAS`), número de documento, fecha de nacimiento, género, teléfono, email, dirección y antecedentes médicos.
* **RF-3.2 Unicidad de Documento:** El par `(clinic_id, document_type, document_number)` es estrictamente único. Intentar registrar un paciente duplicado lanza `UniqueDocumentError`.
* **RF-3.3 Búsqueda Full-Text:** Búsqueda rápida sobre nombre y documento utilizando un índice PostgreSQL GIN (`to_tsvector`), con paginación optimizada (límite por página).
* **RF-3.4 Permisos:** `administrador`, `odontologo` y `recepcionista` pueden registrar y actualizar datos de contacto de pacientes de su consultorio.

### 4.4 Módulo 4: Gestión de Citas Odontológicas y Transiciones
* **RF-4.1 Estados de Cita:** `programada`, `confirmada`, `en_curso`, `completada`, `cancelada`, `reprogramada`.
* **RF-4.2 Detección de Conflictos Horarios:** Al agendar una cita para un odontólogo, el sistema valida que no exista solapamiento horario en el rango `[starts_at, ends_at)`.
* **RF-4.3 Sugerencia Inteligente de Franjas:** Si existe conflicto horario, el sistema rechaza la cita con `AppointmentConflictError` y calcula automáticamente 3 franjas horarias alternativas libres de 30 minutos a partir de la hora solicitada.
* **RF-4.4 Restricción de Cancelación:** Las citas con estado `completada` no pueden cancelarse ni modificarse. La cancelación requiere registrar motivo y usuario que cancela.
* **RF-4.5 Transición Automática:** La Edge Function `auto-transition-appointments` cambia el estado de `confirmada` a `en_curso` cuando la hora actual supera la hora de inicio de la cita.

### 4.5 Módulo 5: Historia Clínica y Entradas Odontológicas
* **RF-5.1 Registro Único por Paciente:** Cada paciente tiene una única historia clínica (`clinical_records`), creada automáticamente con `version = 1`.
* **RF-5.2 Inmutabilidad (Append-Only):** Las entradas médicas (`clinical_entries`) no permiten `UPDATE` ni `DELETE`. Cada intervención se agrega como un nuevo registro con fecha, hora, odontólogo tratante, diagnóstico, procedimiento y prescripción.
* **RF-5.3 Correcciones Auditables:** Si un odontólogo comete un error en una entrada, no puede editarla; debe emitir una nueva entrada de corrección que referencia a la entrada original mediante `corrects_entry_id`.
* **RF-5.4 Concurrencia Optimista:** Al insertar una entrada clínica, se valida que el número de versión enviado coincida con el de la historia clínica en base de datos. Si otro odontólogo guardó cambios concurrentemente, se rechaza la operación con `ConcurrencyConflictError` para prevenir sobreescrituras.
* **RF-5.5 Confidencialidad Médica:** El rol `recepcionista` tiene **acceso denegado (HTTP 403)** a historias clínicas y odontogramas. Solo `odontologo` y `administrador` pueden consultar o crear entradas.

### 4.6 Módulo 6: Archivos Adjuntos e Imágenes Médicas (Storage)
* **RF-6.1 Formatos Permitidos:** Radiografías y fotos intraorales en `JPEG`, `PNG`, documentos en `PDF` y estudios radiológicos en formato médico `DICOM` (`application/dicom`).
* **RF-6.2 Restricciones de Carga:** Tamaño máximo de 20 MB por archivo y tope de hasta 10 adjuntos por cada entrada clínica.
* **RF-6.3 URLs Firmadas Temporales:** Los archivos se almacenan en el bucket privado `clinical-files` bajo la estructura `{clinic_id}/{entry_id}/{filename}`. Para su visualización, la API genera URLs prefirmadas con vigencia exacta de 15 minutos (900 segundos), verificando previamente que el usuario pertenezca al `clinic_id` correspondiente.

### 4.7 Módulo 7: Odontograma Digital y Estados Personalizados
* **RF-7.1 Nomenclatura Estándar:** Soporta los 32 dientes del adulto según la norma internacional FDI (cuadrantes 1 a 4: dientes 11-18, 21-28, 31-38, 41-48).
* **RF-7.2 Anatomía Dental:** Permite registrar afecciones en 6 superficies por diente: `vestibular`, `lingual`, `oclusal`, `mesial`, `distal` y `general`.
* **RF-7.3 Estados Estándar:** `sano`, `caries`, `obturado`, `ausente`, `corona`, `endodoncia`, `implante`.
* **RF-7.4 Estados Personalizados:** El `administrador` puede registrar estados clínicos propios de la clínica (con nombre, código y color hex), hasta un límite máximo de 20 estados por consultorio.
* **RF-7.5 Historial Evolutivo:** El odontograma guarda su historial de manera incremental (append-only) para comparar la evolución de la salud bucal del paciente en el tiempo.

### 4.8 Módulo 8: Registro Inmutable de Auditoría
* **RF-8.1 Registro Obligatorio:** Toda acción de creación, actualización o eliminación en la plataforma genera automáticamente un registro en `audit_logs` con los 9 campos obligatorios: `clinic_id`, `user_id`, `action`, `resource_type`, `resource_id`, `before_state`, `after_state`, `ip_address`, `user_agent`.
* **RF-8.2 Inmutabilidad Total:** La tabla `audit_logs` deniega operaciones `UPDATE` y `DELETE` para cualquier usuario, incluido el administrador del consultorio.
* **RF-8.3 Visibilidad:** Solo el usuario con rol `administrador` de la clínica puede consultar los logs de auditoría de su consultorio.

### 4.9 Módulo 9: Reportes Analíticos Operativos
* **RF-9.1 Reporte de Pacientes Atendidos:** Cuenta el total de citas completadas dentro de un rango de fechas, con capacidad de filtrar por odontólogo específico.
* **RF-9.2 Reporte de Distribución de Citas:** Agrupa las citas del consultorio por su estado actual (`programada`, `confirmada`, `en_curso`, `completada`, `cancelada`, `reprogramada`) en un rango temporal.
* **RF-9.3 Límite de Rango:** Para garantizar el rendimiento del motor de base de datos, el rango de fechas no puede exceder los 365 días (1 año); rangos mayores son rechazados inmediatamente con `ReportRangeLimitError`.

---

## 5. Requisitos No Funcionales y Arquitectura de Seguridad

* **RNF-1 Seguridad de Cabeceras HTTP:** Implementación obligatoria de cabeceras en todas las respuestas (`proxy.ts` / middleware):
  - `Content-Security-Policy`: Restricción estricta de scripts, estilos, orígenes de conexión y marcos.
  - `X-Frame-Options: DENY`: Prevención de Clickjacking.
  - `X-Content-Type-Options: nosniff`: Prevención de MIME-sniffing.
  - `Strict-Transport-Security (HSTS)`: Forzado de HTTPS con expiración de 2 años y subdominios.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy`: Bloqueo de geolocalización, cámara y micrófono no autorizados.
* **RNF-2 Manejo Seguro de Errores (`withErrorHandling`):** Toda Server Action está envuelta en un wrapper que captura excepciones no controladas, oculta credenciales o detalles de infraestructura al cliente, y devuelve mensajes amigables con códigos de error tipados (`DentalClinicError`).
* **RNF-3 Prevención de Fugas de Información en Auditoría:** Los logs de auditoría omiten contraseñas, secretos y tokens en `before_state` y `after_state`.
* **RNF-4 Desempeño de Consultas:** Consultas optimizadas con índices específicos en todas las llaves foráneas (`clinic_id`), estados y rangos de fechas. Uso de extensiones especializadas como `btree_gist` para exclusión de rangos de citas en tiempo real.
* **RNF-5 Resiliencia y Rollbacks Transaccionales:** Acciones compuestas (como el registro de clínicas y usuarios) aplican compensación defensiva si algún paso intermedio falla.

---

## 6. Arquitectura de Base de Datos y Supabase

### 6.1 Esquema `public` (Tablas de Negocio)

```
 clinics (1) ──< users (N)
    │               │
    ├──< patients (N) ──< appointments (N)
    │         │
    │         └──< clinical_records (1)
    │                     │
    │                     └──< clinical_entries (N)
    │                                 │
    │                                 └──< clinical_attachments (N)
    ├──< odontogram_states (N)
    ├──< custom_tooth_statuses (N)
    └──< audit_logs (N)
```

#### 1. `public.clinics`
Consultorios odontológicos registrados en la plataforma SaaS.
* `id` (UUID, PK, `gen_random_uuid()`): Identificador único del consultorio (`clinic_id`).
* `name` (VARCHAR 120, NOT NULL): Nombre comercial de la clínica.
* `address` (VARCHAR 255): Dirección física.
* `phone` (VARCHAR 20): Teléfono de contacto institucional.
* `email` (VARCHAR 254): Correo electrónico corporativo.
* `created_at` (TIMESTAMPTZ, NOT NULL, `now()`): Fecha de registro.
* `updated_at` (TIMESTAMPTZ, NOT NULL, `now()`): Última modificación (mantenido por trigger).

#### 2. `public.users`
Perfiles de usuarios del sistema (extiende `auth.users` de Supabase).
* `id` (UUID, PK, FK -> `auth.users.id` ON DELETE CASCADE).
* `clinic_id` (UUID, NOT NULL, FK -> `clinics.id`).
* `role` (VARCHAR 20, NOT NULL, CHECK: `'administrador' | 'odontologo' | 'recepcionista'`).
* `full_name` (VARCHAR 200, NOT NULL): Nombre y apellido del usuario.
* `is_active` (BOOLEAN, NOT NULL, DEFAULT true): Desactivación lógica.
* `mfa_enabled` (BOOLEAN, NOT NULL, DEFAULT false): Estado de activación de doble factor.
* `created_at`, `updated_at` (TIMESTAMPTZ, NOT NULL).
* *Constraints de Tenant:* `UNIQUE (clinic_id, id)`.

#### 3. `public.patients`
Expedientes de pacientes afiliados a cada consultorio.
* `id` (UUID, PK, `gen_random_uuid()`).
* `clinic_id` (UUID, NOT NULL, FK -> `clinics.id`).
* `first_name` (VARCHAR 100, NOT NULL), `last_name` (VARCHAR 100, NOT NULL).
* `document_type` (VARCHAR 10, NOT NULL, CHECK: `'CC' | 'TI' | 'CE' | 'PAS'`).
* `document_number` (VARCHAR 20, NOT NULL).
* `birth_date` (DATE, NOT NULL).
* `gender` (VARCHAR 20, CHECK: `'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'`).
* `phone` (VARCHAR 20), `email` (VARCHAR 254), `address` (VARCHAR 255).
* `medical_background` (TEXT): Alergias, antecedentes sistémicos, medicamentos.
* *Constraints de Tenant:* `UNIQUE (clinic_id, id)`, `UNIQUE (clinic_id, document_type, document_number)`.
* *Índices:* GIN full-text search sobre `(first_name || ' ' || last_name || ' ' || document_number)`.

#### 4. `public.appointments`
Agenda y citas odontológicas.
* `id` (UUID, PK, `gen_random_uuid()`).
* `clinic_id` (UUID, NOT NULL).
* `patient_id` (UUID, NOT NULL, FK -> `patients(clinic_id, id)`).
* `dentist_id` (UUID, NOT NULL, FK -> `users(clinic_id, id)`).
* `starts_at` (TIMESTAMPTZ, NOT NULL), `ends_at` (TIMESTAMPTZ, NOT NULL).
* `reason` (VARCHAR 500, NOT NULL): Motivo de consulta.
* `status` (VARCHAR 20, NOT NULL, DEFAULT `'programada'`, CHECK: `'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'reprogramada'`).
* `cancellation_reason` (VARCHAR 500), `cancelled_by` (UUID, FK -> `users(clinic_id, id)`).
* `rescheduled_from` (UUID, FK -> `appointments(clinic_id, id)`).
* `created_by` (UUID, NOT NULL, FK -> `users(clinic_id, id)`).
* *Exclusión de Rango:* Índice GiST para detección atómica de solapamientos horarios.

#### 5. `public.clinical_records`
Cabecera del expediente clínico por paciente.
* `id` (UUID, PK, `gen_random_uuid()`).
* `clinic_id` (UUID, NOT NULL, FK -> `clinics.id`).
* `patient_id` (UUID, NOT NULL, UNIQUE con `clinic_id`, FK -> `patients(clinic_id, id)`).
* `version` (INTEGER, NOT NULL, DEFAULT 1): Contador de versión para concurrencia optimista.
* *Trigger:* `enforce_clinical_record_version_update` valida que `version` incremente estrictamente de 1 en 1.

#### 6. `public.clinical_entries`
Entradas cronológicas inmutables de intervenciones médicas (Append-Only).
* `id` (UUID, PK, `gen_random_uuid()`).
* `clinic_id` (UUID, NOT NULL).
* `record_id` (UUID, NOT NULL, FK -> `clinical_records(clinic_id, id)`).
* `patient_id` (UUID, NOT NULL, FK -> `patients(clinic_id, id)`).
* `dentist_id` (UUID, NOT NULL, FK -> `users(clinic_id, id)`).
* `entry_date` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`).
* `diagnosis` (TEXT, NOT NULL), `treatment` (TEXT, NOT NULL), `prescription` (TEXT).
* `notes` (TEXT).
* `corrects_entry_id` (UUID, FK -> `clinical_entries(clinic_id, id)`): Referencia a entrada previa corregida.

#### 7. `public.clinical_attachments`
Metadatos de imágenes radiológicas y documentos adjuntos.
* `id` (UUID, PK, `gen_random_uuid()`).
* `clinic_id` (UUID, NOT NULL).
* `entry_id` (UUID, NOT NULL, FK -> `clinical_entries(clinic_id, id)`).
* `patient_id` (UUID, NOT NULL, FK -> `patients(clinic_id, id)`).
* `file_name` (VARCHAR 255, NOT NULL), `file_path` (VARCHAR 500, NOT NULL).
* `file_type` (VARCHAR 100, NOT NULL, CHECK: `'image/jpeg' | 'image/png' | 'application/pdf' | 'application/dicom'`).
* `file_size` (INTEGER, NOT NULL, CHECK: `<= 20971520` bytes = 20 MB).

#### 8. `public.odontogram_states`
Representación gráfica e historial del odontograma.
* `id` (UUID, PK, `gen_random_uuid()`).
* `clinic_id` (UUID, NOT NULL).
* `patient_id` (UUID, NOT NULL, FK -> `patients(clinic_id, id)`).
* `dentist_id` (UUID, NOT NULL, FK -> `users(clinic_id, id)`).
* `tooth_number` (SMALLINT, NOT NULL, CHECK: Nomenclatura FDI 11-18, 21-28, 31-38, 41-48).
* `surface` (VARCHAR 20, NOT NULL, CHECK: `'vestibular' | 'lingual' | 'oclusal' | 'mesial' | 'distal' | 'general'`).
* `status` (VARCHAR 50, NOT NULL), `notes` (VARCHAR 500).
* `recorded_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`).

#### 9. `public.custom_tooth_statuses`
Estados clínicos personalizados definidos por cada clínica.
* `id` (UUID, PK, `gen_random_uuid()`).
* `clinic_id` (UUID, NOT NULL, FK -> `clinics.id`).
* `name` (VARCHAR 50, NOT NULL), `code` (VARCHAR 20, NOT NULL).
* `color_hex` (VARCHAR 7, NOT NULL, CHECK: `^#[0-9A-Fa-f]{6}$`).
* `description` (VARCHAR 255).
* *Constraints de Tenant:* `UNIQUE (clinic_id, name)`.

#### 10. `public.audit_logs`
Bitácora inmutable de auditoría forense.
* `id` (UUID, PK, `gen_random_uuid()`).
* `clinic_id` (UUID, NOT NULL, FK -> `clinics.id`).
* `user_id` (UUID, FK -> `users.id`).
* `action` (VARCHAR 100, NOT NULL: `create | update | delete | access_denied | login_lockout`).
* `resource_type` (VARCHAR 50, NOT NULL), `resource_id` (VARCHAR 100, NOT NULL).
* `before_state` (JSONB), `after_state` (JSONB).
* `ip_address` (INET), `user_agent` (TEXT).
* `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`).

---

### 6.2 Esquema `private` (Seguridad Interna y Bloqueos)

El esquema `private` no está expuesto a la API pública de Supabase. Solo es accesible por funciones `SECURITY DEFINER` y por el rol `service_role`.

1. **`private.login_attempts`**:
   * `identifier_hash` (TEXT, PK, SHA-256 de 64 caracteres hex): Hash del correo electrónico o IP intentando autenticarse.
   * `failed_count` (SMALLINT, NOT NULL, DEFAULT 0, CHECK: 0-5).
   * `locked_until` (TIMESTAMPTZ): Momento hasta el cual la cuenta permanece bloqueada.
   * `updated_at` (TIMESTAMPTZ).
2. **`private.security_notification_outbox`**:
   * Patrón *Transactional Outbox* para encolar notificaciones de seguridad (bloqueos de cuenta) y garantizar su entrega sin bloquear transacciones de base de datos.

---

### 6.3 Funciones SQL y Triggers

* **`private.current_clinic_id() RETURNS UUID`**: Función `SECURITY DEFINER` con `search_path = ''`. Obtiene el `clinic_id` del usuario autenticado consultando `public.users` sin disparar recursión infinita en las políticas RLS.
* **`private.current_user_role() RETURNS VARCHAR(20)`**: Obtiene el rol del usuario autenticado (`administrador`, `odontologo`, `recepcionista`) de manera no recursiva.
* **`public.custom_access_token_hook(event JSONB) RETURNS JSONB`**: Inyecta claims personalizados en el token JWT durante la autenticación de Supabase: `clinic_id`, `user_role` y `app_metadata.role`.
* **`public.check_login_lockout(p_identifier_hash TEXT)`**: Consulta si una cuenta se encuentra bajo bloqueo temporal por fuerza bruta.
* **`public.record_failed_login_attempt(p_identifier_hash TEXT)`**: Incrementa el contador de fallos y activa el bloqueo de 15 minutos al alcanzar el 5º intento fallido.
* **`public.clear_login_attempts(p_identifier_hash TEXT)`**: Limpia el historial de intentos tras un inicio de sesión exitoso.
* **`public.enqueue_login_lockout_notification(p_target_email TEXT)`**: Encola una alerta en el outbox dirigida a los administradores del consultorio cuando ocurre un bloqueo.
* **`private.enforce_clinical_record_version_update()`**: Trigger que impide cualquier actualización de una historia clínica que no sea un incremento atómico de versión (`NEW.version = OLD.version + 1`).

---

### 6.4 Políticas RLS (Row Level Security)

Todas las tablas en `public` tienen RLS habilitado (`ENABLE ROW LEVEL SECURITY`). Las políticas implementadas utilizan las funciones no recursivas del esquema `private`:

| Tabla | Operación | Política | Condición RLS |
| :--- | :--- | :--- | :--- |
| `clinics` | SELECT | `clinics_select_own` | `id = private.current_clinic_id()` |
| `clinics` | UPDATE | `clinics_update_admin` | `id = private.current_clinic_id() AND private.current_user_role() = 'administrador'` |
| `users` | SELECT | `users_select_same_clinic` | `clinic_id = private.current_clinic_id()` |
| `users` | INSERT/UPDATE | `users_admin_manage` | `clinic_id = private.current_clinic_id() AND private.current_user_role() = 'administrador'` |
| `patients` | SELECT | `patients_select_same_clinic`| `clinic_id = private.current_clinic_id()` |
| `patients` | INSERT/UPDATE | `patients_authorized` | `clinic_id = private.current_clinic_id() AND private.current_user_role() IN ('administrador','odontologo','recepcionista')` |
| `appointments`| SELECT | `appointments_same_clinic` | `clinic_id = private.current_clinic_id()` |
| `appointments`| INSERT/UPDATE | `appointments_authorized` | `clinic_id = private.current_clinic_id() AND private.current_user_role() IN ('administrador','odontologo','recepcionista')` |
| `clinical_records`| SELECT/INSERT/UPDATE | `clinical_records_clinical` | `clinic_id = private.current_clinic_id() AND private.current_user_role() IN ('administrador','odontologo')` |
| `clinical_entries`| SELECT/INSERT | `clinical_entries_clinical` | `clinic_id = private.current_clinic_id() AND private.current_user_role() IN ('administrador','odontologo')` |
| `clinical_attachments`| SELECT/INSERT | `clinical_attachments_clinical`| `clinic_id = private.current_clinic_id() AND private.current_user_role() IN ('administrador','odontologo')` |
| `odontogram_states`| SELECT/INSERT | `odontogram_clinical` | `clinic_id = private.current_clinic_id() AND private.current_user_role() IN ('administrador','odontologo')` |
| `custom_tooth_statuses`| SELECT | `custom_statuses_select` | `clinic_id = private.current_clinic_id()` |
| `custom_tooth_statuses`| INSERT/UPDATE | `custom_statuses_admin` | `clinic_id = private.current_clinic_id() AND private.current_user_role() = 'administrador'` |
| `audit_logs` | SELECT | `audit_logs_select_admin` | `clinic_id = private.current_clinic_id() AND private.current_user_role() = 'administrador'` |
| *Todas* | DELETE | *(Sin política)* | **Denegado por defecto.** Ningún usuario puede borrar filas directamente. |

---

### 6.5 Supabase Storage

* **Bucket:** `clinical-files` (Configuración: `public: false`, tamaño ilimitado a nivel de bucket, restringido a 20 MB por aplicación).
* **Ruta de Almacenamiento:** `{clinic_id}/{entry_id}/{filename}`
* **Políticas en `storage.objects`:**
  - `storage_insert_clinical`: Solo `administrador` u `odontologo` pueden subir archivos cuyo primer segmento de carpeta coincida con su `private.current_clinic_id()`.
  - `storage_select_clinical`: Solo `administrador` u `odontologo` de la misma clínica pueden descargar objetos del bucket.
* **Entrega de Archivos:** Endpoint `/api/storage/signed-url` valida el `clinic_id` del token del usuario y genera una URL firmada con tiempo de vida estricto de 900 segundos.

---

## 7. Estructura del Proyecto y Desglose Archivo por Archivo

### 7.1 Raíz del Proyecto

* **[package.json](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/package.json):** Define scripts del proyecto (`dev`, `build`, `test`), dependencias de producción (`next`, `react`, `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`) y de desarrollo (`vitest`, `fast-check`, `typescript`, `@types/node`).
* **[tsconfig.json](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/tsconfig.json):** Configuración estricta del compilador TypeScript de Next.js. Excluye explícitamente `supabase/functions` para evitar colisión de tipos con el runtime de Deno.
* **[next.config.ts](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/next.config.ts):** Configuración de Next.js con optimizaciones y headers de seguridad HTTP delegados.
* **[proxy.ts](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/proxy.ts):** Middleware / interceptor de red para Next.js que inyecta automáticamente las cabeceras HTTP de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) en todas las rutas de la aplicación.
* **[vitest.config.mts](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/vitest.config.mts):** Configuración del entorno de pruebas unitarias y de propiedades con soporte para alias `@/*` y resolución de módulos de Next.js.
* **[eslint.config.mjs](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/eslint.config.mjs):** Configuración de ESLint con reglas de Core Web Vitals y TypeScript para Next.js.
* **[postcss.config.mjs](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/postcss.config.mjs):** Configuración del pipeline de PostCSS para Tailwind CSS.
* **[.env.local](file:///home/balckyshadown/Escritorio/DENTAL%20CLINIC/.env.local):** Variables de entorno activas con las credenciales de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

---

### 7.2 Directorio `app/` (Next.js App Router)

* **`app/layout.tsx`:** Layout raíz de la aplicación que carga las fuentes, estructura HTML base e inyecta estilos globales.
* **`app/page.tsx`:** Página de inicio (Landing Page) del SaaS con llamada a la acción para ingresar al sistema o registrar consultorios.
* **`app/globals.css`:** Directivas de Tailwind CSS y variables de color globales del tema.
* **`app/api/health/route.ts`:** Endpoint GET de verificación de estado y salud del servicio para monitoreo y balanceadores.
* **`app/api/storage/signed-url/route.ts`:** Route Handler POST que recibe `{ filePath }`, valida la sesión y pertenencia a la clínica del usuario, y genera una URL firmada de 15 minutos hacia Supabase Storage.
* **`app/(auth)/login/page.tsx`:** Formulario de inicio de sesión con correo y contraseña, control de errores y redirección según estado de MFA.
* **`app/(auth)/setup-mfa/page.tsx`:** Pantalla obligatoria para roles clínicos en su primer inicio de sesión. Muestra el código QR generado por TOTP y la clave secreta manual para emparejar la app autenticadora.
* **`app/(auth)/verify-mfa/page.tsx`:** Pantalla de verificación del código TOTP de 6 dígitos requerida en cada inicio de sesión subsiguiente.
* **`app/(dashboard)/layout.tsx`:** Layout principal del panel administrativo con barra lateral de navegación, información del usuario autenticado, control de roles y temporizador de expiración de sesión.
* **`app/(dashboard)/dashboard/page.tsx`:** Vista principal con métricas resumidas, accesos rápidos a módulos y resumen de citas del día.
* **`app/(dashboard)/pacientes/page.tsx`:** Listado, búsqueda interactiva y formulario de registro/edición de pacientes.
* **`app/(dashboard)/citas/page.tsx`:** Calendario y agenda interactiva de citas médicas odontológicas.
* **`app/(dashboard)/usuarios/page.tsx`:** Panel exclusivo del Administrador para invitar miembros al equipo (odontólogos y recepcionistas) y gestionar su estado.
* **`app/(dashboard)/clinica/configuracion/page.tsx`:** Configuración institucional del consultorio (nombre, dirección, datos de contacto).
* **`app/(dashboard)/reportes/pacientes-atendidos/page.tsx`:** Interfaz de reportes de productividad médica y citas completadas por odontólogo.
* **`app/(dashboard)/reportes/estado-citas/page.tsx`:** Métricas gráficas de distribución de citas por estado en rangos de hasta 365 días.

---

### 7.3 Directorio `lib/` (Lógica de Dominio, Server Actions y Auth)

#### Subdirectorio `lib/actions/` (Server Actions de Negocio)
* **`clinic.actions.ts`:**
  - `registerClinicAction`: Transacción atómica de creación de clínica y usuario administrador inicial con rollback automático si falla la invitación.
  - `updateClinicAction`: Modificación de datos institucionales (solo Administrador).
  - `getClinicAction`: Consulta de datos del consultorio del usuario autenticado.
* **`users.actions.ts`:**
  - `createUserAction`: Invita a un usuario en Supabase Auth y crea su fila en `public.users` (solo Administrador).
  - `updateUserAction`: Modifica nombre o rol de un miembro del equipo.
  - `deactivateUserAction`: Desactiva a un usuario asegurando que nunca sea el último administrador activo y revoca su sesión en Auth.
  - `listUsersAction`: Lista todos los usuarios de la clínica.
* **`patients.actions.ts`:**
  - `createPatientAction`: Registra un paciente capturando colisiones de documento con `UniqueDocumentError`.
  - `updatePatientAction`: Modifica datos demográficos y antecedentes médicos.
  - `searchPatientsAction`: Búsqueda full-text paginada sobre índice GIN.
  - `getPatientByIdAction`: Obtiene el detalle de un paciente por su ID.
* **`appointments.actions.ts`:**
  - `createAppointmentAction`: Agenda una cita verificando que no exista solapamiento horario para el odontólogo; ante conflicto, calcula y sugiere 3 franjas horarias alternativas de 30 min.
  - `rescheduleAppointmentAction`: Reprograma citas en estados válidos.
  - `cancelAppointmentAction`: Cancela citas registrando el motivo (prohibido cancelar citas ya completadas).
  - `listAppointmentsAction`: Filtra citas por rango de fechas, odontólogo o estado.
* **`clinical.actions.ts`:**
  - `saveClinicalEntryAction`: Guarda una entrada clínica inmutable validando concurrencia optimista contra el número de versión; rechaza con HTTP 403 a usuarios con rol recepcionista.
  - `getClinicalHistoryAction`: Recupera el expediente completo y cronológico de un paciente.
* **`attachments.actions.ts`:**
  - `uploadAttachmentAction`: Valida formatos permitidos (JPEG, PNG, PDF, DICOM), tamaño máx 20 MB y tope de 10 archivos por entrada antes de registrar metadatos.
  - `listEntryAttachmentsAction`: Lista los adjuntos de una entrada clínica.
* **`odontogram.actions.ts`:**
  - `saveToothStateAction`: Registra el estado de un diente validando la nomenclatura FDI (32 dientes) y sus 6 superficies, de forma append-only.
  - `getOdontogramStateAction`: Obtiene el estado consolidado más reciente del odontograma del paciente.
  - `createCustomToothStatusAction`: Registra un estado personalizado (máx 20 por consultorio, solo Administrador).
  - `listCustomToothStatusesAction`: Lista los estados personalizados activos.
* **`reports.actions.ts`:**
  - `getAttendedPatientsReportAction`: Agrupa citas completadas por odontólogo en un rango temporal.
  - `getAppointmentStatusReportAction`: Agrupa distribución de citas por estado; rechaza rangos mayores a 365 días con `ReportRangeLimitError`.
* **`auth.actions.ts`:**
  - `loginAction`: Autentica credenciales con Supabase Auth e invoca la protección por fuerza bruta.
  - `enrollMfaAction`: Inicia el enrolamiento TOTP limpiando factores no verificados previos para evitar conflictos de idempotencia.
  - `verifyMfaSetupAction`: Valida el primer código TOTP y activa `mfa_enabled = true`.
  - `verifyMfaLoginAction`: Verifica el segundo factor en cada inicio de sesión posterior.
  - `logoutAction`: Cierra la sesión activa de forma segura.

#### Subdirectorios de Seguridad, Auditoría y Supabase
* **`lib/server-action-wrapper.ts`:** Wrapper de alto orden (`withErrorHandling`) que envuelve todas las Server Actions para asegurar captura de errores no controlados, formateo estándar de respuesta `{ success: boolean, data?, error? }` y registro de auditoría en fallos de autorización.
* **`lib/audit.ts`:** Función centralizada `createAuditLog` que utiliza el cliente administrador (`service_role`) para persistir los 9 campos obligatorios en `audit_logs`.
* **`lib/audit/authorization-failure.ts`:** Registra intentos de acceso denegado en la auditoría cuando un usuario intenta ejecutar una acción no permitida por su rol.
* **`lib/auth/require-user.ts`:** Helpers reutilizables `requireAuthUser` y `requireRole` para validar sesión activa y permisos RBAC en Server Actions.
* **`lib/auth/access-policy.ts`:** Matriz declarativa de permisos por rol y tipo de recurso.
* **`lib/auth/login-attempt-store.ts`:** Adaptador de persistencia que interactúa con las funciones RPC de bloqueo (`check_login_lockout`, `record_failed_login_attempt`).
* **`lib/auth/password-validator.ts`:** Validador de fortaleza de contraseñas (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo).
* **`lib/auth/session-termination.ts`:** Lógica de cierre de sesión seguro en cascada.
* **`lib/auth/verified-headers.ts`:** Constantes y utilidades para las cabeceras HTTP de seguridad.
* **`lib/supabase/client.ts`:** Inicializador del cliente Supabase para componentes del navegador (`createBrowserClient`).
* **`lib/supabase/server.ts`:** Inicializador del cliente Supabase para Server Components y Server Actions con gestión de cookies de sesión (`createServerClient`).
* **`lib/supabase/admin.ts`:** Cliente administrador con `SUPABASE_SERVICE_ROLE_KEY` protegido contra ejecuciones en el cliente; utilizado únicamente para auditoría y operaciones administrativas internas.

---

### 7.4 Directorio `types/` y `errors/`

* **`types/domain.ts`:** Definiciones TypeScript de todas las entidades de dominio: `Clinic`, `UserProfile`, `UserRole`, `Patient`, `Appointment`, `ClinicalRecord`, `ClinicalEntry`, `ClinicalAttachment`, `OdontogramState`, `CustomToothStatus`, `AuditLog`, etc.
* **`errors/domain.ts`:** Jerarquía de excepciones de dominio tipadas: `DentalClinicError`, `RoleAuthorizationError`, `UniqueDocumentError`, `AppointmentConflictError`, `ConcurrencyConflictError`, `ReportRangeLimitError`, `AccountLockedError`, `InvalidCredentialsError`.

---

### 7.5 Directorio `components/`

* **`components/session/SessionTimer.tsx`:** Componente visual del cliente que monitorea la inactividad del usuario, muestra una cuenta regresiva previa al cierre de sesión por timeout y permite renovar o cerrar la sesión.

---

### 7.6 Directorio `supabase/` (Migraciones y Edge Functions)

* **`supabase/migrations/`:**
  - `001_create_clinics.sql`: Tabla `clinics`.
  - `002_create_users.sql`: Tabla `users` con roles y relación a `auth.users`.
  - `003_create_patients.sql`: Tabla `patients` con índice GIN de búsqueda full-text.
  - `004_create_appointments.sql`: Tabla `appointments` con índice GiST (`btree_gist`).
  - `005_create_clinical_records.sql`: Tabla `clinical_records` con contador de versión.
  - `006_create_clinical_entries.sql`: Tabla append-only `clinical_entries`.
  - `007_create_clinical_attachments.sql`: Tabla `clinical_attachments`.
  - `008_create_odontogram_states.sql`: Tabla `odontogram_states` (32 dientes FDI).
  - `009_create_custom_tooth_statuses.sql`: Tabla `custom_tooth_statuses`.
  - `010_create_audit_logs.sql`: Tabla append-only `audit_logs`.
  - `011_rls_policies.sql`: Políticas RLS base.
  - `012_storage_policies.sql`: Configuración del bucket `clinical-files`.
  - `013_fix_security_foundation.sql`: **Piedra angular de seguridad**: Esquema `private`, funciones no recursivas `current_clinic_id()` y `current_user_role()`, llaves foráneas compuestas de tenant, trigger de concurrencia optimista, auth hook para claims JWT, bloqueo por fuerza bruta y outbox transaccional.
* **`supabase/functions/auto-transition-appointments/index.ts`:** Edge Function en Deno para la transición automática de citas a `en_curso` cuando vence la hora de inicio.
* **`supabase/tests/`:** Scripts y pruebas de integración en SQL para verificar RLS y migraciones.

---

### 7.7 Directorio `__tests__/` (Suites de Pruebas)

* **`__tests__/setup.ts`:** Configuración de mocks globales para Vitest y variables de entorno de prueba.
* **`__tests__/unit/` (14 archivos de pruebas unitarias):**
  - `clinic-actions.test.ts`: Valida registro de consultorios, rollback defensivo y actualización.
  - `users-actions.test.ts`: Valida creación de usuarios, roles y protección del último administrador.
  - `patients-actions.test.ts`: Valida registro, unicidad de documento y búsqueda.
  - `appointments-actions.test.ts`: Valida citas, conflictos de solapamiento y cálculo de sugerencias horarias.
  - `clinical-actions.test.ts`: Valida concurrencia optimista de versión y rechazo a recepcionistas (HTTP 403).
  - `odontogram-actions.test.ts`: Valida piezas FDI, superficies dentales y tope de estados personalizados.
  - `reports-actions.test.ts`: Valida reportes y rechazo de rangos mayores a 365 días.
  - `audit.test.ts`: Valida la persistencia de los 9 campos de auditoría.
  - `auth-actions.test.ts`: Valida login, rechazo de MFA inválido y logout.
  - `access-policy.test.ts`: Valida la matriz declarativa de control de accesos RBAC.
  - `login-attempt-store.test.ts`: Valida la lógica de bloqueo por fuerza bruta.
  - `session-termination.test.ts`: Valida el cierre de sesión seguro.
  - `proxy.test.ts` y `verified-headers.test.ts`: Validan la inyección de cabeceras HTTP de seguridad.
* **`__tests__/properties/` (4 suites de Property-Based Testing con `fast-check`):**
  - `security-headers.property.test.ts`: Genera rutas y métodos HTTP arbitrarios para asegurar que las cabeceras de seguridad se apliquen universalmente.
  - `password-validation.property.test.ts`: Genera miles de contraseñas aleatorias verificando la estricta adherencia a las políticas de complejidad.
  - `tenant-isolation.property.test.ts`: Verifica la imposibilidad de cruzar datos entre clínicas distintas.
  - `jwt-claims.property.test.ts`: Verifica la presencia e integridad de los claims requeridos en el JWT.
* **`__tests__/smoke/`:**
  - `security-migrations.smoke.test.ts`: Pruebas de humo sobre la sintaxis y consistencia de las migraciones SQL.

---

### 7.8 Directorio `.kiro/` (Especificaciones del Proyecto)

* **`requirements.md`:** Requisitos formales del proyecto estructurados en formato EARS (Easy Approach to Requirements Syntax).
* **`design.md`:** Documento de diseño arquitectónico detallado, modelos de datos, flujos de autenticación y diagramas de secuencia.
* **`tasks.md`:** Plan de trabajo dividido en tareas atómicas con criterios de aceptación claros.
* **`adr-001-auth-context-and-rls-fix.md`:** Architecture Decision Record que documenta la eliminación de recursión en RLS y la adopción del esquema `private` con funciones `SECURITY DEFINER`.

---

## 8. Estado Actual del Desarrollo y Siguientes Pasos

### Estado Actual:
* **Backend:** **100% Completado y Verificado.**
  - Todas las Server Actions requeridas por la especificación están programadas, tipadas y protegidas con Zod y RBAC.
  - Edge Function de transición automática de citas implementada en Deno.
  - Almacenamiento seguro en Supabase Storage con validación de tipos MIME y generación de URLs firmadas de 15 minutos.
* **Base de Datos Remota (Supabase):** **100% Migrada y Operativa.**
  - Tablas de negocio, esquemas `public` y `private`, funciones, triggers y políticas RLS desplegadas.
  - Usuario administrador inicial (`admin@dentalclinic.com`) y consultorio de prueba creados y probados con éxito.
* **Calidad y Cobertura de Código:**
  - **74 de 74 tests unitarios y de propiedades aprobados** (`npx vitest run`).
  - **0 errores de compilación TypeScript** (`npx tsc --noEmit`).
  - Grafo de arquitectura de **Graphify** actualizado y sincronizado.

### Siguientes Pasos Recomendados:
1. **Desarrollo de Vistas Frontend (UI/UX):**
   - Implementar el diseño visual y componentes interactivos para la gestión de pacientes y agenda de citas.
   - Construir el componente interactivo del Odontograma Digital (renderizado interactivo de las 32 piezas y sus 6 superficies).
   - Diseñar las tablas y filtros para la consulta de auditoría y los gráficos de los reportes analíticos.
2. **Pruebas End-to-End (E2E):**
   - Configurar pruebas de integración en el navegador con Playwright para validar los flujos completos desde la interfaz de usuario (Login -> MFA -> Dashboard -> Agendar Cita -> Guardar Historia Clínica).

---

## 9. Caso de Uso Maestro End-to-End (Ciclo de Vida Completo del SaaS)

Este caso de uso integral ilustra el flujo de vida completo del sistema, abarcando desde la incorporación del consultorio, la seguridad perimetral y MFA, hasta la atención clínica odontológica, el almacenamiento de radiografías, la auditoría inmutable y la respuesta a ciberataques.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO MAESTRO END-TO-END DEL SISTEMA                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
  [Fase 1] Registro de Clínica y Admin (Rollback defensivo)
     │
  [Fase 2] Primer Login Admin -> Reto Obligatorio MFA TOTP (AAL2 verificado)
     │
  [Fase 3] Admin crea Odontólogo y Recepcionista (RBAC + JWT claims)
     │
  [Fase 4] Recepcionista registra Paciente (Unicidad CC + Historia Clínica v1)
     │
  [Fase 5] Agendamiento con detección de solapamiento GiST -> Cita 'confirmada'
     │       └─> Edge Function transiciona a 'en_curso' a la hora fijada
     │
  [Fase 6] Odontólogo examina: Odontograma FDI (Pieza 16) + Entrada Clínica (Append-Only)
     │       └─> Recepcionista bloqueado por RLS (HTTP 403)
     │       └─> Concurrencia optimista valida versión 1 -> incrementa a v2
     │
  [Fase 7] Corrección auditable: emite nueva entrada vinculada con corrects_entry_id
     │
  [Fase 8] Odontólogo sube Radiografía PNG (<=20MB) -> URL firmada de 15 minutos
     │
  [Fase 9] Cierre de Cita a 'completada' (Inmutable) + Trazabilidad en audit_logs
     │
  [Fase 10] Admin consulta Reportes de Productividad y Citas (Límite <= 365 días)
     │
  [Fase 11] Ciberseguridad: 5 intentos fallidos -> Bloqueo 15 min + Revocación de sesión
```

### 9.1 Actores y Roles Participantes
* **Dr. Roberto Gómez (Administrador):** Dueño de *"Clínica Dental San Jerónimo"*. Posee máximos privilegios dentro de su tenant.
* **Dra. Elena Vargas (Odontóloga):** Personal médico tratante. Accede a historias clínicas, citas y odontograma.
* **Mateo Soto (Recepcionista):** Personal administrativo de recepción. Registra pacientes y gestiona citas. Acceso denegado a historias clínicas.
* **Mateo Morales (Paciente):** Usuario receptor de los servicios odontológicos.
* **Edge Function Cron (Sistema):** Proceso automatizado en segundo plano para transiciones de citas.
* **Actor Externo No Autorizado (Atacante):** Intento de vulneración por fuerza bruta o acceso cruzado entre clínicas.

---

### 9.2 Fase 1: Onboarding y Registro del Consultorio (Tenant Onboarding)
* **Objetivo:** Registrar un nuevo consultorio dental y su administrador fundador.
* **Acción Ejecutada:** El Dr. Roberto Gómez completa el formulario de registro en la landing page (`app/page.tsx`) llamando a `registerClinicAction` en `lib/actions/clinic.actions.ts`.
* **Parámetros de Entrada:**
  ```json
  {
    "name": "Clínica Dental San Jerónimo",
    "email": "contacto@sanjeronimo.com",
    "phone": "3001234567",
    "address": "Calle 45 # 12-34, Bogotá",
    "adminName": "Dr. Roberto Gómez",
    "adminEmail": "roberto.gomez@sanjeronimo.com"
  }
  ```
* **Mecanismos de Seguridad y Transaccionalidad:**
  1. Zod valida longitudes y expresiones regulares de teléfonos y correos.
  2. Se genera un `clinicId` (UUID v4).
  3. Se inserta la clínica en `public.clinics`.
  4. Se crea el usuario en Supabase Auth (`admin.auth.admin.inviteUserByEmail`).
  5. Si el paso 4 falla por cualquier motivo, se ejecuta una compensación defensiva (Rollback: `DELETE FROM clinics WHERE id = clinicId`), previniendo datos huérfanos.
  6. Se crea el perfil en `public.users` con rol `'administrador'` y `mfa_enabled = false`.
  7. Se registra el primer evento en `audit_logs` con `action = 'create'`, `resource_type = 'clinica'`.

---

### 9.3 Fase 2: Primer Inicio de Sesión y Configuración Obligatoria de MFA
* **Objetivo:** Cumplir el Requisito 2.7 (MFA obligatorio en primer acceso para roles con privilegios clínicos).
* **Acción Ejecutada:** El Dr. Roberto accede a `/login` con sus credenciales iniciales (`loginAction`).
* **Flujo Operativo:**
  1. `loginAction` valida usuario y contraseña en Supabase Auth.
  2. El sistema detecta que el usuario tiene rol `'administrador'` y `mfa_enabled === false`.
  3. La respuesta retorna `{ requiresMfaSetup: true, redirectTo: '/setup-mfa' }`.
  4. El navegador redirige automáticamente a `/setup-mfa`.
  5. La página invoca `enrollMfaAction`:
     - Limpia factores previos no verificados para evitar el error `mfa_factor_name_conflict`.
     - Invoca `supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Dental Clinic SaaS' })`.
     - Retorna el código QR en base64 y el secreto en texto claro.
  6. El Dr. Roberto escanea el código QR con Google Authenticator e ingresa el código `852147`.
  7. La Server Action `verifyMfaSetupAction({ factorId, code: '852147' })`:
     - Invoca `supabase.auth.mfa.challengeAndVerify()`.
     - Verifica que el nivel de aseguramiento alcance `aal2`.
     - Actualiza `public.users` marcando `mfa_enabled = true`.
     - Redirige al `/dashboard`.

---

### 9.4 Fase 3: Gestión de Equipo Médico y Asignación de Roles (RBAC)
* **Objetivo:** Incorporar al equipo médico y administrativo aplicando el principio de menor privilegio.
* **Acción Ejecutada:** El Dr. Roberto ingresa a `/usuarios` y utiliza `createUserAction` (`lib/actions/users.actions.ts`).
* **Usuarios Registrados:**
  1. **Dra. Elena Vargas:** `email: "elena.vargas@sanjeronimo.com"`, `role: "odontologo"`.
  2. **Mateo Soto:** `email: "mateo.soto@sanjeronimo.com"`, `role: "recepcionista"`.
* **Mecanismos de Control de Acceso:**
  - `requireRole(['administrador'])` verifica que solo el administrador pueda crear usuarios.
  - El token JWT de cada usuario nuevo es interceptado por `public.custom_access_token_hook`, inyectando `clinic_id` y `user_role` de forma inmutable.

---

### 9.5 Fase 4: Recepción, Registro del Paciente y Apertura de Historia Clínica
* **Objetivo:** Dar de alta a un paciente y preparar su expediente médico.
* **Acción Ejecutada:** Mateo Soto (Recepcionista) inicia sesión (sin exigir MFA por ser recepcionista) e ingresa a `/pacientes`.
* **Flujo Operativo:**
  1. Mateo ejecuta `createPatientAction` (`lib/actions/patients.actions.ts`):
     ```json
     {
       "firstName": "Mateo",
       "lastName": "Morales",
       "documentType": "CC",
       "documentNumber": "1098765432",
       "birthDate": "1995-04-12",
       "gender": "masculino",
       "phone": "3119876543",
       "email": "mateo.morales@correo.com",
       "medicalBackground": "Alérgico a la penicilina"
     }
     ```
  2. **Protección contra duplicados:** La base de datos aplica el constraint `UNIQUE (clinic_id, document_type, document_number)`. Si se intenta volver a ingresar el mismo documento en la clínica, se captura el error y se retorna `UniqueDocumentError`.
  3. **Apertura de Historia Clínica:** Atómicamente se inserta la fila inicial en `public.clinical_records` con `version = 1`.
  4. Se persiste un registro en `audit_logs` con `action = 'create'`, `resource_type = 'paciente'`.

---

### 9.6 Fase 5: Agendamiento de Citas y Resolución de Conflictos Horarios
* **Objetivo:** Coordinar la cita del paciente sin empalmes en la agenda médica.
* **Acción Ejecutada:** Mateo Soto programa una cita para Mateo Morales con la Dra. Elena Vargas para las 10:00 AM llamando a `createAppointmentAction` (`lib/actions/appointments.actions.ts`).
* **Escenario de Conflicto Horario:**
  1. Supongamos que la Dra. Elena ya tenía una cita confirmada de 10:00 AM a 10:45 AM.
  2. La Server Action ejecuta una consulta con el operador de solapamiento `&&` sobre el índice GiST (`btree_gist`).
  3. Detecta colisión y lanza `AppointmentConflictError`.
  4. La función calcula automáticamente 3 franjas horarias libres consecutivas de 30 minutos a partir de la hora deseada: `["10:45:00", "11:15:00", "11:45:00"]`.
  5. El recepcionista selecciona las 10:45 AM.
  6. La cita se registra con éxito (`status: 'confirmada'`).
* **Automatización en Segundo Plano:**
  - Al llegar las 10:45 AM, la Edge Function `auto-transition-appointments` (ejecutada cada 5 minutos por cron) detecta la cita y actualiza su estado automáticamente a `'en_curso'`.

---

### 9.7 Fase 6: Atención Odontológica, Odontograma e Inmutabilidad Médica
* **Objetivo:** Atender al paciente, registrar afecciones en el odontograma y asentar la entrada clínica.
* **Acción Ejecutada:** La Dra. Elena Vargas inicia sesión, supera el reto TOTP en `/verify-mfa` y abre el expediente de Mateo Morales.
* **Verificación de Confidencialidad Médica:**
  - Si Mateo Soto (Recepcionista) intenta acceder mediante API o interfaz al historial clínico, las políticas RLS y `requireRole(['administrador', 'odontologo'])` bloquean la consulta devolviendo **HTTP 403 (Acceso Denegado)**, y registran un intento no autorizado en `audit_logs`.
* **Registro en el Odontograma:**
  1. La Dra. Elena identifica caries en el primer molar superior derecho (pieza 16 en nomenclatura FDI).
  2. Ejecuta `saveToothStateAction` (`lib/actions/odontogram.actions.ts`):
     ```json
     {
       "patientId": "uuid-paciente",
       "toothNumber": 16,
       "surface": "oclusal",
       "status": "caries",
       "notes": "Lesion cavitada en fosas y fisuras"
     }
     ```
  3. Se inserta en `public.odontogram_states` de forma append-only.
* **Registro de Entrada Clínica con Concurrencia Optimista:**
  1. La Dra. Elena redacta el procedimiento en `saveClinicalEntryAction` (`lib/actions/clinical.actions.ts`):
     ```json
     {
       "patientId": "uuid-paciente",
       "diagnosis": "Caries dental en esmalte y dentina pieza 16 (K02.1)",
       "treatment": "Apertura cavitaria, eliminacion de caries y obturacion con resina fotocurada",
       "prescription": "Ibuprofeno 400mg cada 8 horas si hay dolor",
       "expectedVersion": 1
     }
     ```
  2. La base de datos verifica que `clinical_records.version === 1`.
  3. Se inserta la entrada en `public.clinical_entries`.
  4. El trigger `enforce_clinical_record_version_update` incrementa atómicamente la historia clínica a `version = 2`.
  5. Si otro profesional hubiera modificado la ficha simultáneamente, la versión esperada no coincidiría y el sistema rechazaría la colisión con `ConcurrencyConflictError`, evitando pérdidas de información.

---

### 9.8 Fase 7: Correcciones Auditables de Historia Clínica (Append-Only)
* **Objetivo:** Cumplir la normativa médica de no alteración ni eliminación de registros clínicos.
* **Escenario:** La Dra. Elena se percata de que escribió erróneamente la dosis del medicamento en la prescripción.
* **Comportamiento del Sistema:**
  1. Las operaciones `UPDATE` y `DELETE` sobre `clinical_entries` están terminantemente deshabilitadas por RLS.
  2. Para subsanar el error, la Dra. invoca nuevamente `saveClinicalEntryAction`, incluyendo el parámetro `correctsEntryId`:
     ```json
     {
       "patientId": "uuid-paciente",
       "diagnosis": "Correccion de posologia de la entrada anterior",
       "treatment": "Se mantiene tratamiento restaurador",
       "prescription": "Ibuprofeno 600mg cada 8 horas por 3 dias",
       "correctsEntryId": "uuid-entrada-original",
       "expectedVersion": 2
     }
     ```
  3. El sistema conserva intacta la entrada original y crea la nueva entrada referenciando a la anterior, garantizando plena transparencia médico-legal.

---

### 9.9 Fase 8: Carga y Almacenamiento Seguro de Radiografías (Storage)
* **Objetivo:** Adjuntar una radiografía periapical al expediente clínico y visualizarla de forma segura.
* **Acción Ejecutada:** La Dra. Elena sube el archivo radiológico `periapical_16.png` (3.8 MB).
* **Flujo Operativo:**
  1. `uploadAttachmentAction` (`lib/actions/attachments.actions.ts`):
     - Valida tipo MIME (`image/png`).
     - Valida tamaño `<= 20 MB`.
     - Valida que la entrada clínica no sobrepase el límite de 10 adjuntos.
  2. El archivo se transfiere al bucket privado `clinical-files` en la ruta:
     `{clinic_id}/{entry_id}/periapical_16.png`
  3. Se guarda el metadato en `public.clinical_attachments`.
* **Visualización Segura:**
  1. El cliente web requiere mostrar la imagen en pantalla.
  2. Realiza una petición POST a `/api/storage/signed-url` con `{ filePath }`.
  3. El servidor valida la sesión del usuario y confirma que el primer segmento de la ruta coincida con su `clinic_id`.
  4. Se genera y retorna una URL firmada con expiración exacta de 900 segundos (15 minutos). El archivo nunca queda expuesto públicamente.

---

### 9.10 Fase 9: Cierre de Cita y Registro Inmutable de Auditoría
* **Objetivo:** Concluir el servicio y consolidar la trazabilidad forense.
* **Flujo Operativo:**
  1. La Dra. Elena actualiza la cita a estado `'completada'`.
  2. La cita queda sellada: el sistema bloquea cualquier intento posterior de cancelación o reprogramación.
  3. En segundo plano, cada interacción previa ha dejado un rastro inmutable en `public.audit_logs`:
     - Creación de paciente.
     - Creación de cita.
     - Inserción de entrada clínica.
     - Carga de archivo adjunto.
     - Cambio de estado a completada.
  4. Si cualquier usuario (incluso el Dr. Roberto Gómez como Administrador) intenta ejecutar `UPDATE` o `DELETE` sobre `audit_logs`, PostgreSQL rechaza la consulta de manera tajante por política RLS.

---

### 9.11 Fase 10: Inteligencia Operativa y Reportes Gerenciales
* **Objetivo:** Evaluar el rendimiento del consultorio y la distribución operativa.
* **Acción Ejecutada:** El Dr. Roberto Gómez (Administrador) ingresa a `/reportes` (`lib/actions/reports.actions.ts`).
* **Consultas Ejecutadas:**
  1. **Reporte de Pacientes Atendidos:** `getAttendedPatientsReportAction` con rango del mes actual y filtro por la Dra. Elena Vargas. Devuelve el recuento exacto de citas con estado `completada`.
  2. **Reporte de Estado de Citas:** `getAppointmentStatusReportAction` agrupa el total de citas del mes por estado (`programada: 0`, `confirmada: 0`, `en_curso: 0`, `completada: 1`, `cancelada: 0`).
  3. **Validación de Rendimiento:** Si el administrador intentara solicitar un rango de fechas mayor a 365 días, el sistema rechaza la petición con `ReportRangeLimitError`, protegiendo la carga de la base de datos.

---

### 9.12 Fase 11: Escenarios de Ciberseguridad y Resiliencia
* **Escenario A: Ataque de Fuerza Bruta:**
  1. Un atacante intenta adivinar la contraseña de `roberto.gomez@sanjeronimo.com`.
  2. Al 5º intento fallido consecutivo:
     - `public.record_failed_login_attempt` escribe en `private.login_attempts`.
     - Se fija `locked_until = now() + interval '15 minutes'`.
     - Se encola un evento en `private.security_notification_outbox`.
     - Los siguientes intentos devuelven `AccountLockedError` (HTTP 423) indicando el tiempo restante de bloqueo en segundos.
* **Escenario B: Desactivación de Empleado y Revocación Inmediata de Sesión:**
  1. Mateo Soto (Recepcionista) renuncia a la clínica.
  2. El Dr. Roberto entra a `/usuarios` y ejecuta `deactivateUserAction({ userId: mateoId })`.
  3. El sistema valida que Mateo no sea el último administrador activo.
  4. Actualiza `public.users.is_active = false`.
  5. Ejecuta `adminClient.auth.admin.signOut(mateoId, 'global')`.
  6. Si Mateo tenía una pestaña abierta o intenta hacer clic en cualquier acción, el middleware y `requireAuthUser` rechazan su token en menos de 60 segundos con `ACCOUNT_INACTIVE` (HTTP 403).
