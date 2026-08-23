# Requirements Document

## Introduction

Este documento describe los requisitos funcionales y no funcionales del sistema **Dental Clinic SaaS**, una plataforma web multiempresa para la gestión de consultorios odontológicos privados en Cúcuta, Norte de Santander, Colombia.

El sistema centraliza la información operativa y clínica de múltiples consultorios bajo una misma plataforma, garantizando el aislamiento completo de datos entre organizaciones. Cubre la gestión de usuarios y roles, pacientes, citas, historias clínicas odontológicas, odontograma digital, seguridad, trazabilidad y reportes operativos básicos.

**Stack tecnológico:** Next.js con TypeScript (App Router) en Vercel como frontend; Supabase (Auth, PostgreSQL, Storage, Edge Functions, RLS) como backend/BaaS.

**Alcance excluido del MVP:** facturación electrónica, integración con la DIAN, contabilidad, nómina, cobro automatizado de suscripciones, portal del paciente, aplicación móvil nativa y herramientas avanzadas de captación comercial.

---

## Glossary

- **Sistema**: La plataforma web SaaS Dental Clinic en su conjunto.
- **Consultorio**: Organización independiente registrada en el sistema, identificada por un `clinic_id` único e irrepetible (UUID generado por el servidor).
- **Usuario**: Persona autenticada que opera el sistema dentro de un consultorio.
- **Administrador**: Rol con acceso total a la configuración y datos del consultorio al que pertenece.
- **Odontólogo**: Rol con acceso a la gestión clínica (pacientes, citas, historias, odontograma) dentro de su consultorio.
- **Recepcionista**: Rol con acceso a la gestión administrativa (pacientes, citas) dentro de su consultorio.
- **Paciente**: Persona registrada en el sistema cuyos datos clínicos y personales son gestionados por el consultorio.
- **Cita**: Evento programado que asocia a un paciente con un odontólogo en una franja horaria específica.
- **Historia_Clínica**: Registro estructurado e inmutable que documenta la atención odontológica de un paciente en el tiempo.
- **Entrada_Clinica**: Unidad individual dentro de la Historia_Clínica que documenta una consulta, diagnóstico, plan de tratamiento, procedimiento o evolución. Una vez persistida exitosamente, es inmutable.
- **Odontograma**: Representación gráfica de las 32 piezas dentales del paciente según nomenclatura FDI, con las condiciones, diagnósticos y tratamientos registrados por superficie.
- **RLS**: Row Level Security — mecanismo de PostgreSQL/Supabase que restringe el acceso a filas según políticas definidas, aplicado en la capa de base de datos.
- **MFA**: Autenticación multifactor — capa adicional de verificación de identidad al iniciar sesión.
- **Registro_Auditoria**: Entrada inmutable que documenta una acción realizada por un usuario sobre una entidad del sistema, con campos: `id`, `clinic_id`, `user_id`, `role`, `entity_type`, `entity_id`, `action`, `timestamp` y `result`.
- **JWT**: JSON Web Token — token firmado que identifica a un usuario autenticado y transporta su `clinic_id`, `user_id` y `role` como claims verificables.
- **URL_Firmada**: URL temporal generada por Supabase Storage con tiempo de expiración máximo de 15 minutos, que permite acceso controlado a archivos en buckets privados.
- **Marcas_De_Tiempo**: Campos `created_at` y `version` presentes en entidades sujetas a control de concurrencia (Historia_Clínica, Odontograma), usados para detectar escrituras conflictivas.
- **Conflicto_De_Concurrencia**: Situación en la que dos escrituras sobre el mismo registro ocurren con el mismo valor de `version`, indicando modificación simultánea no coordinada.

---

## Requirements

### Requisito 1: Gestión de Consultorios (Multitenencia)

**Historia de usuario:** Como responsable de un consultorio, quiero registrar mi consultorio en la plataforma y configurar su información básica, para que mi equipo pueda operar de forma independiente con datos completamente aislados de otros consultorios.

#### Criterios de Aceptación

1. THE Sistema SHALL asignar un `clinic_id` único e irrepetible a cada consultorio en el momento de su registro.
2. WHEN un consultorio es registrado exitosamente, THE Sistema SHALL crear un usuario Administrador inicial asociado a ese `clinic_id` y enviar las credenciales de acceso al correo electrónico proporcionado durante el registro.
3. THE Sistema SHALL incluir el `clinic_id` en todas las tablas de datos operativos y clínicos como clave de particionamiento lógico.
4. WHILE un usuario está autenticado, THE Sistema SHALL restringir todas las consultas y mutaciones de datos al `clinic_id` declarado en el JWT del usuario, aplicando esta restricción en la capa de base de datos mediante RLS.
5. IF una solicitud de acceso a datos no incluye un `clinic_id` válido en el JWT, THEN THE Sistema SHALL rechazar la solicitud con una respuesta de error que indique acceso denegado, sin exponer información sobre la existencia o estructura de otros consultorios.
6. THE Sistema SHALL permitir al Administrador actualizar el nombre (máximo 120 caracteres), dirección (máximo 255 caracteres), teléfono (entre 7 y 15 dígitos numéricos) y correo electrónico de contacto (formato válido, máximo 254 caracteres) del consultorio.
7. WHEN un usuario autenticado recupera los datos de su consultorio, THE Sistema SHALL retornar exactamente los mismos valores que fueron almacenados, sin alteración de ningún campo.
8. IF el formulario de registro de consultorio contiene campos obligatorios vacíos o con formato inválido, THEN THE Sistema SHALL rechazar el envío, indicar los campos con error y no crear ningún consultorio ni usuario hasta que todos los campos sean válidos.

---

### Requisito 2: Gestión de Usuarios y Roles

**Historia de usuario:** Como Administrador de un consultorio, quiero gestionar los usuarios de mi equipo y asignarles roles, para que cada persona acceda únicamente a las funciones que le corresponden según el principio de menor privilegio.

#### Criterios de Aceptación

1. THE Sistema SHALL soportar exactamente tres roles: `administrador`, `odontologo` y `recepcionista`.
2. WHEN el Administrador crea un usuario, THE Sistema SHALL asociar ese usuario al `clinic_id` del Administrador y asignarle exactamente un rol; IF el rol proporcionado no es uno de los tres válidos, THEN THE Sistema SHALL rechazar la creación con un mensaje de error que liste los roles aceptados.
3. IF un usuario con rol `odontologo` o `recepcionista` intenta crear, modificar o eliminar cuentas de otros usuarios, THEN THE Sistema SHALL rechazar la operación con una respuesta de acceso denegado y registrar el intento en el Registro_Auditoria.
4. IF un usuario autenticado intenta acceder a datos cuyo `clinic_id` no coincide con el `clinic_id` de su JWT, THEN THE Sistema SHALL rechazar la solicitud con una respuesta de acceso denegado, sin exponer la existencia ni el contenido de esos datos.
5. WHEN el Administrador desactiva un usuario, THE Sistema SHALL revocar la sesión activa de ese usuario en un plazo máximo de 60 segundos, rechazar cualquier solicitud en tránsito con token del usuario desactivado, e impedir nuevos inicios de sesión desde ese momento.
6. IF el Administrador intenta eliminar o desactivar el único usuario con rol `administrador` del consultorio, THEN THE Sistema SHALL rechazar la operación con un mensaje que indique que el consultorio debe conservar al menos un administrador activo.
7. WHEN un usuario con rol `administrador` u `odontologo` inicia sesión por primera vez tras la activación de su cuenta, THE Sistema SHALL redirigirlo al flujo de configuración de MFA antes de conceder acceso a cualquier funcionalidad del sistema.
8. IF un usuario abandona o falla el flujo de configuración de MFA, THEN THE Sistema SHALL cerrar la sesión activa e impedir el acceso hasta que el usuario complete la configuración de MFA en un inicio de sesión posterior.
9. WHEN un usuario completa la autenticación correctamente, THE Sistema SHALL emitir un JWT que incluye `clinic_id`, `user_id` y `role` como claims verificables.
10. THE Sistema SHALL aplicar políticas RLS para los roles `administrador`, `odontologo` y `recepcionista` en todas las operaciones SELECT, INSERT, UPDATE y DELETE de todas las tablas de negocio.

---

### Requisito 3: Autenticación y Control de Sesiones

**Historia de usuario:** Como usuario del sistema, quiero iniciar sesión de forma segura y que mi sesión expire automáticamente, para que mis credenciales y los datos del consultorio estén protegidos.

#### Criterios de Aceptación

1. THE Sistema SHALL gestionar la autenticación de usuarios exclusivamente a través de Supabase Auth.
2. WHEN un usuario introduce credenciales incorrectas cinco veces consecutivas desde la misma cuenta, THE Sistema SHALL bloquear los intentos de inicio de sesión para esa cuenta durante 15 minutos y enviar una notificación al correo del Administrador del consultorio correspondiente.
3. THE Sistema SHALL aplicar una política de contraseñas que requiera un mínimo de 10 caracteres, al menos una letra mayúscula, una minúscula, un dígito y un carácter especial; IF la contraseña proporcionada no cumple esta política, THEN THE Sistema SHALL rechazar el cambio e indicar los requisitos incumplidos.
4. WHEN una sesión está activa y no se registra interacción del usuario (clic, escritura o navegación) durante 30 minutos consecutivos, THE Sistema SHALL cerrar la sesión automáticamente y redirigir al usuario a la pantalla de inicio de sesión.
5. IF el token de sesión del usuario ha expirado o sido revocado, THEN THE Sistema SHALL redirigir al usuario a la pantalla de inicio de sesión, limpiar cualquier dato de sesión del navegador y no exponer datos en caché de la sesión anterior.
6. THE Sistema SHALL transmitir todas las comunicaciones entre el navegador y los servidores exclusivamente mediante HTTPS/TLS.
7. THE Sistema SHALL incluir los encabezados de seguridad HTTP `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options` y `Referrer-Policy` en todas las respuestas del servidor.

---

### Requisito 4: Gestión de Pacientes

**Historia de usuario:** Como Recepcionista u Odontólogo, quiero registrar, consultar y actualizar la información de los pacientes del consultorio, para disponer de sus datos personales, de contacto y antecedentes al momento de la atención.

#### Criterios de Aceptación

1. WHEN un usuario con rol `administrador`, `odontologo` o `recepcionista` registra un paciente, THE Sistema SHALL almacenar los datos bajo el `clinic_id` del usuario autenticado y confirmar el registro con el identificador único asignado al paciente.
2. THE Sistema SHALL requerir como campos obligatorios para el registro de un paciente: nombre completo (máximo 200 caracteres), número de documento de identidad (máximo 20 caracteres alfanuméricos), tipo de documento (de una lista predefinida), fecha de nacimiento (fecha válida, no futura), sexo biológico (de una lista predefinida) y al menos un número de contacto (entre 7 y 15 dígitos numéricos).
3. WHEN un usuario intenta registrar un paciente, THE Sistema SHALL verificar que el número de documento de identidad sea único dentro del mismo consultorio antes de confirmar el registro.
4. IF el número de documento de identidad ya existe para otro paciente en el mismo consultorio, THEN THE Sistema SHALL rechazar el registro con un mensaje que muestre el nombre completo y el identificador del paciente existente.
5. THE Sistema SHALL permitir registrar de forma opcional: correo electrónico (formato válido), dirección de residencia (máximo 255 caracteres), nombre del responsable o acudiente (máximo 200 caracteres), teléfono del responsable o acudiente (entre 7 y 15 dígitos numéricos) y antecedentes médicos relevantes (máximo 500 caracteres).
6. WHEN un usuario autorizado crea o actualiza datos de un paciente, THE Sistema SHALL registrar un Registro_Auditoria con `user_id`, `clinic_id`, `entity_type = 'paciente'`, `entity_id`, `action` (`create` o `update`) y `timestamp`.
7. WHEN un usuario ingresa al menos 2 caracteres en el campo de búsqueda de pacientes, THE Sistema SHALL retornar hasta 50 coincidencias ordenadas por nombre completo, filtrando por nombre completo o número de documento dentro del mismo consultorio, en un plazo máximo de 2 segundos para conjuntos de hasta 10 000 pacientes.
8. WHILE un usuario está autenticado, THE Sistema SHALL mostrar únicamente pacientes cuyo `clinic_id` coincide con el del JWT del usuario.

---

### Requisito 5: Gestión de Citas

**Historia de usuario:** Como Recepcionista u Odontólogo, quiero crear, consultar, reprogramar y cancelar citas, para gestionar eficientemente la agenda del consultorio sin conflictos de horario.

#### Criterios de Aceptación

1. WHEN un usuario intenta crear una cita, THE Sistema SHALL verificar que el odontólogo seleccionado no tenga otra cita en estado `programada`, `confirmada` o `en_curso` que se solape con la franja horaria solicitada antes de confirmar el registro.
2. IF el odontólogo seleccionado tiene un conflicto de horario en la franja solicitada, THEN THE Sistema SHALL rechazar la creación y mostrar las próximas tres franjas horarias disponibles del mismo odontólogo en el mismo día o en los días siguientes.
3. THE Sistema SHALL requerir como campos obligatorios para crear una cita: `paciente_id`, `odontologo_id`, fecha (no anterior a la fecha actual), hora de inicio, duración en minutos (mínimo 15, máximo 480) y motivo de consulta (máximo 500 caracteres).
4. WHEN un usuario reprograma una cita en estado `programada` o `confirmada`, THE Sistema SHALL verificar disponibilidad en la nueva franja horaria y, si no hay conflicto, actualizar el estado de la cita a `reprogramada` y registrar la nueva fecha y hora.
5. IF la franja horaria de reprogramación genera un conflicto con otra cita del mismo odontólogo, THEN THE Sistema SHALL rechazar la reprogramación con el mismo mecanismo de sugerencia de franjas disponibles del criterio 2.
6. WHEN un usuario cancela una cita, THE Sistema SHALL requerir un motivo de cancelación (máximo 255 caracteres), actualizar el estado a `cancelada`, y registrar el `user_id` que ejecutó la acción y el timestamp de cancelación.
7. THE Sistema SHALL soportar los estados de cita: `programada`, `confirmada`, `en_curso`, `completada`, `cancelada` y `reprogramada`.
8. WHEN la fecha y hora de inicio de una cita en estado `programada` o `confirmada` es alcanzada, THE Sistema SHALL actualizar el estado a `en_curso` de forma automática mediante una tarea programada o trigger del servidor.
9. WHEN un usuario visualiza la agenda, THE Sistema SHALL mostrar las citas en una vista de calendario con filtro por odontólogo y por rango de fechas, cargando las citas del rango seleccionado en un plazo máximo de 2 segundos.
10. WHEN un usuario autorizado crea, reprograma o cancela una cita, THE Sistema SHALL registrar un Registro_Auditoria con `user_id`, `clinic_id`, `entity_type = 'cita'`, `entity_id`, `action` (`create`, `reschedule` o `cancel`) y `timestamp`.
11. WHILE un usuario está autenticado, THE Sistema SHALL mostrar únicamente citas cuyo `clinic_id` coincide con el del JWT del usuario.

---

### Requisito 6: Historia Clínica Odontológica

**Historia de usuario:** Como Odontólogo, quiero registrar y consultar la historia clínica de cada paciente con trazabilidad completa, para documentar la atención de forma segura y cumplir con las obligaciones del acto médico.

#### Criterios de Aceptación

1. WHEN un Odontólogo registra la primera Entrada_Clinica de un paciente, THE Sistema SHALL crear automáticamente una Historia_Clínica asociada a ese paciente y consultorio; si la Historia_Clínica ya existe, THE Sistema SHALL agregar la entrada a la historia existente sin crear un duplicado.
2. WHEN un Odontólogo registra una Entrada_Clinica, THE Sistema SHALL almacenar: `odontologo_id`, `paciente_id`, `clinic_id`, `tipo` (uno de: `motivo_consulta`, `diagnostico`, `plan_tratamiento`, `procedimiento`, `evolucion`), `contenido` (máximo 5000 caracteres), `created_at` y un identificador único de la entrada.
3. WHEN una Entrada_Clinica es persistida exitosamente en la base de datos, THE Sistema SHALL tratar ese registro como inmutable: cualquier solicitud de UPDATE o DELETE directo sobre él será rechazada por la base de datos mediante políticas RLS y restricciones de tabla.
4. WHEN un Odontólogo necesita corregir una Entrada_Clinica existente, THE Sistema SHALL crear una nueva Entrada_Clinica con `tipo = 'correccion'` que referencia el `entry_id` original en un campo `corrige_a`, preservando el registro original sin modificación alguna.
5. WHEN un Odontólogo consulta la Historia_Clínica de un paciente, THE Sistema SHALL mostrar las entradas en orden cronológico ascendente por `created_at`, con cada entrada de corrección agrupada e inmediatamente posterior a la entrada que corrige.
6. WHEN se registra una Entrada_Clinica de tipo `correccion`, THE Sistema SHALL registrar un Registro_Auditoria con `entity_type = 'historia_clinica'`, `action = 'correccion'`, `entity_id` de la entrada original y el `entry_id` de la nueva entrada.
7. WHEN un Odontólogo adjunta archivos a una Entrada_Clinica, THE Sistema SHALL aceptar únicamente archivos de formato JPEG, PNG, PDF o DICOM, con un tamaño máximo de 20 MB por archivo y un máximo de 10 archivos por entrada; archivos que excedan estos límites o tengan formato inválido serán rechazados con un mensaje de error específico, sin descartar el contenido de texto ya redactado en la entrada.
8. WHEN un archivo válido es adjuntado a una Entrada_Clinica, THE Sistema SHALL almacenarlo en un bucket privado de Supabase Storage organizado por `clinic_id` y `paciente_id`, y generar una URL_Firmada con expiración máxima de 15 minutos para su visualización; IF la URL_Firmada ha expirado, THEN THE Sistema SHALL generar una nueva URL_Firmada al momento de la solicitud de visualización.
9. IF un usuario con rol `recepcionista` intenta crear, modificar o visualizar Entradas_Clinicas, THEN THE Sistema SHALL rechazar la operación con una respuesta de acceso denegado.
10. WHEN un Odontólogo consulta la Historia_Clínica de un paciente, THE Sistema SHALL retornar el historial completo en un plazo máximo de 3 segundos para historias de hasta 500 entradas, y en un plazo máximo de 8 segundos para historias que superen las 500 entradas.
11. IF se detecta un Conflicto_De_Concurrencia al guardar una Entrada_Clinica (el valor de `version` enviado por el cliente no coincide con el valor actual en la base de datos), THEN THE Sistema SHALL rechazar la escritura y mostrar al Odontólogo un mensaje en pantalla que indique el conflicto, sin descartar el contenido redactado, para que el Odontólogo revise y reintente.
12. THE Sistema SHALL tratar todos los datos de la Historia_Clínica como datos sensibles de salud, aplicando RLS para que solo el personal con rol `administrador` u `odontologo` del mismo consultorio pueda accederlos.

---

### Requisito 7: Odontograma Digital

**Historia de usuario:** Como Odontólogo, quiero registrar y consultar el estado de las piezas dentales de cada paciente en un odontograma digital, para documentar condiciones, diagnósticos y tratamientos de forma visual y estructurada.

#### Criterios de Aceptación

1. THE Sistema SHALL representar el odontograma con las 32 piezas dentales del adulto según la nomenclatura FDI (Federación Dental Internacional), organizadas en cuatro cuadrantes visibles simultáneamente en la interfaz.
2. WHEN un Odontólogo registra una condición en una pieza dental, THE Sistema SHALL almacenar: `pieza_id` (código FDI de dos dígitos), `superficie` (uno de: `oclusal`, `mesial`, `distal`, `vestibular`, `palatino_lingual`, `completa`), `estado` (uno de los estados predefinidos: `sano`, `caries`, `obturado`, `ausente`, `corona`, `endodoncia`, `extraccion_indicada`, `fractura`, o uno de los estados personalizados del consultorio hasta un máximo de 20 estados adicionales por consultorio), `odontologo_id`, `clinic_id`, `paciente_id`, `version` y `created_at`.
3. WHEN un Odontólogo modifica el estado de una pieza dental, THE Sistema SHALL generar un nuevo registro de estado preservando el registro anterior sin modificarlo, manteniendo el historial completo de cambios.
4. WHEN un Odontólogo consulta el odontograma de un paciente, THE Sistema SHALL mostrar el estado vigente de cada pieza y superficie derivado del registro con el `created_at` más reciente por combinación de `pieza_id` y `superficie`.
5. WHEN un Odontólogo registra o actualiza una pieza dental, THE Sistema SHALL permitir asociar un `tratamiento_propuesto` y un `tratamiento_realizado` por combinación de pieza y superficie, mostrándolos con etiquetas distintas y diferenciadas en la interfaz (por ejemplo, "Propuesto" y "Realizado").
6. IF se detecta un Conflicto_De_Concurrencia al guardar el estado de una pieza dental (el valor de `version` enviado por el cliente no coincide con el valor actual en la base de datos), THEN THE Sistema SHALL rechazar la escritura y mostrar un mensaje al Odontólogo que identifique la pieza dental en conflicto para que revise y reintente.
7. IF un usuario con rol `recepcionista` intenta crear o modificar registros del odontograma, THEN THE Sistema SHALL rechazar la operación con una respuesta de acceso denegado.
8. WHILE un usuario está autenticado, THE Sistema SHALL mostrar únicamente odontogramas cuyo `clinic_id` coincide con el del JWT del usuario.
9. WHEN el Sistema persiste o recupera el estado del odontograma, THE Sistema SHALL conservar con exactitud todos los valores de `pieza_id`, `superficie`, `estado`, `tratamiento_propuesto`, `tratamiento_realizado`, `odontologo_id`, `clinic_id`, `paciente_id` y `created_at` sin alteración de ningún campo.

---

### Requisito 8: Seguridad y Trazabilidad

**Historia de usuario:** Como Administrador del sistema, quiero que todas las operaciones estén protegidas por control de acceso granular y queden registradas en un log de auditoría, para garantizar la confidencialidad, integridad y trazabilidad de los datos clínicos.

#### Criterios de Aceptación

1. THE Sistema SHALL aplicar políticas RLS en todas las tablas de negocio de la base de datos para las operaciones SELECT, INSERT, UPDATE y DELETE, de modo que estas restricciones sean validadas en la capa de base de datos independientemente de la lógica de la aplicación.
2. THE Sistema SHALL nunca incluir la `service_role_key` de Supabase en el código fuente del cliente ni en variables de entorno que sean accesibles desde el navegador.
3. THE Sistema SHALL almacenar todas las variables de entorno sensibles (claves de API, secretos JWT, credenciales de base de datos) exclusivamente en la configuración del servidor de Vercel, inaccesibles desde el cliente.
4. WHEN un usuario realiza una operación de creación, actualización, cancelación o corrección sobre una entidad de tipo `consultorio`, `usuario`, `paciente`, `cita`, `historia_clinica` u `odontograma`, THE Sistema SHALL crear un Registro_Auditoria con los campos: `id`, `clinic_id`, `user_id`, `role`, `entity_type`, `entity_id`, `action`, `timestamp` y `result` (`success` o `failure`).
5. IF cualquier usuario, incluido el `administrador` del consultorio, intenta ejecutar una operación UPDATE o DELETE sobre un registro de Registro_Auditoria, THEN THE Sistema SHALL rechazar la operación mediante restricciones de RLS y retornar una respuesta de acceso denegado.
6. WHEN el Sistema genera una URL_Firmada para acceso a un archivo en Storage, THE Sistema SHALL establecer un tiempo de expiración máximo de 15 minutos; IF una solicitud de acceso a un archivo presenta una URL_Firmada expirada, THEN THE Sistema SHALL rechazar el acceso y retornar un mensaje de error que indique que el enlace ha vencido.
7. WHEN el Sistema detecta pérdida de conexión de red en el cliente, THE Sistema SHALL mostrar una barra de notificación persistente con el texto "Sin conexión" en la parte superior de la interfaz y deshabilitar todos los controles que inicien operaciones de escritura hasta que la conexión sea reestablecida.
8. IF una operación de escritura no recibe respuesta exitosa del servidor, THEN THE Sistema SHALL no confirmar visualmente la operación como exitosa y mantener el formulario con los datos ingresados por el usuario para permitir el reintento.
9. THE Sistema SHALL no persistir datos de Historia_Clínica ni de Odontograma en el almacenamiento local del dispositivo (localStorage, IndexedDB o caché del service worker).

---

### Requisito 9: Reportes Operativos Básicos

**Historia de usuario:** Como Administrador u Odontólogo, quiero consultar reportes básicos sobre pacientes atendidos y estados de citas, para monitorear la operación del consultorio.

#### Criterios de Aceptación

1. WHEN un usuario con rol `administrador` u `odontologo` solicita el reporte de pacientes atendidos, THE Sistema SHALL mostrar el número total de citas con estado `completada` dentro del rango de fechas seleccionado, con opción de filtrar por odontólogo, utilizando únicamente datos del `clinic_id` del usuario autenticado.
2. WHEN un usuario con rol `administrador` u `odontologo` solicita el reporte de estado de citas, THE Sistema SHALL mostrar la distribución de citas agrupadas por estado (`programada`, `confirmada`, `completada`, `cancelada`, `reprogramada`) para el rango de fechas seleccionado, dentro del mismo consultorio del usuario autenticado.
3. WHEN un usuario solicita un reporte con un rango de fechas de hasta 12 meses, THE Sistema SHALL retornar los datos en un plazo máximo de 5 segundos; IF el rango solicitado supera 12 meses, THEN THE Sistema SHALL rechazar la solicitud e indicar al usuario el límite máximo permitido.
4. IF la consulta del reporte falla por error del servidor, THEN THE Sistema SHALL mostrar un mensaje de error al usuario e indicar que puede reintentar la operación.
5. IF un usuario con rol `recepcionista` intenta acceder a los reportes operativos, THEN THE Sistema SHALL rechazar la solicitud con una respuesta de acceso denegado.
6. WHILE un usuario está autenticado, THE Sistema SHALL generar los reportes exclusivamente con datos del `clinic_id` declarado en el JWT del usuario.

---

### Requisito 10: Estrategia de Conectividad y Sincronización

**Historia de usuario:** Como usuario del sistema en Cúcuta, quiero que el sistema detecte problemas de conectividad y me impida confirmar operaciones no enviadas, para evitar pérdida o inconsistencia de datos clínicos ante fallas de red.

#### Criterios de Aceptación

1. WHEN el Sistema detecta pérdida de conexión a Internet, THE Sistema SHALL mostrar una barra de notificación persistente con el texto "Sin conexión" en la parte superior de la interfaz y deshabilitar todos los controles que inicien operaciones de escritura.
2. WHEN la conexión a Internet es reestablecida, THE Sistema SHALL ocultar la barra de notificación de "Sin conexión", mostrar brevemente una notificación de "Conectado" y volver a habilitar los controles de escritura.
3. WHEN un usuario intenta iniciar sesión, THE Sistema SHALL verificar la disponibilidad del servidor antes de procesar las credenciales; IF el servidor no está disponible, THEN THE Sistema SHALL mostrar un mensaje que indique que el servicio no está disponible en este momento e impedir el avance en el flujo de autenticación.
4. IF una operación de escritura no recibe respuesta del servidor en un plazo de 10 segundos, THEN THE Sistema SHALL marcar la operación como fallida, mostrar al usuario un mensaje de error con la opción de reintentar manualmente, y conservar los datos ingresados en el formulario.
5. WHEN el Sistema detecta que el valor de `version` enviado por el cliente no coincide con el valor actual en la base de datos para un registro de Historia_Clínica u Odontograma, THE Sistema SHALL rechazar la escritura y mostrar al usuario un mensaje que identifique el registro en conflicto y le indique que recargue y revise antes de reintentar.
6. IF el Sistema no recibe respuesta exitosa del servidor para una operación de escritura, THEN THE Sistema SHALL no mostrar ningún indicador visual de éxito para esa operación y mantener el estado anterior de la interfaz.
