/**
 * AI API Layer - Orchestrator
 * This module manages configuration and delegates requests to specific providers.
 */
// Visual Email Editor - AI Orchestrator (Orquestador de Proveedores)
// Consolidates logic for Groq, OpenRouter, and LM Studio

const MJML_KNOWLEDGE = `
MJML EXPERT RULES:
1. HIERARCHY: <mjml> -> <mj-head> -> <mj-body> -> <mj-section> -> <mj-column> -> [Components].
2. SECTIONS: Never nest <mj-section> inside another <mj-section>. Use <mj-wrapper> if nesting is needed.
3. COLUMNS: Content components (mj-text, mj-image, etc.) MUST be inside <mj-column>. Never directly in <mj-section>.
4. STYLING:
   - Use <mj-attributes> in <mj-head> for global styles.
   - For GRADIENTS or complex CSS, use <mj-style inline="inline"> inside <mj-head> and apply classes.
   - All text must be inside <mj-text>. Do not use <div> or <p> directly in mj-column.
5. RESPONSIVENESS: MJML handles this automatically. Use <mj-group> to prevent columns from stacking on mobile.
6. IMAGES: Always include alt text and a base width.
`;

const AI_API = {
    PROVIDERS: {
        GROQ: 'groq',
        OPENROUTER: 'openrouter',
        LM_STUDIO: 'lmstudio'
    },

    // Default Static Models (Fallbacks)
    GROQ_MODELS: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' }
    ],

    OPENROUTER_FREE_MODELS: [
        { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Gemini 2.0 Flash Lite (Free)' },
        { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro Exp (Free)' },
        { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
        { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)' }
    ],

    // State
    provider: 'lmstudio',
    groqApiKey: '',
    groqModel: 'llama-3.3-70b-versatile',
    openrouterApiKey: '',
    openrouterModel: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    lmStudioUrl: 'http://localhost:1234',
    lmStudioModel: 'local-model',
    
    LM_STUDIO_MODELS: [],
    detectedOpenRouterModels: [],

    mjmlRef: null,

    async init() {
        console.log('[AI API] Orchestrator loading...');
        await this.loadMjmlReference();
        
        try {
            const saved = await browser.storage.local.get([
                'aiProvider', 'groqApiKey', 'groqModel', 
                'openrouterApiKey', 'openrouterModel',
                'lmStudioUrl', 'lmStudioModel'
            ]);
            
            if (saved.aiProvider) this.provider = saved.aiProvider;
            if (saved.groqApiKey) this.groqApiKey = saved.groqApiKey;
            if (saved.groqModel) this.groqModel = saved.groqModel;
            if (saved.openrouterApiKey) this.openrouterApiKey = saved.openrouterApiKey;
            if (saved.openrouterModel) this.openrouterModel = saved.openrouterModel;
            if (saved.lmStudioUrl) this.lmStudioUrl = saved.lmStudioUrl;
            if (saved.lmStudioModel) this.lmStudioModel = saved.lmStudioModel;
            
            // Initial model fetch
            this.fetchModels().catch(() => {});
        } catch (e) {
            console.error('[AI API] Init error:', e);
        }
    },

    get activeProvider() {
        if (this.provider === this.PROVIDERS.GROQ) return GroqProvider;
        if (this.provider === this.PROVIDERS.OPENROUTER) return OpenRouterProvider;
        return LMStudioProvider;
    },

    get currentModel() {
        if (this.provider === this.PROVIDERS.GROQ) return this.groqModel;
        if (this.provider === this.PROVIDERS.OPENROUTER) return this.openrouterModel;
        return this.lmStudioModel;
    },

    get currentModelName() {
        const modelId = this.currentModel;
        return modelId.split('/').pop(); // Simple name
    },

    isConfigured() {
        if (this.provider === this.PROVIDERS.GROQ) return !!this.groqApiKey;
        if (this.provider === this.PROVIDERS.OPENROUTER) return !!this.openrouterApiKey;
        return !!this.lmStudioUrl;
    },

    async updateConfig(config) {
        Object.assign(this, config);
        await browser.storage.local.set({
            aiProvider: this.provider,
            groqApiKey: this.groqApiKey,
            groqModel: this.groqModel,
            openrouterApiKey: this.openrouterApiKey,
            openrouterModel: this.openrouterModel,
            lmStudioUrl: this.lmStudioUrl,
            lmStudioModel: this.lmStudioModel
        });
        await this.fetchModels();
    },

    async fetchModels() {
        if (this.provider === this.PROVIDERS.GROQ) {
            const models = await GroqProvider.fetchModels(this.groqApiKey);
            return models.length > 0 ? models : this.GROQ_MODELS;
        } else if (this.provider === this.PROVIDERS.OPENROUTER) {
            const models = await OpenRouterProvider.fetchModels();
            this.detectedOpenRouterModels = models;
            return models.length > 0 ? models : this.OPENROUTER_FREE_MODELS;
        } else {
            const models = await LMStudioProvider.fetchModels(this.lmStudioUrl);
            this.LM_STUDIO_MODELS = models;
            return models;
        }
    },

    async complete(messages, options = {}) {
        const provider = this.activeProvider;
        const config = this.provider === 'lmstudio' ? this.lmStudioUrl : 
                      (this.provider === 'groq' ? this.groqApiKey : this.openrouterApiKey);
        
        return provider.complete(messages, config, this.currentModel, options);
    },

    async checkHealth() {
        const provider = this.activeProvider;
        const config = this.provider === 'lmstudio' ? this.lmStudioUrl : 
                      (this.provider === 'groq' ? this.groqApiKey : this.openrouterApiKey);
        return provider.checkHealth(config);
    },

    // --- High Level Features ---

    async generateEmail(prompt, style = 'professional') {
        const ref = this.mjmlRef ? `MJML DOCUMENTATION REFERENCE:\n${JSON.stringify(this.mjmlRef)}\n` : MJML_KNOWLEDGE;
        return this.complete([
            { 
                role: "system", 
                content: `You are a Master MJML Designer. 
                ${ref}
                Task: Create a full email template in MJML based on the user description.
                Style: ${style}.
                Return ONLY valid MJML code. No explanations, no markdown.` 
            },
            { role: "user", content: prompt }
        ]);
    },

    async improveText(text, prompt = '') {
        return this.complete([
            { role: "system", content: "You are a professional copywriter. Improve the given text. Output ONLY the improved text." },
            { role: "user", content: `Original: "${text}"\nInstruction: ${prompt || 'Improve it.'}` }
        ]);
    },

    async generateSubjectLines(text) {
        const res = await this.complete([
            { role: "system", content: "Suggest 5 subject lines." },
            { role: "user", content: `Email: ${text}` }
        ]);
        return res.split('\n').filter(l => l.trim().length > 5).slice(0, 5);
    },

    async checkSpamTriggers(text) {
        const res = await this.complete([
            { role: "system", content: "Analyze for spam. Output JSON: [{\"trigger\": \"...\", \"why\": \"...\", \"fix\": \"...\"}]" },
            { role: "user", content: `Content: ${text}` }
        ]);
        try { return JSON.parse(res.substring(res.indexOf('['), res.lastIndexOf(']') + 1)); }
        catch { return []; }
    },

    async generatePreheader(text, subject = '') {
        return this.complete([
            { role: "system", content: "Write a short preheader (max 100 chars)." },
            { role: "user", content: `Subject: ${subject}\nContent: ${text}` }
        ], { maxTokens: 100 });
    },

    async conversationalEdit(prompt, currentMjml) {
        const ref = this.mjmlRef ? `MJML DOCUMENTATION REFERENCE:\n${JSON.stringify(this.mjmlRef)}\n` : MJML_KNOWLEDGE;
        let res = await this.complete([
            { 
                role: "system", 
                content: `You are a Master MJML Designer.
                ${ref}
                Your task is to modify the provided MJML code according to the user's instructions.
                
                Rules:
                1. Return the COMPLETE modified MJML code.
                2. Maintain the existing structure unless asked to change it.
                3. Respond ONLY with the MJML code. No explanations, no markdown blocks.` 
            },
            { role: "user", content: `CURRENT MJML:\n${currentMjml}\n\nUSER REQUEST: ${prompt}` }
        ]);

        // Clean markdown blocks if present
        if (res.includes('```')) {
            res = res.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '');
        }
        return res.trim();
    },

    async processTextAction(text, action) {
        return this.complete([
            { 
                role: 'system', 
                content: `You are an expert email copywriter and editor. \nTask: ${action} the following text. \nRules:\n- If needed, you MAY use inline HTML tags like <span style="..."> for styling.\n- Keep the same language as the original.\n- Respond ONLY with the processed text/HTML.\n- NO conversational filler, NO explanations.` 
            },
            { role: 'user', content: text }
        ]);
    },

    async shortenText(text) {
        return this.processTextAction(text, 'shorten and summarize');
    },

    async translateText(text, targetLanguage) {
        return this.processTextAction(text, `translate to ${targetLanguage}`);
    },

    async rewriteText(text, tone) {
        return this.processTextAction(text, `rewrite with a ${tone} tone`);
    },

    async generateAltTexts(mjml) {
        const res = await this.complete([
            { role: "system", content: "Analyze images in MJML. Return JSON: [{\"url\": \"...\", \"alt\": \"...\"}]" },
            { role: "user", content: mjml }
        ]);
        try { return JSON.parse(res.substring(res.indexOf('['), res.lastIndexOf(']') + 1)); }
        catch { return []; }
    },

    async loadMjmlReference() {
        try {
            // Fetch the JSON reference file
            const response = await fetch('data/mjml-reference.json');
            this.mjmlRef = await response.json();
            console.log('[AI API] MJML Knowledge Base loaded successfully');
        } catch (error) {
            console.error('[AI API] Error loading MJML reference:', error);
            // Fallback is already handled by checking this.mjmlRef in prompts
        }
    }
};

window.AI_API = AI_API;
window.AI_SERVICE = AI_API;