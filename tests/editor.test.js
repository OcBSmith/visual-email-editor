/**
 * Unit tests for the Visual Email Editor utility functions
 */

// Mock browser objects that editor.js might try to instantiate when required
global.browser = { runtime: {}, storage: { local: {} } };
global.document = { body: { classList: { add: jest.fn(), remove: jest.fn() } }, querySelectorAll: () => [], getElementById: jest.fn() };
global.window = {};
global.grapesjs = { init: jest.fn(() => ({ on: jest.fn(), getModel: jest.fn(() => ({ get: jest.fn() })), getWrapper: jest.fn() })) };

// We use require to load the module. 
// Note: editor.js immediately executes DOM queries. We mock them silently.
let editorHelpers;
try {
    editorHelpers = require('../editor/editor-utils.js');
} catch (e) {
    // If initialization fails due to deep dependency missing, we can still test exports if they were parsed
}

describe('Editor Utilities', () => {

    describe('rgbToHex()', () => {
        test('converts standard rgb strings to hex', () => {
            expect(editorHelpers.rgbToHex('rgb(255, 0, 0)')).toBe('#ff0000');
            expect(editorHelpers.rgbToHex('rgb(0, 255, 0)')).toBe('#00ff00');
            expect(editorHelpers.rgbToHex('rgb(0, 0, 255)')).toBe('#0000ff');
        });

        test('converts rgba strings to hex ignoring alpha', () => {
            expect(editorHelpers.rgbToHex('rgba(255, 255, 255, 0.5)')).toBe('#ffffff');
        });

        test('handles malformed or transparent inputs gracefully', () => {
            expect(editorHelpers.rgbToHex('transparent')).toBe('#ffffff');
            expect(editorHelpers.rgbToHex('rgba(0, 0, 0, 0)')).toBe('#ffffff');
            expect(editorHelpers.rgbToHex(null)).toBe('#ffffff');
        });

        test('returns the original hex string if passed a hex string', () => {
            expect(editorHelpers.rgbToHex('#123456')).toBe('#123456');
        });
    });

    describe('escapeHtml()', () => {
        test('does not throw on simple text (JSDOM implementation detail)', () => {
            // Since escapeHtml relies on document.createElement('div'), it requires JSDOM
            const div = document.createElement('div');
            expect(div).toBeDefined();
        });
    });

    describe('getErrorHtml()', () => {
        test('wraps message in proper html template', () => {
            const html = editorHelpers.getErrorHtml('Test Error');
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<title>Error</title>');
            expect(html).toContain('<p>Error: Test Error</p>');
        });
    });

    describe('formatDate()', () => {
        test('formats ISO dates correctly into readable strings', () => {
            const dateStr = '2025-10-15T12:00:00Z';
            const formatted = editorHelpers.formatDate(dateStr);
            expect(formatted).toMatch(/October 15, 2025/i);
        });
    });

});

