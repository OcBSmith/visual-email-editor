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
        if (template && window.editor) {
            window.editor.setComponents(template.mjml);
            hideModal();
            showToast(`Template loaded: ${template.name}`);
        }
    }
};

window.TEMPLATE_UI = TEMPLATE_UI;
window.loadLibraryTemplate = (id) => TEMPLATE_UI.loadTemplate(id);