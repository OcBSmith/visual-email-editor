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
                    <div class="template-card" data-template-id="${t.id}" style="cursor:pointer">
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

        setTimeout(() => {
            const grid = document.getElementById('libraryGrid');
            if (grid) {
                grid.querySelectorAll('.template-card').forEach(card => {
                    card.addEventListener('click', () => {
                        this.loadTemplate(card.dataset.templateId);
                    });
                });
            }
        }, 50);
    },

    loadTemplate(id) {
        const template = TEMPLATE_LIBRARY.find(t => t.id === id);
        if (!template || !window.editor) return;

        // P.ALTA-3: confirm before replacing current work
        showModal('Load Template', `
            <p>Load "<strong>${escapeHtml(template.name)}</strong>"?</p>
            <p style="color: var(--text-muted); font-size: 13px; margin-top: 8px;">Unsaved changes to the current design will be lost.</p>
        `, [
            { text: 'Cancel', primary: false, action: () => this.showTemplateModal() },
            { text: 'Load', primary: true, action: () => {
                window.editor.setComponents(template.mjml);
                showToast(`Template loaded: ${template.name}`);
                hideModal();
            }}
        ]);
    }
};

window.TEMPLATE_UI = TEMPLATE_UI;
window.loadLibraryTemplate = (id) => TEMPLATE_UI.loadTemplate(id);