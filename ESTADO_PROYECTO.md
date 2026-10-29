# Estado actual de Lumera

Última actualización: 29 de octubre de 2026.

Este documento sirve como punto de continuación. No contiene claves, tokens ni información sensible.

## Resumen

Lumera es una aplicación inmobiliaria React conectada a Supabase. Actualmente dispone de catálogo, autenticación, favoritos, formularios de contacto y visita, mensajería privada y un asistente flotante para buscar viviendas.

El proyecto está cerca de un MVP de demostración o portfolio. Todavía no se considera una aplicación pública de producción porque falta elegir el proveedor definitivo de IA, publicar el frontend, configurar el dominio y realizar la revisión legal final.

## Asistente inmobiliario

Flujo actual:

1. El usuario escribe en el chat flotante.
2. React envía el mensaje a la Edge Function `assistant-search` de Supabase.
3. La Edge Function intenta obtener filtros estructurados mediante Gemini.
4. React aplica esos filtros al catálogo real.
5. Si Gemini o la conexión fallan, se utiliza automáticamente el buscador local por reglas.

### Funcionalidades terminadas

- Chat flotante disponible desde todas las páginas.
- Abierto inicialmente, minimizable y adaptado a móvil.
- Resultados mediante tarjetas compactas de propiedades.
- Mensajes de espera y error.
- Longitud máxima de 500 caracteres.
- Contexto entre mensajes basado únicamente en filtros inmobiliarios.
- Botón `Nueva` para borrar el contexto y empezar otra búsqueda.
- Interruptor para activar o desactivar la IA.
- Preferencia del interruptor guardada en el navegador.
- Respaldo local cuando la IA no está disponible.
- Filtros de operación, ciudad, tipo, precio máximo, dormitorios mínimos, baños mínimos y superficie mínima.
- Validación de los filtros tanto en Supabase como en React.

### Limitación conocida pendiente

Los filtros de dormitorios y baños se interpretan actualmente como mínimos. Por ejemplo, `2 baños` significa `2 o más`, por lo que una vivienda con 3 baños también puede aparecer.

La mejora propuesta, pero **no implementada**, es diferenciar:

- `con 2 baños`, `solo 2 baños` o `exactamente 2 baños`: valor exacto.
- `mínimo 2 baños` o `al menos 2 baños`: valor mínimo.

Esta mejora deberá añadirse tanto al esquema de IA como al buscador local, al servicio React y a sus pruebas. Se inició durante una conversación, pero se revirtió por petición del usuario para mantener el estado estable.

## Seguridad y control de uso

### Límite de solicitudes

Está desplegado un límite de 10 solicitudes por minuto por visitante. La dirección de red se transforma en un hash antes de utilizarse y no se guarda la IP original.

Objetivo: evitar abuso y proteger la cuota del proveedor de IA.

### CORS

La Edge Function permite actualmente estos orígenes locales:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:4173`

Los demás orígenes del navegador se bloquean. Cuando se publique la web se deberá guardar el dominio definitivo en el secreto `ALLOWED_ORIGINS` de Supabase y volver a desplegar la función.

### Métricas anónimas

La tabla `assistant_usage_events` registra:

- Resultado técnico de la petición.
- Modelo utilizado.
- Duración en milisegundos.
- Si fue necesario reintentar.
- Fecha.

No registra el mensaje, los filtros, la respuesta de la IA, el nombre del usuario ni su IP.

La tabla conserva la infraestructura para limpiar métricas antiguas a los 90 días. La ejecución periódica de esa limpieza todavía debe programarse.

## Proveedor de IA

### Estado actual

- Gemini está conectado mediante el secreto `GEMINI_API_KEY` de Supabase.
- La clave nunca se envía al navegador.
- Modelo configurado por defecto: `gemini-3.1-flash-lite`.
- La Edge Function está desplegada en el proyecto Supabase `raurhazeqkgqdccjljfr`.
- Las pruebas reales han demostrado que Supabase recibe la solicitud, pero Gemini puede devolver errores temporales de disponibilidad. En ese caso funciona el respaldo local.

### Decisión pendiente

Se está considerando sustituir Gemini por la API de OpenAI para buscar mayor estabilidad y calidad. Este cambio **todavía no se ha realizado**.

Importante: ChatGPT Plus y OpenAI API tienen facturación separada. Para Lumera se necesita saldo o facturación en la plataforma API, no necesariamente una suscripción ChatGPT Plus.

Antes de cambiar el proveedor se debe:

1. Crear una clave de OpenAI API.
2. Guardarla como secreto de Supabase, nunca en React ni en este repositorio.
3. Elegir un modelo económico adecuado para extraer filtros.
4. Adaptar la llamada de la Edge Function manteniendo el mismo esquema estructurado.
5. Ejecutar pruebas reales y observar coste y estabilidad.

## Catálogo y filtros

- El catálogo remoto contiene 40 propiedades: 16 iniciales y 24 viviendas adicionales de demostración.
- Se añadieron propiedades de Sevilla, Bilbao y Granada.
- Los filtros visibles permiten operación, ubicación, tipo, precio mínimo y máximo, dormitorios mínimos, baños mínimos y superficie mínima.
- Supabase es la fuente principal; existe una copia local para demostración y respaldo.

### Viviendas publicadas por clientes

- Todas las cuentas normales continúan teniendo el tipo `client`.
- Una misma cuenta puede comprar, guardar favoritos y publicar viviendas.
- Las propiedades publicadas por usuarios incorporan `owner_id`.
- Las políticas RLS permiten que solo el propietario cree o modifique sus anuncios.
- La ruta protegida `/mis-viviendas` permite publicar y cambiar el estado entre disponible, reservada, vendida y retirada.
- Para usuarios autenticados, el enlace `Vender` abre esta nueva zona privada.
- Las 24 viviendas simuladas pertenecen al catálogo de demostración de Lumera y no utilizan cuentas o contraseñas ficticias.
- Queda pendiente adaptar las conversaciones para que los mensajes de una vivienda particular lleguen directamente a su propietario.

## Base de datos y despliegues realizados

Migraciones nuevas aplicadas al Supabase remoto:

- `20261029170000_secure_assistant_usage.sql`: límites y métricas.
- `20261029173000_expand_property_catalog.sql`: ampliación del catálogo.
- `20261029190000_add_client_property_ownership.sql`: propiedad y permisos de anuncios de clientes.
- `20261029193000_add_demo_property_catalog.sql`: 24 viviendas simuladas adicionales.

También se reconcilió el historial remoto de migraciones antiguas para evitar que Supabase intentara ejecutarlas de nuevo.

La Edge Function desplegada contiene contexto, CORS local, métricas, límite de solicitudes, filtros ampliados y respaldo ante errores del proveedor.

## Pruebas

Último estado estable comprobado antes de documentar:

- 24 pruebas lógicas superadas.
- 83 pruebas de componentes y servicios superadas.
- Prueba E2E simulada del asistente superada en escritorio y móvil.
- `npm run lint` superado.
- `npm run build` superado.

La prueba E2E real llegó correctamente a la Edge Function, pero Gemini devolvió indisponibilidad y activó el modo local. Esto queda como incidencia externa pendiente de volver a probar o resolver cambiando de proveedor.

Comandos principales:

```bash
npm test
npm run lint
npm run build
npm run test:e2e:assistant
RUN_LIVE_AI_E2E=1 npm run test:e2e:assistant:live
```

## Pendiente antes de publicar

1. Decidir entre Gemini y OpenAI.
2. Implementar y probar el proveedor elegido.
3. Decidir cómo tratar valores exactos frente a valores mínimos.
4. Elegir hosting, previsiblemente Vercel.
5. Publicar React y obtener el dominio definitivo.
6. Añadir ese dominio a `ALLOWED_ORIGINS`.
7. Revisar textos de privacidad, cookies y condiciones aplicables.
8. Ejecutar pruebas E2E reales de producción.
9. Programar la limpieza periódica de métricas.
10. Valorar un panel de administración para crear y editar propiedades.

## Archivos principales del asistente

- `src/components/AssistantWidget/AssistantWidget.jsx`
- `src/components/AssistantWidget/AssistantWidget.css`
- `src/services/assistantService.js`
- `src/utils/assistantSearch.js`
- `supabase/functions/assistant-search/index.ts`
- `supabase/functions/assistant-search/filters.ts`
- `e2e/assistant-flow.spec.js`

## Punto exacto para continuar

No hay que reconstruir el asistente. La siguiente conversación debería empezar eligiendo una de estas tareas:

- Cambiar Gemini por OpenAI.
- Implementar filtros exactos y mínimos correctamente.
- Publicar primero la web en modo local.

El estado actual debe considerarse estable y el cambio incompleto de filtros exactos quedó revertido.
