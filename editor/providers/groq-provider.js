/**
 * Groq AI Provider
 */
const GroqProvider = {
    id: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    
    async fetchModels(apiKey) {
        if (!apiKey) return [];
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return (data.data || []).map(m => ({ id: m.id, name: m.id }));
        } catch (e) {
            console.error('[Groq] Fetch models error:', e);
            return [];
        }
    },

    async complete(messages, apiKey, model, options = {}) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2048
            }),
            signal: options.signal
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('[Groq] API Error Detail:', error);
            const msg = error.error?.message || `Error Groq (${response.status})`;
            throw new Error(msg);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    async checkHealth(apiKey) {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            return response.ok ? { status: 'ok', message: 'Groq Online' } : { status: 'error', message: 'API Key inválida' };
        } catch (e) {
            return { status: 'offline', message: 'Error de conexión' };
        }
    }
};

window.GroqProvider = GroqProvider;
