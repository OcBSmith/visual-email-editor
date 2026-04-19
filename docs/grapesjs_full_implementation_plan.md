# Plan de Implementación Total: GrapesJS + MJML Power-Up

GrapesJS incorpora de fábrica un arsenal masivo de funcionalidades visuales que actualmente se encuentran inactivas, restringidas o reemplazadas por versiones limitadas en este plugin. Al aprovechar el core completo, el Visual Email Editor podrá competir cara a cara con herramientas Enterprise (tipo Mailchimp / Stripo).

A continuación se presenta el RoadMap (Hoja de Ruta) detallado para liberar todo el potencial de GrapesJS en futuras sesiones.

---

## FASE 1: Activación de los "Managers" Ocultos (Arquitectura de Paneles)

Actualmente la barra derecha / izquierda está muy simplificada. Debemos integrar los gestores (Managers) nativos que GrapesJS ya lleva dentro y que simplemente están apagados.

### 1.1. Trait Manager (Gestor de Atributos MJML Avanzados)
*   **Problema actual:** Para cambiar un enlace o un color, dependemos de interfaces simplificadas.
*   **Implementación:** Configurar el contenedor `traitManager` en la inicialización de GrapesJS.
*   **Resultado:** Al seleccionar un botón o imagen, aparecerá un panel nativo para editar la URL (`href`), el `alt` (texto oculto), el comportamiento de apertura (`_blank`), bordes redondeados y anchos específicos al milímetro, leyendo directamente de la especificación MJML.

### 1.2. Style Manager Expandido (Panel de CSS)
*   **Problema actual:** Solo se usan unas pocas propiedades CSS/MJML. GrapesJS tiene "Sectores".
*   **Implementación:** Inicializar las categorías (Typografy, Geometry, Decorations, Flexbox). Cargar el plugin `grapesjs-plugin-forms` o extender los controles por defecto.
*   **Resultado:** El usuario podrá cambiar opacidades, sombras (box-shadows), radios de borde individuales, tipografías personalizadas (Google Fonts nativo), alturas de línea y espaciados (padding/margin) visuales avanzados.

### 1.3. Layer Manager (Árbol del DOM)
*   **Implementación:** Crear una pestaña en el panel lateral (p. ej., "Capas") e inicializar el `layerManager: { appendTo: '#layers-container' }`.
*   **Resultado:** Permite ver la jerarquía del correo (`mj-body` > `mj-section` > `mj-column` > `mj-text`). Indispensable para que el usuario pueda seleccionar, arrastrar y reordenar elementos anidados con precisión sin tener que hacer clic en el lienzo (ideal para móviles o correos muy largos).

### 1.4. Selector Manager (Breadcrumbs / Clases CSS)
*   **Implementación:** Activar la barra inferior o superior de *Breadcrumbs* (migajas de pan). Seleccionar clases múltiples nativas `selectorManager`.
*   **Resultado:** Muestra al usuario qué está editando exactamente (Sección > Columna > Texto). Evita errores de hacer clic en el componente equivocado.

---

## FASE 2: Expansión del Arsenal de Bloques (Block Manager)

El plugin `grapesjs-mjml` tiene muchísimos más bloques de los que probablemente se estén cargando.

### 2.1. Desbloqueo de Componentes Avanzados MJML
Habilitar y configurar visualmente en el menú izquierdo:
*   **MJ-Carousel:** Para deslizar imágenes.
*   **MJ-Accordion:** Menús desplegables dentro del email.
*   **MJ-Social:** Botones nativos y automáticos de redes sociales (Facebook, Twitter, Insta, etc.).
*   **MJ-Navbar:** Menú de navegación en el encabezado del email.
*   **MJ-Spacer / MJ-Divider:** Control absoluto del espacio en blanco sin forzar márgenes.
*   **MJ-Hero:** Imágenes con texto superpuesto (background images absolutas).

### 2.2. Categorización Visual
*   Organizar el Block Manager en categorías desplegables ("Layout", "Contenido", "Avanzado", "Redes Sociales") en lugar de una lista monolítica.

---

## FASE 3: Gestión de Archivos y Recursos (Asset Manager)

Actualmente, el manejo de imágenes requiere copiar URLs.

*   **Implementación:** Activar el `AssetManager` de GrapesJS.
*   **Resultado:** Un modal profesional propio donde el usuario puede arrastrar y soltar fotos desde su ordenador hacia el editor. Las imágenes se pueden convertir a `base64` de forma nativa antes de exportarse, o conectarse a un entorno de nube local para su uso dentro del correo.
*   *Bonus:* Se pueden integrar recortes de imagen y filtros nativos.

---

## FASE 4: Funciones de Productividad de Escritorio

*   **Comandos de Zoom / Pan:** Permitir hacer scroll lateral infinito y alejar el tapiz (Zoom in/Zoom out) usando la rueda del ratón (Command manager avanzado).
*   **Botón Clean (Limpiar Lienzo):** Borrar todo el email con un clic confirmando.
*   **Importar Código (Import Editor):** Un botón que despliegue un modal con código (ya sea HTML o MJML). Si pegas código copiado de internet, la herramienta lo compila dinámicamente y lo transforma en bloques arrastrables.

---

## ¿CÓMO LO HAREMOS MAÑANA? (Metodología)

1.  **Auditoría de Invocación:** Revisaremos el archivo `editor.js` donde hacemos el `grapesjs.init({...})`.
2.  **Inyección Modular:** En lugar de poner 1000 líneas nuevas en `editor.js`, crearemos activadores modulares (p.ej: `panels-manager.js` para los layouts y capas).
3.  **Encaje UI:** GrapesJS es feo por defecto. Deberemos conectar las clases nativas de Grapes (`gjs-trait-manager`, `gjs-sm-sector`) con el maravilloso diseño *glassmorphism* moderno en los archivos CSS que ya tienes preparados.

¡Guarda energía! Mañana convertiremos el núcleo actual en una bestia completa de producción visual.
