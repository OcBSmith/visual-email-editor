# Integración y Restauración del Sistema de IA

Este documento detalla los cambios críticos realizados para restaurar y estabilizar las funciones de IA en el Editor Visual de Email.

## 1. Restauración de la Interfaz Contextual (Magic Button)

Se han restaurado los puntos de entrada de la IA en la interfaz de usuario que se habían perdido en versiones previas:

- **Component Toolbar**: Se ha vuelto a vincular el evento `component:selected` en `ai-handlers.js` para inyectar el botón de "Acciones Mágicas" en la barra de herramientas de GrapesJS para componentes de tipo `text` y `mj-text`.
- **Rich Text Editor (RTE)**: Se ha registrado un nuevo botón de IA en la barra de formato flotante que aparece al seleccionar fragmentos de texto específicos. Esto permite modificaciones quirúrgicas mediante IA sin afectar a todo el bloque de texto.

## 2. Estabilización de la Arquitectura (Global Editor)

Se resolvió el error crítico `Editor not initialized` mediante la exposición global de la instancia:

- **Interoperabilidad**: Al modularizar el código, los submódulos perdieron el acceso a la variable local `editor`. Se corrigió añadiendo `window.editor = editor;` en el núcleo de `editor.js`.
- **Sincronización**: Todos los handlers de IA ahora verifican la disponibilidad de `window.editor` antes de ejecutar comandos, garantizando que los eventos (como el clic en el "engranaje" de configuración) no fallen.

## 3. Extracción Robusta de Código (MJML Engine)

Para el funcionamiento del Chat y las Acciones Rápidas, es vital extraer el código MJML fuente (no el HTML compilado). Se implementó un sistema de fallbacks en `import-export.js`:

1. **API Directa**: Intenta `editor.getMjml()`.
2. **Variante de API**: Intenta `editor.getMJML()`.
3. **Comandos de Plugin**: Ejecuta `editor.runCommand('mjml-get-code')` como alternativa si el método no está mapeado en la raíz del objeto.
4. **Fallback Final**: Utiliza `getHtml()` como último recurso.

## 4. Corrección de Codificación (Encoding)

Se detectaron y corrigieron problemas de visualización de caracteres especiales (tildes, emojis):

- **Sanitización de index.html**: Se reconstruyó el archivo `index.html` asegurando que los strings en español ("Acciones", "Diseño", "Configuración") se guarden y sirvan correctamente en UTF-8.
- **UI de Chat**: Se limpiaron los mensajes de sistema y se variaron las respuestas de confirmación para evitar repeticiones mecánicas.

## 5. Flujo de Trabajo de IA Local vs Nube

El sistema es agnóstico al proveedor configurado en `ai-api.js`:

- **Groq (Nube)**: Proporciona respuestas instantáneas para generación de texto complejo.
- **LM Studio (Local)**: Permite privacidad total y uso sin conexión a internet, procesado mediante `localhost`.
- **Visualización de Estado**: El indicador de salud en el header se comunica con `ai-api.js` para mostrar si el servicio está listo o si requiere configuración.
