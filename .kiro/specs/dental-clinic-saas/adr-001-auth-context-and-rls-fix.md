# ADR-001: Contexto de autorización, MFA y RLS

## Estado

Aceptado para corregir las tareas 1–3.

## Contexto

La implementación inicial presenta cuatro defectos de seguridad:

1. Las políticas RLS consultan `public.users` desde la propia política de `public.users`, lo que produce recursión.
2. El middleware usa `user_metadata` como fuente alternativa de `clinic_id`, rol y MFA, aunque esos datos no son autoritativos para autorización.
3. El flujo MFA usa un campo `mfa_completed` propio en lugar del Authenticator Assurance Level (AAL) emitido por Supabase.
4. El límite de intentos de login reside en memoria y no es consistente entre instancias serverless.

## Opciones consideradas

| Decisión | Opciones | Resultado |
|---|---|---|
| Contexto RLS | Subconsultas directas; claims JWT; funciones auxiliares | Funciones auxiliares no recursivas para RLS; claims JWT para transporte verificable |
| Fuente de rol y tenant | `user_metadata`; `app_metadata`; `public.users` | `public.users` como fuente de verdad y Custom Access Token Hook para emitir claims firmados |
| MFA | Flag propio; AAL de Supabase | AAL2 de Supabase |
| Rate limit | Memoria; Redis; PostgreSQL | PostgreSQL mediante RPC atómica, porque ya forma parte del stack y evita infraestructura adicional |
| Notificación por correo | Proveedor específico; outbox | Outbox transaccional ahora; el proveedor de entrega requiere una decisión separada |

## Decisión

1. Crear funciones `private.current_clinic_id()` y `private.current_user_role()` con `SECURITY DEFINER`, `search_path` vacío y permisos mínimos. Las políticas RLS no consultarán directamente `public.users`.
2. Crear un Custom Access Token Hook versionado que añada `clinic_id`, `user_id` y `user_role` desde `public.users`. El middleware seguirá consultando el perfil para comprobar `is_active`; nunca confiará en `user_metadata`.
3. El middleware decidirá el acceso mediante `getAuthenticatorAssuranceLevel()`: los roles clínicos requieren `currentLevel = 'aal2'` para rutas protegidas.
4. Los claims verificados se inyectarán en los headers de la solicitud interna de Next.js, no en los headers de respuesta.
5. Una configuración Supabase ausente provocará HTTP 503; la autorización fallará de forma cerrada.
6. Los intentos fallidos se registrarán mediante RPC atómica en PostgreSQL usando un hash SHA-256 del email normalizado.
7. Los rechazos de autorización HTTP 403 pasarán por un puerto de auditoría y se persistirán con el cliente administrativo del servidor. Cuando el contexto no esté disponible en el wrapper, el error de dominio lo transportará explícitamente con la acción `access_denied`.

## Criterios de regresión

1. WHEN Supabase no está configurado, THE middleware SHALL responder 503 y no permitir una ruta protegida.
2. WHEN un usuario no autenticado solicita una ruta protegida o una API distinta de `/api/health`, THE middleware SHALL redirigirlo a login.
3. WHEN un administrador u odontólogo tiene `mfa_enabled = false`, THE middleware SHALL enviarlo a `/setup-mfa`.
4. WHEN un administrador u odontólogo tiene AAL1 y MFA configurado, THE middleware SHALL enviarlo a `/verify-mfa`.
5. WHEN un administrador u odontólogo tiene AAL2, THE middleware SHALL permitir la ruta protegida.
6. WHEN una política necesita tenant o rol, THE política SHALL usar funciones auxiliares y SHALL NOT consultar directamente `public.users`.
7. WHEN un `DentalClinicError` con estado 403 es capturado, THE wrapper SHALL intentar crear exactamente un registro de auditoría sin ocultar el error original si la auditoría falla.
8. WHEN cinco intentos de login fallan, THE store SHALL bloquear el identificador durante 15 minutos de forma persistente y atómica.

## Consecuencias

- Las políticas dependen de funciones pequeñas y auditables, pero dejan de ser autocontenidas.
- El Auth Hook debe habilitarse en `Authentication > Hooks` para el proyecto remoto; localmente se configura en `supabase/config.toml` cuando exista el proyecto Supabase local.
- La entrega real del correo de bloqueo queda pendiente de elegir y configurar un proveedor. El sistema conservará el evento en un outbox y no afirmará que el correo fue enviado.
- La migración correctiva será aditiva para no reescribir migraciones que podrían haberse aplicado.

## Referencias

- [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [Supabase MFA AAL](https://supabase.com/docs/reference/javascript/auth-mfa-getauthenticatorassurancelevel)
