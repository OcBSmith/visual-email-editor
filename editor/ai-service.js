// Visual Email Editor - AI Service (Groq Integration)

const AI_SERVICE = {
    API_URL: 'https://api.groq.com/openai/v1/chat/completions',

    // Available free models on Groq
    AVAILABLE_MODELS: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Recommended)', description: 'Best quality, slower' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Fast, good quality' },
        { id: 'llama3-70b-8192', name: 'Llama 3 70B', description: 'High quality' },
        { id: 'llama3-8b-8192', name: 'Llama 3 8B', description: 'Balanced' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Long context' },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google, compact' }
    ],

    currentModel: 'llama-3.3-70b-versatile',
    apiKey: null,

    // Initialize - load API key and model from storage
    async init() {
        try {
            const stored = await browser.storage.local.get(['groqApiKey', 'groqModel']);
            this.apiKey = stored.groqApiKey || null;
            this.currentModel = stored.groqModel || 'llama-3.3-70b-versatile';
            console.log('AI Service initialized, API key:', this.apiKey ? 'configured' : 'not set');
            console.log('AI Model:', this.currentModel);
        } catch (e) {
            console.log('AI Service: Could not load settings from storage');
        }
    },

    // Save API key
    async setApiKey(key) {
        this.apiKey = key;
        await browser.storage.local.set({ groqApiKey: key });
        console.log('AI Service: API key saved');
    },

    // Save model preference
    async setModel(modelId) {
        this.currentModel = modelId;
        await browser.storage.local.set({ groqModel: modelId });
        console.log('AI Service: Model set to', modelId);
    },

    // Get current model info
    getModelInfo() {
        return this.AVAILABLE_MODELS.find(m => m.id === this.currentModel) || this.AVAILABLE_MODELS[0];
    },

    // Check if API key is configured
    isConfigured() {
        return !!this.apiKey;
    },

    // Main chat completion function
    async complete(messages, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        const model = options.model || this.currentModel;
        console.log('Using model:', model);

        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2048
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    // ===== TEXT EDITING ACTIONS =====

    async improveText(text) {
        return this.complete([
            { role: 'system', content: 'You are an expert email copywriter. Improve the provided text making it more professional, clear, and persuasive. Keep the same language. Respond ONLY with the improved text, no explanations.' },
            { role: 'user', content: text }
        ]);
    },

    async shortenText(text) {
        return this.complete([
            { role: 'system', content: 'You are an expert email copywriter. Shorten the provided text while keeping the main message. Make it concise and direct. Keep the same language. Respond ONLY with the shortened text, no explanations.' },
            { role: 'user', content: text }
        ]);
    },

    async expandText(text) {
        return this.complete([
            { role: 'system', content: 'You are an expert email copywriter. Expand the provided text by adding more details, examples, or relevant context. Keep the same language and tone. Respond ONLY with the expanded text, no explanations.' },
            { role: 'user', content: text }
        ]);
    },

    async translateText(text, targetLanguage) {
        return this.complete([
            { role: 'system', content: `You are a professional translator. Translate the text to ${targetLanguage}. Keep the original tone and style. Respond ONLY with the translation, no explanations.` },
            { role: 'user', content: text }
        ]);
    },

    async rewriteText(text, tone) {
        const tones = {
            formal: 'formal and professional',
            casual: 'casual and friendly',
            promotional: 'promotional and persuasive',
            urgent: 'urgent and eye-catching'
        };
        return this.complete([
            { role: 'system', content: `You are an expert email copywriter. Rewrite the text with a ${tones[tone] || tone} tone. Keep the same language. Respond ONLY with the rewritten text, no explanations.` },
            { role: 'user', content: text }
        ]);
    },

    async customPrompt(text, instruction) {
        return this.complete([
            { role: 'system', content: 'You are an email copywriting assistant. Follow the user instructions exactly. Respond ONLY with the result, no additional explanations.' },
            { role: 'user', content: `Original text:\n${text}\n\nInstruction:\n${instruction}` }
        ]);
    },

    // ===== EMAIL GENERATION =====

    async generateEmail(description, style = 'professional') {
        const styles = {
            professional: 'professional and corporate',
            casual: 'casual and friendly',
            promotional: 'promotional with clear calls to action',
            newsletter: 'informative newsletter style'
        };

        return this.complete([
            {
                role: 'system',
                content: `You are an expert email designer. Generate complete and functional MJML code based on the user's description.

The style should be: ${styles[style] || style}

RULES:
1. Respond ONLY with the MJML code, no explanations
2. Always include: mj-head with styles, mj-body, mj-section, mj-column
3. Use modern and attractive colors
4. Include mj-button for calls to action
5. The code must be complete and valid
6. Use English for the content unless otherwise specified
7. Include placeholders for images using https://via.placeholder.com

Example structure:
<mjml>
  <mj-head>
    <mj-attributes>...</mj-attributes>
  </mj-head>
  <mj-body>
    <mj-section>...</mj-section>
  </mj-body>
</mjml>`
            },
            { role: 'user', content: `Generate an email: ${description}` }
        ], { maxTokens: 4096, temperature: 0.8 });
    }
};

// Export for use in editor
window.AI_SERVICE = AI_SERVICE;
