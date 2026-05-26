# Informe de Mejoras — Visual Email Editor (Thunderbird)
Versión analizada: v1.1.2  
Fecha: mayo 2026

---

## 1. ARQUITECTURA

### 1.1 Namespace global como sistema de módulos
Todos los módulos se exponen como objetos literales en `window`:
`window.AI_API`, `window.IMPORT_EXPORT`, `window.STYLE_MANAGER`, etc.
Esto implica que cualquier script cargado después puede sobreescribir cualquier módulo
sin aviso, y el orden de carga de los `<script>` en `index.html` es la única
"gestión de dependencias" que existe.

**Solución:** Migrar a ES Modules nativos (`<script type="module">`).
Cada archivo exporta lo que necesita y el resto solo ve lo que importa.
Esto elimina la contaminación de window, hace las dependencias explícitas
y permite tree-shaking si en algún momento se añade un bundler.

### 1.2 Acoplamiento fuerte entre módulos
`editor.js` llama directamente a `TEMPLATE_LIBRARY[0]`, `STYLE_MANAGER.getConfig()`,
`CUSTOM_BLOCKS.init()`, `IMPORT_EXPORT.init()`, `AI_HANDLERS.init()`, etc.
Si cualquiera de esos módulos no está cargado, el editor falla en silencio o
lanza una excepción que aborta la inicialización completa.

**Solución:** Patrón de registro/plugin. El editor expone un método `editor.use(plugin)`
y cada módulo se registra a sí mismo. El editor no conoce ningún módulo específico.

### 1.3 Estado disperso en tres almacenes distintos
- Configuración de IA → `browser.storage.local`
- Plantillas guardadas por el usuario → `localStorage`
- Estado del editor en sesión → propiedades de objetos en memoria (STYLE_MANAGER.isSyncing, etc.)

Esto hace imposible razonar sobre qué se persiste, qué se pierde al recargar
y qué sobrevive entre sesiones. `localStorage` en una extensión puede ser
limpiado por el navegador; `browser.storage.local` no.

**Solución:** Unificar todo en `browser.storage.local` con un único módulo
`Storage` que abstrae las operaciones. Las plantillas deben migrarse allí.

### 1.4 editor.js mezcla demasiadas responsabilidades
El archivo hace: inicialización de GrapesJS, configuración de keymaps, registro
de comandos, cálculo del tamaño del email, control del ancho del canvas,
sincronización de la UI de anchura y la lógica del botón "Nuevo Diseño".
Son al menos 6 responsabilidades distintas en un solo archivo de 460 líneas.

**Solución:** Extraer `canvas-controller.js` (ancho + scroll),
`size-indicator.js` (cálculo KB), y dejar `editor.js` solo como bootstrap.

### 1.5 background.js tiene código muerto
Las funciones `processInlineImages`, `base64ToFile` y `generateContentId`
están definidas pero no se llaman en ningún sitio (el comentario en el código
lo confirma: "CID conversion was causing size inconsistencies"). Son ~80 líneas
que aumentan la superficie de mantenimiento sin aportar nada.

**Solución:** Eliminarlas. Si en el futuro se necesita conversión CID,
se reimplementan desde cero con prueba unitaria.

### 1.6 Manifest con propiedades desconocidas
`locales` y `chrome_injectors` en `manifest.json` generan WARNING en cada carga
de la extensión. No afectan al funcionamiento pero enturbian los logs de depuración
y pueden causar rechazo en revisiones de addons.thunderbird.net.

**Solución:** Eliminar ambas propiedades del manifest.

---

## 2. BUENAS PRÁCTICAS DE PROGRAMACIÓN

### 2.1 Sin TypeScript ni JSDoc estructurado
Todo el código es JavaScript puro sin anotaciones de tipo. Funciones como
`applyMjmlAttribute(editor, value, attrName, target)` no documentan qué tipo
espera cada parámetro, lo que obliga a leer la implementación completa para
entender cómo llamarlas.

**Solución a corto plazo:** JSDoc completo en todas las funciones públicas.
**Solución a medio plazo:** Migrar a TypeScript. El código base es lo suficientemente
pequeño (< 3000 líneas sin librerías) para migrarlo en una semana.

### 2.2 Timeouts mágicos dispersos por todo el código
Hay al menos 8 `setTimeout` con valores hardcodeados: 50ms, 150ms, 300ms,
500ms, 700ms, 1000ms. Ninguno tiene constante nombrada. Cambiar el
comportamiento de uno puede romper otro en cascada (como demostró el bug
de la alineación, donde `healComponent` se llamaba a los 500ms).

**Solución:** Definir constantes con nombre en un módulo de configuración:
```
const TIMING = {
  COMPONENT_UPDATE_DEBOUNCE: 500,
  COMPILE_DEBOUNCE: 300,
  INIT_DEFER: 150,
};
```

### 2.3 healComponent se ejecuta en cada compilación y recorre el árbol entero
`updateEmailSize` llama a `getCompiledHtml()`, que llama a `healComponent(wrapper)`.
`healComponent` es recursivo y visita todos los componentes del documento.
Esto ocurre cada vez que se modifica cualquier componente (500ms de debounce),
lo que en un email con 20-30 bloques supone recorrer el árbol completo
varias veces por segundo mientras el usuario edita.

**Solución:** Ejecutar `healComponent` solo antes de exportar/insertar,
nunca durante la edición. El cálculo de tamaño puede usar la serialización
MJML directa sin necesidad de "curar" el árbol.

### 2.4 setInterval sin limpieza
En `ai-handlers.js`, `setInterval(() => this.updateAIStatus(), 10000)` se inicia
en `init()` pero nunca se limpia. Si el editor se recarga (ej: el usuario carga
una nueva pestaña), el intervalo anterior sigue activo y acumula llamadas
periódicas a la API de salud del proveedor.

**Solución:** Guardar el ID del intervalo y limpiarlo al recargar:
```
this._statusInterval = setInterval(...);
// Al destruir:
clearInterval(this._statusInterval);
```

### 2.5 Almacenamiento de plantillas sin deduplicación (en v1.1.2)
`saveCurrentTemplate` en la versión base hace `templates.unshift(entry)` sin
comprobar si ya existe una plantilla con el mismo nombre. El usuario puede
acumular duplicados sin darse cuenta.

**Solución:** Buscar por nombre antes de insertar y preguntar al usuario
si quiere sobreescribir.

### 2.6 Idioma mezclado en el código
La UI está en español pero los nombres de variables, funciones, comentarios
y mensajes de log están en inglés-español mezclados:
`showToast('Template saved')`, `console.log('[Editor] No stored content found')`,
`showModal('Save Template', ...)`.

**Solución:** Definir un idioma único para el código (inglés es estándar),
y externalizar todos los strings de UI a un objeto de traducciones.

### 2.7 Sin validación de entrada del usuario
El campo de URL de LM Studio se pasa directamente a `fetch()` sin validar
que sea una URL válida. Un usuario que pegue texto accidentalmente provocará
un error de red en lugar de un mensaje de validación claro.

**Solución:** Validar con `new URL(input)` en un bloque try/catch antes de
usarla para hacer peticiones.

### 2.8 API keys guardadas en texto plano
`browser.storage.local` no cifra los datos. Las API keys de Groq y OpenRouter
se guardan como strings legibles. En el escenario de una extensión maliciosa
con acceso a storage, quedarían expuestas.

**Solución a corto plazo:** Documentar claramente que las keys se guardan
en texto plano y recomendar usar keys con permisos mínimos.
**Solución a largo plazo:** Usar la Web Crypto API para cifrar las keys
con una clave derivada de un PIN de usuario.

---

## 3. EXPERIENCIA DE USUARIO

### 3.1 Plantillas de la librería sin previsualización visual
El modal de librería muestra solo el nombre y una descripción de texto.
El usuario no sabe cómo va a quedar el email hasta que lo carga y reemplaza
su trabajo actual.

**Solución:** Generar miniaturas PNG de cada plantilla en build time
(usando `mjml` + `puppeteer` en Node) y mostrarlas como thumbnails en el modal.
O alternativamente, cargar la plantilla en un iframe de previsualización
dentro del modal antes de confirmar.

### 3.2 Cargar una plantilla destruye el trabajo sin confirmación
`TEMPLATE_UI.loadTemplate()` llama directamente a `editor.setComponents()`
sin mostrar ningún diálogo de confirmación. Si el usuario tenía trabajo no
guardado, lo pierde sin aviso.

**Solución:** Añadir un paso de confirmación idéntico al del botón "Nuevo Diseño".

### 3.3 "Insertar en Email" abre una ventana de redacción nueva siempre
Actualmente el botón siempre crea una nueva ventana de redacción (`beginNew`).
Si el usuario ya tiene una ventana de redacción abierta, no puede insertar
el diseño en ella; tiene que empezar un email nuevo.

**Solución:** Detectar si hay ventanas de redacción abiertas con
`browser.compose.getActiveTabs()` y ofrecer al usuario elegir entre
"insertar en ventana existente" o "abrir nueva".

### 3.4 Sin historial de versiones del diseño
El usuario no puede retroceder más allá del undo/redo de GrapesJS (que
es solo de la sesión actual). Si cierra la pestaña accidentalmente, pierde
todo el trabajo.

**Solución:** Guardar automáticamente versiones temporales en
`browser.storage.local` cada 2 minutos con timestamp, y ofrecer
un panel de "Historial" donde recuperarlas. Mantener las últimas 5.

### 3.5 El indicador de tamaño (KB) no es accionable
El semáforo de tamaño del email (verde/amarillo/rojo) informa pero no
ayuda. El usuario no sabe qué está causando el tamaño excesivo ni cómo
reducirlo.

**Solución:** Al hacer clic en el indicador, mostrar un desglose:
- Tamaño del HTML compilado
- Número de imágenes externas
- Si hay imágenes base64 embebidas (las más pesadas)
- Consejo específico: "Hay 2 imágenes base64. Usa URLs externas para reducir el tamaño."

### 3.6 El estado "AI Offline" no explica qué hacer
El indicador rojo "LM Studio no detectado" aparece con ese texto y ya.
El usuario nuevo no sabe qué es LM Studio ni cómo configurar Groq u OpenRouter.

**Solución:** Al hacer clic en el indicador de estado cuando está offline,
abrir directamente el modal de configuración de IA con un mensaje explicativo
en la parte superior: "Configura al menos un proveedor para usar la IA".

### 3.7 Sin soporte para imágenes propias del usuario
Las imágenes de los bloques usan URLs de placeholder (via.placeholder.com,
images.unsplash.com). Si el usuario quiere poner su logo o imágenes propias,
tiene que editar la URL manualmente en el campo de atributos.

**Solución:** Implementar el Asset Manager de GrapesJS conectado a:
- Subida de imágenes como adjuntos inline (el código base64 ya existe en background.js)
- O un campo de pegado de URL con previsualización inmediata

### 3.8 La paleta de colores no recuerda colores usados
Cada vez que el usuario abre el selector de color, tiene que escribir el
código hexadecimal desde cero. No hay "colores recientes" ni posibilidad
de guardar una paleta de marca.

**Solución:** Añadir una sección de "Colores de marca" en la configuración,
y mostrar esos colores como chips en el selector de color. Guardar los
últimos 10 colores usados automáticamente.

### 3.9 No hay forma de duplicar una sección
Si el usuario crea una sección bien diseñada y quiere repetirla con
contenido diferente, tiene que rehacerla desde cero. GrapesJS soporta
la operación de clonado de componentes pero no hay un botón visible para ello.

**Solución:** Añadir "Duplicar" en la barra de herramientas flotante de cada
componente (al lado de Eliminar). GrapesJS ya tiene el comando `core:component-clone`.

### 3.10 La interfaz no guarda el estado de los paneles entre sesiones
Si el usuario cierra el panel derecho o cambia el ancho de los paneles laterales,
esa preferencia se pierde al recargar. Lo mismo para el sector del style manager
que tenía abierto.

**Solución:** Persistir estado de UI (ancho de paneles, sector abierto en style manager,
vista de dispositivo activa) en `browser.storage.local`.

---

## 4. CARACTERÍSTICAS ÚTILES A IMPLEMENTAR

### 4.1 Variables dinámicas / personalización
Permitir insertar variables como `{{nombre}}`, `{{empresa}}`, `{{ciudad}}`
en el texto. En la previsualización, mostrar valores de ejemplo. En la exportación,
mantener las variables para que el sistema de envío las sustituya.

**Implementación:** Un botón "Insertar variable" en el RTE que abre un desplegable
con las variables disponibles. Opcionalmente, un panel de "Previsualizar con datos"
donde el usuario introduzca valores de ejemplo.

### 4.2 Análisis de compatibilidad con clientes de email
MJML garantiza compatibilidad básica, pero hay propiedades CSS que solo
funcionan en algunos clientes. El usuario no sabe si su diseño se verá bien
en Gmail, Outlook 2019, Apple Mail, etc.

**Implementación:** Integrar la base de datos de Caniemail.com (tienen una API JSON
pública) para marcar en el style manager qué propiedades tienen soporte limitado.
Un icono de advertencia ⚠ junto a `box-shadow` con tooltip "No soportado en Outlook".

### 4.3 Análisis de spam básico
Las funciones de IA incluyen un botón de análisis de spam pero es genérico.
Se podría añadir un análisis basado en reglas simples (ratio imagen/texto,
palabras en mayúsculas, exceso de signos de exclamación, ausencia de enlace
de baja) que no requiera IA.

**Implementación:** Un módulo `spam-analyzer.js` con reglas simples. Se ejecuta
antes de "Insertar en Email" y muestra una puntuación con recomendaciones concretas.

### 4.4 Parámetros UTM para links
Muchos emails de marketing necesitan añadir `?utm_source=email&utm_campaign=...`
a todos los enlaces. Hacerlo a mano en cada botón es tedioso y propenso a errores.

**Implementación:** Un panel de "Configuración de campaña" donde el usuario
define los parámetros UTM. Al compilar, se añaden automáticamente a todos los
`<a href>` que apunten a dominios externos.

### 4.5 Modo previsualización por cliente de email
Actualmente la previsualización es una vista del MJML compilado en el canvas.
No simula cómo lo vería un cliente de email específico.

**Implementación a nivel básico:** Mostrar el HTML compilado en un iframe
con el ancho y font-stack característico de Gmail / Outlook / Apple Mail.
No es una simulación perfecta pero sí orientativa.

### 4.6 Exportación directa a archivo MJML
El usuario puede exportar HTML pero no MJML. Para reutilizar el diseño en
sistemas que compilan MJML en el servidor (como campañas de email marketing),
necesita el MJML fuente.

**Implementación:** Ya existe `getMjml()` en IMPORT_EXPORT. Solo falta
un botón "Exportar MJML" en el modal de exportación. (El código de descarga
también existe en `exportMjmlToFile()`.)

### 4.7 Atajos de teclado documentados
Existen keymaps (Ctrl+S, Backspace, Ctrl+Alt+P) pero el usuario no los conoce.

**Implementación:** Un modal "?" o un botón de ayuda que muestre todos los
atajos disponibles. GrapesJS expone `editor.Keymaps.getAll()`.

### 4.8 Búsqueda de componentes en el panel de capas
En emails complejos con muchas secciones, encontrar el componente correcto
en el árbol de capas es lento.

**Implementación:** Un campo de búsqueda en el panel de capas que filtre
por tipo de componente o por contenido de texto.

### 4.9 Bloque de "texto condicional" para Outlook
Outlook renderiza ciertas cosas de manera diferente. Un bloque de comentarios
condicionales `<!--[if mso]>...<![endif]-->` permitiría al usuario avanzado
incluir estilos específicos para Outlook.

**Implementación:** Un bloque personalizado en el block manager etiquetado
"Fix Outlook" que inserta el comentario condicional con un placeholder editable.

### 4.10 Historial de emails generados por IA
Si el usuario pide a la IA generar un email, prueba el resultado, pide
otra variación y luego quiere volver a la primera versión, no puede.

**Implementación:** El modal de generación de IA mantiene un array de las
últimas 3-5 generaciones con botones "Anterior" / "Siguiente" antes de confirmar.

---

## 5. RENDIMIENTO

### 5.1 updateEmailSize compila MJML en cada edición
La función `updateEmailSize` llama a `getCompiledHtml()` que ejecuta
`mjml-code-to-html`, una compilación completa de MJML. Esto ocurre con
un debounce de 500ms en cada cambio de componente. En emails complejos,
esta compilación tarda entre 200-500ms, bloqueando el hilo de JS.

**Solución:** Calcular el tamaño a partir del MJML serializado (texto plano)
en lugar de compilarlo a HTML. La diferencia de tamaño entre ambos es pequeña
y predecible. La compilación completa solo debería ocurrir al exportar.

### 5.2 Sin caché del HTML compilado
Cada llamada a `getCompiledHtml()` compila desde cero aunque el modelo no haya
cambiado. Si el usuario abre el modal de exportación, hace clic en "Copiar HTML"
y luego en "Descargar HTML", se compila dos veces.

**Solución:** Cache invalidado por `component:update`. Guardar el último
resultado compilado y un hash del MJML actual. Si el hash no cambió, devolver
el cache.

### 5.3 Todas las plantillas cargadas en memoria desde el inicio
`templates-data.js` carga todas las plantillas MJML como strings en memoria
aunque el usuario solo vaya a usar una. Con 8 plantillas de media a 3KB cada una,
son ~24KB de strings en memoria que la mayoría de sesiones no se usarán.

**Solución:** Lazy loading. Cargar el MJML de cada plantilla solo cuando
el usuario la selecciona en el modal.

### 5.4 Polling cada 10 segundos al proveedor de IA
`setInterval(() => this.updateAIStatus(), 10000)` hace una petición HTTP
cada 10 segundos durante toda la sesión. Para LM Studio local esto no es
un problema, pero para Groq y OpenRouter supone ~360 peticiones en una hora.

**Solución:** Comprobar el estado solo cuando el usuario interactúa con la IA
(antes de enviar una petición) o cuando cambia la configuración. Eliminar el polling
continuo.

---

## 6. TESTING Y CALIDAD

### 6.1 Cobertura de tests muy baja
Solo existen 3 archivos de test que cubren funciones utilitarias puras y
algunos mocks básicos. No hay tests para:
- El flujo completo de generación de email con IA
- La lógica de inserción en Thunderbird (`insertHtmlToCompose`)
- Los eventos del editor (component:update, style:property:update)
- La integración entre modules (editor.js + style-manager.js)
- Comportamiento del canvas en distintos estados

### 6.2 Sin CI/CD
No existe ningún pipeline de automatización. El proceso de release es manual:
modificar archivos → hacer zip → instalar en Thunderbird → probar a mano.

**Solución:** GitHub Actions con:
1. `npm test` en cada push
2. Construcción del XPI automática en cada tag
3. Carga del XPI como artifact de la release

### 6.3 Sin linter
No hay ESLint configurado. Errores como variables no declaradas, comparaciones
con `==` en lugar de `===`, o funciones async sin `await` no se detectan
hasta ejecutar el código.

**Solución:** Añadir ESLint con el preset `eslint:recommended` más las reglas
`no-implicit-globals` y `prefer-const`. Ejecución automática en pre-commit con Husky.

---

## 7. EXTENSIÓN / MANIFEST

### 7.1 Manifest Version 2 — planificar migración a MV3
Thunderbird adoptará Manifest V3 en algún momento siguiendo a Firefox.
La API `browser.compose` y el background script persistente son los úntos
de mayor riesgo de incompatibilidad.

**Acción:** Monitorizar el roadmap de Thunderbird en developer.thunderbird.net
y en la lista de correo tb-addon-developers. Cuando anuncien fechas de
deprecación MV2, migrar `background.js` a un Service Worker.

### 7.2 web_accessible_resources expone todo el directorio editor/
`"web_accessible_resources": ["editor/*"]` hace que cualquier página web
pueda cargar cualquier archivo de `editor/` como recurso cross-origin.
Esto incluye los archivos JS con la lógica de IA y las API keys en memoria.

**Solución:** Limitar solo a los recursos que genuinamente necesitan ser
accesibles desde fuera: típicamente `editor/index.html` y poco más.

### 7.3 Sin versión mínima de Thunderbird recomendada
`strict_min_version: "115.0"` es correcto, pero no hay `strict_max_version`.
Si una versión futura de Thunderbird rompe la API `compose`, la extensión
instalada seguirá apareciendo como compatible aunque falle.

---

## 8. RESUMEN PRIORIZADO

### Prioridad ALTA (bugs / bloqueos de usuario)
- [x] Eliminar el polling de 10s al proveedor de IA ← **hecho** (rama `improvements/p-alta`)
- [x] Mover plantillas del usuario a `browser.storage.local` ← **hecho**
- [x] Confirmación antes de cargar plantilla (si hay contenido) ← **hecho**
- [x] Deduplicación de plantillas al guardar ← **hecho**
- [ ] Limpiar propiedades desconocidas del manifest (`locales`, `chrome_injectors`)

### Prioridad MEDIA (experiencia de usuario)
- [ ] Botón "Duplicar sección"
- [ ] Previsualización de plantilla antes de cargar
- [ ] Panel de "Historial" con autoguardado cada 2 minutos
- [ ] Configuración de colores de marca persistente
- [ ] Modal de ayuda con atajos de teclado
- [ ] Exportación MJML desde el modal de exportación (ya hay código, falta el botón)

### Prioridad MEDIA (calidad técnica)
- [ ] Extraer constantes de timing a un módulo de config
- [ ] Eliminar código muerto de background.js
- [ ] Añadir ESLint
- [ ] CI/CD básico con GitHub Actions
- [ ] Mover cálculo de tamaño fuera de la compilación completa

### Prioridad BAJA (largo plazo)
- [ ] Migrar a ES Modules
- [ ] TypeScript
- [ ] Variables dinámicas ({{nombre}})
- [ ] Análisis de compatibilidad con Caniemail
- [ ] Parámetros UTM automáticos
- [ ] Planificación de migración a Manifest V3

---

## 9. PRINCIPIOS DE IMPLEMENTACIÓN — SIN REGRESIONES

Cada mejora debe aplicarse siguiendo estas reglas sin excepción.
El objetivo es que en ningún momento el editor pierda funcionalidad que ya
tenía, y que cada cambio quede verificado de forma automática y permanente.

### 9.1 Regla de oro: cambio mínimo verificable
Cada tarea del plan de prioridades se implementa como una unidad atómica:
- Un PR por mejora (nunca agrupar dos mejoras distintas en el mismo commit)
- El test que cubre la mejora se escribe en el mismo commit que el código
- Si el test no pasa, el código no entra

### 9.2 Antes de tocar cualquier archivo
1. Ejecutar `npm test` y anotar cuántos tests pasan (baseline)
2. Identificar qué funciones del archivo afectado tienen tests existentes
3. Si no los tienen, escribir primero los tests que describen el comportamiento
   ACTUAL antes de cambiar nada (tests de caracterización)
4. Hacer el cambio
5. Ejecutar `npm test` de nuevo — el número de tests que pasan no puede bajar

### 9.3 Qué nunca tocar sin tests previos
- `getCompiledHtml()` / `healComponent()` — cualquier cambio aquí afecta
  la exportación y la inserción en Thunderbird
- `loadInitialTemplate()` — afecta el arranque del editor
- `insertHtmlToCompose()` en background.js — afecta la funcionalidad principal
- Cualquier listener de eventos de GrapesJS — como demostró el bug de la alineación,
  un listener de más o de menos rompe comportamientos aparentemente no relacionados

### 9.4 Señales de que algo se rompió (checklist manual mínimo)
Después de cada cambio, antes de hacer commit, verificar:
- [ ] El editor abre sin errores en consola
- [ ] Se puede arrastrar un bloque al canvas
- [ ] Se puede cambiar la alineación de un texto y persiste
- [ ] El botón "Insertar en Email" funciona
- [ ] Ctrl+Z deshace el último cambio
- [ ] El indicador de tamaño (KB) se actualiza al añadir contenido

---

## 10. PLAN DE TESTS POR MEJORA

Cada sección indica: qué archivo de test crear o ampliar, qué describe cada test,
y el comando de verificación. Todos los tests son Jest (el framework ya configurado)
y deben funcionar en Node sin navegador salvo indicación explícita.

---

### MEJORA P.ALTA-1 — Eliminar polling continuo de IA
**Archivo:** `tests/ai-handlers.test.js` (nuevo)

```javascript
// Test 1: init() no llama setInterval
test('AI_HANDLERS.init no registra un setInterval de salud', () => {
  const spy = jest.spyOn(global, 'setInterval');
  // montar AI_HANDLERS con mocks mínimos...
  // comprobar que setInterval NO fue llamado con la función updateAIStatus
  expect(spy).not.toHaveBeenCalled();
});

// Test 2: updateAIStatus se puede llamar manualmente y devuelve un estado
test('updateAIStatus devuelve un objeto con campo status', async () => {
  global.AI_API = { checkHealth: jest.fn().mockResolvedValue({ status: 'ok' }) };
  const result = await AI_HANDLERS.updateAIStatus();
  expect(result).toHaveProperty('status');
});
```

**Verificación de no-regresión:** el test existente de `AI_API.init` debe
seguir pasando (comprueba que las keys de storage se solicitan correctamente).

---

### MEJORA P.ALTA-2 — Plantillas del usuario en browser.storage.local
**Archivo:** `tests/editor-actions.test.js` (nuevo, reemplaza la sección
de template management de bugs.test.js con mocks de browser.storage)

```javascript
// Setup: mock browser.storage.local en lugar de localStorage
global.browser = {
  storage: { local: {
    get: jest.fn().mockResolvedValue({}),
    set: jest.fn().mockResolvedValue()
  }}
};

// Test 1: saveCurrentTemplate escribe en browser.storage.local, no en localStorage
test('saveCurrentTemplate persiste en browser.storage.local', async () => {
  await EDITOR_ACTIONS.saveCurrentTemplate();
  expect(global.browser.storage.local.set).toHaveBeenCalled();
  expect(localStorage.setItem).not.toHaveBeenCalled();
});

// Test 2: getSavedTemplates lee de browser.storage.local
test('getSavedTemplates lee de browser.storage.local', async () => {
  global.browser.storage.local.get.mockResolvedValueOnce({
    savedTemplates: JSON.stringify([{ name: 'T1', mjml: '<mjml/>' }])
  });
  const templates = await EDITOR_ACTIONS.getSavedTemplates();
  expect(templates).toHaveLength(1);
  expect(templates[0].name).toBe('T1');
});

// Test 3: no-regresión — guardar con nombre duplicado sobreescribe, no duplica
test('guardar plantilla con nombre existente sobreescribe', async () => {
  // igual que el test ya existente en bugs.test.js pero con el nuevo storage
  await EDITOR_ACTIONS.saveCurrentTemplate(); // nombre: 'My Template'
  await EDITOR_ACTIONS.saveCurrentTemplate(); // mismo nombre
  const templates = await EDITOR_ACTIONS.getSavedTemplates();
  expect(templates.filter(t => t.name === 'My Template')).toHaveLength(1);
});
```

---

### MEJORA P.ALTA-3 — Confirmación antes de cargar plantilla
**Archivo:** `tests/template-ui.test.js` (nuevo)

```javascript
// Test 1: si el editor tiene contenido, showModal se llama antes de cargar
test('loadTemplate pide confirmación si hay contenido en el editor', () => {
  global.editor = {
    getWrapper: jest.fn(() => ({
      components: jest.fn(() => ({ length: 3 })) // hay 3 componentes
    })),
    setComponents: jest.fn()
  };
  global.showModal = jest.fn();

  TEMPLATE_UI.loadTemplate('welcome');

  expect(global.showModal).toHaveBeenCalled();
  expect(global.editor.setComponents).not.toHaveBeenCalled(); // no carga aún
});

// Test 2: si el editor está vacío, carga directamente sin modal
test('loadTemplate carga directo si el editor está vacío', () => {
  global.editor = {
    getWrapper: jest.fn(() => ({
      components: jest.fn(() => ({ length: 0 }))
    })),
    setComponents: jest.fn()
  };
  global.showModal = jest.fn();

  TEMPLATE_UI.loadTemplate('welcome');

  expect(global.showModal).not.toHaveBeenCalled();
  expect(global.editor.setComponents).toHaveBeenCalledWith(
    expect.stringContaining('<mjml>')
  );
});
```

---

### MEJORA P.ALTA-4 — Deduplicación de plantillas al guardar
Este test ya existe en `tests/bugs.test.js` como test de regresión.
Solo verificar que sigue pasando tras la migración a browser.storage.
No es necesario escribir tests nuevos.

**Comando:** `npm test -- --testNamePattern="BUG: saving a template"`

---

### MEJORA P.ALTA-5 — Limpiar manifest
No requiere test de Jest. La verificación es:
```
// En package.json scripts añadir:
"validate:manifest": "node -e \"JSON.parse(require('fs').readFileSync('manifest.json','utf8')); console.log('OK')\""
```
Y comprobar que no aparecen WARN de `locales` ni `chrome_injectors` en el
Browser Console de Thunderbird tras reinstalar.

---

### MEJORA P.MEDIA-UX-1 — Botón "Duplicar sección"
**Archivo:** `tests/editor-commands.test.js` (nuevo)

```javascript
// Test 1: el comando 'duplicate-component' existe en el registro de comandos
test('el comando duplicate-component está registrado en el editor', () => {
  expect(global.editor.Commands.has('duplicate-component')).toBe(true);
});

// Test 2: ejecutar el comando sobre un componente seleccionado no lanza excepción
test('duplicate-component no lanza error con un componente seleccionado', () => {
  global.editor.select(mockMjSection);
  expect(() => {
    global.editor.runCommand('duplicate-component');
  }).not.toThrow();
});
```

---

### MEJORA P.MEDIA-UX-3 — Autoguardado cada 2 minutos
**Archivo:** `tests/autosave.test.js` (nuevo)

```javascript
// Test 1: AutoSave.start registra un intervalo
test('AutoSave.start registra un setInterval', () => {
  const spy = jest.spyOn(global, 'setInterval');
  AutoSave.start();
  expect(spy).toHaveBeenCalledWith(expect.any(Function), 120000);
});

// Test 2: AutoSave.save escribe en browser.storage.local con timestamp
test('AutoSave.save escribe versión con timestamp', async () => {
  global.editor = { getMjml: jest.fn().mockReturnValue('<mjml/>') };
  await AutoSave.save();
  const [key, value] = global.browser.storage.local.set.mock.calls.at(-1);
  expect(key.autosaveHistory).toBeDefined();
  expect(key.autosaveHistory[0].ts).toBeGreaterThan(0);
});

// Test 3: AutoSave mantiene máximo 5 versiones
test('AutoSave no almacena más de 5 versiones', async () => {
  // simular 6 guardados
  for (let i = 0; i < 6; i++) await AutoSave.save();
  const history = await AutoSave.getHistory();
  expect(history.length).toBeLessThanOrEqual(5);
});

// Test 4 (no-regresión): el guardado manual de plantilla sigue funcionando
// independientemente del autoguardado
test('saveCurrentTemplate funciona con AutoSave activo', async () => {
  AutoSave.start();
  await EDITOR_ACTIONS.saveCurrentTemplate();
  expect(global.browser.storage.local.set).toHaveBeenCalled();
});
```

---

### MEJORA P.MEDIA-TEC-1 — Constantes de timing
**Archivo:** `tests/config.test.js` (nuevo)

```javascript
const { TIMING } = require('../editor/config.js');

// Test 1: todas las constantes son números positivos
test('TIMING contiene solo números positivos', () => {
  Object.values(TIMING).forEach(v => {
    expect(typeof v).toBe('number');
    expect(v).toBeGreaterThan(0);
  });
});

// Test 2: los valores críticos existen con los nombres esperados
test('TIMING tiene las claves requeridas', () => {
  expect(TIMING).toHaveProperty('COMPONENT_UPDATE_DEBOUNCE');
  expect(TIMING).toHaveProperty('COMPILE_DEBOUNCE');
  expect(TIMING).toHaveProperty('INIT_DEFER');
});
```

---

### MEJORA P.MEDIA-TEC-5 — Cálculo de tamaño sin compilación completa
**Archivo:** `tests/size-indicator.test.js` (nuevo)

```javascript
// Test 1: calcularTamaño recibe MJML (string) y devuelve número de bytes
test('calcularTamano devuelve el tamaño en bytes del MJML serializado', () => {
  const mjml = '<mjml><mj-body></mj-body></mjml>';
  const bytes = calcularTamano(mjml);
  expect(typeof bytes).toBe('number');
  expect(bytes).toBe(new Blob([mjml]).size);
});

// Test 2: no-regresión — formatBytes sigue funcionando para el display
test('formatBytes 0 devuelve "0 Bytes"', () => {
  expect(formatBytes(0)).toBe('0 Bytes');
});

test('formatBytes 1 GB no devuelve undefined', () => {
  expect(formatBytes(1024 ** 3)).toMatch(/GB$/);
});
```

---

### MEJORA P.BAJA-3 — Variables dinámicas {{nombre}}
**Archivo:** `tests/variables.test.js` (nuevo)

```javascript
const { resolveVariables, extractVariables } = require('../editor/variables.js');

// Test 1: extractVariables detecta todas las variables en un MJML
test('extractVariables encuentra todas las variables en el MJML', () => {
  const mjml = '<mj-text>Hola {{nombre}}, tu pedido {{codigo}} está listo.</mj-text>';
  const vars = extractVariables(mjml);
  expect(vars).toContain('nombre');
  expect(vars).toContain('codigo');
  expect(vars).toHaveLength(2);
});

// Test 2: resolveVariables sustituye correctamente
test('resolveVariables sustituye variables por sus valores', () => {
  const mjml = '<mj-text>Hola {{nombre}}</mj-text>';
  const result = resolveVariables(mjml, { nombre: 'Ana' });
  expect(result).toBe('<mj-text>Hola Ana</mj-text>');
});

// Test 3: variables no definidas se dejan como están
test('resolveVariables deja intactas las variables sin valor', () => {
  const mjml = '<mj-text>{{sin_valor}}</mj-text>';
  const result = resolveVariables(mjml, {});
  expect(result).toBe('<mj-text>{{sin_valor}}</mj-text>');
});

// Test 4: no-regresión — sanitizeMjml sigue aceptando MJML con variables
test('sanitizeMjml no destruye variables al limpiar el MJML', () => {
  const input = '<mjml><mj-body><mj-section><mj-column>' +
                '<mj-text>{{nombre}}</mj-text>' +
                '</mj-column></mj-section></mj-body></mjml>';
  const result = AI_API.sanitizeMjml(input);
  expect(result).toContain('{{nombre}}');
});
```

---

### MEJORA P.BAJA-4 — Análisis de spam por reglas
**Archivo:** `tests/spam-analyzer.test.js` (nuevo)

```javascript
const { analizarSpam } = require('../editor/spam-analyzer.js');

// Test 1: texto con muchas mayúsculas sube la puntuación de riesgo
test('EXCESO DE MAYÚSCULAS sube el riesgo', () => {
  const result = analizarSpam({ texto: 'COMPRA AHORA OFERTA GRATIS GRATIS' });
  expect(result.puntuacion).toBeGreaterThan(50);
});

// Test 2: email sin enlace de baja añade advertencia
test('ausencia de enlace de baja añade aviso', () => {
  const result = analizarSpam({ html: '<p>Hola</p>', tieneEnlaceBaja: false });
  expect(result.avisos).toContain(expect.stringMatching(/baja/i));
});

// Test 3: email limpio tiene puntuación baja
test('email correcto tiene puntuación menor a 20', () => {
  const result = analizarSpam({
    texto: 'Bienvenido a nuestro boletín mensual.',
    tieneEnlaceBaja: true,
    ratioImagenTexto: 0.3
  });
  expect(result.puntuacion).toBeLessThan(20);
});
```

---

## 11. INTEGRACIÓN CON GITHUB ACTIONS

Todos los tests anteriores se ejecutan automáticamente en cada push y PR.
El siguiente workflow cubre: lint, tests y construcción del XPI.

Crear el archivo `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Lint (cuando ESLint esté configurado)
        run: npm run lint --if-present

      - name: Ejecutar tests
        run: npm test -- --coverage --coverageReporters=text-summary

      - name: Validar manifest.json
        run: node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8')); console.log('manifest OK')"

      - name: Verificar que no hay propiedades inválidas en manifest
        run: |
          node -e "
            const m = JSON.parse(require('fs').readFileSync('manifest.json','utf8'));
            const invalid = ['locales','chrome_injectors'];
            const found = invalid.filter(k => k in m);
            if (found.length) { console.error('Propiedades inválidas:', found); process.exit(1); }
            console.log('manifest sin propiedades inválidas');
          "

  build-xpi:
    runs-on: ubuntu-latest
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4

      - name: Construir XPI
        run: |
          zip -r visual-email-editor.xpi \
            manifest.json background.js editor/ icons/ popup/ \
            --exclude "editor/lib/*.map" \
            --exclude "**/.DS_Store"

      - name: Subir XPI como artifact de la release
        uses: softprops/action-gh-release@v2
        with:
          files: visual-email-editor.xpi
```

### Flujo de trabajo con este CI

```
desarrollador hace cambio
        ↓
escribe test que cubre el cambio (mismo commit)
        ↓
push / abre PR
        ↓
GitHub Actions ejecuta npm test
  - si algún test falla → PR bloqueado, no se mergea
  - si todos pasan    → PR aprobable
        ↓
merge a main
        ↓
si se crea un tag vX.Y.Z →
  CI construye el XPI automáticamente
  y lo adjunta a la release de GitHub
```

### Umbrales de cobertura recomendados (añadir a jest.config.js)

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  coverageThresholds: {
    global: {
      functions: 60,   // subir 10 puntos por cada sprint
      lines:     50,
      branches:  40,
    }
  }
};
```

Los umbrales empiezan bajos para no bloquear el trabajo actual y se suben
gradualmente conforme se añaden los tests de cada mejora.

---

## 12. REGISTRO DE CAMBIOS IMPLEMENTADOS

Historial de lo que ya está en el código. Cada entrada indica la rama,
los archivos modificados y qué comportamiento cambia exactamente.

---

### [2026-05-26] Rama: `improvements/p-alta`

#### Fix: Eliminación de logs de depuración temporales
**Archivos:** `editor/style-manager.js`, `editor/import-export.js`

Durante la investigación del bug de alineación se añadieron listeners de
depuración con `console.warn` (prefijo `[DBG]`) en `style-manager.js` y
mensajes de log verbosos en `import-export.js`. Esta sesión los eliminó:

- `style-manager.js`: eliminados los 4 listeners de eventos debug
  (`style:property:update`, `component:update`, `component:update:attributes`,
  `component:update:style`). El método `init()` queda vacío, reservado para
  listeners de sincronización futuros.
- `import-export.js`: simplificados los mensajes de log de `getCompiledHtml()`
  a nivel `console.log` estándar. Eliminados los `console.warn` en
  `healComponent()`.

**Comportamiento anterior:** La consola del desarrollador se llenaba de líneas
`[DBG ...]` en cada edición, dificultando la depuración real.  
**Comportamiento nuevo:** Consola limpia en uso normal.

---

#### Mejora P.ALTA-1: Eliminar polling continuo de estado de IA
**Archivo:** `editor/ai-handlers.js`

- [x] Eliminado `setInterval(() => this.updateAIStatus(), 10000)` de `init()`
- [x] El health check ahora se ejecuta solo en tres momentos:
  1. Al inicializar el módulo (una vez, al arrancar el editor)
  2. Al abrir el modal de configuración de IA
  3. Después de guardar cambios en la configuración

**Por qué:** Cada tick hacía una petición HTTP al proveedor (Groq, OpenRouter,
LM Studio). En una hora de trabajo = 360 peticiones innecesarias. Además,
el intervalo no se limpiaba nunca, pudiendo acumularse entre recargas.

---

#### Mejora P.ALTA-2: Plantillas de usuario en browser.storage.local
**Archivo:** `editor/editor-actions.js`

- [x] `getSavedTemplates()` es ahora `async` y lee de `browser.storage.local.get('savedTemplates')`
- [x] `saveCurrentTemplate()` escribe con `browser.storage.local.set({ savedTemplates: ... })`
- [x] `showSavedTemplatesModal()` es ahora `async` (depende del await de getSavedTemplates)
- [x] `loadTemplate(index)` es ahora `async`
- [x] `deleteTemplate(index)` es ahora `async`

**Por qué:** `localStorage` en una extensión de Thunderbird puede ser limpiado
por el sistema sin aviso. `browser.storage.local` es el almacenamiento
persistente diseñado para extensiones y sobrevive a reinicios.

---

#### Mejora P.ALTA-3: Confirmación antes de cargar plantilla
**Archivos:** `editor/editor-actions.js`, `editor/template-ui.js`

- [x] `EDITOR_ACTIONS.loadTemplate()`: antes de llamar a `editor.setComponents()`,
  muestra un modal de confirmación con el nombre de la plantilla y un aviso
  de que los cambios no guardados se perderán.
- [x] `TEMPLATE_UI.loadTemplate()`: mismo comportamiento para las plantillas
  de la librería predefinida. Al cancelar, vuelve al modal de la librería.

**Por qué:** Antes, hacer clic accidentalmente en "Load" destruía el trabajo
actual sin posibilidad de recuperación. La confirmación cuesta un clic extra
pero evita pérdidas de trabajo.

---

#### Mejora P.ALTA-4: Deduplicación de plantillas al guardar
**Archivo:** `editor/editor-actions.js`

- [x] `saveCurrentTemplate()` busca si ya existe una plantilla con el mismo
  nombre antes de insertar (`findIndex` por nombre).
- [x] Si ya existe → sobreescribe la entrada existente y muestra
  `"Template X updated"`.
- [x] Si no existe → inserta al principio del array y muestra
  `"Template X saved"`.

**Por qué:** En v1.1.2, guardar con el mismo nombre acumulaba entradas
duplicadas. El usuario no podía saber cuál era la versión más reciente.
