// Visual Email Editor - AI Handlers Module (All AI Feature UI)

const AI_HANDLERS = {
    chatMessages: null,
    chatInput: null,
    isProcessing: false,

    async init() {
        this.setupAIButtons();
        this.setupChat();
        
        // Restore missing component events for the "magic" AI icon
        this.bindComponentEvents();
        this.setupRTE();
        
        // Wait for AI_API to load from storage
        await AI_API.init();

        // One-time health check on init; subsequent checks happen only after config changes
        this.updateAIStatus();
    },

    setupAIButtons() {
        const btnAIGenerate = document.getElementById('btnAIGenerate');
        const btnAISpam = document.getElementById('btnAISpam');
        const btnAITranslateAll = document.getElementById('btnAITranslateAll');
        const btnAIAlt = document.getElementById('btnAIAlt');
        const btnAIConfig = document.getElementById('btnAIConfig');

        if (btnAIGenerate) btnAIGenerate.addEventListener('click', () => this.showGenerateModal());
        if (btnAISpam) btnAISpam.addEventListener('click', () => this.showSpamModal());
        if (btnAITranslateAll) btnAITranslateAll.addEventListener('click', () => this.showTranslateModal());
        if (btnAIAlt) btnAIAlt.addEventListener('click', () => this.showAltTextModal());
        if (btnAIConfig) btnAIConfig.addEventListener('click', () => this.showConfigModal());
    },

    bindComponentEvents() {
        if (!window.editor) return;

        // When a component is selected, add the AI button to its toolbar
        window.editor.on('component:selected', (model) => {
            const type = model.get('type');
            // Only add to text-based components
            if (type === 'mj-text' || type === 'text' || model.get('content')) {
                this.addAIToolbarButton(model);
            }
        });
    },

    addAIToolbarButton(model) {
        const toolbar = model.get('toolbar');
        
        // Avoid duplicate buttons
        if (toolbar.some(item => item.id === 'ai-action')) return;

        // Add the AI button (Magic Wand / Sparkles icon)
        toolbar.unshift({
            id: 'ai-action',
            command: () => this.showComponentAIModal(model),
            label: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`,
            title: 'IA: Acciones Mágicas'
        });
        
        model.set('toolbar', toolbar);
    },

    showComponentAIModal(model) {
        const content = model.get('content') || '';
        this.showTextAIModal(content, (newText) => {
            model.set('content', newText);
            window.editor.refresh();
        }, 'Acciones de IA para este componente');
    },

    setupRTE() {
        if (!window.editor) return;

        // Button 1: Full AI Modal (Layers icon)
        window.editor.RichTextEditor.add('ai-rte-modal', {
            icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`,
            attributes: { title: 'IA: Opciones Mágicas' },
            result: (rte) => {
                const selectedText = rte.selection().toString();
                if (!selectedText) {
                    showToast('Selecciona el texto que quieres modificar', 'secondary');
                    return;
                }
                
                this.showTextAIModal(selectedText, (newText) => {
                    rte.insertHTML(newText);
                }, 'IA: Modificar texto seleccionado');
            }
        });

        // Button 2: Quick Improve (Sparkles icon)
        window.editor.RichTextEditor.add('ai-rte-improve', {
            icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>`,
            attributes: { title: 'IA: Mejora rápida del texto' },
            result: async (rte) => {
                const selectedText = rte.selection().toString();
                if (!selectedText) return;
                
                if (!AI_SERVICE.isConfigured()) {
                    showToast('Configura la IA primero', 'warning');
                    this.showConfigModal();
                    return;
                }

                showToast('Mejorando texto...', 'info');
                try {
                    const newText = await AI_SERVICE.improveText(selectedText);
                    rte.insertHTML(newText);
                    showToast('¡Texto mejorado!', 'success');
                } catch (e) {
                    showToast('Error IA: ' + e.message, 'error');
                }
            }
        });
    },

    showTextAIModal(originalText, onApply, title = 'Acciones de IA') {
        if (!AI_SERVICE.isConfigured()) {
            showToast('Configura la IA primero', 'warning');
            this.showConfigModal();
            return;
        }

        if (!originalText.trim()) {
            showToast('No hay texto para procesar', 'secondary');
            return;
        }

        showModal(title, `
            <div class="ai-actions">
                <button class="ai-action-btn" id="aiFixGrammar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span>Corregir</span>
                </button>
                <button class="ai-action-btn" id="aiTranslate">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14M5 12h14M5 16h14"/></svg>
                    <span>Traducir</span>
                </button>
                <button class="ai-action-btn" id="aiImprove">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span>Mejorar</span>
                </button>
                <button class="ai-action-btn" id="aiToneFormal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z"/></svg>
                    <span>Formal</span>
                </button>
                <button class="ai-action-btn" id="aiToneFriendly">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-13v4m0 4h.01"/></svg>
                    <span>Cercano</span>
                </button>
                <button class="ai-action-btn" id="aiShorten">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14l-7 7-7-7M19 10l-7-7-7 7"/></svg>
                    <span>Acortar</span>
                </button>
            </div>
            
            <div class="ai-custom-prompt-container" style="margin-top: 15px; border-top: 1px solid var(--border); padding-top: 15px;">
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="aiCustomTextPrompt" class="form-input" style="flex:1; font-size: 13px;" placeholder="¿Qué quieres hacer con este texto?">
                    <button class="btn-primary" id="btnExecuteCustom" style="padding: 0 15px;">Enviar</button>
                </div>
            </div>
            
            <div id="aiActionPreview" class="ai-preview" style="display:none;"></div>
            
            <div class="modal-footer" id="aiActionFooter" style="display:none;">
                <button class="btn-secondary" id="aiCancelAction">Cancelar</button>
                <button class="btn-primary" id="aiApplyAction">Aplicar Cambio</button>
            </div>
        `);

        // Bind actions
        const cancelBtn = document.getElementById('aiCancelAction');
        if (cancelBtn) cancelBtn.onclick = () => hideModal();
        document.getElementById('aiFixGrammar').onclick = () => this.handleTextAIAction(originalText, 'corregir gramática y ortografía', onApply);
        document.getElementById('aiTranslate').onclick = () => this.handleTextAIAction(originalText, 'traducir al inglés', onApply);
        document.getElementById('aiImprove').onclick = () => this.handleTextAIAction(originalText, 'mejorar el estilo y la fluidez', onApply);
        document.getElementById('aiToneFormal').onclick = () => this.handleTextAIAction(originalText, 'cambiar a un tono más formal y profesional', onApply);
        document.getElementById('aiToneFriendly').onclick = () => this.handleTextAIAction(originalText, 'cambiar a un tono más cercano y amable', onApply);
        document.getElementById('aiShorten').onclick = () => this.handleTextAIAction(originalText, 'resumir y acortar el texto', onApply);
        
        const customInput = document.getElementById('aiCustomTextPrompt');
        const customBtn = document.getElementById('btnExecuteCustom');
        
        customBtn.onclick = () => {
            const prompt = customInput.value.trim();
            if (prompt) this.handleTextAIAction(originalText, prompt, onApply);
        };
        
        customInput.onkeypress = (e) => {
            if (e.key === 'Enter') customBtn.click();
        };
    },

    async handleTextAIAction(originalText, action, onApply) {
        if (this.isProcessing) return;
        const preview = document.getElementById('aiActionPreview');
        const footer = document.getElementById('aiActionFooter');
        const applyBtn = document.getElementById('aiApplyAction');

        this.isProcessing = true;
        preview.style.display = 'flex';
        preview.classList.add('loading');
        preview.innerHTML = '<div class="ai-spinner"></div><div style="margin-left:10px">Procesando con IA...</div>';
        footer.style.display = 'none';

        try {
            const result = await AI_SERVICE.processTextAction(originalText, action);
            
            preview.classList.remove('loading');
            preview.style.display = 'block';
            preview.innerHTML = `<strong>Sugerencia:</strong><br>${result}`;
            
            footer.style.display = 'flex';
            applyBtn.onclick = () => {
                onApply(result);
                showToast('Cambio aplicado');
                hideModal();
            };
        } catch (error) {
            console.error('AI Action error:', error);
            preview.innerHTML = `<div style="color:var(--danger)">Error: ${error.message}</div>`;
            preview.classList.remove('loading');
        } finally {
            this.isProcessing = false;
        }
    },

    setupChat() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        const btnSendChat = document.getElementById('btnSendChat');

        if (btnSendChat) {
            btnSendChat.addEventListener('click', () => this.handleChatSend());
        }
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleChatSend();
                }
            });
        }

        const aiChatTab = document.querySelector('[data-panel="ai-chat"]');
        if (aiChatTab) {
            aiChatTab.addEventListener('click', () => {
                setTimeout(() => {
                    if (this.chatInput) this.chatInput.focus();
                }, 100);
            });
        }
    },

    showConfigModal() {
        this.updateAIStatus();
        showModal('Configure AI', `
            <div class="form-group">
                <label>AI Provider</label>
                <select class="form-input" id="aiProviderSelect">
                    <option value="groq" ${AI_API.provider === 'groq' ? 'selected' : ''}>Groq (Cloud - Free Keys)</option>
                    <option value="openrouter" ${AI_API.provider === 'openrouter' ? 'selected' : ''}>OpenRouter (Cloud - Free Models)</option>
                    <option value="lmstudio" ${AI_API.provider === 'lmstudio' ? 'selected' : ''}>LM Studio (Local)</option>
                </select>
            </div>

            <div id="openrouterSettings" style="display: ${AI_API.provider === 'openrouter' ? 'block' : 'none'};">
                <div class="form-group">
                    <label>OpenRouter API Key</label>
                    <input type="password" class="form-input" id="aiOpenRouterKeyInput" 
                           value="${AI_API.openrouterApiKey || ''}" placeholder="sk-or-v1-...">
                    <small style="color: var(--text-muted);">Consigue tu clave en <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai</a></small>
                </div>
                <div class="form-group">
                    <label>Modelo Gratuito</label>
                    <select class="form-input" id="aiOpenRouterModelSelect">
                        ${[...AI_API.OPENROUTER_FREE_MODELS, ...AI_API.detectedOpenRouterModels.filter(dm => !AI_API.OPENROUTER_FREE_MODELS.find(fm => fm.id === dm.id))].map(m => 
                            `<option value="${m.id}" ${m.id === AI_API.openrouterModel ? 'selected' : ''}>${m.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>

            <div id="groqSettings" style="display: ${AI_API.provider === 'groq' ? 'block' : 'none'};">
                <div class="form-group">
                    <label>Groq API Key</label>
                    <input type="password" class="form-input" id="aiApiKeyInput" 
                           value="${AI_API.groqApiKey || ''}" placeholder="gsk_...">
                    <small style="color: var(--text-muted);">Get free key at <a href="https://console.groq.com" target="_blank">console.groq.com</a></small>
                </div>
                <div class="form-group">
                    <label>Model</label>
                    <select class="form-input" id="aiModelSelect">
                        ${AI_API.GROQ_MODELS.map(m => 
                            `<option value="${m.id}" ${m.id === AI_API.groqModel ? 'selected' : ''}>${m.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>

            <div id="lmStudioSettings" style="display: ${AI_API.provider === 'lmstudio' ? 'block' : 'none'};">
                <div class="form-group">
                    <label>LM Studio URL</label>
                    <input type="text" class="form-input" id="aiLmUrlInput" 
                           value="${AI_API.lmStudioUrl || ''}" placeholder="http://localhost:1234">
                </div>
                <div class="form-group">
                    <label>Model (leave as default if using single model)</label>
                    <select class="form-input" id="aiLmModelSelect">
                        ${AI_API.LM_STUDIO_MODELS.length > 0 
                            ? AI_API.LM_STUDIO_MODELS.map(m => 
                                `<option value="${m.id}" ${m.id === AI_API.lmStudioModel ? 'selected' : ''}>${m.id}</option>`
                              ).join('')
                            : `<option value="${AI_API.lmStudioModel || 'local-model'}" selected>${AI_API.lmStudioModel || 'local-model'}</option>`
                        }
                    </select>
                </div>
            </div>

            <button type="button" class="btn-secondary" id="btnRefreshModels" style="margin-top: 15px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Actualizar Modelos
            </button>
        `, [
            { text: 'Cancelar', class: 'btn-secondary', action: hideModal },
            { text: 'Guardar Configuración', class: 'btn-primary', action: () => this.saveAIConfig() }
        ]);

        setTimeout(() => this.bindConfigEvents(), 50);
    },

    bindConfigEvents() {
        const providerSelect = document.getElementById('aiProviderSelect');
        const groqSettings = document.getElementById('groqSettings');
        const lmStudioSettings = document.getElementById('lmStudioSettings');
        const lmUrlInput = document.getElementById('aiLmUrlInput');
        const refreshBtn = document.getElementById('btnRefreshModels');

        if (providerSelect) {
            providerSelect.addEventListener('change', async (e) => {
                const newProvider = e.target.value;
                AI_API.provider = newProvider;
                
                groqSettings.style.display = newProvider === 'groq' ? 'block' : 'none';
                document.getElementById('openrouterSettings').style.display = newProvider === 'openrouter' ? 'block' : 'none';
                lmStudioSettings.style.display = newProvider === 'lmstudio' ? 'block' : 'none';
                
                // Auto-save provider change (SILENT)
                await this.saveAIConfig(true);
            });
        }

        if (refreshBtn && lmUrlInput) {
            refreshBtn.addEventListener('click', async () => {
                const selectedProvider = providerSelect?.value || AI_API.provider;
                
                // Update config state from inputs before fetching
                if (selectedProvider === 'groq') {
                    const apiKey = document.getElementById('aiApiKeyInput')?.value?.trim();
                    if (apiKey) AI_API.groqApiKey = apiKey;
                } else if (selectedProvider === 'openrouter') {
                    const apiKey = document.getElementById('aiOpenRouterKeyInput')?.value?.trim();
                    if (apiKey) AI_API.openrouterApiKey = apiKey;
                } else {
                    const currentLmUrl = lmUrlInput?.value?.trim() || AI_API.lmStudioUrl;
                    if (currentLmUrl) AI_API.lmStudioUrl = currentLmUrl;
                }
                
                try {
                    const models = await AI_API.fetchModels();
                    
                    if (selectedProvider === 'groq') {
                        const select = document.getElementById('aiModelSelect');
                        if (select) {
                            select.innerHTML = '';
                            models.forEach(m => {
                                const opt = document.createElement('option');
                                opt.value = m.id;
                                opt.textContent = m.name || m.id;
                                if (m.id === AI_API.groqModel) opt.selected = true;
                                select.appendChild(opt);
                            });
                        }
                    } else if (selectedProvider === 'openrouter') {
                        const select = document.getElementById('aiOpenRouterModelSelect');
                        if (select) {
                            select.innerHTML = '';
                            models.forEach(m => {
                                const opt = document.createElement('option');
                                opt.value = m.id;
                                opt.textContent = m.name || m.id;
                                if (m.id === AI_API.openrouterModel) opt.selected = true;
                                select.appendChild(opt);
                            });
                        }
                    } else {
                        const select = document.getElementById('aiLmModelSelect');
                        if (select) {
                            select.innerHTML = '';
                            if (models.length > 0) {
                                models.forEach(m => {
                                    const opt = document.createElement('option');
                                    opt.value = m.id;
                                    opt.textContent = m.id;
                                    if (m.id === AI_API.lmStudioModel) opt.selected = true;
                                    select.appendChild(opt);
                                });
                            }
                        }
                    }
                    showToast(`Detectados ${models.length} modelos`, 'success');
                } catch (e) {
                    console.error('[AI Config] Error fetching models:', e);
                    showToast('Error al conectar: ' + e.message, 'error');
                }
            });
        }

        const orKeyInput = document.getElementById('aiOpenRouterKeyInput');
        if (orKeyInput) {
            orKeyInput.addEventListener('blur', async () => {
                const refreshBtn = document.getElementById('btnRefreshModels');
                if (orKeyInput.value.trim().startsWith('sk-or-')) {
                    refreshBtn?.click();
                }
                await this.saveAIConfig(true);
            });
        }

        const apiKeyInput = document.getElementById('aiApiKeyInput');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('blur', async () => {
                const refreshBtn = document.getElementById('btnRefreshModels');
                if (apiKeyInput.value.trim().startsWith('gsk_')) {
                    refreshBtn?.click();
                }
                await this.saveAIConfig(true);
            });
        }

        // Also save when models are manually selected (SILENT)
        document.getElementById('aiModelSelect')?.addEventListener('change', () => this.saveAIConfig(true));
        document.getElementById('aiOpenRouterModelSelect')?.addEventListener('change', () => this.saveAIConfig(true));
        document.getElementById('aiLmModelSelect')?.addEventListener('change', () => this.saveAIConfig(true));
        lmUrlInput?.addEventListener('blur', () => this.saveAIConfig(true));
    },

    async saveAIConfig(silent = false) {
        const provider = document.getElementById('aiProviderSelect')?.value;
        const groqApiKey = document.getElementById('aiApiKeyInput')?.value;
        const groqModel = document.getElementById('aiModelSelect')?.value;
        const openrouterApiKey = document.getElementById('aiOpenRouterKeyInput')?.value;
        const openrouterModel = document.getElementById('aiOpenRouterModelSelect')?.value;
        const lmStudioUrl = document.getElementById('aiLmUrlInput')?.value;
        const lmStudioModel = document.getElementById('aiLmModelSelect')?.value;

        await AI_API.updateConfig({
            provider,
            groqApiKey,
            groqModel,
            openrouterApiKey,
            openrouterModel,
            lmStudioUrl,
            lmStudioModel
        });

        if (!silent) {
            showToast('AI configuration saved', 'success');
            hideModal();
        }
        await this.updateAIStatus();
    },

    async updateAIStatus() {
        const indicator = document.getElementById('aiStatusIndicator');
        const nameEl = document.getElementById('aiStatusName');
        if (!indicator || !nameEl) return;

        const health = await AI_SERVICE.checkHealth();
        
        // Update Indicator Class
        indicator.classList.remove('status-ok', 'status-offline', 'status-error', 'status-unconfigured');
        indicator.classList.add(`status-${health.status}`);

        // Update Text
        const providerName = AI_API.provider === 'groq' ? 'Groq' : 
                            (AI_API.provider === 'openrouter' ? 'OpenRouter' : 'LM Studio');
        if (health.status === 'ok') {
            nameEl.textContent = `${providerName}: ${AI_API.currentModelName}`;
        } else {
            nameEl.textContent = health.message;
        }
        
        indicator.title = `Status: ${health.message}`;
    },

    async getEmailTextForAI() {
        try {
            const html = await IMPORT_EXPORT.getCompiledHtml();
            return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                       .replace(/<[^>]+>/g, ' ')
                       .replace(/\s+/g, ' ')
                       .trim();
        } catch {
            return window.editor?.getWrapper()?.get('components')?.map(c => c.get('content') || '').join(' ') || '';
        }
    },

    showGenerateModal() {
        if (!AI_SERVICE.isConfigured()) {
            showToast('Please configure your AI API Key first', 'warning');
            document.getElementById('btnAIConfig')?.click();
            return;
        }

        showModal('Generate Email with AI', `
            <div class="form-group">
                <label>Describe the email you want to create</label>
                <textarea class="form-input" id="aiDescriptionInput" rows="4" 
                          placeholder="e.g.: Holiday newsletter for customers with a 20% discount offer"></textarea>
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
                    document.getElementById('btnSaveTemplate')?.click();
                }
            },
            {
                text: 'Apply to Editor', class: 'btn-primary', id: 'btnApplyAiGenerate', style: 'display:none', action: () => {
                    const mjml = window.lastGeneratedMjml;
                    if (mjml) {
                        try {
                            window.editor.DomComponents.clear();
                            window.editor.setComponents(mjml);
                            showToast('Design applied to editor', 'success');
                            hideModal();
                        } catch (e) {
                            showToast('Error applying design: ' + e.message, 'error');
                        }
                    }
                }
            },
            {
                text: 'Generate', class: 'btn-primary ai-btn', id: 'btnDoGenerate', action: () => this.handleGenerate()
            }
        ]);
    },

    async handleGenerate() {
        const description = document.getElementById('aiDescriptionInput')?.value.trim();
        const style = document.getElementById('aiStyleSelect')?.value;
        const preview = document.getElementById('aiGeneratePreview');
        const btn = document.getElementById('btnDoGenerate');
        const saveBtn = document.getElementById('btnSaveAiResult');
        const applyBtn = document.getElementById('btnApplyAiGenerate');

        if (!description) {
            showToast('Please describe the email you want to create', 'warning');
            return;
        }

        btn?.classList.add('ai-loading');
        btn.textContent = 'Generating...';
        if (preview) {
            preview.style.display = 'flex';
            preview.classList.add('loading');
            preview.innerHTML = '<div class="ai-spinner"></div>';
        }

        try {
            const mjml = await AI_SERVICE.generateEmail(description, style);
            window.lastGeneratedMjml = mjml;

            showToast('Email generated successfully', 'success');

            if (saveBtn) saveBtn.style.display = 'block';
            if (applyBtn) applyBtn.style.display = 'block';
            
            btn.textContent = 'Regenerate';
            btn?.classList.remove('ai-loading');
            
            if (preview) {
                preview.classList.remove('loading');
                preview.innerHTML = '<span style="color: var(--success); font-weight: bold;">Design is ready! Click "Apply to Editor" to use it.</span>';
            }
        } catch (error) {
            if (preview) {
                preview.classList.remove('loading');
                preview.innerHTML = `<span style="color: var(--danger);">Error: ${error.message}</span>`;
            }
            btn?.classList.remove('ai-loading');
            btn.textContent = 'Retry';
        }
    },



    showSpamModal() {
        if (!AI_SERVICE.isConfigured()) {
            showToast('Please configure your AI API Key first', 'warning');
            document.getElementById('btnAIConfig')?.click();
            return;
        }

        showModal('Spam Score Analysis', `
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
                Analyzing your email for spam triggers and deliverability issues...
            </p>
            <div class="ai-preview loading" id="spamAnalysisContainer">
                <div class="ai-spinner"></div>
            </div>
        `, [
            { text: 'Close', class: 'btn-secondary', action: hideModal }
        ]);

        setTimeout(async () => {
            const container = document.getElementById('spamAnalysisContainer');
            try {
                const emailText = await this.getEmailTextForAI();
                const analysis = await AI_SERVICE.analyzeSpam(emailText);

                if (!analysis) throw new Error('Could not parse analysis');

                const scoreColors = { safe: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)' };
                const color = scoreColors[analysis.level] || 'var(--text-secondary)';

                if (container) {
                    container.classList.remove('loading');
                    container.innerHTML = `
                        <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px; padding:12px; background: var(--surface); border-radius:8px;">
                            <div style="font-size:36px; font-weight:700; color:${color};">${analysis.score}/10</div>
                            <div>
                                <div style="font-size:13px; font-weight:600; color:${color}; text-transform:uppercase; letter-spacing:1px;">${analysis.level}</div>
                                <div style="font-size:12px; color: var(--text-secondary); margin-top:4px;">${escapeHtml(analysis.summary)}</div>
                            </div>
                        </div>
                        ${analysis.triggers.length > 0 ? `
                        <div style="font-size:11px; font-weight:600; color: var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Issues Found</div>
                        ${analysis.triggers.map(t => {
                            const sColor = t.severity === 'high' ? 'var(--danger)' : t.severity === 'medium' ? 'var(--warning)' : 'var(--text-muted)';
                            return `
                            <div style="padding:10px; background: var(--surface); border-radius:8px; margin-bottom:8px; border-left: 3px solid ${sColor};">
                                <div style="font-size:12px; font-weight:600; color:${sColor}; margin-bottom:4px;">${t.issue}</div>
                                <div style="font-size:11px; color: var(--text-secondary);">Fix: ${escapeHtml(t.fix)}</div>
                            </div>`;
                        }).join('')}` : `<div style="color: var(--success); font-size:13px;">No spam triggers detected!</div>`
                    }`;
                }
            } catch (err) {
                if (container) {
                    container.classList.remove('loading');
                    container.innerHTML = `<span style="color: var(--danger);">Error: ${err.message}</span>`;
                }
            }
        }, 50);
    },



    showTranslateModal() {
        if (!AI_SERVICE.isConfigured()) {
            showToast('Please configure your AI API Key first', 'warning');
            document.getElementById('btnAIConfig')?.click();
            return;
        }

        const languages = [
            { code: 'English', name: 'English' },
            { code: 'Spanish', name: 'Español' },
            { code: 'French', name: 'Français' },
            { code: 'German', name: 'Deutsch' },
            { code: 'Portuguese', name: 'Português' },
            { code: 'Italian', name: 'Italiano' },
            { code: 'Dutch', name: 'Nederlands' },
            { code: 'Polish', name: 'Polski' },
            { code: 'Chinese', name: '中文' },
            { code: 'Japanese', name: '日本語' },
            { code: 'Korean', name: '한국어' }
        ];

        showModal('Translate Entire Email', `
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
                Translate your entire email to a new language. This will replace the current content.
            </p>
            <div class="form-group">
                <label>Target Language</label>
                <select class="form-input" id="translateLangSelect">
                    ${languages.map(l => `<option value="${l.code}">${l.name}</option>`).join('')}
                </select>
            </div>
            <div class="ai-preview loading" id="translateContainer" style="display:none;"></div>
        `, [
            { text: 'Cancel', class: 'btn-secondary', action: hideModal },
            {
                text: 'Translate', class: 'btn-primary', id: 'btnDoTranslate', action: () => this.handleTranslate()
            }
        ]);
    },

    async handleTranslate() {
        const lang = document.getElementById('translateLangSelect')?.value;
        const container = document.getElementById('translateContainer');
        const btn = document.getElementById('btnDoTranslate');

        if (!lang) return;

        if (container) {
            container.style.display = 'flex';
            container.classList.add('loading');
            container.innerHTML = '<div class="ai-spinner"></div>';
        }
        if (btn) btn.disabled = true;

        try {
            // CRÍTICO: Debemos pasar el código MJML puro (getHtml de GrapesJS en este plugin), 
            // no el getCompiledHtml() porque si el bot devuelve HTML estándar en lugar de MJML, 
            // rompe toda la estructura del editor.
            const mjmlToTranslate = window.editor.getHtml();
            const translatedMjml = await AI_SERVICE.translateEmail(mjmlToTranslate, lang);

            if (translatedMjml && translatedMjml.length > 50) {
                window.editor.setComponents(translatedMjml);
                showToast(`Email traducido al ${lang}`, 'success');
                hideModal();
            } else {
                throw new Error('La respuesta de la IA no parece un correo válido.');
            }
        } catch (err) {
            if (container) {
                container.classList.remove('loading');
                container.innerHTML = `<span style="color: var(--danger);">Error: ${err.message}</span>`;
            }
        } finally {
            if (btn) btn.disabled = false;
        }
    },

    showAltTextModal() {
        if (!AI_SERVICE.isConfigured()) {
            showToast('Please configure your AI API Key first', 'warning');
            document.getElementById('btnAIConfig')?.click();
            return;
        }

        showModal('Generate Alt Texts', `
            <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
                Generate descriptive alt texts for all images in your email for accessibility.
            </p>
            <div class="ai-preview loading" id="altTextContainer">
                <div class="ai-spinner"></div>
            </div>
        `, [
            { text: 'Close', class: 'btn-secondary', action: hideModal }
        ]);

        setTimeout(async () => {
            const container = document.getElementById('altTextContainer');
            try {
                const mjml = await IMPORT_EXPORT.getCompiledHtml();
                const results = await AI_SERVICE.generateAltTexts(mjml);

                if (container) {
                    container.classList.remove('loading');
                    if (results.length === 0) {
                        container.innerHTML = '<span style="color: var(--text-secondary);">No images found or could not generate alt texts.</span>';
                    } else {
                        container.innerHTML = results.map(r => `
                            <div style="padding:8px; border-bottom: 1px solid var(--border);">
                                <div style="font-size:11px; color: var(--text-muted); margin-bottom:4px;">${r.url}</div>
                                <div style="font-size:13px;">${escapeHtml(r.alt)}</div>
                            </div>
                        `).join('');
                    }
                }
            } catch (err) {
                if (container) {
                    container.classList.remove('loading');
                    container.innerHTML = `<span style="color: var(--danger);">Error: ${err.message}</span>`;
                }
            }
        }, 50);
    },

    addChatMessage(role, text) {
        if (!this.chatMessages) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        
        const isUser = role === 'user';
        msgDiv.style.cssText = `
            background: ${isUser ? 'var(--primary-dark)' : 'var(--surface)'};
            color: ${isUser ? 'white' : 'var(--text)'};
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            max-width: 90%;
            align-self: ${isUser ? 'flex-end' : 'flex-start'};
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            line-height: 1.4;
        `;
        
        msgDiv.textContent = text;
        this.chatMessages.appendChild(msgDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return msgDiv;
    },

    async handleChatSend() {
        if (this.isProcessing) return;
        const text = this.chatInput?.value.trim();
        if (!text) return;

        if (!AI_SERVICE.isConfigured()) {
            showToast('Please configure AI first', 'warning');
            return;
        }

        this.isProcessing = true;
        this.chatInput.value = '';
        this.addChatMessage('user', text);
        
        const loadingMsg = this.addChatMessage('ai', 'Pensando...');
        if (loadingMsg) loadingMsg.classList.add('loading');

        try {
            const mjml = await IMPORT_EXPORT.getMjml();
            const resultMjml = await AI_SERVICE.conversationalEdit(text, mjml);
            
            if (loadingMsg) loadingMsg.remove();
            this.addChatMessage('ai', '¡Listo! He aplicado los cambios solicitados al diseño.');
            window.editor.setComponents(resultMjml);
            window.editor.refresh();
            showToast('Cambios aplicados', 'success');
        } catch (err) {
            if (loadingMsg) {
                loadingMsg.innerHTML = `<span style="color: var(--danger);">Error: ${err.message}</span>`;
            }
        } finally {
            this.isProcessing = false;
        }
    }
};

window.AI_HANDLERS = AI_HANDLERS;