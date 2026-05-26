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

    healComponent(comp) {
        const attrs = { ...comp.getAttributes() };
        let modifiedAttrs = false;

        const type = comp.get('type');

        // mj-text, mj-button, mj-image don't support text-align as an MJML attribute
        if (type === 'mj-text' || type === 'mj-button' || type === 'mj-image') {
            if (attrs['text-align']) {
                delete attrs['text-align'];
                modifiedAttrs = true;
            }
        }

        if (modifiedAttrs) {
            comp.set('attributes', attrs);
        }

        // NOTA: NO eliminar style['align'] — el plugin grapesjs-mjml lo usa internamente
        // para almacenar el atributo MJML align en el modelo de GrapesJS.

        // Recursión para los hijos
        const components = comp.components();
        if (components && components.length) {
            components.forEach(c => this.healComponent(c));
        }
    },

    async getCompiledHtml() {
        if (!window.editor) throw new Error('Editor not initialized');
        
        try {
            console.log('[Import/Export] Compiling MJML...');
            
            // 1. EL GRAN SANADOR (The Great Healer)
            // Las pruebas de alineación anteriores corruptieron el estado almacenado 
            // con atributos inválidos (como text-align en mj-text) haciendo que el 
            // parser interno de MJML explote ("Parsing failed").
            this.healComponent(window.editor.getWrapper());
            
            // 2. Ejecutar compilación usando SIEMPRE mjml-code-to-html (el comando que sabemos que existe)
            // Pasamos validación saltada por si acaso queda algo mal
            let result = window.editor.runCommand('mjml-code-to-html', { validationLevel: 'skip' });
            
            let fullHtml = "";
            if (result) {
                fullHtml = result.html || (typeof result === 'string' ? result : "");
            }

            // 3. Si falló mjml-code-to-html con parsing failed, la librería no lo devuelve, 
            // así que tenemos que comprobar que de verdad hemos obtenido HTML
            if (fullHtml && fullHtml.length > 50 && fullHtml.includes('<html')) {
                console.log('[Import/Export] Compilation successful.');
                
                // Limpieza agresiva de MSO y basura de Outlook para Thunderbird
                fullHtml = fullHtml.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '');
                fullHtml = fullHtml.replace(/mso-[^:;]+:[^;]+;?/gi, '');

                let bodyContent = '';
                const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
                bodyContent = bodyMatch ? bodyMatch[1].trim() : fullHtml;

                let styles = '';
                const styleMatches = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
                if (styleMatches) styles = styleMatches.join('\n');

                // Detectar el ancho real del MJML para el contenedor final
                const wrapper = window.editor.getWrapper();
                const mjBody = wrapper.find('mj-body')[0] || wrapper.findType('mj-body')[0];
                let finalWidth = '600px'; 
                if (mjBody) {
                    finalWidth = mjBody.getAttributes().width || '600px';
                }

                return `${styles}\n<div class="visual-editor-container" style="max-width:${finalWidth};margin:0 auto;">${bodyContent}</div>`;
            }

            throw new Error('Comando terminó pero no devolvió un HTML válido.');
        } catch (e) {

            console.warn('[Import/Export] MJML compilation failed, falling back to raw HTML cleanup.', e);
            
            // Si GrapesJS falla por completo en darnos el HTML compilado, sacamos la versión pura serializada
            // y limpiamos TODAS las etiquetas MJML para que Thunderbird no las vea
            let rawMjml = window.editor.getHtml();
            if(!rawMjml || rawMjml.length < 10) rawMjml = "<div>El diseño no se pudo exportar correctamente.</div>";
            
            return rawMjml.replace(/<mj-text[^>]*>/gi, '<div style="margin-bottom:10px; font-family: sans-serif;">')
                          .replace(/<mj-section[^>]*>/gi, '<div style="width: 100%; display: table;">')
                          .replace(/<mj-column[^>]*>/gi, '<div style="display: table-cell; vertical-align: top;">')
                          .replace(/<mj-[^>]*>/gi, '<div>')
                          .replace(/<\/mj-[^>]*>/gi, '</div>')
                          .replace(/<mjml>|<\/mjml>|<mj-head>|<\/mj-head>|<mj-body>|<\/mj-body>/gi, '');
        }
    },

    async getMjml() {
        if (!window.editor) {
            throw new Error('Editor not initialized');
        }
        
        // 1. Try direct call (Standard MJML plugin adds this to the editor instance)
        if (typeof window.editor.getMjml === 'function') {
            return window.editor.getMjml();
        }
        
        // 2. Try uppercase variant
        if (typeof window.editor.getMJML === 'function') {
            return window.editor.getMJML();
        }
        
        // 3. Try plugin command BUT only if it exists (avoids "command not found" warning)
        if (window.editor.Commands.isActive && window.editor.Commands.has('mjml-get-code')) {
            try {
                return window.editor.runCommand('mjml-get-code');
            } catch (e) {
                console.warn('Command mjml-get-code failed', e);
            }
        }

        // 4. Default fallback: getHtml()
        // In the MJML plugin, getHtml() usually returns the MJML components as a string
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