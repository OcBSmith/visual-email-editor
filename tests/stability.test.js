/**
 * Stability and Logic Tests for Visual Email Editor
 * Verifies critical path logic including "The Great Healer" and "Circuit Breaker"
 */

// Mock global environment
global.window = global;
global.document = {
    getElementById: jest.fn((id) => {
        if (id === 'htmlFileInput') return { addEventListener: jest.fn() };
        return null;
    }),
    createElement: jest.fn(() => ({
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        click: jest.fn(),
        setAttribute: jest.fn()
    }))
};
global.navigator = { clipboard: { writeText: jest.fn() } };
global.URL = { createObjectURL: jest.fn(), revokeObjectURL: jest.fn() };
global.Blob = jest.fn();
global.showToast = jest.fn();
global.showModal = jest.fn();
global.hideModal = jest.fn();

// Load modules
require('../editor/import-export.js');
require('../editor/style-manager.js');

const IMPORT_EXPORT = global.IMPORT_EXPORT;
const STYLE_MANAGER = global.STYLE_MANAGER;

describe('Stability & Logic Tests', () => {

    describe('The Great Healer (IMPORT_EXPORT.healComponent)', () => {
        
        test('removes invalid text-align from mj-text', () => {
            const mockComponent = {
                get: jest.fn(() => 'mj-text'),
                getAttributes: jest.fn(() => ({ 'text-align': 'center', 'color': '#000' })),
                set: jest.fn(),
                getStyle: jest.fn(() => ({})),
                components: jest.fn(() => [])
            };

            IMPORT_EXPORT.healComponent(mockComponent);

            // Should call set with attributes missing text-align
            expect(mockComponent.set).toHaveBeenCalledWith('attributes', { 'color': '#000' });
        });

        test('removes invalid align property from CSS styles (MJML incompatibility)', () => {
             const mockComponent = {
                get: jest.fn(() => 'mj-section'),
                getAttributes: jest.fn(() => ({})),
                set: jest.fn(),
                getStyle: jest.fn(() => ({ 'align': 'center', 'color': '#000' })),
                removeStyle: jest.fn(),
                components: jest.fn(() => [])
            };

            IMPORT_EXPORT.healComponent(mockComponent);

            expect(mockComponent.removeStyle).toHaveBeenCalledWith('align');
        });

        test('recursive healing of child components', () => {
            const childComp = {
                get: jest.fn(() => 'mj-text'),
                getAttributes: jest.fn(() => ({ 'text-align': 'left' })),
                set: jest.fn(),
                getStyle: jest.fn(() => ({})),
                components: jest.fn(() => [])
            };

            const parentComp = {
                get: jest.fn(() => 'mj-section'),
                getAttributes: jest.fn(() => ({})),
                set: jest.fn(),
                getStyle: jest.fn(() => ({})),
                components: jest.fn(() => ({
                    length: 1,
                    forEach: (cb) => cb(childComp)
                }))
            };

            IMPORT_EXPORT.healComponent(parentComp);

            expect(childComp.set).toHaveBeenCalledWith('attributes', {});
        });
    });

    describe('Style Manager Alignment (Circuit Breaker)', () => {
        
        test('applyAlignment skips update if value is already synced (prevents loop)', () => {
            const mockEditor = { getSelected: jest.fn() };
            const mockComponent = {
                get: jest.fn(() => 'mj-text'),
                getAttributes: jest.fn(() => ({ 'align': 'center' })),
                addAttributes: jest.fn()
            };

            // First time - should NOT update because it's already 'center'
            STYLE_MANAGER.applyAlignment(mockEditor, 'center', 'text-align', mockComponent);
            expect(mockComponent.addAttributes).not.toHaveBeenCalled();

            // Change to 'left' - should update
            STYLE_MANAGER.applyAlignment(mockEditor, 'left', 'text-align', mockComponent);
            expect(mockComponent.addAttributes).toHaveBeenCalledWith({ 'align': 'left' });
        });

        test('applyAlignment correctly identifies needsUpdate for mj-section (text-align)', () => {
            const mockEditor = { getSelected: jest.fn() };
            const mockComponent = {
                get: jest.fn(() => 'mj-section'),
                getAttributes: jest.fn(() => ({ 'text-align': 'left' })),
                addAttributes: jest.fn()
            };

            // Should update
            STYLE_MANAGER.applyAlignment(mockEditor, 'center', 'text-align', mockComponent);
            expect(mockComponent.addAttributes).toHaveBeenCalledWith({ 'text-align': 'center' });
        });

        test('isSyncing flag prevents recursion', () => {
             const mockEditor = { getSelected: jest.fn() };
             const mockComponent = {
                get: jest.fn(() => 'mj-text'),
                getAttributes: jest.fn(() => ({ 'align': 'left' })),
                addAttributes: jest.fn()
            };

            STYLE_MANAGER.isSyncing = true;
            STYLE_MANAGER.applyAlignment(mockEditor, 'center', 'text-align', mockComponent);
            expect(mockComponent.addAttributes).not.toHaveBeenCalled();
            STYLE_MANAGER.isSyncing = false;
        });
    });

    describe('Export Robustness', () => {
        test('getCompiledHtml produces valid div wrapper', async () => {
            global.window.editor = {
                getWrapper: jest.fn(() => ({
                    get: () => 'wrapper',
                    getAttributes: () => ({}),
                    getStyle: () => ({}),
                    components: () => []
                })),
                runCommand: jest.fn(() => ({ 
                    html: '<html lang="es"><head><style>p{color:red}</style></head><body><div class="content"><p>Test Content that is long enough to pass the 50 char limit</p></div></body></html>' 
                })),
                getHtml: jest.fn(() => 'fallback')
            };

            const html = await IMPORT_EXPORT.getCompiledHtml();
            expect(html).toContain('<div class="visual-editor-container"');
            expect(html).toContain('Test Content');
            expect(html).toContain('p{color:red}');
        });

        test('fallback replacement works when mjml-code-to-html fails', async () => {
            global.window.editor = {
                getWrapper: jest.fn(() => ({
                    get: () => 'wrapper',
                    getAttributes: () => ({}),
                    getStyle: () => ({}),
                    components: () => []
                })),
                runCommand: jest.fn(() => null), // Fail!
                getHtml: jest.fn(() => '<mj-text>Emergency fallback content here</mj-text>')
            };

            const html = await IMPORT_EXPORT.getCompiledHtml();
            expect(html).toContain('Emergency fallback');
            expect(html).not.toContain('<mj-text>');
        });
    });
});
