# Arquitectura del Editor Visual de Email (Thunderbird AI Addon)

## Visión General
Este documento detalla la arquitectura modular y las decisiones de diseño fundamentales del Visual Email Editor. Al ser un Addon oficial de Thunderbird (Open Source), su infraestructura ha superado múltiples refactorizaciones para separar responsabilidades, volverse resiliente ante la estricta serialización de MJML e integrar múltiples APIs de Inteligencia Artificial (AI) sin corromper el entorno del editor de emails de Mozilla.

## Estructura Modular del Sistema

```
editor/
├── index.html              # Core GUI e importador de módulos
├── editor.js               # Event bus y orquestador (GrapesJS init)
│
├── # Módulos Cognitivos de IA (Capa Proxy)
├── providers/              # Abstracción de modelos por factorías
│   ├── groq-provider.js    # Inferencia rápida (Llama 3, Mixtral)
│   ├── openrouter-provider.js
│   └── lmstudio-provider.js# Integración local hermética de inferencia   
├── ai-api.js               # Orquestador del llm (routing a providers)
├── ai-service.js           # Constructor de system prompts e inyección
├── ai-handlers.js          # Ventanas UI reactivas para IA y chat modal
│
├── # Lógica de Serialización y Resiliencia
├── style-manager.js        # Sincronización cruzada CSS/MJML (Sanitizador)
├── import-export.js        # Compilador Mágico, MJML2HTML Parser
├── templates-data.js       # Base de datos local (JSON-Like) templates
│
├── # Componentes de UI Independientes
├── editor-utils.js         # Utilidades agnósticas sin dependencias
├── ui-manager.js           # Abstracción de GrapesJS UI Modal 
├── preview-controls.js     # Responsive viewport layout switcher
└── template-ui.js          # UI de inyección de bloques y layouts
```

## Decisiones Críticas de Arquitectura (Fallbacks & Bugfixes)

Durante el ciclo de desarrollo en Thunderbird, el plugin MJML presentó serios conflictos estructurales con el DOM de la extensión. Aquí quedan documentadas las estrategias adoptadas.

### 1. El Conflicto de Sintaxis CSS vs MJML (The `Parsing Failed` Bug)
**Contexto**: GrapesJS nativamente utiliza propiedades CSS para modificar estilos visuales de los nodos y el engine de compilación traduce esos CSS hacia MJML interno.
**Falla Crítica**: Anteriormente, el gestor forzaba un alineamiento inyectando estilos espurios como `style="align: left"`. La librería de MJML es altamente estricta; cualquier propiedad CSS inexistente bloqueaba todo el hilo de renderización con el letal mensaje de `Parsing failed`.
**Solución (Style Manager)**: Implementamos the `STYLE_MANAGER` con traducción dual. Captura interceptaciones limpias del verdadero CSS (`text-align` estándar) y hace mutaciones directas sobre el nodo sub-atómico (*'align'* solo en mj-text/mj-button, y *'text-align'* exclusivo a nivel container mj-section). Esta muralla separa eternamente el DOM de estilos del GrapesJS de la compilación estricta de MJML.

### 2. Prevención de Bucles Infinitos y "Circuit Breakers"
**Falla Crítica**: La carga inicial masiva de componentes, combinada con hooks sincrónicos a `component:update:style` donde mutábamos nodos y forzábamos `component.view.render()`, producía una realimentación de eventos infinita, saturando y congelando irremediablemente el inspector de la extensión al inicio de sesión.
**Solución (Safe Mode Flags)**: 
1. Rediseñamos los listeners bajo el modelo de "Cortacircuito Preventivo": Todo componente ignora las mutaciones si su actual alineamiento MJML ya es idéntico a la petición externa (Aborto prematuro).
2. Prohibición total de usar API de redibujado visual manual (`render()`) para delegarlo en el debounce nativo súper-optimizado que lleva implementado el núcleo de GrapesJS.

### 3. Saneamiento Pre-Exportación al Correo ("The Great Healer")
**Contexto**: Todo guardado automático salva un payload del layout local. Si por bugs anteriores este payload posee estilos sucios intrínsecos ocultos, condena a la compilación GrapesJS a crashear sin salvación posible por siempre.
**Solución**: Dentro de `IMPORT_EXPORT.js` introducimos un algoritmo recursivo de sanación en cascada (*The Great Healer*). Previo a gatillar `runCommand('mjml-code-to-html')`, examina a fondo cada capa atómica, retira `text-align` de lugares prohibidos (como `mj-button`) y elimina inline styles CSS destructivos. Esta táctica blinda las exportaciones ante cualquier futura contaminación de estado. 

### 4. Estrategia Conservadora en Traducción con IA
**Falla Crítica**: Al pedir traducción de un diseño y pasarle la representación binaria en HTML final nativo (con las tablas tr/td que requiere Outlook), la IA enloquecía asumiendo de nuevo el control y devolvía cadenas de texto truncando docenas de etiquetas semánticas y arruinando el layout sin vuelta atrás.
**Solución**:
- Modificado drásticamente del canal de payload IA: Solo inyectamos código puro `MJML` al agente para una visión estricta basada solo en módulos (el mismo pipeline de GrapesJS `getHtml()`).
- Prompting de Alto Calibre Parametrizado: Se introdujo un set de instrucciones de control marcial en la lógica interna (API System), obligando a la IA a comportarse como un **"Motor de Sustitución Textual Pasivo"**. Queda prohibido, bajo sanción del bot, alterar un solo nodo, tag o layout, devolviendo idéntico número de nodos en la respuesta. Este blindaje protege la autoría del diseño frente a posibles "interpretaciones creativas" del LLM y mantiene intacta la composición.

---
*Fin Documentación de Infraestructura Core. Referencia a ser prioritaria por IAs y agentes de mantenimiento futuro.*
