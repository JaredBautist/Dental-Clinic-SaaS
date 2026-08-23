# 🦷 Dental Clinic SaaS

> Sistema web SaaS multiempresa para la gestión integral de consultorios odontológicos privados en Cúcuta, Norte de Santander, Colombia.

---

> [!WARNING]
> ## 🚧 PROYECTO EN DESARROLLO 🚧
>
> **Este proyecto se encuentra actualmente en fase de desarrollo activo.**
>
> El sistema **NO está listo para uso en producción**. Las funcionalidades descritas en esta documentación representan el diseño y plan de implementación del sistema. El código está siendo construido de forma incremental siguiendo el plan de tareas definido.
>
> **No utilizar con datos clínicos reales hasta completar la validación jurídica, operativa y de seguridad correspondiente.**

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Problemática que Resuelve](#-problemática-que-resuelve)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Modelo de Base de Datos](#-modelo-de-base-de-datos)
- [Roles y Permisos](#-roles-y-permisos)
- [Seguridad](#-seguridad)
- [Fuera del Alcance (MVP)](#-fuera-del-alcance-mvp)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Configuración del Entorno](#️-configuración-del-entorno)
- [Variables de Entorno](#-variables-de-entorno)
- [Testing](#-testing)
- [Propiedades de Corrección](#-propiedades-de-corrección)
- [Plan de Implementación](#-plan-de-implementación)
- [Conectividad y Sincronización](#-conectividad-y-sincronización)
- [Contexto del Proyecto](#-contexto-del-proyecto)

---

## 🦷 Descripción General

**Dental Clinic SaaS** es una plataforma web bajo el modelo de Software como Servicio (SaaS) diseñada para pequeños y medianos consultorios odontológicos privados de la ciudad de Cúcuta, Norte de Santander.

La plataforma permite que **múltiples consultorios utilicen una misma instancia del sistema**, manteniendo los datos de cada organización completamente **aislados y separados** mediante multitenencia lógica basada en `clinic_id`. Cada consultorio opera de forma independiente: sus usuarios, pacientes, citas, historias clínicas y odontogramas son accesibles únicamente para el personal autorizado de esa organización.

El sistema fue diseñado con el apoyo de un consultorio odontológico real de la ciudad para validar los requisitos funcionales, la usabilidad y la correspondencia con las necesidades reales de la práctica odontológica.

---

## 🔍 Problemática que Resuelve

Los consultorios odontológicos gestionan diariamente:

- 📂 Datos personales y clínicos de pacientes
- 📅 Agendas y horarios de profesionales
- 🩺 Diagnósticos, tratamientos y evoluciones
- 📋 Historias clínicas con trazabilidad legal

En muchos consultorios, esta información se gestiona mediante **documentos físicos, hojas de cálculo o herramientas independientes no integradas**, lo que genera:

| Problema | Impacto |
|---|---|
| Duplicidad de registros | Inconsistencia en datos de pacientes |
| Dificultad para consultar antecedentes | Pérdida de continuidad en la atención |
| Cruces de horarios | Conflictos en la agenda de profesionales |
| Trazabilidad limitada | Riesgo legal y clínico |
| Acceso no controlado | Exposición de datos sensibles de salud |

---

## 📦 Módulos del Sistema

### 🏢 1. Gestión de Consultorios (Multitenencia)
Registro y configuración básica de cada consultorio como organización independiente. Cada consultorio recibe un `clinic_id` UUID único en el momento del registro. Se crea automáticamente un usuario Administrador inicial y se envían las credenciales al correo registrado.

### 👥 2. Gestión de Usuarios y Roles
Administración del equipo del consultorio con tres roles exactos:

| Rol | Acceso |
|---|---|
| `administrador` | Configuración total del consultorio, gestión de usuarios, acceso a todos los módulos |
| `odontologo` | Gestión clínica completa: pacientes, citas, historias clínicas, odontograma |
| `recepcionista` | Gestión administrativa: pacientes y citas únicamente |

Principio de **menor privilegio**: cada rol accede únicamente a las funciones que le corresponden.

### 🔐 3. Autenticación y Control de Sesiones
- Autenticación exclusivamente vía **Supabase Auth**
- **MFA obligatorio** (TOTP) para `administrador` y `odontologo`
- Bloqueo de cuenta por 5 intentos fallidos consecutivos (15 minutos)
- Contraseñas: mínimo 10 caracteres, mayúscula + minúscula + dígito + carácter especial
- Cierre automático de sesión por inactividad de **30 minutos**
- HTTPS/TLS en toda comunicación

### 🧑‍⚕️ 4. Gestión de Pacientes
Registro, consulta y actualización de datos personales y clínicos:

**Campos obligatorios:** nombre completo, número y tipo de documento, fecha de nacimiento, sexo biológico, teléfono de contacto.

**Campos opcionales:** correo electrónico, dirección, nombre y teléfono del acudiente, antecedentes médicos relevantes.

- Validación de **unicidad de documento** por consultorio
- Búsqueda full-text (índice GIN en PostgreSQL) por nombre o documento
- Resultados en ≤ 2 segundos para conjuntos de hasta 10.000 pacientes

### 📅 5. Gestión de Citas
Creación, reprogramación, cancelación y consulta de citas:

- **Detección automática de conflictos de horario** con exclusion constraint en PostgreSQL (`btree_gist`)
- Ante conflicto: sugerencia de las 3 próximas franjas disponibles del odontólogo
- Duración: mínimo 15 min, máximo 480 min
- **Transición automática de estados** vía Edge Function/cron
- Vista de calendario con filtros por odontólogo y rango de fechas

**Estados de cita:**
```
programada → confirmada → en_curso → completada
         ↘ cancelada
         ↘ reprogramada
```

### 🏥 6. Historia Clínica Odontológica
Registro inmutable de la atención clínica con trazabilidad completa:

- **Entradas inmutables**: ninguna entrada se modifica ni elimina; las correcciones crean nuevas entradas con referencia a la original
- Tipos de entrada: `motivo_consulta`, `diagnostico`, `plan_tratamiento`, `procedimiento`, `evolucion`, `correccion`
- Contenido máximo: 5.000 caracteres por entrada
- Adjuntos permitidos: **JPEG, PNG, PDF, DICOM** (máx. 20 MB por archivo, máx. 10 por entrada)
- Archivos en **buckets privados** de Supabase Storage con URLs firmadas de máximo 15 minutos
- Control de concurrencia optimista con campo `version`
- Acceso restringido: solo `administrador` y `odontologo`

### 🦷 7. Odontograma Digital
Representación gráfica interactiva de las **32 piezas dentales** del adulto según nomenclatura **FDI (Federación Dental Internacional)**:

```
Cuadrante 1 (superior derecho): 18,17,16,15,14,13,12,11
Cuadrante 2 (superior izquierdo): 21,22,23,24,25,26,27,28
Cuadrante 3 (inferior izquierdo): 31,32,33,34,35,36,37,38
Cuadrante 4 (inferior derecho): 41,42,43,44,45,46,47,48
```

**Superficies por pieza:** `oclusal`, `mesial`, `distal`, `vestibular`, `palatino_lingual`, `completa`

**Estados predefinidos:**

| Estado | Color |
|---|---|
| `sano` | Blanco (#FFFFFF) |
| `caries` | Rojo (#FF4444) |
| `obturado` | Azul (#4444FF) |
| `ausente` | Gris (#CCCCCC) |
| `corona` | Amarillo (#FFD700) |
| `endodoncia` | Naranja (#FF8C00) |
| `extraccion_indicada` | Rojo oscuro (#8B0000) |
| `fractura` | Púrpura (#800080) |

- Hasta **20 estados personalizados** adicionales por consultorio
- Historial **append-only**: cada cambio genera un nuevo registro preservando el anterior
- Registro de `tratamiento_propuesto` y `tratamiento_realizado` por pieza y superficie

### 🔒 8. Seguridad y Trazabilidad
- **RLS (Row Level Security)** en todas las tablas de la base de datos
- Log de auditoría **inmutable** para todas las operaciones de escritura
- La `service_role_key` de Supabase nunca se expone en el cliente
- Encabezados de seguridad HTTP: `CSP`, `HSTS`, `X-Content-Type-Options`, `Referrer-Policy`
- Datos de historia clínica **nunca persistidos** en `localStorage`, `IndexedDB` ni caché del service worker

### 📊 9. Reportes Operativos Básicos
- **Reporte de pacientes atendidos**: cantidad de citas con estado `completada`, filtrable por odontólogo y rango de fechas
- **Reporte de distribución de citas**: agrupación por estado para el rango seleccionado
- Rango máximo: **12 meses**
- Acceso: solo `administrador` y `odontologo`
- Respuesta en ≤ 5 segundos para rangos de hasta 12 meses

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| 🖥️ **Frontend** | Next.js 14+ con TypeScript (App Router) | Componentes servidor/cliente, rutas protegidas, diseño responsive |
| ⚙️ **Backend / BaaS** | Supabase (Auth, PostgreSQL, Storage, Edge Functions) | Integra autenticación, base de datos relacional, almacenamiento y funciones en un solo servicio |
| 🗄️ **Base de datos** | PostgreSQL administrado por Supabase | Relaciones definidas, integridad referencial, transacciones, índices GIN, extensión btree_gist |
| 🔑 **Autenticación** | Supabase Auth + RLS + TOTP/MFA | JWT con clinic_id, user_id y role; RLS como capa de aislamiento en base de datos |
| 📁 **Almacenamiento** | Supabase Storage (buckets privados) | Archivos clínicos organizados por clinic_id/patient_id con URLs firmadas |
| 🚀 **Infraestructura** | Vercel (frontend) + Supabase Cloud | HTTPS/TLS, firewall, DDoS, despliegues automáticos |
| ✅ **Validación** | Zod | Validación de esquemas en servidor y cliente |
| 🧪 **Testing** | Vitest + fast-check | Pruebas unitarias + property-based testing (25 propiedades) |
| 🌐 **Conectividad mínima** | 4G LTE o Wi-Fi | El sistema gestiona principalmente texto y JSON; 5G compatible pero no obligatorio |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE - NAVEGADOR                     │
│              Next.js App Router (Server + Client)           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS/TLS
┌─────────────────────▼───────────────────────────────────────┐
│                RED PERIMETRAL - VERCEL                      │
│         Edge Network (Firewall, DDoS, HTTPS/TLS)            │
│         Next.js Server Actions & Route Handlers             │
└──────┬──────────────────────┬───────────────────────────────┘
       │ service_role (server) │ anon key + JWT (RLS activo)
┌──────▼──────────┐  ┌────────▼────────────────────────────────┐
│  Supabase Auth  │  │         Supabase Cloud                   │
│  (JWT, MFA,     │  │  PostgreSQL (RLS, tablas de negocio)     │
│   Sessions)     │  │  Storage (buckets privados, clinical-files) │
└─────────────────┘  │  Edge Functions (cron: transición citas) │
                     └─────────────────────────────────────────┘
```

**Principios de arquitectura:**
- 🔒 `service_role_key` **solo en servidor** (Server Actions, Route Handlers, Edge Functions)
- 🌐 El cliente opera únicamente con `anon key` + JWT del usuario (RLS activo en BD)
- 📡 Modo **online-first estricto**: las escrituras requieren confirmación del servidor
- 🏢 Multitenencia **lógica**: `clinic_id` en todas las tablas de negocio

---

## 🗄️ Modelo de Base de Datos

### Tablas principales

| Tabla | Descripción | Inmutable |
|---|---|---|
| `clinics` | Consultorios registrados | No |
| `users` | Usuarios del sistema (extiende `auth.users`) | No |
| `patients` | Pacientes de cada consultorio | No |
| `appointments` | Citas con exclusion constraint anti-solapamiento | No |
| `clinical_records` | Cabecera de historia clínica (1 por paciente/consultorio) | No |
| `clinical_entries` | Entradas clínicas individuales | ✅ Sí |
| `clinical_attachments` | Metadatos de archivos adjuntos | ✅ Sí |
| `odontogram_states` | Estados de piezas dentales (append-only) | ✅ Sí |
| `custom_tooth_statuses` | Estados personalizados del odontograma (máx. 20/consultorio) | No |
| `audit_logs` | Log de auditoría de todas las operaciones | ✅ Sí |

### Restricciones críticas de diseño

```sql
-- Prevención de solapamiento de citas (PostgreSQL btree_gist)
ALTER TABLE appointments ADD CONSTRAINT no_overlap_appointments
  EXCLUDE USING gist (
    dentist_id WITH =,
    tstzrange(scheduled_at, ends_at, '[)') WITH &&
  )
  WHERE (status IN ('programada','confirmada','en_curso'));

-- Unicidad de documento por consultorio
UNIQUE (clinic_id, document_type, document_number)

-- Una historia clínica por paciente/consultorio
UNIQUE (clinic_id, patient_id)  -- en clinical_records

-- Búsqueda full-text en pacientes
CREATE INDEX idx_patients_search ON patients
  USING GIN (to_tsvector('spanish', full_name || ' ' || document_number));
```

---

## 👤 Roles y Permisos

| Funcionalidad | `administrador` | `odontologo` | `recepcionista` |
|---|:---:|:---:|:---:|
| Configurar consultorio | ✅ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Registrar / ver pacientes | ✅ | ✅ | ✅ |
| Crear / gestionar citas | ✅ | ✅ | ✅ |
| Ver historia clínica | ✅ | ✅ | ❌ |
| Registrar entradas clínicas | ✅ | ✅ | ❌ |
| Ver / editar odontograma | ✅ | ✅ | ❌ |
| Ver reportes operativos | ✅ | ✅ | ❌ |
| MFA obligatorio | ✅ | ✅ | ❌ |

---

## 🔐 Seguridad

### Controles implementados

| Control | Implementación |
|---|---|
| 🏢 Aislamiento multiempresa | `clinic_id` en todas las tablas + RLS para SELECT/INSERT/UPDATE/DELETE |
| 🔑 Credenciales | `service_role_key` solo en servidor Vercel, nunca en cliente ni repositorio |
| 🔏 Autenticación | Supabase Auth, MFA (TOTP), confirmación de correo, política de contraseñas |
| 🛡️ Protección de datos | HTTPS, buckets privados, URLs firmadas ≤15 min, validación de entradas |
| 📝 Auditoría | Registro inmutable: `user_id`, `clinic_id`, `action`, `entity_type`, `timestamp`, `result` |
| 🔒 Inmutabilidad clínica | `clinical_entries` y `audit_logs` sin políticas UPDATE/DELETE → rechazadas por RLS |
| 🌐 Perimetral | Protecciones Vercel (firewall, limitación de solicitudes), headers HTTP de seguridad |
| 📵 Sin datos locales | Datos clínicos nunca en `localStorage`, `IndexedDB` ni caché de service worker |

### Headers de seguridad HTTP
```
Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co; ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🚫 Fuera del Alcance (MVP)

Las siguientes funcionalidades **no están incluidas** en el alcance inicial y podrán considerarse como trabajo futuro:

- ❌ Facturación electrónica
- ❌ Integración con servicios de la DIAN
- ❌ Contabilidad y nómina
- ❌ Cobro automatizado de suscripciones
- ❌ Portal del paciente (acceso propio del paciente)
- ❌ Aplicación móvil nativa
- ❌ Herramientas avanzadas de captación comercial

---

## 📁 Estructura del Proyecto

```
dental-clinic-saas/
├── app/
│   ├── (auth)/                    # Rutas de autenticación (sin layout de dashboard)
│   │   ├── login/                 # Inicio de sesión
│   │   ├── setup-mfa/             # Configuración MFA obligatoria
│   │   └── verify-mfa/            # Verificación MFA
│   ├── (dashboard)/               # Rutas protegidas (requieren sesión válida)
│   │   ├── layout.tsx             # Sidebar, navbar, SessionTimer, OfflineBanner
│   │   ├── dashboard/             # Resumen operativo
│   │   ├── clinica/               # Configuración del consultorio
│   │   ├── usuarios/              # Gestión de usuarios (admin)
│   │   ├── pacientes/             # Gestión de pacientes, historia clínica, odontograma
│   │   ├── citas/                 # Calendario y gestión de citas
│   │   └── reportes/              # Reportes operativos
│   └── api/
│       ├── health/                # Health check para detección de conectividad
│       └── storage/signed-url/    # Generación server-side de URLs firmadas
├── components/
│   ├── odontogram/
│   │   ├── OdontogramCanvas.tsx   # SVG interactivo 32 piezas FDI
│   │   └── ToothForm.tsx          # Formulario de registro por superficie
│   ├── session/
│   │   └── SessionTimer.tsx       # Cierre de sesión por inactividad (30 min)
│   └── connectivity/
│       └── OfflineBanner.tsx      # Detector de conectividad offline
├── lib/
│   ├── supabase/
│   │   ├── server.ts              # createServerClient (@supabase/ssr)
│   │   ├── client.ts              # createBrowserClient (anon key)
│   │   └── admin.ts               # createAdminClient (service_role — solo server)
│   ├── actions/
│   │   ├── clinic.actions.ts      # Server Actions: consultorios
│   │   ├── users.actions.ts       # Server Actions: usuarios
│   │   ├── patients.actions.ts    # Server Actions: pacientes
│   │   ├── appointments.actions.ts # Server Actions: citas
│   │   ├── clinical.actions.ts    # Server Actions: historia clínica
│   │   ├── odontogram.actions.ts  # Server Actions: odontograma
│   │   ├── attachments.actions.ts # Server Actions: adjuntos
│   │   └── reports.actions.ts     # Server Actions: reportes
│   ├── audit.ts                   # Función centralizada de log de auditoría
│   ├── fetch-with-timeout.ts      # Timeout de 10 seg para operaciones de escritura
│   └── server-action-wrapper.ts   # Wrapper genérico con manejo de errores
├── types/
│   └── domain.ts                  # UserRole, AppointmentStatus, ClinicalEntryType, etc.
├── errors/
│   └── domain.ts                  # Jerarquía de errores de dominio
├── supabase/
│   ├── migrations/                # 12 migraciones SQL numeradas
│   │   ├── 001_create_clinics.sql
│   │   ├── 002_create_users.sql
│   │   ├── 003_create_patients.sql
│   │   ├── 004_create_appointments.sql
│   │   ├── 005_create_clinical_records.sql
│   │   ├── 006_create_clinical_entries.sql
│   │   ├── 007_create_clinical_attachments.sql
│   │   ├── 008_create_odontogram_states.sql
│   │   ├── 009_create_custom_tooth_statuses.sql
│   │   ├── 010_create_audit_logs.sql
│   │   ├── 011_rls_policies.sql
│   │   └── 012_storage_policies.sql
│   └── functions/
│       └── auto-transition-appointments/  # Edge Function: citas programadas → en_curso
├── __tests__/
│   ├── properties/                # 25 property-based tests (fast-check)
│   ├── unit/                      # Pruebas unitarias (Vitest)
│   └── smoke/                     # Pruebas de humo
├── middleware.ts                  # Auth guard + MFA check + clinic_id en headers
├── next.config.ts                 # Headers de seguridad HTTP
└── vitest.config.ts               # Configuración de Vitest + fast-check
```

---

## ⚙️ Configuración del Entorno

### Prerrequisitos

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Cuenta en [Supabase](https://supabase.com) y [Vercel](https://vercel.com)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd dental-clinic-saas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Inicializar base de datos local (desarrollo)
supabase start
supabase db push

# 5. Iniciar servidor de desarrollo
npm run dev
```

---

## 🔧 Variables de Entorno

```bash
# .env.local

# ✅ Públicas (accesibles en el navegador)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# 🔒 Privadas (NUNCA prefijadas con NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

> ⚠️ **Importante:** `SUPABASE_SERVICE_ROLE_KEY` jamás debe estar prefijada con `NEXT_PUBLIC_`. Su exposición en el cliente comprometería el aislamiento RLS y la seguridad de todos los consultorios.

---

## 🧪 Testing

El proyecto utiliza un **enfoque dual de pruebas**:

### Property-Based Testing (fast-check)

25 pruebas de propiedades de corrección con **mínimo 100 iteraciones** cada una:

```bash
# Ejecutar todas las pruebas
npx vitest --run

# Solo pruebas de propiedades
npx vitest --run __tests__/properties/

# Solo pruebas unitarias
npx vitest --run __tests__/unit/
```

### Pruebas de humo

```bash
npx vitest --run __tests__/smoke/
```

Verifican:
- ✅ Columna `clinic_id` presente en todas las tablas de negocio
- ✅ RLS habilitado (`rowsecurity = true`) en todas las tablas
- ✅ Ausencia de `service_role_key` en el bundle del cliente
- ✅ `OdontogramCanvas` renderiza exactamente 32 piezas FDI válidas

---

## 📐 Propiedades de Corrección

El sistema define **25 propiedades formales de corrección** que deben mantenerse en todas las ejecuciones válidas:

| # | Propiedad | Requisitos |
|---|---|---|
| P1 | Aislamiento completo de tenants | 1.4, 2.4, 4.8, 5.11, 7.8, 8.1, 9.6 |
| P2 | Round-trip de datos del consultorio | 1.6, 1.7 |
| P3 | Rechazo de datos obligatorios ausentes o inválidos | 1.8, 4.2, 5.3 |
| P4 | Unicidad de documento de paciente por consultorio | 4.3, 4.4 |
| P5 | Round-trip de datos de entidades clínicas | 4.1, 6.2, 7.2, 7.9 |
| P6 | Completitud e integridad del registro de auditoría | 4.6, 5.10, 6.6, 8.4 |
| P7 | Control de acceso por rol | 2.3, 6.9, 7.7, 9.5 |
| P8 | Invariante de no solapamiento de citas | 5.1, 5.4 |
| P9 | Integridad de datos de cancelación de citas | 5.6 |
| P10 | Unicidad de historia clínica por paciente | 6.1 |
| P11 | Inmutabilidad de registros clínicos y de auditoría | 6.3, 8.5 |
| P12 | Trazabilidad de correcciones clínicas | 6.4 |
| P13 | Ordenamiento cronológico de la historia clínica | 6.5 |
| P14 | Validación de archivos adjuntos | 6.7 |
| P15 | Control de concurrencia optimista | 6.11, 7.6, 10.5 |
| P16 | Inmutabilidad del historial del odontograma (append-only) | 7.3, 7.4 |
| P17 | Expiración máxima de URLs firmadas (exactamente 900 seg) | 6.8, 8.6 |
| P18 | Preservación de estado de UI ante fallo del servidor | 8.8, 10.4, 10.6 |
| P19 | Corrección de filtros en reportes operativos | 9.1, 9.2 |
| P20 | Validación del rango de fechas en reportes (≤ 12 meses) | 9.3 |
| P21 | Round-trip de conectividad (offline → online) | 10.2 |
| P22 | Validación de contraseñas | 3.3 |
| P23 | Protección del último administrador activo | 2.6 |
| P24 | Integridad del JWT emitido | 2.9 |
| P25 | Headers de seguridad HTTP en todas las respuestas | 3.7 |

---

## 📋 Plan de Implementación

El desarrollo sigue **15 epics** en orden de dependencias naturales:

```
1. ⚙️  Infraestructura base (Next.js, Supabase, env vars, headers, middleware)
2. 🗄️  Migraciones SQL completas + RLS + Storage policies
3. 🔐  Autenticación (login, MFA, SessionTimer, health check)
4. 🏢  Gestión de consultorios
5. ✅  Checkpoint #1 (infraestructura base)
6. 👥  Gestión de usuarios y roles
7. 🧑‍⚕️  Gestión de pacientes (CRUD + búsqueda full-text)
8. 📅  Gestión de citas (CRUD + exclusion constraint + Edge Function)
9. ✅  Checkpoint #2 (módulos de negocio base)
10. 🏥  Historia clínica (inmutabilidad, correcciones, adjuntos, concurrencia)
11. 🦷  Odontograma digital (SVG 32 piezas FDI, append-only)
12. 🔒  Seguridad, auditoría y conectividad offline
13. 📊  Reportes operativos
14. 🧪  Testing completo (25 PBTs + unit tests + smoke tests)
15. ✅  Checkpoint final
```

---

## 📡 Conectividad y Sincronización

El sistema opera bajo un modelo **online-first estricto**:

| Evento | Comportamiento del sistema |
|---|---|
| 🔴 Pérdida de conexión | Barra "Sin conexión" persistente en la parte superior; controles de escritura deshabilitados |
| 🟢 Reconexión detectada | Verificación con `/api/health`; si HTTP 200 → rehabilitar controles, mostrar "Conectado" 3 seg |
| ⏱️ Timeout de escritura (10 seg) | Marcar operación como fallida, preservar formulario, mostrar botón "Reintentar" |
| 🔄 Conflicto de concurrencia | Rechazar escritura, mostrar mensaje con el registro en conflicto, preservar contenido redactado |
| 🚫 No persistencia local | Datos de historia clínica y odontograma **nunca** en `localStorage`, `IndexedDB` ni caché |

---

## 📍 Contexto del Proyecto

| Campo | Detalle |
|---|---|
| 🏙️ **Ciudad** | Cúcuta, Norte de Santander, Colombia |
| 🏥 **Contexto** | Consultorios odontológicos privados pequeños y medianos |
| 🎓 **Naturaleza** | Proyecto académico con validación en consultorio piloto real |
| ⚖️ **Aviso legal** | Para uso con datos clínicos reales se requiere validación jurídica, operativa y de seguridad adicional. En fase académica se utilizan datos ficticios, anonimizados o autorizados. |

---

<div align="center">

**🦷 Dental Clinic SaaS** · Cúcuta, Colombia · Next.js + Supabase + Vercel

</div>
