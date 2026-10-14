# Inmobiliaria React

Proyecto didactico de una aplicacion inmobiliaria. El objetivo es aprender React paso a paso mientras construimos una web bien organizada, mantenible y adaptable a dispositivos moviles.

## Que es React

React es una biblioteca de JavaScript para crear interfaces de usuario mediante componentes reutilizables. Cada componente representa una parte de la interfaz, como una cabecera, un filtro o una tarjeta de vivienda.

Durante el proyecto aprenderemos:

- **Componentes:** piezas reutilizables de la interfaz.
- **Props:** datos que un componente recibe de otro.
- **Estado:** informacion que cambia durante el uso de la aplicacion.
- **Hooks:** funciones como `useState` y `useEffect` para trabajar con el estado y otros comportamientos de React.
- **JSX:** sintaxis que permite describir la interfaz dentro de JavaScript.
- **Rutas:** navegacion entre paginas sin recargar toda la aplicacion.

React se ocupara de la interfaz. En una fase posterior podremos conectar la aplicacion a un backend y una base de datos reales.

## Tecnologias y herramientas

- **HTML:** estructura y contenido.
- **CSS:** estilos y diseno adaptable.
- **JavaScript:** logica de la aplicacion.
- **React:** componentes e interfaz interactiva.
- **Vite:** entorno de desarrollo y compilacion.
- **React Router:** navegacion entre paginas.
- **Node.js y npm:** ejecucion de herramientas e instalacion de dependencias.
- **Git y GitHub:** control de versiones y alojamiento del repositorio.
- **Visual Studio Code:** editor recomendado, aunque se puede usar cualquier editor.

Empezaremos con JavaScript para concentrarnos en los conceptos de React. TypeScript se podra incorporar cuando la primera version sea estable.

## Funcionalidades previstas

### Primera version

1. Pagina de inicio.
2. Catalogo de inmuebles.
3. Filtros por precio, tipo y ubicacion.
4. Pagina de detalle de cada inmueble.
5. Sistema de favoritos.
6. Formulario de contacto.
7. Diseno adaptable a movil, tableta y escritorio.
8. Pagina de error 404.
9. Datos simulados almacenados localmente.

### Posibles ampliaciones

- Registro e inicio de sesion.
- Panel de administracion.
- Backend y base de datos reales.
- Subida de fotografias.
- Mapas y geolocalizacion.
- Publicacion de la aplicacion en internet.

## Estructura prevista

La estructura se ira creando gradualmente para entender para que sirve cada parte:

```text
inmobiliaria-react/
|-- public/                 # Archivos publicos
|-- src/
|   |-- assets/             # Imagenes, iconos y fuentes
|   |-- components/         # Componentes reutilizables
|   |   |-- Header/
|   |   |-- Footer/
|   |   `-- PropertyCard/
|   |-- pages/              # Paginas completas
|   |   |-- Home/
|   |   |-- Properties/
|   |   |-- PropertyDetail/
|   |   `-- Contact/
|   |-- layouts/            # Estructuras compartidas entre paginas
|   |-- hooks/              # Hooks personalizados
|   |-- services/           # Acceso a datos y futuras API
|   |-- data/               # Datos simulados
|   |-- utils/              # Funciones auxiliares
|   |-- styles/             # Estilos globales
|   |-- App.jsx             # Componente principal
|   `-- main.jsx            # Punto de entrada de React
|-- index.html
|-- package.json
`-- README.md
```

No crearemos carpetas vacias sin necesitarlas: apareceran conforme avancemos para que cada cambio tenga un motivo claro.

## Requisitos

- Node.js 22 o una version compatible con Vite.
- npm, incluido con Node.js.
- Git.

Para comprobar las instalaciones:

```bash
node --version
npm --version
git --version
```

## Puesta en marcha

Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Vite mostrara en la terminal la direccion local de la aplicacion, normalmente `http://localhost:5173`.

Para detener el servidor se puede pulsar `Ctrl + C`.

## Comandos disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Genera la version optimizada para produccion
npm run preview   # Permite revisar localmente la version de produccion
npm run lint      # Analiza el codigo y detecta posibles problemas
```

## Ruta de aprendizaje

1. Repasar JavaScript moderno necesario para React.
2. Conocer los archivos iniciales creados por Vite.
3. Crear los primeros componentes con JSX.
4. Reutilizar componentes mediante props.
5. Gestionar estado y eventos.
6. Crear paginas y configurar React Router.
7. Implementar filtros y formularios.
8. Leer datos locales y consumir una API.
9. Guardar los favoritos en el navegador.
10. Probar, optimizar y publicar la aplicacion.

## Forma de trabajo

Cada etapa debe incluir:

1. El objetivo del cambio.
2. La explicacion del concepto de React utilizado.
3. La implementacion en un cambio pequeno.
4. Una comprobacion manual y automatica.
5. Un commit descriptivo cuando la etapa este terminada.

La prioridad no es avanzar deprisa, sino comprender por que existe cada archivo y como se comunican los componentes.

## Documentacion oficial

- [React](https://react.dev/learn)
- [Vite](https://vite.dev/guide/)
- [React Router](https://reactrouter.com/start/modes)
- [MDN: JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript)
