/**
 * LM Studio (Local) AI Provider
 */
const LMStudioProvider = {
    id: 'lmstudio',
    
    normalizeUrl(baseUrl) {
        if (!baseUrl) return '';
        // Remove trailing slashes and any completions path if added by user
        let url = baseUrl.replace(/\/+$/, '').split('/chat/completions')[0].split('/completions')[0];
        // Ensure /v1 if missing
        if (!url.includes('/v1') && !url.includes(':')) { // simple check
             // assuming default structure if no path provided
        }
        return url;
    },

    async fetchModels(rawUrl) {
        if (!rawUrl) return [];
        const baseUrl = this.normalizeUrl(rawUrl);
        const url = baseUrl.endsWith('/v1') ? `${baseUrl}/models` : `${baseUrl}/v1/models`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const models = data.data || [];
                return models.map(m => ({ id: m.id, name: m.id }));
            }
            return [];
        } catch (e) {
            console.warn('[LM Studio] Offline or wrong URL');
            return [];
        }
    },

    async complete(messages, rawUrl, model, options = {}) {
        const baseUrl = this.normalizeUrl(rawUrl);
        // Correct endpoint for chat completions
        const url = baseUrl.endsWith('/v1') ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'local-model',
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2048
            }),
            signal: options.signal
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error local (${response.status}): ${errorText.substring(0, 50)}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    async checkHealth(rawUrl) {
        if (!rawUrl) return { status: 'unconfigured', message: 'No configurado' };
        const baseUrl = this.normalizeUrl(rawUrl);
        const url = baseUrl.endsWith('/v1') ? `${baseUrl}/models` : `${baseUrl}/v1/models`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            return response.ok ? { status: 'ok', message: 'LM Studio Online' } : { status: 'error', message: 'Error de servidor local' };
        } catch (e) {
            return { status: 'offline', message: 'LM Studio no detectado' };
        }
    }
};

window.LMStudioProvider = LMStudioProvider;
