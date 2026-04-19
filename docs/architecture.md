# Arquitectura del Editor Visual de Email

## Estructura Modular

El editor utiliza una arquitectura modular con archivos especializados:

```
editor/
├── index.html              # Punto de entrada
├── editor.js               # Controlador principal (GrapesJS)
│
├── # Módulos de IA
├── ai-api.js               # Capa API (URLs, fetch, configuración)
├── ai-service.js           # Lógica de negocio AI (prompts)
├── ai-handlers.js          # Handlers UI de IA (modals, chat)
│
└── # Documentación Detallada
    └── ai-integration.md   # Lógica profunda de IA local y nube
├── # Gestión de datos
├── templates-data.js       # Biblioteca de plantillas MJML
├── import-export.js        # Import/export de archivos y compilación
│
├── # Utilidades y UI
├── editor-utils.js         # Funciones puras (rgbToHex, escapeHtml, etc.)
├── ui-manager.js           # Modales, toasts, tabs, resizing
├── preview-controls.js      # Vista previa (desktop/tablet/mobile) y undo/redo
├── template-ui.js          # Interfaz de selección de plantillas
│
├── # Estilos CSS modulares
├── styles-layout.css      # Layout base, header, panels
├── styles-ui.css           # Botones, modales, formularios
├── styles-canvas.css      # Canvas, GrapesJS overrides
│
└── # Librerías externas
    └── lib/
        ├── grapes.min.js
        └── grapesjs-mjml.min.js
```

## Responsabilidades por Módulo

### ai-api.js (208 líneas)
- URLs y configuración de proveedores (Groq, LM Studio)
- Métodos `fetch()`, `complete()` para llamadas API
- Gestión de API keys y modelos
- **No depende de otros módulos**

### ai-service.js (336 líneas)
- Prompts de negocio (improveText, shortenText, translate, etc.)
- Integración con ai-api.js para llamadas API
- Generación de emails, subject lines, análisis SPAM

### ai-handlers.js (648 líneas)
- Todos los modales de IA (generate, subject, spam, translate, alt text)
- Chat conversacional con el editor
- Botones de toolbar para edición de componentes

### import-export.js (178 líneas)
- Import HTML/MJML desde archivo o clipboard
- Export a archivo (.html, .mjml)
- Compilación y limpieza de MJML
- `getCompiledHtml()`, `getMjml()` (con recubrimiento robusto para compatibilidad)
- Soporte para extracción de código mediante comandos del plugin si la API directa falla.

### preview-controls.js (60 líneas)
- Botones de vista dispositivo (desktop/tablet/mobile)
- Controles de undo/redo

### template-ui.js (55 líneas)
- Modal de biblioteca de plantillas
- Carga de plantillas en el editor

### editor-utils.js (57 líneas)
- `rgbToHex()` - Conversión de colores
- `escapeHtml()` - Escape de HTML
- `getErrorHtml()` - Plantilla de error
- `formatDate()`, `formatBytes()` - Formateo

### ui-manager.js (158 líneas)
- Sistema de modales reutilizables
- Notificaciones toast
- Tabs de panels
- Resizing de panels

### templates-data.js (144 líneas)
- `TEMPLATE_LIBRARY` con plantillas MJML predefinidas

### editor.js (474 líneas)
- Inicialización de GrapesJS
- Exposición global mediante `window.editor` para interoperabilidad de módulos
- Eventos del editor y delegaciones a otros módulos
- Registro de botones en el Rich Text Editor (RTE) para IA contextual.

## Orden de Carga

```html
<script src="lib/grapes.min.js">
<script src="lib/grapesjs-mjml.min.js">
<script src="editor-utils.js">      <!-- Utilidades primero -->
<script src="templates-data.js">    <!-- Datos -->
<script src="ui-manager.js">        <!-- UI base -->
<script src="ai-api.js">           <!-- API de IA -->
<script src="ai-service.js">       <!-- Servicio AI -->
<script src="import-export.js">     <!-- Archivos -->
<script src="preview-controls.js">  <!-- Controles -->
<script src="template-ui.js">       <!-- Templates -->
<script src="ai-handlers.js">       <!-- Handlers AI -->
<script src="editor.js">           <!-- Controlador -->
```

## Tests

Ejecutar: `npm test`

- `tests/editor.test.js` - Utils (rgbToHex, escapeHtml, formatDate)
- `tests/ai-import.test.js` - Limpieza markdown, detección MJML, isConfigured
