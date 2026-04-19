// Visual Email Editor - Editor Actions (Standalone Buttons)

const EDITOR_ACTIONS = {
    init() {
        this.bindSaveTemplateButton();
        this.bindExportButton();
        this.bindLoadTemplateButton();
        this.bindPreviewButton();
        this.bindViewCodeButton();
        this.bindFullscreenButton();
        this.bindInsertEmailButton();
    },

    bindSaveTemplateButton() {
        const btnSaveTemplate = document.getElementById('btnSaveTemplate');
        if (btnSaveTemplate) {
            btnSaveTemplate.addEventListener('click', () => this.showSaveTemplateModal());
        }
    },

    showSaveTemplateModal() {
        showModal('Save Template', `
            <div class="form-group">
                <label>Template Name</label>
                <input type="text" class="form-input" id="templateName" placeholder="My Email Template">
            </div>
        `, [
            { text: 'Cancel', primary: false, action: hideModal },
            { text: 'Save', primary: true, action: () => this.saveCurrentTemplate() }
        ]);
    },

    async saveCurrentTemplate() {
        const name = document.getElementById('templateName')?.value.trim();
        
        if (!name) {
            showToast('Please enter a template name', 'warning');
            return;
        }

        try {
            const mjml = await IMPORT_EXPORT.getMjml();
            const templates = this.getSavedTemplates();
            
            templates.unshift({
                name: name,
                mjml: mjml,
                date: new Date().toLocaleDateString()
            });

            localStorage.setItem('savedTemplates', JSON.stringify(templates));
            showToast(`Template "${name}" saved`, 'success');
            hideModal();
        } catch (e) {
            showToast('Error saving template: ' + e.message, 'error');
        }
    },

    bindExportButton() {
        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.showExportModal());
        }
    },

    bindLoadTemplateButton() {
        const btnLoadTemplate = document.getElementById('btnLoadTemplate');
        if (btnLoadTemplate) {
            btnLoadTemplate.addEventListener('click', () => this.showSavedTemplatesModal());
        }
    },

    bindPreviewButton() {
        const btnPreview = document.getElementById('btnPreview');
        if (btnPreview) {
            btnPreview.addEventListener('click', () => this.togglePreview());
        }
    },

    bindViewCodeButton() {
        const btnViewCode = document.getElementById('btnViewCode');
        if (btnViewCode) {
            btnViewCode.addEventListener('click', () => this.showCodeModal());
        }
    },

    bindFullscreenButton() {
        const btnFullscreen = document.getElementById('btnFullscreen');
        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
        }
    },

    bindInsertEmailButton() {
        const btnInsertEmail = document.getElementById('btnInsertEmail');
        if (btnInsertEmail) {
            btnInsertEmail.addEventListener('click', () => this.insertEmail());
        }
    },

    showExportModal() {
        showModal('Export Email', `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div class="form-group">
                    <label>Export Format</label>
                    <select class="form-input" id="exportFormat">
                        <option value="html">HTML (Compiled)</option>
                        <option value="mjml">MJML (Source)</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 8px;">
                    <button class="btn-secondary" style="flex:1;" onclick="EDITOR_ACTIONS.downloadFile()">
                        Download File
                    </button>
                    <button class="btn-secondary" style="flex:1;" onclick="EDITOR_ACTIONS.copyToClipboard()">
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        `, [
            { text: 'Close', primary: false, action: hideModal }
        ]);
    },

    async downloadFile() {
        const format = document.getElementById('exportFormat')?.value || 'html';
        
        try {
            if (format === 'html') {
                await IMPORT_EXPORT.exportHtmlToFile();
            } else {
                await IMPORT_EXPORT.exportMjmlToFile();
            }
            hideModal();
        } catch (e) {
            showToast('Error exporting: ' + e.message, 'error');
        }
    },

    async copyToClipboard() {
        const format = document.getElementById('exportFormat')?.value || 'html';
        
        try {
            if (format === 'html') {
                await IMPORT_EXPORT.copyHtmlToClipboard();
            } else {
                await IMPORT_EXPORT.copyMjmlToClipboard();
            }
            hideModal();
        } catch (e) {
            showToast('Error copying: ' + e.message, 'error');
        }
    },

    showSavedTemplatesModal() {
        const templates = this.getSavedTemplates();
        
        if (templates.length === 0) {
            showModal('Saved Templates', `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <p>No saved templates yet.</p>
                    <p style="margin-top: 12px; font-size: 13px;">Use "Save Template" to save your designs.</p>
                </div>
            `, [
                { text: 'Close', primary: false, action: hideModal }
            ]);
            return;
        }

        const templateList = templates.map((t, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border);">
                <div>
                    <div style="font-weight: 500;">${escapeHtml(t.name)}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${t.date}</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-secondary" onclick="EDITOR_ACTIONS.loadTemplate(${i})" style="padding: 6px 12px; font-size: 12px;">Load</button>
                    <button class="btn-secondary" onclick="EDITOR_ACTIONS.deleteTemplate(${i})" style="padding: 6px 12px; font-size: 12px; color: var(--danger);">Delete</button>
                </div>
            </div>
        `).join('');

        showModal('Saved Templates', `
            <div style="max-height: 400px; overflow-y: auto;">
                ${templateList}
            </div>
        `, [
            { text: 'Close', primary: false, action: hideModal }
        ]);
    },

    getSavedTemplates() {
        try {
            const saved = localStorage.getItem('savedTemplates');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },

    loadTemplate(index) {
        const templates = this.getSavedTemplates();
        const template = templates[index];
        
        if (template && window.editor) {
            window.editor.setComponents(template.mjml);
            showToast(`Template "${template.name}" loaded`, 'success');
            hideModal();
        }
    },

    deleteTemplate(index) {
        const templates = this.getSavedTemplates();
        const name = templates[index]?.name;
        
        templates.splice(index, 1);
        localStorage.setItem('savedTemplates', JSON.stringify(templates));
        
        showToast(`Template "${name}" deleted`, 'success');
        this.showSavedTemplatesModal();
    },

    togglePreview() {
        const canvasContainer = document.querySelector('.canvas-container');
        const btnPreview = document.getElementById('btnPreview');
        
        if (canvasContainer) {
            canvasContainer.classList.toggle('preview-mode');
            const isPreview = canvasContainer.classList.contains('preview-mode');
            
            if (btnPreview) {
                btnPreview.style.background = isPreview ? 'var(--primary)' : '';
                btnPreview.style.color = isPreview ? 'white' : '';
            }
        }
    },

    async showCodeModal() {
        showModal('Email Code', `
            <div class="form-group">
                <label>Format</label>
                <select class="form-input" id="codeFormat" onchange="EDITOR_ACTIONS.updateCodePreview()">
                    <option value="mjml">MJML</option>
                    <option value="html">HTML</option>
                </select>
            </div>
            <div class="code-preview" id="codePreview" style="max-height: 400px;">
                <pre id="codeContent">Loading...</pre>
            </div>
        `, [
            { text: 'Copy to Clipboard', primary: true, action: () => this.copyCode() },
            { text: 'Close', primary: false, action: hideModal }
        ]);

        setTimeout(() => this.updateCodePreview(), 50);
    },

    async updateCodePreview() {
        const format = document.getElementById('codeFormat')?.value || 'mjml';
        const codeContent = document.getElementById('codeContent');
        
        if (!codeContent) return;

        try {
            let code;
            if (format === 'mjml') {
                code = await IMPORT_EXPORT.getMjml();
            } else {
                code = await IMPORT_EXPORT.getCompiledHtml();
            }
            codeContent.textContent = code;
        } catch (e) {
            codeContent.textContent = 'Error loading code: ' + e.message;
        }
    },

    async copyCode() {
        const format = document.getElementById('codeFormat')?.value || 'mjml';
        
        try {
            if (format === 'mjml') {
                await IMPORT_EXPORT.copyMjmlToClipboard();
            } else {
                await IMPORT_EXPORT.copyHtmlToClipboard();
            }
            hideModal();
        } catch (e) {
            showToast('Error copying code', 'error');
        }
    },

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
                showToast('Fullscreen not available', 'error');
            });
        } else {
            document.exitFullscreen();
        }
    },

    async insertEmail() {
        try {
            const html = await IMPORT_EXPORT.getCompiledHtml();
            
            showModal('Insert Email', `
                <div class="form-group">
                    <label>Your email is ready to insert into Thunderbird.</label>
                    <p style="color: var(--text-secondary); font-size: 13px; margin-top: 8px;">
                        Copy the HTML below and paste it into your Thunderbird compose window.
                    </p>
                </div>
                <div class="form-group">
                    <textarea id="insertEmailCode" class="form-input" rows="12" style="font-family: monospace; font-size: 11px;" readonly>${escapeHtml(html)}</textarea>
                </div>
            `, [
                { text: 'Copy HTML', primary: true, action: () => {
                    navigator.clipboard.writeText(html).then(() => {
                        showToast('HTML copied to clipboard', 'success');
                        hideModal();
                    });
                }},
                { text: 'Close', primary: false, action: hideModal }
            ]);
        } catch (e) {
            showToast('Error preparing email: ' + e.message, 'error');
        }
    }
};

window.EDITOR_ACTIONS = EDITOR_ACTIONS;