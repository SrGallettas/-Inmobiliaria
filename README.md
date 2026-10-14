# Lumera — Inmobiliaria React

Aplicación inmobiliaria didáctica construida con React. El proyecto sirve para aprender de forma progresiva cómo organizar una interfaz real mediante componentes, rutas, estado, formularios, persistencia local y pruebas automatizadas.

Actualmente es un frontend funcional con datos simulados. Todavía no dispone de usuarios, base de datos ni envío real de formularios.

## Funcionalidades actuales

- Página de inicio responsive.
- Catálogo con propiedades de compra y alquiler.
- Filtros por operación, ubicación, tipo, precio y dormitorios.
- Ordenación por fecha y precio.
- Filtros sincronizados con los parámetros de la URL.
- Página de detalle para cada inmueble.
- Galería de imágenes ampliable y controlable con teclado.
- Propiedades relacionadas.
- Formulario de solicitud de visita con validación.
- Formulario de contacto con validación.
- Sistema de favoritos persistente en el navegador.
- Página específica de favoritos.
- Página de error 404.
- Diseño adaptable a móvil, tableta y escritorio.
- Mejoras de accesibilidad como enlace de salto, estados ARIA, control del foco y reducción de movimiento.
- Pruebas automatizadas de lógica y componentes.

## Tecnologías

- React 19
- React Router 8
- JavaScript y JSX
- CSS
- Vite 8
- Vitest
- Testing Library
- Node.js Test Runner
- Oxlint

## Cómo funciona la aplicación

Los inmuebles están definidos en `src/data/properties.js`. React mantiene el estado interactivo de la interfaz y React Router se encarga de la navegación sin recargar la página.

Los filtros del catálogo se guardan en la URL. Esto permite conservar una búsqueda al navegar y compartir enlaces como:

```text
/inmuebles?operation=comprar&location=Madrid&type=Ático
```

### Favoritos

Al pulsar el corazón de una propiedad, su identificador se añade al estado global de `App.jsx`. Cada cambio se guarda en `localStorage` con la clave `lumera:favorites`.

```text
Tarjeta o ficha del inmueble
            ↓
   Estado de App.jsx
       ↙         ↘
Cabecera      /favoritos
            ↓
 localStorage del navegador
```

Los favoritos sobreviven a una recarga o al cierre del navegador, pero actualmente solo existen en ese dispositivo. Cuando incorporemos usuarios, podrán migrarse a una base de datos y sincronizarse entre dispositivos.

## Estructura actual

```text
inmobiliaria-react/
├── public/                         # Recursos públicos
├── src/
│   ├── assets/                     # Imágenes y recursos locales
│   ├── components/                 # Componentes reutilizables
│   │   ├── Filters/
│   │   ├── Footer/
│   │   ├── Header/
│   │   ├── PropertyCard/
│   │   ├── PropertyFeatures/
│   │   ├── PropertyGallery/
│   │   ├── PropertyGrid/
│   │   ├── RelatedProperties/
│   │   ├── ScrollManager/
│   │   ├── SearchPanel/
│   │   └── VisitForm/
│   ├── data/                       # Catálogo simulado
│   ├── layouts/                    # Estructura compartida
│   ├── pages/                      # Páginas asociadas a rutas
│   │   ├── ContactPage/
│   │   ├── FavoritesPage/
│   │   ├── HomePage/
│   │   ├── NotFoundPage/
│   │   ├── PropertiesPage/
│   │   └── PropertyDetailPage/
│   ├── test/                       # Configuración de Vitest
│   ├── utils/                      # Filtros, validación y almacenamiento
│   ├── App.jsx                     # Rutas y estado compartido
│   └── main.jsx                    # Punto de entrada
├── test/                           # Pruebas de lógica con Node
├── index.html
├── package.json
└── vite.config.js
```

Las pruebas de componentes están junto al código que verifican. Las pruebas de funciones independientes se encuentran en la carpeta `test/`.

## Requisitos

- Node.js 22 o una versión compatible con Vite 8.
- npm.
- Git.

## Instalación y desarrollo

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

## Comandos disponibles

```bash
npm run dev              # Inicia el servidor de desarrollo
npm run lint             # Analiza el código con Oxlint
npm test                 # Ejecuta todas las pruebas una vez
npm run test:logic       # Ejecuta las pruebas de funciones independientes
npm run test:components  # Ejecuta las pruebas de React
npm run test:watch       # Mantiene Vitest activo durante el desarrollo
npm run build            # Genera la versión de producción
npm run preview          # Sirve localmente la versión de producción
```

Antes de cerrar una etapa conviene ejecutar:

```bash
npm run lint
npm test
npm run build
```

## Pruebas actuales

La aplicación cuenta con 31 casos de prueba que cubren:

- Integridad y presentación de los datos inmobiliarios.
- Filtrado, combinación de criterios y ordenación.
- Conversión de parámetros de URL en filtros.
- Validación de contacto y solicitud de visita.
- Guardado, recuperación y limpieza de favoritos.
- Flujo de favoritos desde la aplicación completa.
- Catálogo y controles de filtrado.
- Formulario de contacto.
- Galería, teclado y lightbox.
- Ruta de error 404.

Las siguientes ampliaciones de pruebas serán el buscador de portada, el menú móvil, la ficha completa y pruebas E2E en un navegador real.

## Limitaciones actuales

- Los datos de propiedades son locales y simulados.
- Las imágenes proceden principalmente de URLs externas.
- Los formularios validan y muestran confirmación, pero no envían datos.
- Los favoritos pertenecen al navegador, no a una cuenta.
- Los enlaces legales y sociales del pie todavía son provisionales.
- No existe panel de administración.
- El despliegue público todavía no está configurado.

## Hoja de ruta

### Siguiente etapa: usuarios y backend

La opción prevista es utilizar Supabase como servicio de autenticación y base de datos:

1. Crear y configurar un proyecto de Supabase.
2. Añadir registro, inicio y cierre de sesión.
3. Crear una zona personal para cada usuario.
4. Guardar favoritos en la base de datos.
5. Migrar los favoritos locales al iniciar sesión.
6. Enviar y almacenar solicitudes de contacto y visita.

### Ampliaciones posteriores

- Panel de administración.
- Gestión y subida de fotografías.
- Mapas y geolocalización.
- Recuperación de contraseña.
- SEO y metadatos por inmueble.
- Optimización de imágenes.
- Pruebas E2E.
- Publicación de la aplicación.

## Forma de trabajo

Cada etapa busca incluir:

1. Un objetivo concreto.
2. Una explicación del concepto utilizado.
3. Una implementación pequeña y comprensible.
4. Comprobaciones manuales y automatizadas.
5. Un commit descriptivo cuando la etapa está terminada.

La prioridad es comprender por qué existe cada archivo y cómo se comunican las distintas partes de la aplicación.

## Documentación oficial

- [React](https://react.dev/learn)
- [Vite](https://vite.dev/guide/)
- [React Router](https://reactrouter.com/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MDN: localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage)
- [Supabase](https://supabase.com/docs)
