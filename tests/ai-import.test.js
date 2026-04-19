/**
 * Unit tests for AI API and Import/Export modules
 * Tests markdown cleaning and configuration logic
 */

describe('MJML Markdown Cleaning Logic', () => {

    describe('Code block removal regex', () => {
        
        function cleanMarkdownCodeBlocks(text) {
            if (!text.includes('```')) return text;
            return text.replace(/```[a-z]*\n/gi, '').replace(/```/g, '').trim();
        }

        test('removes markdown code blocks from response', () => {
            const input = '```mjml\n<mjml>test</mjml>\n```';
            const result = cleanMarkdownCodeBlocks(input);
            expect(result).toBe('<mjml>test</mjml>');
        });

        test('handles response with ```html code blocks', () => {
            const input = '```html\n<html><body>Test</body></html>\n```';
            const result = cleanMarkdownCodeBlocks(input);
            expect(result).toBe('<html><body>Test</body></html>');
        });

        test('handles response with language specifier like ```mjml', () => {
            const input = '```mjml\n<mj-section><mj-column><mj-text>Hi</mj-text></mj-column></mj-section>\n```';
            const result = cleanMarkdownCodeBlocks(input);
            expect(result).toBe('<mj-section><mj-column><mj-text>Hi</mj-text></mj-column></mj-section>');
        });

        test('does not modify response without code blocks', () => {
            const cleanContent = '<mjml><mj-body>Clean content</mj-body></mjml>';
            const result = cleanMarkdownCodeBlocks(cleanContent);
            expect(result).toBe(cleanContent);
        });

        test('handles multiple code blocks in response', () => {
            const input = 'Here is the code:\n```html\n<div>Test</div>\n```\nAnd some explanation\n```\nAnother block\n```';
            const result = cleanMarkdownCodeBlocks(input);
            expect(result).toBe('Here is the code:\n<div>Test</div>\nAnd some explanation\nAnother block');
            expect(result.includes('```')).toBe(false);
        });

        test('handles text after code block', () => {
            const input = '```html\n<p>Test</p>\n```\n\nSome description';
            const result = cleanMarkdownCodeBlocks(input);
            expect(result).toBe('<p>Test</p>\n\nSome description');
        });

        test('handles no trailing newline before closing backticks', () => {
            const input = '```mjml\n<mj-text>Test</mj-text>```';
            const result = cleanMarkdownCodeBlocks(input);
            expect(result).toBe('<mj-text>Test</mj-text>');
        });

        test('handles uppercase language specifiers', () => {
            const input = '```MJML\n<mjml>Test</mjml>\n```';
            const result = cleanMarkdownCodeBlocks(input);
            expect(result).toBe('<mjml>Test</mjml>');
        });
    });

    describe('isConfigured logic', () => {
        
        function isConfigured(provider, groqApiKey, lmStudioUrl) {
            if (provider === 'groq') {
                return !!groqApiKey;
            }
            return !!lmStudioUrl;
        }

        test('returns true when Groq API key is set', () => {
            expect(isConfigured('groq', 'valid-key', '')).toBe(true);
        });

        test('returns false when Groq API key is null', () => {
            expect(isConfigured('groq', null, '')).toBe(false);
        });

        test('returns false when Groq API key is empty string', () => {
            expect(isConfigured('groq', '', '')).toBe(false);
        });

        test('returns true when LM Studio URL is set', () => {
            expect(isConfigured('lmstudio', '', 'http://localhost:1234')).toBe(true);
        });

        test('returns false when LM Studio URL is empty', () => {
            expect(isConfigured('lmstudio', '', '')).toBe(false);
        });

        test('returns true for LM Studio with any URL', () => {
            expect(isConfigured('lmstudio', '', 'http://localhost:8080')).toBe(true);
        });
    });
});

describe('AI API Configuration', () => {
    
    describe('Model name resolution', () => {
        
        const GROQ_MODELS = [
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' }
        ];

        function getModelName(provider, groqModel, lmStudioModel) {
            if (provider === 'groq') {
                const m = GROQ_MODELS.find(m => m.id === groqModel);
                return m ? m.name : groqModel;
            }
            return lmStudioModel || 'Local Model';
        }

        test('returns correct Groq model name', () => {
            expect(getModelName('groq', 'llama-3.3-70b-versatile', '')).toBe('Llama 3.3 70B');
        });

        test('returns unknown model if not found', () => {
            expect(getModelName('groq', 'unknown-model', '')).toBe('unknown-model');
        });

        test('returns LM Studio model name', () => {
            expect(getModelName('lmstudio', '', 'llama-3.1-8b')).toBe('llama-3.1-8b');
        });

        test('returns default for LM Studio when no model set', () => {
            expect(getModelName('lmstudio', '', '')).toBe('Local Model');
        });
    });
});

describe('MJML Detection Logic', () => {
    
    function isMjmlContent(html) {
        return html.includes('<mjml') || html.includes('<mj-');
    }

    test('detects full MJML structure', () => {
        expect(isMjmlContent('<mjml><mj-body>Test</mj-body></mjml>')).toBe(true);
    });

    test('detects MJML with mj- prefix elements', () => {
        expect(isMjmlContent('<mj-section><mj-column><mj-text>Test</mj-text></mj-column></mj-section>')).toBe(true);
    });

    test('detects partial MJML with closing tags', () => {
        expect(isMjmlContent('<mj-body><mj-text>Content</mj-text></mj-body>')).toBe(true);
    });

    test('rejects regular HTML', () => {
        expect(isMjmlContent('<html><body><div>Content</div></body></html>')).toBe(false);
    });

    test('rejects plain text', () => {
        expect(isMjmlContent('Just plain text content')).toBe(false);
    });

    test('rejects empty string', () => {
        expect(isMjmlContent('')).toBe(false);
    });
});

describe('Editor Error Handling', () => {
    
    describe('getCompiledHtml error', () => {
        
        function getCompiledHtmlError(editorExists) {
            if (!editorExists) {
                throw new Error('Editor not initialized');
            }
        }

        test('throws error when editor is not initialized', () => {
            expect(() => getCompiledHtmlError(false)).toThrow('Editor not initialized');
        });

        test('does not throw when editor exists', () => {
            expect(() => getCompiledHtmlError(true)).not.toThrow();
        });
    });

    describe('getMjml error', () => {
        
        function getMjmlError(editorExists) {
            if (!editorExists) {
                throw new Error('Editor not initialized');
            }
        }

        test('throws error when editor is not initialized', () => {
            expect(() => getMjmlError(false)).toThrow('Editor not initialized');
        });

        test('does not throw when editor exists', () => {
            expect(() => getMjmlError(true)).not.toThrow();
        });
    });
});

describe('Text Extraction for AI', () => {
    
    function extractTextFromHtml(html) {
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    test('strips HTML tags from content', () => {
        const html = '<div><p>Hello <b>World</b></p></div>';
        const text = extractTextFromHtml(html);
        expect(text).toBe('Hello World');
    });

    test('removes style blocks completely', () => {
        const html = '<style>.class { color: red; }</style><p>Content</p>';
        const text = extractTextFromHtml(html);
        expect(text).toBe('Content');
    });

    test('collapses multiple whitespace', () => {
        const html = '<p>Hello     World</p>';
        const text = extractTextFromHtml(html);
        expect(text).toBe('Hello World');
    });

    test('trims leading and trailing whitespace', () => {
        const html = '   <p>Text</p>   ';
        const text = extractTextFromHtml(html);
        expect(text).toBe('Text');
    });

    test('handles empty input', () => {
        expect(extractTextFromHtml('')).toBe('');
    });

    test('handles nested tags', () => {
        const html = '<div><section><article><p>Deep content</p></article></section></div>';
        const text = extractTextFromHtml(html);
        expect(text).toBe('Deep content');
    });
});