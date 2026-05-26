// Visual Email Editor - Editor Actions (Standalone Buttons)

const EDITOR_ACTIONS = {
    init() {
        this.bindSaveTemplateButton();
        this.bindExportButton();
        this.bindLoadTemplateButton();
        this.bindPreviewButton();
        this.bindViewCodeButton();
        this.bindInsertEmailButton();
        this.bindExtraButtons();
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
            const templates = await this.getSavedTemplates();

            // P.ALTA-4: prevent duplicate names (update existing instead of duplicating)
            const existingIndex = templates.findIndex(t => t.name === name);
            const entry = { name, mjml, date: new Date().toLocaleDateString() };
            if (existingIndex >= 0) {
                templates[existingIndex] = entry;
                showToast(`Template "${name}" updated`, 'success');
            } else {
                templates.unshift(entry);
                showToast(`Template "${name}" saved`, 'success');
            }

            await browser.storage.local.set({ savedTemplates: templates });
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


    bindInsertEmailButton() {
        const btnInsertEmail = document.getElementById('btnInsertEmail');
        if (btnInsertEmail) {
            btnInsertEmail.addEventListener('click', () => this.insertEmail());
        }
    },

    bindExtraButtons() {
        document.getElementById('btnAutosaveHistory')?.addEventListener('click', () => {
            if (window.AUTO_SAVE) AUTO_SAVE.showHistoryModal();
        });
        document.getElementById('btnBrandColors')?.addEventListener('click', () => {
            if (window.BRAND_COLORS) BRAND_COLORS.showModal();
        });
        document.getElementById('btnVariables')?.addEventListener('click', () => {
            if (window.VARIABLES) VARIABLES.showInsertModal();
        });
        document.getElementById('btnSpamRules')?.addEventListener('click', () => {
            if (window.SPAM_ANALYZER) SPAM_ANALYZER.showModal();
        });
        document.getElementById('btnUTMConfig')?.addEventListener('click', () => {
            if (window.UTM) UTM.showConfigModal();
        });
        document.getElementById('btnKeyboardShortcuts')?.addEventListener('click', () => {
            if (window.showKeyboardShortcutsModal) showKeyboardShortcutsModal();
        });
    },

    showExportModal() {
        showModal('Export Email', `
            <div class="export-options">
                <div class="form-group">
                    <label>Choose Format</label>
                    <select class="form-input" id="exportFormat">
                        <option value="html">HTML (Recommended for Thunderbird)</option>
                        <option value="mjml">MJML (For re-editing)</option>
                    </select>
                </div>
                <div class="export-preview-box">
                    <p>Format: <span id="exportFormatLabel" style="font-weight:bold; color:var(--primary);">HTML</span></p>
                    <small style="color:var(--text-muted);">El formato HTML está optimizado para su visualización en clientes de correo.</small>
                </div>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn-secondary" style="flex:1;" id="btnDownloadExport">
                        Descargar Archivo
                    </button>
                    <button class="btn-secondary" style="flex:1;" id="btnCopyExport">
                        Copiar al Portapapeles
                    </button>
                </div>
            </div>
        `, [
            { text: 'Cancel', primary: false, action: hideModal }
        ]);

        setTimeout(() => {
            const formatSelect = document.getElementById('exportFormat');
            const formatLabel = document.getElementById('exportFormatLabel');
            const btnDownload = document.getElementById('btnDownloadExport');
            const btnCopy = document.getElementById('btnCopyExport');

            if (formatSelect) {
                formatSelect.addEventListener('change', () => {
                    const format = formatSelect.value;
                    if (formatLabel) formatLabel.textContent = format.toUpperCase();
                });
            }

            if (btnDownload) {
                btnDownload.addEventListener('click', () => this.downloadFile());
            }

            if (btnCopy) {
                btnCopy.addEventListener('click', () => this.copyToClipboard());
            }
        }, TIMING.MODAL_INIT_DELAY);
    },

    async downloadFile() {
        const format = document.getElementById('exportFormat')?.value || 'html';

        try {
            if (format === 'html') {
                await IMPORT_EXPORT.exportHtmlToFile(undefined, await this._getUtmConfig());
            } else {
                await IMPORT_EXPORT.exportMjmlToFile();
            }
            hideModal();
        } catch (e) {
            showToast('Error exporting: ' + e.message, 'error');
        }
    },

    async _getUtmConfig() {
        if (!window.UTM) return null;
        const cfg = await UTM.getConfig();
        return (cfg.source || cfg.campaign) ? cfg : null;
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

    async showSavedTemplatesModal() {
        const templates = await this.getSavedTemplates();

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

        showModal('Saved Templates', `
            <div style="max-height: 400px; overflow-y: auto;" id="savedTemplatesList">
                ${templates.map((t, i) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border);">
                        <div>
                            <div style="font-weight: 500;">${escapeHtml(t.name)}</div>
                            <div style="font-size: 11px; color: var(--text-muted);">${t.date}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-secondary btn-load-tpl" data-index="${i}" style="padding: 6px 12px; font-size: 12px;">Load</button>
                            <button class="btn-secondary btn-delete-tpl" data-index="${i}" style="padding: 6px 12px; font-size: 12px; color: var(--danger);">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `, [
            { text: 'Close', primary: false, action: hideModal }
        ]);

        setTimeout(() => {
            const list = document.getElementById('savedTemplatesList');
            if (list) {
                list.querySelectorAll('.btn-load-tpl').forEach(btn => {
                    btn.addEventListener('click', () => this.loadTemplate(parseInt(btn.getAttribute('data-index'))));
                });
                list.querySelectorAll('.btn-delete-tpl').forEach(btn => {
                    btn.addEventListener('click', () => this.deleteTemplate(parseInt(btn.getAttribute('data-index'))));
                });
            }
        }, TIMING.MODAL_INIT_DELAY);
    },

    async getSavedTemplates() {
        try {
            const result = await browser.storage.local.get('savedTemplates');
            return result.savedTemplates || [];
        } catch {
            return [];
        }
    },

    async loadTemplate(index) {
        const templates = await this.getSavedTemplates();
        const template = templates[index];

        if (!template || !window.editor) return;

        // P.ALTA-3: confirm before replacing current work
        showModal('Load Template', `
            <p>Load "<strong>${escapeHtml(template.name)}</strong>"?</p>
            <p style="color: var(--text-muted); font-size: 13px; margin-top: 8px;">Unsaved changes to the current design will be lost.</p>
        `, [
            { text: 'Cancel', primary: false, action: hideModal },
            { text: 'Load', primary: true, action: () => {
                window.editor.setComponents(template.mjml);
                showToast(`Template "${template.name}" loaded`, 'success');
                hideModal();
            }}
        ]);
    },

    async deleteTemplate(index) {
        const templates = await this.getSavedTemplates();
        const name = templates[index]?.name;

        templates.splice(index, 1);
        await browser.storage.local.set({ savedTemplates: templates });

        showToast(`Template "${name}" deleted`, 'success');
        this.showSavedTemplatesModal();
    },

    togglePreview() {
        if (!window.editor) return;
        
        const isPreview = window.editor.Commands.isActive('preview');
        if (isPreview) {
            window.editor.stopCommand('preview');
            document.body.classList.remove('preview-mode');
        } else {
            window.editor.runCommand('preview');
            document.body.classList.add('preview-mode');
        }
        
        const btnPreview = document.getElementById('btnPreview');
        if (btnPreview) {
            const nowActive = window.editor.Commands.isActive('preview');
            btnPreview.style.background = nowActive ? 'var(--primary)' : '';
            btnPreview.style.color = nowActive ? 'white' : '';
        }
    },

    async showCodeModal() {
        showModal('Email Code', `
            <div class="form-group">
                <label>Format</label>
                <select class="form-input" id="codeFormat">
                    <option value="mjml">MJML (GrapesJS Source)</option>
                    <option value="html">Generated HTML (Final Output)</option>
                </select>
            </div>
            <div class="form-group">
                <textarea id="codeViewArea" class="form-input" rows="18" readonly 
                          style="font-family: 'Fira Code', monospace; font-size: 11px; white-space: pre; overflow: scroll; background: #1e1e2e; color: #cdd6f4; border: 1px solid #313244;"></textarea>
            </div>
        `, [
            { text: 'Copy to Clipboard', primary: true, action: () => this.copyCodeFromModal() },
            { text: 'Close', primary: false, action: hideModal }
        ]);

        setTimeout(() => {
            const formatSelect = document.getElementById('codeFormat');
            if (formatSelect) {
                formatSelect.addEventListener('change', () => this.updateCodePreview());
            }
            this.updateCodePreview();
        }, TIMING.CODE_VIEW_DELAY);
    },

    async updateCodePreview() {
        const formatSelect = document.getElementById('codeFormat');
        const codeViewArea = document.getElementById('codeViewArea');
        if (!codeViewArea) return;

        const format = formatSelect?.value || 'mjml';

        try {
            let code;
            if (format === 'mjml') {
                code = await IMPORT_EXPORT.getMjml();
            } else {
                code = await IMPORT_EXPORT.getCompiledHtml();
            }
            codeViewArea.value = code;
        } catch (e) {
            codeViewArea.value = 'Error loading code: ' + e.message;
        }
    },

    async copyCodeFromModal() {
        const formatSelect = document.getElementById('codeFormat');
        const format = formatSelect?.value || 'mjml';
        
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


    async _fetchAsBase64(url, timeoutMs = 8000) {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const res = await fetch(url, { signal: ctrl.signal });
            clearTimeout(tid);
            if (!res.ok) return null;
            const blob = await res.blob();
            return await new Promise((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result);
                r.onerror = reject;
                r.readAsDataURL(blob);
            });
        } catch (e) {
            clearTimeout(tid);
            return null;
        }
    },

    async inlineFonts(html) {
        // Handle @import url(Google Fonts) → fetch the CSS → inline each font file as base64
        const importRx = /@import\s+url\(\s*['"]?(https:\/\/fonts\.googleapis\.com[^'")\s]+)['"]?\s*\)\s*;?/gi;
        const importMatches = [...html.matchAll(importRx)];

        for (const match of importMatches) {
            const [fullImport, cssUrl] = [match[0], match[1]];
            try {
                const ctrl = new AbortController();
                const tid = setTimeout(() => ctrl.abort(), 8000);
                const res = await fetch(cssUrl, { signal: ctrl.signal });
                clearTimeout(tid);
                if (!res.ok) continue;
                let fontCss = await res.text();

                // Inline each font file referenced in the Google Fonts CSS
                const fontUrls = [...new Set(
                    [...fontCss.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/gi)].map(m => m[1])
                )];

                const b64 = {};
                await Promise.all(fontUrls.map(async url => {
                    const data = await this._fetchAsBase64(url);
                    if (data) b64[url] = data;
                }));

                fontCss = fontCss.replace(
                    /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/gi,
                    (m, u) => b64[u] ? `url("${b64[u]}")` : m
                );

                html = html.replace(fullImport, fontCss);
            } catch (e) {
                console.warn('[inlineFonts] No se pudo obtener Google Fonts:', cssUrl, e.message);
            }
        }

        // Handle direct @font-face src URLs (non-Google Fonts)
        const directUrls = [...new Set(
            [...html.matchAll(/url\(['"]?(https?:\/\/[^'")\s]+\.(?:woff2?|ttf|otf|eot))['"]?\)/gi)].map(m => m[1])
        )];

        if (directUrls.length > 0) {
            const b64Map = {};
            await Promise.all(directUrls.map(async url => {
                const data = await this._fetchAsBase64(url);
                if (data) b64Map[url] = data;
            }));
            html = html.replace(
                /url\(['"]?(https?:\/\/[^'")\s]+\.(?:woff2?|ttf|otf|eot))['"]?\)/gi,
                (m, url) => b64Map[url] ? `url("${b64Map[url]}")` : m
            );
        }

        return html;
    },

    async inlineImages(html) {
        const srcRx = /src="(https?:\/\/[^"]+)"/gi;
        const urls = [...new Set([...html.matchAll(srcRx)].map(m => m[1]))];
        if (urls.length === 0) return html;

        const b64Map = {};
        await Promise.all(urls.map(async (url) => {
            try {
                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), 5000);
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(tid);
                if (!res.ok) return;
                const blob = await res.blob();
                b64Map[url] = await new Promise((resolve, reject) => {
                    const r = new FileReader();
                    r.onload = () => resolve(r.result);
                    r.onerror = reject;
                    r.readAsDataURL(blob);
                });
            } catch (e) {
                console.warn('[insertEmail] No se pudo incrustar imagen:', url, e.message);
            }
        }));

        return html.replace(/src="(https?:\/\/[^"]+)"/gi, (match, url) =>
            b64Map[url] ? `src="${b64Map[url]}"` : match
        );
    },

    async insertEmail() {
        try {
            let html = await IMPORT_EXPORT.getCompiledHtml();

            showToast('Preparando email para Thunderbird...', 'info');

            html = await this.inlineImages(html);

            const response = await browser.runtime.sendMessage({
                action: "insertHtmlToCompose",
                html: html
            });

            if (response && response.success) {
                showToast('Email insertado correctamente', 'success');
            } else {
                throw new Error(response?.error || 'Error desconocido al insertar');
            }
        } catch (e) {
            console.error('Insert Email Error:', e);
            showToast('Error al insertar: ' + e.message, 'error');
            
            // Fallback: show the modal if messaging fails
            this.showInsertEmailFallback(await IMPORT_EXPORT.getCompiledHtml());
        }
    },

    showInsertEmailFallback(html) {
        showModal('Insert Email (Manual)', `
            <div class="form-group">
                <label>No se pudo insertar automáticamente. Copia el HTML manualmente:</label>
            </div>
            <div class="form-group">
                <textarea id="insertEmailCode" class="form-input" rows="12" style="font-family: monospace; font-size: 11px;" readonly>${escapeHtml(html)}</textarea>
            </div>
        `, [
            { text: 'Copiar HTML', primary: true, action: () => {
                navigator.clipboard.writeText(html).then(() => {
                    showToast('HTML copiado', 'success');
                    hideModal();
                });
            }},
            { text: 'Cerrar', primary: false, action: hideModal }
        ]);
    }
};

window.EDITOR_ACTIONS = EDITOR_ACTIONS;