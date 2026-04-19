/**
 * OpenRouter AI Provider
 */
const OpenRouterProvider = {
    id: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    referer: 'https://github.com/VisualEmailEditor',
    title: 'Visual Email Editor',
    
    async fetchModels() {
        try {
            const response = await fetch(`${this.baseUrl}/models`);
            if (!response.ok) return [];
            
            const data = await response.json();
            const allModels = data.data || [];
            
            // Filter free models
            return allModels.filter(m => {
                const isFreePrice = m.pricing && 
                                   (parseFloat(m.pricing.prompt) === 0 || m.pricing.prompt === "0") && 
                                   (parseFloat(m.pricing.completion) === 0 || m.pricing.completion === "0");
                const isExplicitFree = m.id && m.id.toLowerCase().includes(':free');
                return isFreePrice || isExplicitFree;
            }).map(m => ({
                id: m.id,
                name: m.name || m.id
            }));
        } catch (e) {
            console.error('[OpenRouter] Fetch models error:', e);
            return [];
        }
    },

    async complete(messages, apiKey, model, options = {}) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': this.referer,
                'X-Title': this.title
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
            console.error('[OpenRouter] API Error Detail:', error);
            
            if (response.status === 429) {
                throw new Error('Límite de velocidad alcanzado. Espera un momento o cambia a un modelo diferente.');
            }
            
            const msg = error.error?.message || `Error OpenRouter (${response.status})`;
            throw new Error(msg);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            if (data.error) throw new Error(data.error.message || 'Error en respuesta');
            throw new Error('Formato de respuesta inesperado de OpenRouter');
        }

        return data.choices[0].message.content;
    },

    async checkHealth(apiKey) {
        if (!apiKey) return { status: 'unconfigured', message: 'No configurado' };
        try {
            const response = await fetch(`${this.baseUrl}/auth/key`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            return response.ok ? { status: 'ok', message: 'OpenRouter Online' } : { status: 'error', message: 'API Key inválida' };
        } catch (e) {
            return { status: 'offline', message: 'Error de conexión' };
        }
    }
};

window.OpenRouterProvider = OpenRouterProvider;
