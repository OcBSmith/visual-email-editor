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
            // Enable all MJML blocks
            resetDevices: false
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
    // Desktop uses full width canvas, MJML content (640px) is centered like in Thunderbird
    deviceManager: {
        devices: [
            { name: 'Desktop', width: '' },
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

// ===== TEMPLATE LIBRARY =====
const TEMPLATE_LIBRARY = [
    {
        id: 'welcome',
        name: 'Welcome Email',
        description: 'Clean light welcome email',
        mjml: `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="'Segoe UI', Inter, Arial, sans-serif" />
      <mj-text font-size="16px" color="#333333" line-height="1.7" />
      <mj-button background-color="#0a84ff" color="#ffffff" border-radius="8px" font-weight="600" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f5f5f5" width="640px">
    <mj-section padding="30px 0 10px 0">
      <mj-column>
        <mj-image src="https://www.thunderbird.net/media/img/thunderbird/logos/release.png" width="80px" alt="Thunderbird" />
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" border-radius="16px" padding="40px 20px">
      <mj-column>
        <mj-text align="center" font-size="38px" font-weight="bold" color="#1a1a1a" padding-bottom="0">
          Welcome to <span style="color: #0a84ff; font-style: italic; font-weight: bold;">Freedom</span>
        </mj-text>
        <mj-text align="center" font-size="18px" color="#666666" padding="20px 40px">
          Tu mensaje ha sido creado con el editor visual de <strong>Thunderbird</strong>. Disfruta de la productividad, privacidad y libertad que te ofrecemos.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="20px">
      <mj-group>
        <mj-column>
          <mj-button href="#" font-size="14px" padding="12px 20px">
            🎯 Empezar
          </mj-button>
        </mj-column>
        <mj-column>
          <mj-button href="#" font-size="14px" padding="12px 20px" background-color="#ff4081">
            ❤️ Donar
          </mj-button>
        </mj-column>
        <mj-column>
          <mj-button href="#" font-size="14px" padding="12px 20px" background-color="#00c853">
            💬 Ayuda
          </mj-button>
        </mj-column>
      </mj-group>
    </mj-section>
    <mj-section background-color="#ffffff" border-radius="16px" padding="40px 30px">
      <mj-group>
        <mj-column>
          <mj-text font-size="20px" font-weight="700" color="#1a1a1a" padding-bottom="10px">
            Libre y Open Source
          </mj-text>
          <mj-text color="#666666">
            Thunderbird es tuyo para siempre. Desarrollado abiertamente y distribuido libremente.
          </mj-text>
        </mj-column>
        <mj-column>
          <mj-text font-size="20px" font-weight="700" color="#1a1a1a" padding-bottom="10px">
            Impulsado por la Comunidad
          </mj-text>
          <mj-text color="#666666">
            Puedes ser parte de nuestra historia. Cualquiera puede contribuir a Thunderbird.
          </mj-text>
        </mj-column>
      </mj-group>
    </mj-section>
    <mj-section padding="30px 0">
      <mj-column>
        <mj-text align="center" font-size="12px" color="#999999">
          © 2024 Visual Email Editor for Thunderbird
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
    },
    {
        id: 'promo',
        name: 'Flash Sale',
        description: 'High-conversion promotional email',
        mjml: `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Inter, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#fee2e2" width="640px">
    <mj-section padding="20px">
      <mj-column>
        <mj-text align="center" font-size="14px" font-weight="bold" color="#dc2626" text-transform="uppercase" letter-spacing="2px">
          Limited Time Offer
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="40px 20px" border-radius="20px">
      <mj-column>
        <mj-text align="center" font-size="48px" font-weight="900" color="#111827">
          50% OFF
        </mj-text>
        <mj-text align="center" font-size="20px" color="#4b5563" padding-bottom="30px">
          Everything in our store!
        </mj-text>
        <mj-image src="https://via.placeholder.com/500x300?text=SALE" border-radius="10px" />
        <mj-text align="center" padding-top="30px">
          Don't miss out on the biggest sale of the season. Use code <strong>FLASH50</strong> at checkout.
        </mj-text>
        <mj-button background-color="#ef4444" color="white" font-size="18px" font-weight="bold" padding="30px" border-radius="50px" href="#">
          SHOP THE SALE
        </mj-button>
        <mj-text align="center" font-size="12px" color="#9ca3af" padding-top="20px">
          *Offer ends tonight at midnight.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
    },
    {
        id: 'newsletter',
        name: 'Modern Newsletter',
        description: 'Elegant layout for sharing news and articles',
        mjml: `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Inter, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f3f4f6" width="640px">
    <mj-section background-color="#1f2937" padding="20px">
      <mj-column>
        <mj-text color="#ffffff" font-size="20px" font-weight="bold">
          The Weekly Post
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-image src="https://via.placeholder.com/640x350?text=Featured+Story" />
        <mj-text font-size="24px" font-weight="bold" color="#111827">
          Our Main Story Highlight
        </mj-text>
        <mj-text color="#4b5563">
          Discover the latest trends and insights in your industry. This week we dive deep into the future of email design.
        </mj-text>
        <mj-button background-color="#3b82f6" align="left" href="#">
          Read More
        </mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="10px"></mj-section>
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column width="45%">
        <mj-image src="https://via.placeholder.com/250x150" />
        <mj-text font-size="18px" font-weight="bold">Story #2</mj-text>
        <mj-text font-size="14px">Brief summary of the second interesting story.</mj-text>
      </mj-column>
      <mj-column width="10%"></mj-column>
      <mj-column width="45%">
        <mj-image src="https://via.placeholder.com/250x150" />
        <mj-text font-size="18px" font-weight="bold">Story #3</mj-text>
        <mj-text font-size="14px">Brief summary of the third interesting story.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
    }
];

// Initial template
const initialTemplate = TEMPLATE_LIBRARY[0].mjml;

// Load initial template
editor.setComponents(initialTemplate);

// ===== EMAIL SIZE CALCULATOR =====
const sizeIndicator = document.getElementById('sizeIndicator');
const sizeValue = document.getElementById('sizeValue');

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function updateEmailSize() {
    try {
        const html = await getCompiledHtml();
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
const htmlFileInput = document.getElementById('htmlFileInput');

document.getElementById('btnImportHtml').addEventListener('click', () => {
    const content = `
        <div class="import-options">
            <p style="margin-bottom: 16px; color: var(--text-secondary);">
                Import an HTML file or paste the code directly:
            </p>
            <div class="form-group">
                <label>From file:</label>
                <button id="btnSelectFile" class="btn-secondary" style="width: 100%;">
                    📁 Select HTML file
                </button>
            </div>
            <div style="text-align: center; margin: 16px 0; color: var(--text-muted);">— or —</div>
            <div class="form-group">
                <label>Paste HTML code:</label>
                <textarea id="htmlCodeInput" class="form-input" rows="10" placeholder="Paste your HTML or MJML code here..." style="font-family: monospace; font-size: 12px;"></textarea>
            </div>
        </div>
    `;

    showModal('Import HTML', content, [
        { text: 'Cancel', primary: false, action: hideModal },
        { text: 'Import', primary: true, action: importHtmlFromTextarea }
    ]);

    // Add file select button handler after modal is shown
    setTimeout(() => {
        const btnSelectFile = document.getElementById('btnSelectFile');
        if (btnSelectFile) {
            btnSelectFile.addEventListener('click', () => htmlFileInput.click());
        }
    }, 50);
});

// Handle file selection
htmlFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        loadHtmlContent(text, file.name);
        hideModal();
    } catch (error) {
        console.error('Error reading file:', error);
        showToast('Error reading the file', 'error');
    }

    // Reset input
    htmlFileInput.value = '';
});

// Import from textarea
function importHtmlFromTextarea() {
    const textarea = document.getElementById('htmlCodeInput');
    const html = textarea.value.trim();

    if (!html) {
        showToast('Please provide HTML code', 'error');
        return;
    }

    loadHtmlContent(html, 'Pasted code');
    hideModal();
}

window.importHtmlFromTextarea = importHtmlFromTextarea;

// Load HTML content into editor
function loadHtmlContent(html, sourceName) {
    try {
        // Check if it's MJML
        if (html.includes('<mjml') || html.includes('<mj-')) {
            editor.setComponents(html);
            showToast(`MJML imported: ${sourceName}`);
        } else {
            // For regular HTML, wrap in basic MJML structure
            // First try to load as-is
            editor.setComponents(html);
            showToast(`HTML imported: ${sourceName}`);
        }
    } catch (error) {
        console.error('Error loading HTML:', error);
        showToast('Error loading HTML', 'error');
    }
}

window.loadHtmlContent = loadHtmlContent;

// ===== DEVICE PREVIEW BUTTONS =====
const deviceDesktop = document.getElementById('deviceDesktop');
const deviceTablet = document.getElementById('deviceTablet');
const deviceMobile = document.getElementById('deviceMobile');

function setDevice(device, button) {
    editor.setDevice(device);
    document.querySelectorAll('.device-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

deviceDesktop.addEventListener('click', () => setDevice('Desktop', deviceDesktop));
deviceTablet.addEventListener('click', () => setDevice('Tablet', deviceTablet));
deviceMobile.addEventListener('click', () => setDevice('Mobile', deviceMobile));

// ===== UNDO/REDO =====
document.getElementById('btnUndo').addEventListener('click', () => {
    editor.UndoManager.undo();
});

document.getElementById('btnRedo').addEventListener('click', () => {
    editor.UndoManager.redo();
});

// ===== PANEL TABS =====
const panelTabs = document.querySelectorAll('.panel-tab');
const panelSections = document.querySelectorAll('.panel-section');

panelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetPanel = tab.dataset.panel;

        panelTabs.forEach(t => t.classList.remove('active'));
        panelSections.forEach(s => s.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`${targetPanel}-container`).classList.add('active');
    });
});

// ===== MODALS =====
const modalOverlay = document.getElementById('modalOverlay');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalFooter = document.getElementById('modalFooter');
const modalClose = document.getElementById('modalClose');

// Current modal action handlers
let currentModalActions = {};

function showModal(title, bodyContent, footerButtons = []) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyContent;

    // Clear and rebuild footer with proper buttons
    modalFooter.innerHTML = '';
    currentModalActions = {};


    footerButtons.forEach(btn => {
        const button = document.createElement('button');
        button.className = btn.class || (btn.primary ? 'btn-primary' : 'btn-secondary');
        button.textContent = btn.text;
        if (btn.id) button.id = btn.id;
        button.addEventListener('click', btn.action);
        modalFooter.appendChild(button);
    });

    modalOverlay.classList.remove('hidden');
}

function hideModal() {
    modalOverlay.classList.add('hidden');
    currentModalActions = {};
}

if (modalClose) {
    modalClose.addEventListener('click', hideModal);
}
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModal();
    });
}

// ===== TOAST NOTIFICATIONS =====
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';
    toast.innerHTML = `<span>${icon}</span> ${message}`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== SAVE TEMPLATE =====
document.getElementById('btnSaveTemplate').addEventListener('click', () => {
    const content = `
    <div class="form-group">
      <label>Template name</label>
      <input type="text" id="templateName" class="form-input" placeholder="My template">
    </div>
  `;

    showModal('Save Template', content, [
        { text: 'Cancel', primary: false, action: hideModal },
        { text: 'Save', primary: true, action: saveTemplate }
    ]);

    setTimeout(() => {
        const input = document.getElementById('templateName');
        if (input) input.focus();
    }, 100);
});

async function saveTemplate() {
    const name = document.getElementById('templateName').value.trim();
    if (!name) {
        showToast('Please provide a name', 'error');
        return;
    }

    try {
        const components = JSON.stringify(editor.getComponents());
        // For MJML templates, get MJML code
        const mjml = editor.getHtml();

        const storage = await browser.storage.local.get('templates');
        let templates = storage.templates || [];

        // Check if template with same name exists
        const existingIndex = templates.findIndex(t => t.name.toLowerCase() === name.toLowerCase());

        if (existingIndex !== -1) {
            // Confirm overwrite (using modal or simple confirm for speed here, but let's stick to toast or simple logic)
            // Actually, let's just update it if it exists or ask in a nested way.
            // For now, let's just update it to keep it simple but functional.
            templates[existingIndex] = {
                ...templates[existingIndex],
                date: new Date().toISOString(),
                mjml: mjml,
                components: components
            };
            showToast('Template updated successfully');
        } else {
            const template = {
                id: Date.now().toString(),
                name: name,
                date: new Date().toISOString(),
                mjml: mjml,
                components: components
            };
            templates.unshift(template);
            showToast('Template saved successfully');
        }

        // Keep only last 20 templates
        if (templates.length > 20) {
            templates = templates.slice(0, 20);
        }

        await browser.storage.local.set({ templates });
        hideModal();
    } catch (error) {
        console.error('Error saving template:', error);
        showToast('Error saving template', 'error');
    }
}

async function deleteTemplate(id, e) {
    if (e) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.preventDefault === 'function') e.preventDefault();
    }

    // Get template name for better confirmation
    let templateName = 'this template';
    try {
        const storage = await browser.storage.local.get('templates');
        const templates = storage.templates || [];
        const template = templates.find(t => t.id === id);
        if (template) templateName = `"${template.name}"`;
    } catch (err) { }

    if (!confirm(`Are you sure you want to delete ${templateName}?`)) return;

    try {
        const storage = await browser.storage.local.get('templates');
        let templates = storage.templates || [];
        templates = templates.filter(t => t.id !== id);
        await browser.storage.local.set({ templates });

        showToast('Template deleted');

        // Refresh the list by re-triggering the click on the Load button
        const btnLoad = document.getElementById('btnLoadTemplate');
        if (btnLoad) {
            btnLoad.click();
        } else {
            hideModal();
        }
    } catch (error) {
        console.error('Error deleting template:', error);
        showToast('Error deleting template', 'error');
    }
}

window.deleteTemplate = deleteTemplate;

// Make saveTemplate globally available
window.saveTemplate = saveTemplate;

// ===== LOAD TEMPLATE =====
document.getElementById('btnLoadTemplate').addEventListener('click', async () => {
    try {
        const storage = await browser.storage.local.get('templates');
        const templates = storage.templates || [];

        if (templates.length === 0) {
            showModal('Load Template', '<p style="text-align:center;color:var(--text-muted);padding:20px;">No saved templates found</p>', [
                { text: 'Close', primary: false, action: hideModal }
            ]);
            return;
        }

        const content = `
      <div class="template-grid" id="templateGrid">
        ${templates.map(t => `
          <div class="template-card" data-template-id="${t.id}">
            <button class="template-delete-btn" onclick="deleteTemplate('${t.id}', event)" title="Delete template">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events: none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            <h3>${escapeHtml(t.name)}</h3>
            <p>${formatDate(t.date)}</p>
          </div>
        `).join('')}
      </div>
    `;

        showModal('Load Template', content, [
            { text: 'Close', primary: false, action: hideModal }
        ]);

        // Add click handlers to template cards
        setTimeout(() => {
            const grid = document.getElementById('templateGrid');
            if (grid) {
                grid.addEventListener('click', (e) => {
                    const card = e.target.closest('.template-card');
                    if (card && !e.target.closest('.template-delete-btn')) {
                        loadTemplate(card.dataset.templateId);
                    }
                });
            }
        }, 50);
    } catch (error) {
        console.error('Error loading templates:', error);
        showToast('Error loading templates', 'error');
    }
});

async function loadTemplate(templateId) {
    try {
        const storage = await browser.storage.local.get('templates');
        const templates = storage.templates || [];
        const template = templates.find(t => t.id === templateId);

        if (template) {
            editor.setComponents(JSON.parse(template.components));
            hideModal();
            showToast('Template loaded');
        }
    } catch (error) {
        console.error('Error loading template:', error);
        showToast('Error loading template', 'error');
    }
}

window.loadTemplate = loadTemplate;

// ===== PREVIEW =====
document.getElementById('btnPreview').addEventListener('click', async () => {
    try {
        const html = await getCompiledHtml();

        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        previewWindow.document.write(html);
        previewWindow.document.close();
    } catch (error) {
        console.error('Error generating preview:', error);
        showToast('Error generating preview', 'error');
    }
});

// ===== VIEW CODE =====
document.getElementById('btnViewCode').addEventListener('click', async () => {
    try {
        const html = await getCompiledHtml();

        const content = `
      <div class="code-preview">
        <pre>${escapeHtml(html)}</pre>
      </div>
    `;

        showModal('HTML Code', content, [
            { text: 'Close', primary: false, action: hideModal },
            { text: 'Copy code', primary: true, action: copyCode }
        ]);
    } catch (error) {
        console.error('Error getting code:', error);
        showToast('Error getting code', 'error');
    }
});

async function copyCode() {
    try {
        const html = await getCompiledHtml();
        await navigator.clipboard.writeText(html);
        showToast('Code copied to clipboard');
    } catch (error) {
        showToast('Error copying code', 'error');
    }
}

window.copyCode = copyCode;

// ===== INSERT TO EMAIL =====
document.getElementById('btnInsertEmail').addEventListener('click', async () => {
    try {
        const html = await getCompiledHtml();

        const response = await browser.runtime.sendMessage({
            action: 'insertHtmlToCompose',
            html: html
        });

        if (response.success) {
            showToast(response.newCompose ? 'New email created with the design' : 'Design inserted into the email');
        } else {
            showToast('Error: ' + (response.error || 'Could not insert'), 'error');
        }
    } catch (error) {
        console.error('Error inserting to email:', error);
        showToast('Error inserting to email', 'error');
    }
});

// ===== UTILITY FUNCTIONS =====

// Use the compiled MJML HTML and clean it for Thunderbird
async function getCompiledHtml() {
    console.log('Getting compiled HTML...');

    // First, try to get the MJML compiled HTML (this has the CORRECT colors)
    try {
        const result = editor.runCommand('mjml-code-to-html');
        console.log('mjml-code-to-html result available:', !!result?.html);

        if (result && result.html) {
            // Clean the HTML for Thunderbird by removing Outlook conditional comments
            let fullHtml = result.html;

            // Remove <!--[if mso]>...<![endif]--> and similar
            fullHtml = fullHtml.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '');
            fullHtml = fullHtml.replace(/<!--\[if[^\]]*\]><!-->/gi, '');
            fullHtml = fullHtml.replace(/<!--<!\[endif\]-->/gi, '');

            // Remove mso-* styles within style attributes
            fullHtml = fullHtml.replace(/mso-[^:;]+:[^;]+;?/gi, '');

            // Remove empty comments
            fullHtml = fullHtml.replace(/<!--\s*-->/g, '');

            // Clean up extra whitespace
            fullHtml = fullHtml.replace(/\n\s*\n\s*\n/g, '\n\n');

            // --- IMPROVEMENT: Extract only body content and styles to avoid double <html> tags ---
            let bodyContent = '';
            const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (bodyMatch) {
                bodyContent = bodyMatch[1].trim();
            } else {
                bodyContent = fullHtml; // Fallback
            }

            // Extract styles from head
            let styles = '';
            const styleMatches = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            if (styleMatches) {
                styles = styleMatches.join('\n');
            }

            // Wrap in a 640px centered container for consistency with Thunderbird and signature
            const cleanHtml = `
                ${styles}
                <div class="visual-editor-container" style="max-width: 640px; margin: 0 auto; box-sizing: border-box;">
                    ${bodyContent}
                </div>
            `.trim();

            console.log('Cleaned HTML length:', cleanHtml.length);
            return cleanHtml;
        }
    } catch (e) {
        console.error('mjml-code-to-html failed:', e);
    }

    // Fallback: use canvas extraction
    console.log('Falling back to canvas extraction...');

    const canvasFrame = editor.Canvas.getFrameEl();

    if (!canvasFrame || !canvasFrame.contentDocument) {
        console.error('Canvas iframe not available');
        return getErrorHtml('Canvas not available');
    }

    const doc = canvasFrame.contentDocument;
    const body = doc.body;
    const processedTexts = new Set();
    const processedButtons = new Set();

    let simpleHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
<tr>
<td align="center" style="padding: 20px 0;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width: 640px; width: 100%;">
`;

    // Find mj-section rendered elements
    const sections = body.querySelectorAll('[data-gjs-type="mj-section"]');
    let contentElements = sections.length > 0 ? sections : body.querySelectorAll('div[style*="max-width: 640px"], div[style*="max-width:640px"]');

    if (contentElements.length === 0) {
        contentElements = [body];
    }

    console.log('Found content elements:', contentElements.length);

    contentElements.forEach((section, index) => {
        // Get computed styles
        const style = canvasFrame.contentWindow.getComputedStyle(section);
        const bgColor = style.backgroundColor || '#ffffff';
        const bgHex = rgbToHex(bgColor);

        simpleHtml += `
<tr>
<td style="background-color: ${bgHex}; padding: 20px;">
`;

        // Extract images (skip placeholders and broken images)
        const images = section.querySelectorAll('img');
        images.forEach(img => {
            const src = img.src || img.getAttribute('src') || '';
            const alt = img.alt || '';
            // Skip GrapesJS UI, placeholders, and broken images
            if (src &&
                !src.includes('gjs-') &&
                !src.includes('toolbar') &&
                !src.includes('placeholder') &&
                src.startsWith('http') || src.startsWith('data:')) {
                simpleHtml += `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; display: block; margin: 0 auto 15px auto;" />\n`;
            }
        });

        // Extract text content - be more selective
        const textDivs = section.querySelectorAll('[data-gjs-type="mj-text"] div[style*="font"], [data-gjs-type="mj-text"] p');
        textDivs.forEach(textEl => {
            const text = textEl.textContent.trim();
            // Skip if already processed or inside a button
            if (text && !processedTexts.has(text) && !textEl.closest('a')) {
                processedTexts.add(text);
                const elStyle = canvasFrame.contentWindow.getComputedStyle(textEl);
                const fontSize = elStyle.fontSize || '14px';
                const fontWeight = elStyle.fontWeight || 'normal';
                const color = rgbToHex(elStyle.color) || '#000000';
                const textAlign = elStyle.textAlign || 'left';

                simpleHtml += `<div style="font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color}; text-align: ${textAlign}; margin-bottom: 10px; line-height: 1.5;">${textEl.innerHTML}</div>\n`;
            }
        });

        // Extract buttons - get color from GrapesJS component model
        const mjButtonEls = section.querySelectorAll('[data-gjs-type="mj-button"]');
        mjButtonEls.forEach(mjBtnEl => {
            const btn = mjBtnEl.querySelector('a');
            if (!btn) return;

            const href = btn.getAttribute('href') || '#';
            const text = btn.textContent.trim();
            if (text && !processedButtons.has(text)) {
                processedButtons.add(text);

                let btnBg = '#414141';
                let btnColor = '#ffffff';

                // Get the GrapesJS component to access its model with real values
                try {
                    const wrapper = editor.DomComponents.getWrapper();
                    const allButtons = wrapper.find('[data-gjs-type="mj-button"]');

                    for (const comp of allButtons) {
                        const compEl = comp.getEl();
                        if (compEl === mjBtnEl) {
                            // Get attributes from component model - MJML stores colors here
                            const attrs = comp.getAttributes();
                            console.log('Button attrs:', JSON.stringify(attrs));

                            if (attrs['background-color']) {
                                btnBg = attrs['background-color'];
                            }
                            if (attrs['color']) {
                                btnColor = attrs['color'];
                            }
                            break;
                        }
                    }
                } catch (e) {
                    console.log('Error getting component:', e);
                }

                console.log('Final button:', text, 'bg:', btnBg, 'color:', btnColor);

                simpleHtml += `
<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 20px auto;">
<tr>
<td style="background-color: ${btnBg}; border-radius: 4px; padding: 12px 24px;">
<a href="${href}" style="color: ${btnColor}; text-decoration: none; font-weight: bold; display: inline-block;">${text}</a>
</td>
</tr>
</table>
`;
            }
        });

        simpleHtml += `</td>
</tr>
`;
    });

    simpleHtml += `
</table>
</td>
</tr>
</table>
</body>
</html>`;

    console.log('Simple HTML generated, length:', simpleHtml.length);
    return simpleHtml;
}

// Helper: Convert rgb/rgba to hex
function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    if (rgb.startsWith('#')) return rgb;

    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    return rgb;
}

function getErrorHtml(message) {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Error</title></head>
<body style="font-family: Arial; padding: 20px;">
<p>Error: ${message}</p>
</body></html>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl+S to save template
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('btnSaveTemplate').click();
    }

    // Ctrl+Z to undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editor.UndoManager.undo();
    }

    // Ctrl+Shift+Z or Ctrl+Y to redo
    if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        editor.UndoManager.redo();
    }

    // Escape to close modal
    if (e.key === 'Escape') {
        hideModal();
    }
});

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
const MAX_WIDTH = 640;
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

// ===== AI INTEGRATION =====

// Initialize AI service
if (window.AI_SERVICE) {
    AI_SERVICE.init();
}

// AI Config button
document.getElementById('btnAIConfig').addEventListener('click', () => {
    // Build model options
    const modelOptions = AI_SERVICE.AVAILABLE_MODELS.map(m =>
        `<option value="${m.id}" ${m.id === AI_SERVICE.currentModel ? 'selected' : ''}>${m.name} - ${m.description}</option>`
    ).join('');

    showModal('Configure AI (Groq)', `
        <div class="form-group">
            <label>Groq API Key</label>
            <input type="password" class="form-input" id="aiApiKeyInput" 
                   placeholder="gsk_..." 
                   value="${AI_SERVICE.apiKey || ''}">
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
                Get your free API Key at <a href="https://console.groq.com" target="_blank" style="color: var(--primary);">console.groq.com</a>
            </p>
        </div>
        <div class="form-group">
            <label>AI Model</label>
            <select class="form-input" id="aiModelSelect">
                ${modelOptions}
            </select>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
                All models are free. Llama 3.3 70B offers the best quality.
            </p>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: hideModal },
        {
            text: 'Save', class: 'btn-primary', action: async () => {
                const key = document.getElementById('aiApiKeyInput').value.trim();
                const model = document.getElementById('aiModelSelect').value;

                if (key) {
                    await AI_SERVICE.setApiKey(key);
                    await AI_SERVICE.setModel(model);
                    showToast('Settings saved', 'success');
                    hideModal();
                } else {
                    showToast('Please enter a valid API Key', 'warning');
                }
            }
        }
    ]);
});

// AI Generate button
document.getElementById('btnAIGenerate').addEventListener('click', () => {
    if (!AI_SERVICE.isConfigured()) {
        showToast('Please configure your AI API Key first', 'warning');
        document.getElementById('btnAIConfig').click();
        return;
    }

    showModal('Generate Email with AI', `
        <div class="form-group">
            <label>Describe the email you want to create</label>
            <textarea class="form-input" id="aiDescriptionInput" rows="4" 
                      placeholder="e.g.: Holiday newsletter for customers with a 20% discount offer, including a header image and a purchase button"></textarea>
        </div>
        <div class="form-group">
            <label>Style</label>
            <select class="form-input" id="aiStyleSelect">
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="promotional">Promotional</option>
                <option value="newsletter">Newsletter</option>
            </select>
        </div>
        <div class="ai-preview" id="aiGeneratePreview" style="display: none;"></div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: hideModal },
        {
            text: 'Save as Template', class: 'btn-secondary', id: 'btnSaveAiResult', style: 'display:none', action: () => {
                document.getElementById('btnSaveTemplate').click();
            }
        },
        {
            text: 'Generate', class: 'btn-primary ai-btn', id: 'btnDoGenerate', action: async () => {
                const description = document.getElementById('aiDescriptionInput').value.trim();
                const style = document.getElementById('aiStyleSelect').value;
                const preview = document.getElementById('aiGeneratePreview');
                const btn = document.getElementById('btnDoGenerate');
                const saveBtn = document.getElementById('btnSaveAiResult');

                if (!description) {
                    showToast('Please describe the email you want to create', 'warning');
                    return;
                }

                btn.classList.add('ai-loading');
                btn.textContent = 'Generating...';
                preview.style.display = 'flex';
                preview.classList.add('loading');
                preview.innerHTML = '<div class="ai-spinner"></div>';

                try {
                    const mjml = await AI_SERVICE.generateEmail(description, style);

                    // Load generated MJML into editor
                    editor.setComponents(mjml);

                    showToast('Email generated successfully', 'success');

                    // Show save button and update preview
                    if (saveBtn) {
                        saveBtn.style.display = 'block';
                        btn.textContent = 'Regenerate';
                        btn.classList.remove('ai-loading');
                    }
                    preview.classList.remove('loading');
                    preview.innerHTML = '<span style="color: var(--success);">Generation complete! You can preview it in the canvas behind this modal.</span>';
                } catch (error) {
                    preview.classList.remove('loading');
                    preview.innerHTML = `<span style="color: var(--danger);">Error: ${error.message}</span>`;
                    btn.classList.remove('ai-loading');
                    btn.textContent = 'Retry';
                }
            }
        }
    ]);
});

// Add AI button to component toolbar
editor.on('component:selected', (component) => {
    // Check if it's a text component
    const type = component.get('type');
    if (type === 'mj-text' || type === 'text' || type === 'mj-button') {
        // Add AI command if not already exists
        if (!editor.Commands.has('ai-edit-text')) {
            editor.Commands.add('ai-edit-text', {
                run(editor) {
                    const selected = editor.getSelected();
                    if (selected) {
                        showAITextEditor(selected);
                    }
                }
            });
        }
    }
});

// AI Text Editor function
function showAITextEditor(component) {
    if (!AI_SERVICE.isConfigured()) {
        showToast('Please configure your AI API Key first', 'warning');
        document.getElementById('btnAIConfig').click();
        return;
    }

    const currentText = component.get('content') || component.view.el.innerText || '';

    showModal('Edit Text with AI', `
        <div class="form-group">
            <label>Current text</label>
            <div class="ai-preview">${escapeHtml(currentText)}</div>
        </div>
        
        <div class="ai-actions">
            <button class="ai-action-btn" data-action="improve">
                <span>✨</span>
                <span>Improve</span>
            </button>
            <button class="ai-action-btn" data-action="shorten">
                <span>✂️</span>
                <span>Shorten</span>
            </button>
            <button class="ai-action-btn" data-action="expand">
                <span>📝</span>
                <span>Expand</span>
            </button>
            <button class="ai-action-btn" data-action="translate">
                <span>🌍</span>
                <span>Translate</span>
            </button>
            <button class="ai-action-btn" data-action="rewrite">
                <span>🔄</span>
                <span>Rewrite</span>
            </button>
            <button class="ai-action-btn" data-action="custom">
                <span>💬</span>
                <span>Custom</span>
            </button>
        </div>
        
        <div id="aiExtraInput" style="display: none;" class="form-group">
            <label id="aiExtraLabel">Instruction</label>
            <input type="text" class="form-input" id="aiExtraValue" placeholder="">
        </div>
        
        <div class="form-group">
            <label>Result</label>
            <div class="ai-preview" id="aiResultPreview">Select an action</div>
        </div>
    `, [
        { text: 'Cancel', class: 'btn-secondary', action: hideModal },
        {
            text: 'Apply', class: 'btn-primary', id: 'btnApplyAI', action: () => {
                const result = document.getElementById('aiResultPreview').textContent;
                if (result && result !== 'Select an action' && !result.startsWith('Error')) {
                    component.set('content', result);
                    showToast('Text updated', 'success');
                    hideModal();
                }
            }
        }
    ]);

    // Add event listeners to action buttons
    setTimeout(() => {
        document.querySelectorAll('.ai-action-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const action = btn.dataset.action;
                const preview = document.getElementById('aiResultPreview');
                const extraInput = document.getElementById('aiExtraInput');
                const extraLabel = document.getElementById('aiExtraLabel');
                const extraValue = document.getElementById('aiExtraValue');

                // Remove active from all
                document.querySelectorAll('.ai-action-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show extra input if needed
                if (action === 'translate') {
                    extraInput.style.display = 'block';
                    extraLabel.textContent = 'Target language';
                    extraValue.placeholder = 'english, french, german...';
                    extraValue.value = 'english';
                } else if (action === 'rewrite') {
                    extraInput.style.display = 'block';
                    extraLabel.textContent = 'Tone';
                    extraValue.placeholder = 'formal, casual, urgent...';
                    extraValue.value = 'formal';
                } else if (action === 'custom') {
                    extraInput.style.display = 'block';
                    extraLabel.textContent = 'Your instruction';
                    extraValue.placeholder = 'e.g.: Make it more persuasive...';
                    extraValue.value = '';
                    return; // Don't execute yet, wait for custom input
                } else {
                    extraInput.style.display = 'none';
                }

                // Execute AI action
                preview.classList.add('loading');
                preview.innerHTML = '<div class="ai-spinner"></div>';

                try {
                    let result;
                    switch (action) {
                        case 'improve':
                            result = await AI_SERVICE.improveText(currentText);
                            break;
                        case 'shorten':
                            result = await AI_SERVICE.shortenText(currentText);
                            break;
                        case 'expand':
                            result = await AI_SERVICE.expandText(currentText);
                            break;
                        case 'translate':
                            result = await AI_SERVICE.translateText(currentText, extraValue.value);
                            break;
                        case 'rewrite':
                            result = await AI_SERVICE.rewriteText(currentText, extraValue.value);
                            break;
                    }
                    preview.classList.remove('loading');
                    preview.textContent = result;
                } catch (error) {
                    preview.classList.remove('loading');
                    preview.innerHTML = `<span style="color: var(--danger);">Error: ${error.message}</span>`;
                }
            });
        });

        // Handle custom prompt execution
        document.getElementById('aiExtraValue').addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && document.querySelector('.ai-action-btn[data-action="custom"]').classList.contains('active')) {
                const preview = document.getElementById('aiResultPreview');
                const instruction = e.target.value;

                if (!instruction) return;

                preview.classList.add('loading');
                preview.innerHTML = '<div class="ai-spinner"></div>';

                try {
                    const result = await AI_SERVICE.customPrompt(currentText, instruction);
                    preview.classList.remove('loading');
                    preview.textContent = result;
                } catch (error) {
                    preview.classList.remove('loading');
                    preview.innerHTML = `<span style="color: var(--danger);">Error: ${error.message}</span>`;
                }
            }
        });
    }, 100);
}

// Add AI button to toolbar when text is selected
editor.on('rte:enable', () => {
    const rteToolbar = document.querySelector('.gjs-rte-toolbar');
    if (rteToolbar && !rteToolbar.querySelector('.ai-rte-btn')) {
        const aiBtn = document.createElement('span');
        aiBtn.className = 'gjs-rte-action ai-rte-btn';
        aiBtn.innerHTML = '✨';
        aiBtn.title = 'Edit with AI';
        aiBtn.onclick = () => {
            const selected = editor.getSelected();
            if (selected) showAITextEditor(selected);
        };
        rteToolbar.appendChild(aiBtn);
    }
});

// ===== TEMPLATE LIBRARY UI =====
document.getElementById('btnLibrary').addEventListener('click', () => {
    const content = `
        <div class="template-grid">
            ${TEMPLATE_LIBRARY.map(t => `
                <div class="template-card" onclick="loadLibraryTemplate('${t.id}')">
                    <h3>${t.name}</h3>
                    <p>${t.description}</p>
                    <div style="margin-top: 10px; font-size: 10px; color: var(--primary); font-weight: bold;">CLICK TO LOAD</div>
                </div>
            `).join('')}
        </div>
    `;
    showModal('Template Library', content, [
        { text: 'Cancel', primary: false, action: hideModal }
    ]);
});

window.loadLibraryTemplate = (id) => {
    const template = TEMPLATE_LIBRARY.find(t => t.id === id);
    if (template) {
        editor.setComponents(template.mjml);
        hideModal();
        showToast(`Template loaded: ${template.name}`);
    }
};

// ===== INITIALIZE =====
console.log('Visual Email Editor initialized');
