// Visual Email Editor - GrapesJS + MJML Editor Script

// ===== EDITOR INITIALIZATION =====
const editor = grapesjs.init({
    container: '#gjs',
    height: '100%',
    width: 'auto',
    fromElement: false,
    storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
        stepsBeforeSave: 1,
        id: 'gjs-',
    },

    // Use MJML plugin
    plugins: ['grapesjs-mjml'],
    pluginsOpts: {
        'grapesjs-mjml': {
            resetDevices: false,
            useCustomStyleManager: true
        }
    },
    
    // Internationalization
    i18n: {
        locale: 'es',
        detectLocale: false,
        messages: {
            es: {
                assetManager: {
                    addButton: 'Añadir imagen',
                    inputPlaceholder: 'http://url-de-la-imagen.jpg',
                    modalTitle: 'Seleccionar Imagen',
                    uploadTitle: 'Arrastra archivos aquí o haz clic para subir'
                },
                blockManager: {
                    labels: {
                        'mj-text': 'Texto',
                        'mj-column': 'Columna',
                        'mj-section': 'Sección',
                        'mj-image': 'Imagen',
                        'mj-button': 'Botón',
                        'mj-divider': 'Divisor',
                        'mj-spacer': 'Espaciador',
                        'mj-social': 'Redes Sociales',
                        'mj-navbar': 'Barra de Navegación',
                        'mj-group': 'Grupo',
                        'mj-hero': 'Hero',
                        'mj-wrapper': 'Envoltorio'
                    },
                    categories: {
                        'Basic': 'Básico',
                        'Typography': 'Tipografía',
                        'Layout': 'Diseño'
                    }
                },
                styleManager: {
                    empty: 'Selecciona un elemento para editar su estilo',
                    sectors: {
                        Alignment: 'Alineación',
                        Dimension: 'Dimensiones',
                        Typography: 'Tipografía',
                        Decorations: 'Decoraciones',
                        Flex: 'Flexbox / Avanzado'
                    }
                },
                traitManager: {
                    empty: 'Selecciona un elemento para ver sus atributos',
                    label: 'Atributos'
                },
                deviceManager: {
                    device: 'Dispositivo',
                    devices: {
                        Desktop: 'Escritorio',
                        Tablet: 'Tablet',
                        Mobile: 'Móvil'
                    }
                }
            }
        }
    },

    blockManager: {
        appendTo: '#blocks'
    },

    // Style manager configuration
    styleManager: STYLE_MANAGER.getConfig(),

    // Layer manager configuration
    layerManager: {
        appendTo: '#layers-container'
    },

    // Selector manager configuration
    selectorManager: {
        appendTo: '#styles-container',
        componentFirst: true,
    },

    // Trait manager configuration
    traitManager: {
        appendTo: '#traits-container'
    },
    
    // Asset manager configuration
    assetManager: {
        // Assets are better handled via modals or direct URLs in MJML context
        assets: [],
        dropzone: false,
    },

    // Device manager for responsive preview
    deviceManager: {
        devices: [
            { name: 'Desktop', width: '' }, // Full width, no 640px limit
            { name: 'Tablet', width: '768px', widthMedia: '992px' },
            { name: 'Mobile', width: '375px', widthMedia: '480px' }
        ]
    },

    // Canvas configuration
    canvas: {
        styles: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            'body { padding-bottom: 600px !important; max-width: none !important; }'
        ]
    }
});

// Initialize modules
STYLE_MANAGER.init(editor);

// Global editor
window.editor = editor;

// Initial template loading - Wait for editor to be ready
const loadInitialTemplate = () => {
    try {
        // Only load default template if there's no stored content
        const storageManager = editor.StorageManager;
        const storedData = storageManager.load();
        
        if (!storedData || (!storedData.components && !storedData.html)) {
            console.log('[Editor] No stored content found, loading default template');
            const mjmlCode = TEMPLATE_LIBRARY[0].mjml;
            editor.setComponents(mjmlCode.trim());
        } else {
            console.log('[Editor] Restored content from local storage');
        }
        
        setTimeout(() => {
            editor.refresh();
            updateEmailSize();
            syncWidthUI();
            bindWidthControl();
        }, 500);
    } catch (err) {
        console.error('Safe Load error:', err);
    }
};

// Keymaps Configuration
const initKeymaps = () => {
    const keymaster = editor.Keymaps;
    
    // Ctrl+S: Save Template Action
    keymaster.add('save-template', 'control+s, command+s', (e) => {
        e.preventDefault();
        EDITOR_ACTIONS.showSaveTemplateModal();
    });

    // Delete/Backspace: Remove selected component
    keymaster.add('delete-comp', 'backspace, delete', (e) => {
        const selected = editor.getSelected();
        if (selected && !selected.is('wrapper')) {
            editor.runCommand('tlb-delete');
        }
    });

    // Ctrl+Alt+P: Toggle Preview
    keymaster.add('toggle-preview', 'control+alt+p, command+alt+p', (e) => {
        EDITOR_ACTIONS.togglePreview();
    });

    console.log('[Editor] Custom keymaps initialized');
};

// Global Commands Registration
const initCommands = () => {
    const commands = editor.Commands;

    // AI commands
    commands.add('ai-improve-text', {
        run(editor, sender, opts = {}) {
            if (window.AI_HANDLERS) AI_HANDLERS.openImproveTextModal();
        }
    });

    commands.add('ai-generate-email', {
        run(editor, sender, opts = {}) {
            if (window.AI_HANDLERS) AI_HANDLERS.openGenerateModal();
        }
    });

    // Action commands
    commands.add('export-html', {
        run() {
            if (window.EDITOR_ACTIONS) EDITOR_ACTIONS.showExportModal();
        }
    });

    commands.add('insert-to-thunderbird', {
        run() {
            if (window.EDITOR_ACTIONS) EDITOR_ACTIONS.insertEmail();
        }
    });

    // Toggle Panels
    commands.add('show-layers', { run() { editor.Panels.getButton('views', 'open-layers').set('active', true); } });
    
    console.log('[Editor] Global commands registered');
};

// Width Control Logic
function bindWidthControl() {
    const widthInput = document.getElementById('emailWidthInput');
    if (!widthInput) return;

    // Remove old listeners to avoid duplicates
    const newWidthInput = widthInput.cloneNode(true);
    widthInput.parentNode.replaceChild(newWidthInput, widthInput);

    const updateWidth = (e) => {
        const value = parseInt(e.target.value);
        if (!value || value < 320 || value > 1200) return;

        const newWidth = value + 'px';
        const wrapper = editor.getWrapper();
        let mjBody = wrapper.find('mj-body')[0] || wrapper.findType('mj-body')[0];

        if (mjBody) {
            // 1. Update MJML Attribute
            mjBody.addAttributes({ width: newWidth });
            
            // 2. Synchronize Canvas Device Width (This is the fix!)
            if (value <= 480) {
                editor.setDevice('Mobile');
            } else if (value <= 992) {
                editor.setDevice('Tablet');
            } else {
                editor.setDevice('Desktop');
            }

            // 3. Force canvas width adjustment
            editor.Canvas.setCustomBadgeLabel(`Ancho: ${value}px`);
            const canvasEl = editor.Canvas.getElement();
            if (canvasEl) {
                const frame = canvasEl.querySelector('iframe');
                if (frame) frame.style.width = newWidth;
            }

            // 4. Update UI labels and internal styles
            document.documentElement.style.setProperty('--mjml-width', newWidth);
            
            const iframeDoc = editor.Canvas.getDocument();
            if (iframeDoc) {
                let styleEl = iframeDoc.getElementById('custom-mjml-width');
                if (!styleEl) {
                    styleEl = iframeDoc.createElement('style');
                    styleEl.id = 'custom-mjml-width';
                    iframeDoc.head.appendChild(styleEl);
                }
                styleEl.innerHTML = `
                    .mj-container { max-width: none !important; width: 100% !important; }
                    .mj-container > div { max-width: ${newWidth} !important; margin: 0 auto !important; }
                    body { min-width: auto !important; }
                `;
            }
            
            updateEmailSize();
        }
    };

    newWidthInput.addEventListener('change', updateWidth);
    newWidthInput.addEventListener('input', updateWidth);
}

// Watch for any MJML changes to keep UI in sync
editor.on('component:update:attributes', (component) => {
    if (component.get('type') === 'mj-body') {
        syncWidthUI();
    }
});

// Sync width UI with editor content
function syncWidthUI() {
    const mjBody = editor.getWrapper().find('mj-body')[0];
    if (mjBody) {
        const width = mjBody.getAttributes().width || '600px';
        const cssWidth = width.toString().includes('px') ? width : width + 'px';
        document.getElementById('emailWidthInput').value = parseInt(width);
        document.documentElement.style.setProperty('--mjml-width', cssWidth);
        
        // Inject invincible internal width override directly into the iframe
        const iframeDoc = editor.Canvas.getDocument();
        if (iframeDoc) {
            let styleEl = iframeDoc.getElementById('custom-mjml-width');
            if (!styleEl) {
                styleEl = iframeDoc.createElement('style');
                styleEl.id = 'custom-mjml-width';
                iframeDoc.head.appendChild(styleEl);
            }
            styleEl.innerHTML = `
                .mj-container { max-width: none !important; }
                .mj-container > div { max-width: ${cssWidth} !important; }
                body { min-width: ${cssWidth} !important; }
            `;
        }
    }
}

// Run once on start
bindWidthControl();
IMPORT_EXPORT.init();

if (editor.getModel().get('is_loaded')) {
    loadInitialTemplate();
} else {
    editor.on('load', loadInitialTemplate);
}

// ===== EMAIL SIZE CALCULATOR =====
const sizeIndicator = document.getElementById('sizeIndicator');
const sizeValue = document.getElementById('sizeValue');

async function updateEmailSize() {
    try {
        const html = await IMPORT_EXPORT.getCompiledHtml();
        const sizeBytes = new Blob([html]).size;

        // Update display
        sizeValue.textContent = formatBytes(sizeBytes);

        // Remove all size classes
        sizeIndicator.classList.remove('size-ok', 'size-warning', 'size-danger');

        // Gmail clips emails > 102KB
        if (sizeBytes < 50 * 1024) {
            sizeIndicator.classList.add('size-ok');
            sizeIndicator.title = 'Email size is optimal';
        } else if (sizeBytes < 102 * 1024) {
            sizeIndicator.classList.add('size-warning');
            sizeIndicator.title = 'Warning: Approaching Gmail 102KB limit';
        } else {
            sizeIndicator.classList.add('size-danger');
            sizeIndicator.title = 'Danger: Gmail may clip this email (>102KB)';
        }
    } catch (e) {
        sizeValue.textContent = '-- KB';
    }
}

// Update size on editor changes (debounced)
let sizeUpdateTimeout;
editor.on('component:update', () => {
    clearTimeout(sizeUpdateTimeout);
    sizeUpdateTimeout = setTimeout(updateEmailSize, 500);
});

editor.on('component:add', () => {
    clearTimeout(sizeUpdateTimeout);
    sizeUpdateTimeout = setTimeout(updateEmailSize, 500);
});

editor.on('component:remove', () => {
    clearTimeout(sizeUpdateTimeout);
    sizeUpdateTimeout = setTimeout(updateEmailSize, 500);
});

// Initial size calculation
setTimeout(updateEmailSize, 1000);

// ===== NEW DESIGN =====
document.getElementById('btnNew').addEventListener('click', () => {
    const content = `
        <div style="text-align: center; padding: 20px;">
            <p style="margin-bottom: 20px; font-size: 16px;">¿Estás seguro de que quieres empezar un nuevo diseño?</p>
            <p style="color: var(--text-secondary); font-size: 14px;">Se perderán todos los cambios que no hayas guardado como plantilla.</p>
        </div>
    `;

    showModal('Nuevo Diseño', content, [
        { text: 'Cancelar', primary: false, action: hideModal },
        {
            text: 'Empezar de cero', primary: true, class: 'btn-danger', action: () => {
                const emptyTemplate = `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="'Segoe UI', Inter, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body width="600px">
    <mj-section>
      <mj-column>
        <mj-text align="center">Empieza a diseñar tu email aquí...</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
                editor.setComponents(emptyTemplate);
                hideModal();
                showToast('Nuevo diseño iniciado');
                updateEmailSize();
            }
        }
    ]);
});

// ===== IMPORT HTML =====
document.getElementById('btnImportHtml').addEventListener('click', () => {
    IMPORT_EXPORT.showImportModal();
});

window.loadHtmlContent = (html, sourceName) => IMPORT_EXPORT.loadHtmlContent(html, sourceName);

// ===== EDITOR EVENTS =====
// Function to initialize blocks safely
const initBlocks = () => {
    if (window.CUSTOM_BLOCKS) {
        console.log('[Editor] Initializing custom blocks...');
        CUSTOM_BLOCKS.init(editor);
    } else {
        console.warn('[Editor] CUSTOM_BLOCKS not found!');
    }
};

// Check if editor is already loaded, otherwise listen
if (editor.getModel().get('isLoaded')) {
    initBlocks();
    loadInitialTemplate();
} else {
    editor.on('load', () => {
        console.log('[Editor] Load event fired');
        initBlocks();
        loadInitialTemplate();
    });
}

editor.on('component:selected', () => {
    // Auto switch to styles panel when component is selected
    const stylesTab = document.querySelector('[data-panel="styles"]');
    if (stylesTab) stylesTab.click();
});


// ===== INITIALIZE =====
PREVIEW_CONTROLS.init();
TEMPLATE_UI.init();
AI_HANDLERS.init();
EDITOR_ACTIONS.init();
initKeymaps();
initCommands();
console.log('Visual Email Editor initialized');
