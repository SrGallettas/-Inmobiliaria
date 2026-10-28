# Hoja de ruta: usuarios y chat inmobiliario

## Objetivo

Transformar Lumera en una aplicación donde cualquier cliente pueda comprar, alquilar o vender y contactar con Lumera desde una conversación asociada a una propiedad.

En cada ficha aparecerá el botón:

```text
Contactar sobre esta propiedad
```

Al pulsarlo:

- Si el usuario no ha iniciado sesión, se le pedirá registrarse o entrar.
- Si ya tiene una cuenta, se abrirá una conversación asociada a esa propiedad.
- El usuario podrá escribir libremente el primer mensaje.
- No se enviará ningún mensaje automáticamente.

El campo de texto mostrará este ejemplo como `placeholder`:

```text
Hola, me interesa esta propiedad. ¿Sigue disponible?
```

El placeholder solo sirve como orientación: no se guarda ni se envía.

## Usuarios de la primera versión

En la primera versión habrá un único tipo de cuenta visible: el cliente. Una misma persona puede comprar, alquilar y vender, por lo que esas acciones no se modelarán como roles.

### Cliente

Podrá:

- Crear una cuenta.
- Iniciar y cerrar sesión.
- Recuperar su contraseña.
- Contactar con Lumera sobre una propiedad.
- Consultar sus conversaciones.
- Enviar y recibir mensajes.
- Guardar favoritos asociados a su cuenta.

La atención por parte de empleados y la administración se incorporarán más adelante. El campo `role` se conserva internamente para esa ampliación, pero no condicionará las acciones de comprar, alquilar o vender.

## Fase 1: autenticación de usuarios

### Objetivo

Permitir que una persona pueda registrarse, iniciar sesión y cerrar sesión utilizando Supabase Auth.

### Funcionalidades

- Página de registro.
- Página de inicio de sesión.
- Cierre de sesión.
- Recuperación de contraseña.
- Estado de sesión persistente.
- Mensajes claros de error y confirmación.
- Navegación adaptada al estado del usuario.

La cabecera mostrará:

```text
Sin sesión:
[Entrar] [Crear cuenta]

Con sesión:
[Mi cuenta] [Cerrar sesión]
```

### Datos del registro

Inicialmente solicitaremos:

- Nombre.
- Correo electrónico.
- Contraseña.
- Confirmación de contraseña.
- Aceptación de la política de privacidad.

No pediremos teléfono ni fotografía durante el registro. Se podrán completar posteriormente desde el perfil.

### Aprendizajes

- Qué es la autenticación.
- Diferencia entre usuario y sesión.
- Cómo funciona Supabase Auth.
- Cómo proteger una ruta.
- Cómo mantener una sesión al recargar.
- Cómo tratar errores sin revelar información sensible.

### Criterios para completar la fase

- El usuario puede registrarse.
- Puede verificar su correo si está activada la confirmación.
- Puede iniciar sesión.
- La sesión sobrevive a una recarga.
- Puede cerrar sesión.
- Puede solicitar recuperación de contraseña.
- Las pruebas y el build funcionan.

## Fase 2: perfiles

### Objetivo

Guardar información adicional de cada cliente. Comprar, alquilar y vender son acciones de una misma cuenta, no roles distintos.

### Tabla `profiles`

```text
profiles
├── id
├── full_name
├── phone
├── avatar_url
├── role
├── created_at
└── updated_at
```

El campo `id` estará relacionado con el usuario de Supabase Auth.

El campo técnico `role` queda reservado para una futura zona de administración, pero todas las cuentas creadas desde la web son clientes.

### Seguridad

- Cada usuario podrá consultar y actualizar su propio perfil.
- El usuario no podrá modificar su campo técnico `role`.
- El rol deberá controlarse desde la base de datos.
- No se guardarán contraseñas en `profiles`.

### Aprendizajes

- Relación uno a uno entre tablas.
- Claves externas.
- Políticas RLS.
- Diferencia entre autenticación y autorización.

### Criterios para completar la fase

- Cada nuevo usuario recibe un perfil.
- El usuario puede editar su nombre y teléfono.
- El rol no puede modificarse desde el navegador.
- Ningún usuario puede editar perfiles ajenos.

## Fase 3: preparar la experiencia del cliente

### Objetivo

Consolidar la zona personal y preparar el inicio de conversaciones desde una propiedad, sin asignar agentes en esta fase.

### Interfaz

En la ficha aparecerá una acción como:

```text
[Contactar sobre esta propiedad]
```

### Criterios para completar la fase

- Cualquier cuenta puede comprar, alquilar o vender.
- El botón de contacto conserva la propiedad de origen.
- Un visitante sin sesión vuelve a la propiedad después de entrar.

## Fase 4: crear conversaciones

### Objetivo

Abrir una conversación privada entre un cliente y Lumera sobre una propiedad.

### Tabla `conversations`

```text
conversations
├── id
├── property_id
├── user_id
├── property_title (copia de seguridad)
├── property_image (copia de seguridad)
├── property_status
├── status
├── created_at
└── updated_at
```

Estados iniciales:

```text
open
closed
```

### Comportamiento del botón

Al pulsar `Contactar con el vendedor`:

1. Se comprueba si existe una sesión.
2. Si no existe, se muestra la pantalla de acceso.
3. Después de entrar, el usuario regresa a la misma propiedad.
4. Se busca una conversación existente sobre esa propiedad.
5. Si ya existe, se abre.
6. Si no existe, se crea una nueva.

Evitaremos crear varias conversaciones iguales entre el mismo cliente y la misma propiedad.

### Criterios para completar la fase

- Solo los usuarios autenticados pueden crear conversaciones.
- Una conversación siempre pertenece al cliente que la inició y conserva los datos básicos de la propiedad.
- No se crean conversaciones duplicadas.
- Un usuario no puede abrir conversaciones en nombre de otra persona.

## Fase 5: mensajes del chat

### Objetivo

Permitir escribir, guardar y consultar mensajes.

### Tabla `messages`

```text
messages
├── id
├── conversation_id
├── sender_id
├── content
├── read_at
└── created_at
```

### Interfaz del chat

La pantalla mostrará:

- Fotografía y título de la propiedad.
- Identidad de Lumera como interlocutor.
- Historial de mensajes.
- Hora de cada mensaje.
- Campo para escribir.
- Botón de enviar.

Placeholder:

```text
Hola, me interesa esta propiedad. ¿Sigue disponible?
```

El campo estará inicialmente vacío. El mensaje de ejemplo no se enviará hasta que el usuario lo escriba voluntariamente.

### Validaciones

- El mensaje no puede estar vacío.
- Se eliminarán espacios innecesarios.
- Habrá una longitud máxima.
- El botón se desactivará mientras se envía.
- Se evitarán envíos repetidos por doble clic.
- Se mostrará un error si falla la conexión.

### Seguridad RLS

En esta primera etapa, solo el cliente propietario de la conversación puede leerla y escribir desde la web pública. La futura interfaz interna de Lumera tendrá sus propias políticas de acceso.

Además:

- `sender_id` deberá coincidir con el usuario autenticado.
- Nadie podrá consultar mensajes de conversaciones ajenas.
- Las reglas estarán en PostgreSQL, no solamente en React.

### Criterios para completar la fase

- El cliente puede enviar mensajes y el historial queda preparado para recibir respuestas de Lumera.
- Los mensajes persisten después de recargar.
- Los mensajes aparecen en orden.
- No se pueden leer conversaciones ajenas.
- No se pueden falsificar remitentes.

## Fase 6: mensajes en tiempo real

### Objetivo

Mostrar nuevos mensajes sin tener que recargar la página.

Utilizaremos Supabase Realtime:

```text
Usuario envía un mensaje
          ↓
PostgreSQL lo almacena
          ↓
Supabase comunica el cambio
          ↓
El otro participante lo ve
```

### Funcionalidades

- Recepción inmediata de mensajes.
- Actualización de la conversación abierta.
- Contador de mensajes pendientes.
- Estado leído o no leído.
- Ordenación por última actividad.

### Criterios para completar la fase

- La conversación y la bandeja reaccionan a cambios realizados desde otra sesión autorizada.
- Los mensajes aparecen sin recargar.
- El contador se actualiza correctamente.
- Las suscripciones se cierran al abandonar el chat.

## Fase 7: bandeja de conversaciones

### Objetivo

Crear una zona llamada `Mensajes`.

Cada conversación mostrará:

- Fotografía de la propiedad.
- Nombre de la propiedad.
- Estado de la propiedad.
- Último mensaje.
- Fecha de última actividad.
- Número de mensajes sin leer.
- Estado de la conversación.

El cliente verá todas las propiedades sobre las que ha preguntado. La bandeja interna del equipo de Lumera se construirá en una etapa posterior.

### Criterios para completar la fase

- Las conversaciones se ordenan por actividad.
- Se distinguen mensajes leídos y pendientes.
- Se puede abrir una conversación desde la bandeja.
- Se puede volver desde el chat a la ficha del inmueble.

## Fase 8: integrar las visitas en el chat

### Objetivo

Convertir la solicitud de visita en parte de la conversación.

El cliente podrá proponer:

- Fecha.
- Franja horaria.
- Mensaje adicional.

El equipo de Lumera podrá, cuando exista su interfaz interna:

- Aceptar.
- Proponer otra fecha.
- Rechazar.
- Marcar la visita como realizada o cancelada.

Más adelante podremos crear una tabla específica:

```text
visit_proposals
├── id
├── conversation_id
├── proposed_by
├── proposed_date
├── time_slot
├── status
├── created_at
└── updated_at
```

Estados posibles:

```text
pending
accepted
rejected
cancelled
completed
```

Esta fase sustituirá progresivamente el formulario independiente de visitas.

## Fase 9: favoritos asociados a la cuenta

### Objetivo

Sincronizar los favoritos entre dispositivos.

Crearemos:

```text
favorites
├── user_id
├── property_id
└── created_at
```

Al iniciar sesión:

1. Se leen los favoritos locales.
2. Se combinan con los favoritos de Supabase.
3. Se guardan los que falten.
4. A partir de entonces quedan asociados a la cuenta.

## Fase 10: mejoras posteriores

Una vez terminado el sistema básico podremos valorar:

- Notificaciones por correo.
- Notificaciones push.
- Indicador «está escribiendo».
- Vista previa y compresión de archivos adjuntos.
- Bloqueo y denuncia de usuarios.
- Archivado de conversaciones.
- Notas privadas para administración.
- Panel de administración.
- Estadísticas de interés por propiedad.
- Eliminación o anonimización de conversaciones.
- Publicación directa por propietarios particulares.

## Principios de desarrollo

Cada fase deberá incluir:

1. Explicación del concepto.
2. Diseño de la base de datos.
3. Implementación pequeña.
4. Políticas de seguridad.
5. Pruebas automatizadas.
6. Prueba manual.
7. Compilación de producción.
8. Actualización de la documentación.
9. Un commit independiente.

No comenzaremos una fase nueva hasta comprobar que la anterior funciona.

## Primer paso

Comenzaremos exclusivamente por la fase 1:

```text
Registro
Inicio de sesión
Persistencia de sesión
Cierre de sesión
Recuperación de contraseña
```

Todavía no crearemos conversaciones ni mensajes. Primero necesitamos una identidad segura para saber quién envía y recibe cada mensaje.
