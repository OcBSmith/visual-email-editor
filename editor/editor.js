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
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
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
        }, TIMING.INIT_DEFER);
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

    // Duplicate the selected component and insert it right after
    commands.add('duplicate-component', {
        run(ed) {
            const sel = ed.getSelected();
            if (!sel || sel.is('wrapper')) return;
            const clone = sel.clone();
            sel.collection.add(clone, { at: sel.index() + 1 });
            showToast('Sección duplicada');
        }
    });

    console.log('[Editor] Global commands registered');
};

// --- LÓGICA DE CONTROL DE ANCHO Y SCROLL ---
function bindWidthControl() {
    const widthInput = document.getElementById('emailWidthInput');
    if (!widthInput) return;

    const updateWidth = (e) => {
        const value = parseInt(e.target.value);
        if (!value || value < 320 || value > 1200) return;
        const newWidth = value + 'px';

        // 1. Ajuste visual instantáneo del frame
        const frame = editor.Canvas.getFrameEl();
        if (frame) {
            frame.style.width = newWidth;
        }

        // 2. Actualizar el modelo de MJML
        const mjBody = editor.getWrapper().findType('mj-body')[0];
        if (mjBody) {
            mjBody.addAttributes({ width: newWidth });
        }

        // 3. Inyectar estilos correctores de SCROLL y CENTRADO directamente en el DOM del iframe
        const doc = editor.Canvas.getDocument();
        if (doc) {
            let style = doc.getElementById('gjs-mjml-fix');
            if (!style) {
                style = doc.createElement('style');
                style.id = 'gjs-mjml-fix';
                doc.head.appendChild(style);
            }
            style.innerHTML = `
                body { 
                    display: flex !important; 
                    flex-direction: column !important; 
                    align-items: center !important; 
                    min-height: 100% !important;
                    padding-bottom: 150px !important; /* EL FIX DEL SCROLL */
                }
                .mj-container { 
                    width: 100% !important; 
                    max-width: none !important;
                }
                .mj-container > div { 
                    margin: 0 auto !important; 
                    max-width: ${newWidth} !important;
                }
            `;
        }
        
        // 4. Actualizar memoria de escritorio
        if (value > 992 && window.PREVIEW_CONTROLS) {
            window.PREVIEW_CONTROLS.lastDesktopWidth = value;
        }
        
        document.documentElement.style.setProperty('--mjml-width', newWidth);
    };

    widthInput.addEventListener('input', updateWidth);
}

// Escuchar específicamente cuando el frame se carga para inyectar el arreglo de scroll
editor.on('canvas:frame:load', () => {
    const widthInput = document.getElementById('emailWidthInput');
    if (widthInput) widthInput.dispatchEvent(new Event('input'));
});

// Sincronización inversa (cuando MJML cambia externamente)
function syncWidthUI() {
    const mjBody = editor.getWrapper().findType('mj-body')[0];
    if (mjBody) {
        const width = mjBody.getAttributes().width || '600px';
        const widthInput = document.getElementById('emailWidthInput');
        if (widthInput) {
            widthInput.value = parseInt(width);
            widthInput.dispatchEvent(new Event('input'));
        }
    }
}


// ===== EMAIL SIZE CALCULATOR =====
const sizeIndicator = document.getElementById('sizeIndicator');
const sizeValue = document.getElementById('sizeValue');

async function updateEmailSize() {
    try {
        // Use serialized MJML for size estimation — avoids a full MJML→HTML compilation
        // on every keystroke. Full compilation only happens on export/insert.
        const mjml = await IMPORT_EXPORT.getMjml();
        const sizeBytes = new Blob([mjml]).size;

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
    sizeUpdateTimeout = setTimeout(updateEmailSize, TIMING.COMPONENT_UPDATE_DEBOUNCE);
});

editor.on('component:add', () => {
    clearTimeout(sizeUpdateTimeout);
    sizeUpdateTimeout = setTimeout(updateEmailSize, TIMING.COMPONENT_UPDATE_DEBOUNCE);
});

editor.on('component:remove', () => {
    clearTimeout(sizeUpdateTimeout);
    sizeUpdateTimeout = setTimeout(updateEmailSize, TIMING.COMPONENT_UPDATE_DEBOUNCE);
});

// Initial size calculation
setTimeout(updateEmailSize, TIMING.INIT_SIZE_DELAY);

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
// Final Initialization Logic
const initFullEditor = () => {
    console.log('[Editor] Starting secure initialization...');
    
    // 1. Blocks & Modules
    if (window.CUSTOM_BLOCKS) CUSTOM_BLOCKS.init(editor);
    if (window.IMPORT_EXPORT) IMPORT_EXPORT.init();
    
    // 2. UI Controls
    bindWidthControl();
    if (window.PREVIEW_CONTROLS) PREVIEW_CONTROLS.init();
    if (window.TEMPLATE_UI) TEMPLATE_UI.init();
    if (window.AI_HANDLERS) AI_HANDLERS.init();
    if (window.EDITOR_ACTIONS) EDITOR_ACTIONS.init();
    
    // 3. Settings & Data
    initKeymaps();
    initCommands();
    loadInitialTemplate();

    // 4. Tasks
    setTimeout(updateEmailSize, TIMING.INIT_SIZE_DELAY);
    if (window.AUTO_SAVE) AUTO_SAVE.start();
    console.log('Visual Email Editor initialized successfully');
};

// Start safely
if (editor.getModel().get('isLoaded')) {
    initFullEditor();
} else {
    editor.once('load', initFullEditor);
}

editor.on('component:selected', (model) => {
    const stylesTab = document.querySelector('[data-panel="styles"]');
    if (stylesTab) stylesTab.click();

    // Add "Duplicate" button to every non-wrapper component toolbar
    if (!model || model.is('wrapper')) return;
    const toolbar = model.get('toolbar') || [];
    if (toolbar.some(btn => btn.id === 'duplicate-btn')) return;
    model.set('toolbar', [
        ...toolbar,
        {
            id: 'duplicate-btn',
            command: 'duplicate-component',
            label: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>`,
            title: 'Duplicar'
        }
    ]);
});

// Keyboard shortcut: ? → keyboard shortcuts modal
document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        showKeyboardShortcutsModal();
    }
});

function showKeyboardShortcutsModal() {
    const shortcuts = [
        { keys: 'Ctrl + S', action: 'Guardar plantilla' },
        { keys: 'Ctrl + Z', action: 'Deshacer' },
        { keys: 'Ctrl + Y / Ctrl + Shift + Z', action: 'Rehacer' },
        { keys: 'Supr / Backspace', action: 'Eliminar componente seleccionado' },
        { keys: 'Ctrl + Alt + P', action: 'Alternar vista previa' },
        { keys: 'Esc', action: 'Cerrar modal' },
        { keys: '?', action: 'Mostrar esta ayuda' },
    ];

    showModal('Atajos de teclado', `
        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="text-align:left; padding:8px; border-bottom:1px solid var(--border); font-size:12px; color:var(--text-secondary);">Atajo</th>
                    <th style="text-align:left; padding:8px; border-bottom:1px solid var(--border); font-size:12px; color:var(--text-secondary);">Acción</th>
                </tr>
            </thead>
            <tbody>
                ${shortcuts.map(s => `
                    <tr>
                        <td style="padding:10px 8px; border-bottom:1px solid var(--border);">
                            <kbd style="background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:2px 6px; font-size:11px; font-family:monospace;">${s.keys}</kbd>
                        </td>
                        <td style="padding:10px 8px; border-bottom:1px solid var(--border); font-size:13px;">${s.action}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `, [{ text: 'Cerrar', action: hideModal }]);
}

window.showKeyboardShortcutsModal = showKeyboardShortcutsModal;
