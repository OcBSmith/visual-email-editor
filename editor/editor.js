// Visual Email Editor - GrapesJS + MJML Editor Script

// ===== EDITOR INITIALIZATION =====
const editor = grapesjs.init({
    container: '#gjs',
    height: '100%',
    width: 'auto',
    fromElement: false,
    storageManager: false,

    // Use MJML plugin
    plugins: ['grapesjs-mjml'],
    pluginsOpts: {
        'grapesjs-mjml': {
            resetDevices: false, // DO NOT reset, we need our custom unrestricted Desktop
            useCustomStyleManager: true
        }
    },

    // Block manager configuration
    blockManager: {
        appendTo: '#blocks'
    },

    // Style manager configuration
    styleManager: {
        appendTo: '#styles-container',
        sectors: [
            {
                name: 'Alignment',
                open: true,
                properties: [
                    {
                        type: 'radio', name: 'Horizontal', property: 'text-align',
                        defaults: 'left',
                        options: [
                            { value: 'left', title: 'Left', className: 'fa fa-align-left' },
                            { value: 'center', title: 'Center', className: 'fa fa-align-center' },
                            { value: 'right', title: 'Right', className: 'fa fa-align-right' },
                            { value: 'justify', title: 'Justify', className: 'fa fa-align-justify' }
                        ]
                    },
                    {
                        type: 'select', name: 'Vertical', property: 'vertical-align',
                        options: [
                            { value: 'top', name: 'Top' },
                            { value: 'middle', name: 'Middle' },
                            { value: 'bottom', name: 'Bottom' }
                        ]
                    }
                ]
            },
            {
                name: 'Dimension',
                open: false,
                properties: [
                    { type: 'integer', name: 'width', property: 'width', units: ['px', '%'] },
                    { type: 'integer', name: 'height', property: 'height', units: ['px', '%', 'auto'] },
                    { type: 'integer', name: 'max-width', property: 'max-width', units: ['px', '%'] },
                    { type: 'integer', name: 'padding', property: 'padding', units: ['px', '%'] },
                    {
                        type: 'select', name: 'Horizontal Align', property: 'margin',
                        options: [
                            { value: '0', name: 'Left' },
                            { value: '0 auto', name: 'Center' },
                            { value: '0 0 0 auto', name: 'Right' }
                        ]
                    }
                ]
            },
            {
                name: 'Typography',
                open: false,
                properties: [
                    {
                        type: 'select', name: 'font-family', property: 'font-family',
                        options: [
                            { value: 'Arial, sans-serif', name: 'Arial' },
                            { value: 'Helvetica, sans-serif', name: 'Helvetica' },
                            { value: 'Georgia, serif', name: 'Georgia' },
                            { value: 'Times New Roman, serif', name: 'Times New Roman' },
                            { value: 'Verdana, sans-serif', name: 'Verdana' }
                        ]
                    },
                    { type: 'integer', name: 'font-size', property: 'font-size', units: ['px', 'em'] },
                    {
                        type: 'select', name: 'font-weight', property: 'font-weight',
                        options: [
                            { value: '300', name: 'Light' },
                            { value: '400', name: 'Normal' },
                            { value: '500', name: 'Medium' },
                            { value: '600', name: 'Semi Bold' },
                            { value: '700', name: 'Bold' }
                        ]
                    },
                    { type: 'color', name: 'color', property: 'color' },
                    { type: 'integer', name: 'line-height', property: 'line-height', units: ['px', 'em', '%'] }
                ]
            },
            {
                name: 'Background',
                open: false,
                properties: [
                    { type: 'color', name: 'background-color', property: 'background-color' },
                    { type: 'file', name: 'background-image', property: 'background-image' },
                    {
                        type: 'select', name: 'background-size', property: 'background-size',
                        options: [
                            { value: 'auto', name: 'Auto' },
                            { value: 'cover', name: 'Cover' },
                            { value: 'contain', name: 'Contain' }
                        ]
                    }
                ]
            },
            {
                name: 'Borders',
                open: false,
                properties: [
                    { type: 'integer', name: 'border-radius', property: 'border-radius', units: ['px', '%'] },
                    { type: 'integer', name: 'border-width', property: 'border-width', units: ['px'] },
                    {
                        type: 'select', name: 'border-style', property: 'border-style',
                        options: [
                            { value: 'none', name: 'None' },
                            { value: 'solid', name: 'Solid' },
                            { value: 'dashed', name: 'Dashed' },
                            { value: 'dotted', name: 'Dotted' }
                        ]
                    },
                    { type: 'color', name: 'border-color', property: 'border-color' }
                ]
            }
        ]
    },

    // Trait manager
    traitManager: {
        appendTo: '#traits-container'
    },

    // Layer manager
    layerManager: {
        appendTo: '#layers-container'
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

// Global editor
window.editor = editor;

// ===== TEMPLATE LIBRARY =====
// Template library is now loaded from templates-data.js

// Initial template loading - Wait for editor to be ready
const loadInitialTemplate = () => {
    try {
        const mjmlCode = TEMPLATE_LIBRARY[0].mjml;
        editor.setComponents(mjmlCode.trim());
        
        setTimeout(() => {
            editor.refresh();
            updateEmailSize();
            syncWidthUI();
            
            // Re-bind events just in case
            bindWidthControl();
        }, 500);
    } catch (err) {
        console.error('Safe Load error:', err);
    }
};


// Width Control Logic
function bindWidthControl() {
    const widthInput = document.getElementById('emailWidthInput');
    if (!widthInput) return;

    // Remove old listeners to avoid duplicates
    const newWidthInput = widthInput.cloneNode(true);
    widthInput.parentNode.replaceChild(newWidthInput, widthInput);

    const updateWidth = (e) => {
        const value = e.target.value;
        if (!value || value < 320 || value > 1200) return;

        const newWidth = value + 'px';
        const wrapper = editor.getWrapper();
        let mjBody = wrapper.find('mj-body')[0] || 
                     wrapper.findType('mj-body')[0];

        if (mjBody) {
            mjBody.addAttributes({ width: newWidth });
            const cssWidth = newWidth.includes('px') ? newWidth : newWidth + 'px';
            document.documentElement.style.setProperty('--mjml-width', cssWidth);
            
            // Force MJML to re-compile to HTML
            editor.getHtml(); 
            editor.refresh();
            
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
            <p style="margin-bottom: 20px; font-size: 16px;">Â¿EstÃ¡s seguro de que quieres empezar un nuevo diseÃ±o?</p>
            <p style="color: var(--text-secondary); font-size: 14px;">Se perderÃ¡n todos los cambios que no hayas guardado como plantilla.</p>
        </div>
    `;

    showModal('Nuevo DiseÃ±o', content, [
        { text: 'Cancelar', primary: false, action: hideModal },
        {
            text: 'Empezar de cero', primary: true, class: 'btn-danger', action: () => {
                // Basic MJML structure to start with
                const emptyTemplate = `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="'Segoe UI', Inter, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body width="640px">
    <mj-section>
      <mj-column>
        <mj-text align="center">Empieza a diseÃ±ar tu email aquÃ­...</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
                editor.setComponents(emptyTemplate);
                hideModal();
                showToast('Nuevo diseÃ±o iniciado');
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

// ===== DEVICE PREVIEW BUTTONS & UNDO/REDO (handled by preview-controls.js) =====

// Tabs handled by ui-manager.js

// Modals handled by ui-manager.js

// ===== EDITOR EVENTS =====
editor.on('load', () => {
    console.log('Visual Email Editor loaded');

    // Add Horizontal Align sector to StyleManager
    const sm = editor.StyleManager;
    sm.addSector('alignment', {
        name: 'Alignment',
        open: true,
        properties: [
            {
                type: 'select',
                property: 'margin',
                name: 'Horizontal Align',
                defaults: '0',
                options: [
                    { value: '0', name: 'Left' },
                    { value: '0 auto', name: 'Center' },
                    { value: '0 0 0 auto', name: 'Right' }
                ]
            },
            {
                type: 'select',
                property: 'text-align',
                name: 'Text Align',
                defaults: 'left',
                options: [
                    { value: 'left', name: 'Left' },
                    { value: 'center', name: 'Center' },
                    { value: 'right', name: 'Right' }
                ]
            }
        ]
    }, { at: 0 }); // Add at the top
});

editor.on('component:selected', () => {
    // Auto switch to styles panel when component is selected
    const stylesTab = document.querySelector('[data-panel="styles"]');
    if (stylesTab) stylesTab.click();
});

// Limit width to 640px max for MJML components
const MAX_WIDTH = 2000; // Increased limit to allow wider designs
editor.on('component:update', (component) => {
    if (!component) return;

    const type = component.get('type') || '';
    if (type.startsWith('mj-') || type === 'image') {
        // Check style width
        const style = component.getStyle();
        if (style.width) {
            const widthValue = parseInt(style.width);
            if (widthValue > MAX_WIDTH) {
                component.addStyle({ width: MAX_WIDTH + 'px' });
                console.log(`Width limited to ${MAX_WIDTH}px for ${type}`);
            }
        }

        // Check attribute width
        const attrs = component.getAttributes();
        if (attrs.width) {
            const widthValue = parseInt(attrs.width);
            if (widthValue > MAX_WIDTH) {
                component.addAttributes({ width: MAX_WIDTH + 'px' });
                console.log(`Attribute width limited to ${MAX_WIDTH}px for ${type}`);
            }
        }
    }
});

// ===== AI INTEGRATION (handled by ai-handlers.js) =====

// ===== TEMPLATE LIBRARY UI (handled by template-ui.js) =====

// ===== AI DESIGN CHAT (handled by ai-handlers.js) =====

// UI Manager (Resizing) extracted to ui-manager.js

// ===== INITIALIZE =====
PREVIEW_CONTROLS.init();
TEMPLATE_UI.init();
AI_HANDLERS.init();
EDITOR_ACTIONS.init();
console.log('Visual Email Editor initialized');







