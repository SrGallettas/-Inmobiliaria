# Lumera — Inmobiliaria React

Aplicación inmobiliaria construida con React y Supabase. El proyecto se desarrolla por etapas para aprender una estructura real: componentes reutilizables, rutas, autenticación, base de datos, almacenamiento privado, seguridad RLS, tiempo real y pruebas.

## Estado actual

Lumera permite que una única cuenta de cliente pueda buscar viviendas para comprar o alquilar, guardar favoritos, gestionar su perfil y mantener conversaciones privadas relacionadas con una propiedad.

No existen roles separados de comprador, vendedor o inquilino: son acciones que puede realizar la misma persona. El campo técnico `role` se conserva únicamente para incorporar administración más adelante.

### Funcionalidades terminadas

- Inicio, catálogo y ficha detallada de cada propiedad.
- Filtros por operación, ubicación, tipo, precio y dormitorios.
- Ordenación y filtros guardados en la URL.
- Galería, propiedades relacionadas y favoritos locales.
- Registro con nickname único, correo y contraseña segura.
- Confirmación de correo electrónico.
- Inicio de sesión mediante correo o nickname.
- Recuperación y cambio seguro de contraseña mediante correo.
- Sesión persistente y rutas protegidas.
- Perfil editable con nombre, teléfono, nickname y avatar.
- Avatar almacenado en Supabase Storage.
- Chat privado asociado a usuario y propiedad.
- Bandeja de entrada con último mensaje y mensajes pendientes.
- Mensajes actualizados en tiempo real sin recargar.
- Fotografías y vídeos privados dentro del chat.
- Estados de propiedades: disponible, reservada, vendida y retirada.
- Cierre y reapertura automática de conversaciones según el estado.
- Diseño responsive, accesibilidad básica, SEO y página 404.
- Pruebas automatizadas, lint y compilación de producción.
- Pruebas E2E del flujo público en Chrome para escritorio y móvil.

## Decisiones de producto

### Un único tipo de cliente

Una cuenta puede:

- Comprar o alquilar una vivienda.
- Vender una vivienda en una fase posterior.
- Guardar favoritos.
- Contactar con Lumera.
- Acordar una visita dentro del chat.
- Gestionar su perfil y seguridad.

Por ahora no hay agentes ni vendedores separados en la interfaz. El panel interno para que el equipo de Lumera gestione propiedades y responda conversaciones queda aplazado.

### Visitas mediante chat

No se utiliza un formulario independiente de visitas en la ficha:

```text
Ficha de la vivienda
        ↓
Contactar sobre esta propiedad
        ↓
Conversación privada con Lumera
        ↓
Preguntas, fotografías, vídeos y acuerdo de visita
```

### Estados de una propiedad

| Estado | Se muestra | Permite conversar |
|---|---|---|
| `available` | Catálogo y ficha | Sí |
| `reserved` | Catálogo con etiqueta «Reservada» | Sí |
| `sold` | Fuera del catálogo; ficha e historial conservados | No |
| `removed` | Fuera del catálogo; ficha e historial conservados | No |

Al pasar una vivienda a `sold` o `removed`, sus conversaciones se cierran pero el historial se conserva. Si fue un error o el comprador se retira, al cambiarla de nuevo a `available` o `reserved`:

- La vivienda vuelve automáticamente al catálogo como disponible o reservada.
- Las conversaciones anteriores se reabren.
- El cliente puede continuar hablando en el mismo chat.
- La bandeja y el chat reciben el cambio mediante Supabase Realtime.

No conviene borrar físicamente una propiedad. Se debe utilizar `removed` para conservar conversaciones y referencias.

### Propiedades retiradas y favoritos

Una publicación retirada no es lo mismo que una propiedad eliminada físicamente:

```text
Disponible → aparece públicamente en el catálogo
Retirada   → se oculta del catálogo, pero se conserva internamente
Eliminada  → borrado físico definitivo, reservado para casos administrativos
```

El estado `removed` funciona como un **borrado lógico**. La propiedad continúa en la base de datos para no romper favoritos, conversaciones, fotografías ni referencias históricas, pero deja de aparecer en el catálogo público y ya no permite enviar mensajes.

Si una propiedad guardada en favoritos cambia de estado:

- `available`: permanece visible y permite contactar.
- `reserved`: permanece visible con la etiqueta «Reservada» y permite contactar.
- `sold`: permanece en favoritos con la etiqueta «Vendida», pero no permite contactar.
- `removed`: permanece en favoritos con la etiqueta «Publicación retirada», pero no permite contactar.
- Si vuelve a `available`, recupera automáticamente su comportamiento normal.
- El usuario puede quitarla manualmente de favoritos en cualquier momento.

Las propiedades vendidas o retiradas no deben desaparecer silenciosamente de favoritos, porque el usuario podría pensar que se ha producido un error. En una mejora posterior, la página de favoritos las separará visualmente:

```text
Tus favoritos disponibles
├── Viviendas disponibles
└── Viviendas reservadas

Ya no disponibles
├── Viviendas vendidas
└── Publicaciones retiradas
```

Las publicaciones no disponibles aparecerán al final y con un estilo visual atenuado, conservando siempre su contexto y permitiendo eliminarlas manualmente de favoritos.

## Estructura principal

```text
inmobiliaria-react/
├── public/                         # Archivos públicos
├── src/
│   ├── assets/                     # Imágenes y recursos locales
│   ├── auth/                       # Contexto y acceso a la sesión
│   ├── components/                 # Componentes reutilizables
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Filters/
│   │   ├── PropertyCard/
│   │   ├── PropertyGallery/
│   │   ├── PropertyGrid/
│   │   ├── ProtectedRoute/
│   │   └── ...
│   ├── data/                       # Catálogo local de respaldo
│   ├── layouts/                    # Estructura común de las páginas
│   ├── lib/                        # Cliente de Supabase
│   ├── pages/
│   │   ├── AuthPages/             # Registro, acceso, cuenta y contraseña
│   │   ├── ChatPage/              # Conversación de una propiedad
│   │   ├── InboxPage/             # Bandeja de entrada
│   │   ├── HomePage/
│   │   ├── PropertiesPage/
│   │   ├── PropertyDetailPage/
│   │   └── ...
│   ├── services/                   # Consultas a Supabase
│   ├── test/                       # Configuración de Vitest
│   ├── utils/                      # Validaciones, filtros y almacenamiento
│   ├── App.jsx                     # Rutas y estado compartido
│   └── main.jsx                    # Entrada de React
├── supabase/
│   ├── functions/                 # Edge Function para login por nickname
│   └── migrations/                # Tablas, políticas RLS, Storage y Realtime
├── test/                           # Pruebas de lógica con Node
├── .env.example
├── package.json
└── vite.config.js
```

### Por qué se organiza así

- `components`: piezas que pueden utilizarse en varias páginas.
- `pages`: pantallas asociadas a una ruta.
- `services`: comunicación con Supabase; evita mezclar consultas con la interfaz.
- `auth`: sesión y usuario disponibles para toda la aplicación.
- `utils`: funciones independientes fáciles de probar.
- `supabase/migrations`: historial reproducible de cambios de base de datos.

## Configuración local

Requisitos:

- Node.js 22 o compatible con Vite 8.
- npm.
- Un proyecto de Supabase.

Instalación:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Variables necesarias:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publicable
```

Vite mostrará normalmente `http://localhost:5173`.

## Supabase

Las migraciones deben ejecutarse en orden desde el SQL Editor:

1. `20261015150000_create_properties.sql`
2. `20261015153000_add_property_details.sql`
3. `20261021130000_create_requests.sql`
4. `20261026190000_create_profiles.sql`
5. `20261026200000_add_usernames_and_avatars.sql`
6. `20261026210000_fix_avatar_upsert_policy.sql`
7. `20261026220000_create_client_chat.sql`
8. `20261026223000_add_chat_attachments.sql`
9. `20261026230000_add_inbox_and_listing_status.sql`
10. `20261026233000_enable_chat_realtime.sql`
11. `20261026234500_lock_unavailable_listings.sql`
12. `20261026235000_reopen_available_conversations.sql`
13. `20261028123000_send_chat_attachment_atomically.sql`
14. `20261028130000_create_conversations_server_side.sql`
15. `20261028133000_harden_chat_media_isolation.sql`
16. `20261028140000_enforce_unavailable_chat_lock.sql`
17. `20261028143000_reopen_property_conversations_safely.sql`
18. `20261028150000_optimize_client_inbox.sql`

La Edge Function `login-with-username` resuelve un nickname a su cuenta sin exponer correos privados. Debe estar desplegada y disponer de `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` como secretos del servidor.

### Storage

- `avatars`: fotografías de perfil.
- `chat-media`: imágenes y vídeos privados del chat.
- Los archivos del chat no caducan después de una hora.
- Caduca únicamente la URL firmada y la aplicación genera otra cuando es necesario.
- Tamaño máximo actual: 50 MB.
- Imágenes admitidas: JPG, PNG y WebP.
- Vídeos admitidos: MP4, WebM y MOV.

### Seguridad

Las políticas RLS garantizan que:

- Cada usuario solo modifica su perfil.
- El nickname es único.
- Cada cliente solo consulta sus conversaciones.
- No se puede falsificar el remitente de un mensaje.
- No se crean conversaciones nuevas para anuncios vendidos o retirados.
- No se envían mensajes mientras una conversación está cerrada.
- Volver a disponible o reservada reabre la conversación y publica de nuevo la vivienda.
- Los adjuntos pertenecen a conversaciones autorizadas.

## Comandos

```bash
npm run dev              # Desarrollo
npm run lint             # Análisis estático
npm test                 # Todas las pruebas
npm run test:logic       # Pruebas independientes
npm run test:components  # Pruebas React y servicios
npm run test:db          # Seguridad y funciones SQL (requiere Supabase local)
npm run test:e2e         # Recorridos reales en Chrome con Playwright
npm run test:watch       # Vitest en modo observación
npm run build            # Build de producción
npm run preview          # Vista previa del build
```

Antes de cerrar una etapa:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

Las pruebas E2E arrancan Vite en modo `e2e`, fuerzan el catálogo local y no utilizan las credenciales de `.env.local`. Playwright dirige el Chrome instalado para comprobar filtros, detalle, favoritos persistentes, rutas protegidas, validación de acceso, páginas legales y 404 en escritorio y móvil.

Las pruebas de base de datos utilizan pgTAP y se ejecutan contra un Supabase local aislado:

```bash
supabase start
supabase db reset
npm run test:db
```

`supabase db reset` reconstruye únicamente la base local, aplica todas las migraciones y no modifica el proyecto alojado. La CLI necesita Docker u otro motor compatible para iniciar los servicios.

## Prueba manual recomendada

1. Registrar una cuenta y confirmar su correo.
2. Entrar mediante correo y mediante nickname.
3. Editar perfil y subir avatar.
4. Abrir una propiedad disponible e iniciar una conversación.
5. Enviar texto, una imagen y un vídeo.
6. Abrir otra pestaña y comprobar la actualización sin recargar.
7. Revisar que la conversación aparece en `Mensajes`.
8. Cambiar la propiedad a `sold` y comprobar que el chat se cierra.
9. Cambiarla a `available` y comprobar que se reabre.
10. Solicitar un cambio de contraseña y verificar el correo.

Ejemplo para cambiar el estado:

```sql
update public.properties
set listing_status = 'sold'
where id = 1;

update public.properties
set listing_status = 'available'
where id = 1;
```

## Situación pendiente

- Los favoritos todavía se guardan en `localStorage`, no por cuenta.
- No existe panel interno para responder como Lumera; esta etapa está aplazada.
- No existe gestión visual de propiedades; los estados se cambian mediante SQL.
- No existe todavía el formulario para solicitar la publicación o venta de una vivienda.
- No hay notificaciones por correo o push para mensajes nuevos.
- Falta ejecutar E2E de autenticación y chat contra un Supabase local o de pruebas.
- El despliegue público definitivo aún no está configurado.
- Las imágenes del catálogo siguen procediendo principalmente de URLs externas.
- El enlace de Instagram es provisional.

## Próxima etapa recomendada

### Integración E2E con Supabase y preparación de despliegue

Los recorridos públicos ya se ejecutan en Chrome. El siguiente paso es preparar un Supabase aislado para comprobar:

1. Registro, confirmación y acceso reales.
2. Creación y continuidad de una conversación.
3. Adjuntos privados y políticas RLS.
4. Venta, cierre y reapertura mediante cambios de base de datos.
5. Recuperación ante desconexiones.
6. Ejecución de E2E y pruebas SQL en CI.

Después: favoritos por cuenta, solicitud de publicación, notificaciones, optimización de imágenes y mapas. El panel interno se retomará solo cuando forme parte del alcance deseado.

## Forma de trabajo

Cada etapa debe terminar con:

1. Objetivo claro.
2. Migración y políticas de seguridad si hay datos nuevos.
3. Interfaz pequeña y comprensible.
4. Pruebas automatizadas.
5. Prueba manual.
6. Lint y build.
7. README actualizado.
8. Commit descriptivo y subida a Git cuando esté comprobado.

## Documentación oficial

- [React](https://react.dev/learn)
- [React Router](https://reactrouter.com/)
- [Vite](https://vite.dev/guide/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supabase](https://supabase.com/docs)
