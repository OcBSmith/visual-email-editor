// Visual Email Editor - Template UI Module

const TEMPLATE_UI = {
    init() {
        this.bindTemplateButton();
    },

    bindTemplateButton() {
        const btnLibrary = document.getElementById('btnLibrary');
        if (btnLibrary) {
            btnLibrary.addEventListener('click', () => this.showTemplateModal());
        }
    },

    showTemplateModal() {
        const content = `
            <div class="template-grid" id="libraryGrid">
                ${TEMPLATE_LIBRARY.map(t => `
                    <div class="template-card" data-template-id="${t.id}" style="cursor:pointer; position:relative;">
                        <h3>${t.name}</h3>
                        <p>${t.description}</p>
                        <div style="margin-top: 10px; display:flex; gap:6px;">
                            <button class="btn-preview-tpl" data-id="${t.id}" style="flex:1; font-size:10px; padding:4px 6px; background:var(--surface); border:1px solid var(--border); border-radius:4px; cursor:pointer; color:var(--text-muted);">Vista previa</button>
                            <button class="btn-load-tpl-direct" data-id="${t.id}" style="flex:1; font-size:10px; padding:4px 6px; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;">Cargar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        showModal('Template Library', content, [
            { text: 'Cancelar', primary: false, action: hideModal }
        ]);

        setTimeout(() => {
            const grid = document.getElementById('libraryGrid');
            if (!grid) return;
            grid.querySelectorAll('.btn-preview-tpl').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.previewTemplate(btn.dataset.id);
                });
            });
            grid.querySelectorAll('.btn-load-tpl-direct').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.loadTemplate(btn.dataset.id);
                });
            });
        }, TIMING.MODAL_INIT_DELAY);
    },

    async previewTemplate(id) {
        const template = TEMPLATE_LIBRARY.find(t => t.id === id);
        if (!template || !window.editor) return;

        showToast('Generando vista previa...', 'info');

        const savedMjml = await IMPORT_EXPORT.getMjml();
        const sm = window.editor.StorageManager;
        const prevSteps = sm.get('stepsBeforeSave');
        sm.set('stepsBeforeSave', 999999);
        window.editor.UndoManager.stop();

        let previewHtml = '';
        try {
            window.editor.setComponents(template.mjml);
            await new Promise(r => setTimeout(r, 200));
            const result = window.editor.runCommand('mjml-code-to-html', { validationLevel: 'skip' });
            previewHtml = result?.html || '';
        } finally {
            window.editor.setComponents(savedMjml);
            sm.set('stepsBeforeSave', prevSteps);
            window.editor.UndoManager.start();
            window.editor.UndoManager.clear();
        }

        const safeSrc = previewHtml.replace(/"/g, '&quot;');
        showModal(`Vista Previa: ${escapeHtml(template.name)}`, `
            <p style="color:var(--text-muted); font-size:12px; margin-bottom:12px;">${escapeHtml(template.description)}</p>
            <div style="position:relative; width:100%; height:420px; border:1px solid var(--border); border-radius:6px; overflow:hidden; background:#fff;">
                ${previewHtml
                    ? `<iframe srcdoc="${safeSrc}" style="width:167%; height:167%; transform:scale(0.6); transform-origin:top left; border:none;" sandbox="allow-same-origin"></iframe>`
                    : '<div style="padding:40px; text-align:center; color:var(--text-muted);">Vista previa no disponible</div>'
                }
            </div>
        `, [
            { text: 'Volver', class: 'btn-secondary', action: () => this.showTemplateModal() },
            { text: 'Cargar esta plantilla', class: 'btn-primary', action: () => this.loadTemplate(id) }
        ]);
    },

    loadTemplate(id) {
        const template = TEMPLATE_LIBRARY.find(t => t.id === id);
        if (!template || !window.editor) return;

        showModal('Cargar plantilla', `
            <p>Cargar "<strong>${escapeHtml(template.name)}</strong>"?</p>
            <p style="color:var(--text-muted); font-size:13px; margin-top:8px;">Los cambios no guardados del diseño actual se perderán.</p>
        `, [
            { text: 'Cancelar', primary: false, action: () => this.showTemplateModal() },
            { text: 'Cargar', primary: true, action: () => {
                window.editor.setComponents(template.mjml);
                showToast(`Plantilla cargada: ${template.name}`);
                hideModal();
            }}
        ]);
    }
};

window.TEMPLATE_UI = TEMPLATE_UI;
window.loadLibraryTemplate = (id) => TEMPLATE_UI.loadTemplate(id);