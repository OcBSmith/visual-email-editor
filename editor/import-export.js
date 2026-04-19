// Visual Email Editor - Import/Export Module (File Handling & MJML Compilation)

const IMPORT_EXPORT = {
    htmlFileInput: null,

    init() {
        this.htmlFileInput = document.getElementById('htmlFileInput');
        this.setupFileHandler();
    },

    setupFileHandler() {
        if (!this.htmlFileInput) return;

        this.htmlFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                this.loadHtmlContent(text, file.name);
                hideModal();
            } catch (error) {
                console.error('[Import/Export] Error reading file:', error);
                showToast('Error reading the file', 'error');
            }

            this.htmlFileInput.value = '';
        });
    },

    async getCompiledHtml() {
        if (!window.editor) {
            throw new Error('Editor not initialized');
        }
        return window.editor.getHtml();
    },

    async getMjml() {
        if (!window.editor) {
            throw new Error('Editor not initialized');
        }
        
        // Try direct call (Standard MJML plugin)
        if (typeof window.editor.getMjml === 'function') {
            return window.editor.getMjml();
        }
        
        // Try uppercase variant
        if (typeof window.editor.getMJML === 'function') {
            return window.editor.getMJML();
        }
        
        // Try plugin command
        try {
            const result = window.editor.runCommand('mjml-get-code');
            if (result) return result;
        } catch (e) {
            console.warn('Command mjml-get-code failed', e);
        }

        // If all fails, fall back to getHtml which sometimes returns the MJML in certain plugin versions
        return window.editor.getHtml();
    },

    loadHtmlContent(html, sourceName) {
        if (!window.editor) {
            console.error('[Import/Export] Editor not initialized');
            return;
        }

        try {
            if (html.includes('<mjml') || html.includes('<mj-')) {
                window.editor.setComponents(html);
                showToast(`MJML imported: ${sourceName}`);
            } else {
                window.editor.setComponents(html);
                showToast(`HTML imported: ${sourceName}`);
            }
        } catch (error) {
            console.error('[Import/Export] Error loading HTML:', error);
            showToast('Error loading HTML', 'error');
        }
    },

    importHtmlFromTextarea() {
        const textarea = document.getElementById('htmlCodeInput');
        if (!textarea) return;

        const html = textarea.value.trim();

        if (!html) {
            showToast('Please provide HTML code', 'error');
            return;
        }

        this.loadHtmlContent(html, 'Pasted code');
        hideModal();
    },

    showImportModal() {
        const content = `
            <div class="import-options">
                <p style="margin-bottom: 16px; color: var(--text-secondary);">
                    Import an HTML file or paste the code directly:
                </p>
                <div class="form-group">
                    <label>From file:</label>
                    <button id="btnSelectFile" class="btn-secondary" style="width: 100%;">
                        Select HTML/MJML file
                    </button>
                </div>
                <div style="text-align: center; margin: 16px 0; color: var(--text-muted);">or</div>
                <div class="form-group">
                    <label>Paste HTML code:</label>
                    <textarea id="htmlCodeInput" class="form-input" rows="10" placeholder="Paste your HTML or MJML code here..." style="font-family: monospace; font-size: 12px;"></textarea>
                </div>
            </div>
        `;

        showModal('Import HTML', content, [
            { text: 'Cancel', primary: false, action: hideModal },
            { text: 'Import', primary: true, action: () => this.importHtmlFromTextarea() }
        ]);

        setTimeout(() => {
            const btnSelectFile = document.getElementById('btnSelectFile');
            if (btnSelectFile && this.htmlFileInput) {
                btnSelectFile.addEventListener('click', () => this.htmlFileInput.click());
            }
        }, 50);
    },

    async exportHtmlToFile(filename = 'email.html') {
        try {
            const html = await this.getCompiledHtml();
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('HTML exported successfully', 'success');
        } catch (error) {
            console.error('[Import/Export] Error exporting HTML:', error);
            showToast('Error exporting HTML: ' + error.message, 'error');
        }
    },

    async exportMjmlToFile(filename = 'email.mjml') {
        try {
            const mjml = await this.getMjml();
            const blob = new Blob([mjml], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('MJML exported successfully', 'success');
        } catch (error) {
            console.error('[Import/Export] Error exporting MJML:', error);
            showToast('Error exporting MJML: ' + error.message, 'error');
        }
    },

    async copyHtmlToClipboard() {
        try {
            const html = await this.getCompiledHtml();
            await navigator.clipboard.writeText(html);
            showToast('HTML copied to clipboard', 'success');
        } catch (error) {
            console.error('[Import/Export] Error copying HTML:', error);
            showToast('Error copying to clipboard', 'error');
        }
    },

    async copyMjmlToClipboard() {
        try {
            const mjml = await this.getMjml();
            await navigator.clipboard.writeText(mjml);
            showToast('MJML copied to clipboard', 'success');
        } catch (error) {
            console.error('[Import/Export] Error copying MJML:', error);
            showToast('Error copying to clipboard', 'error');
        }
    }
};

window.IMPORT_EXPORT = IMPORT_EXPORT;