/**
 * Style Manager Configuration and Sync Logic
 */
const STYLE_MANAGER = {
    getConfig() {
        return {
            appendTo: '#styles-container',
            sectors: [
                {
                    name: 'Alignment',
                    open: true,
                    properties: [
                        {
                            type: 'radio',
                            name: 'Horizontal Align',
                            property: 'text-align',
                            defaults: 'left',
                            options: [
                                { value: 'left', title: 'Left', className: 'fa fa-align-left' },
                                { value: 'center', title: 'Center', className: 'fa fa-align-center' },
                                { value: 'right', title: 'Right', className: 'fa fa-align-right' }
                            ]
                        },
                        {
                            type: 'select',
                            name: 'Vertical Align',
                            property: 'vertical-align',
                            options: [
                                { value: 'top', name: 'Top' },
                                { value: 'middle', name: 'Middle' },
                                { value: 'bottom', name: 'Bottom' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Dimension',
                    open: false,
                    properties: [
                        { type: 'integer', name: 'width', property: 'width', units: ['px', '%'] },
                        { type: 'integer', name: 'height', property: 'height', units: ['px', '%', 'auto'] },
                        { type: 'integer', name: 'max-width', property: 'max-width', units: ['px', '%'] },
                        { type: 'integer', name: 'padding', property: 'padding', units: ['px', '%'] },
                        { type: 'integer', name: 'margin', property: 'margin', units: ['px', '%'] }
                    ]
                },
                {
                    name: 'Typography',
                    open: false,
                    properties: [
                        { type: 'select', name: 'Font Family', property: 'font-family', options: [
                            { value: "'Segoe UI', Inter, Arial, sans-serif", name: 'System Default' },
                            { value: 'Inter, sans-serif', name: 'Inter' },
                            { value: 'Arial, sans-serif', name: 'Arial' },
                            { value: 'Helvetica, sans-serif', name: 'Helvetica' },
                            { value: 'Times New Roman, serif', name: 'Times' },
                            { value: 'Courier New, monospace', name: 'Courier' }
                        ]},
                        { type: 'integer', name: 'Font Size', property: 'font-size', units: ['px', 'pt', 'em'] },
                        { type: 'integer', name: 'Font Weight', property: 'font-weight', step: 100, min: 100, max: 900 },
                        { type: 'color', name: 'Color', property: 'color' },
                        { type: 'integer', name: 'Line Height', property: 'line-height' },
                        { type: 'integer', name: 'Letter Spacing', property: 'letter-spacing' },
                        {
                            type: 'radio',
                            name: 'Decoration',
                            property: 'text-decoration',
                            defaults: 'none',
                            options: [
                                { value: 'none', title: 'None', className: 'fa fa-times' },
                                { value: 'underline', title: 'Underline', className: 'fa fa-underline' },
                                { value: 'line-through', title: 'Strikethrough', className: 'fa fa-strikethrough' }
                            ]
                        }
                    ]
                },
                {
                    name: 'Decorations',
                    open: false,
                    properties: [
                        { type: 'color', name: 'Bg Color', property: 'background-color' },
                        { type: 'integer', name: 'Border Radius', property: 'border-radius', units: ['px', '%'] },
                        { type: 'select', name: 'Border Style', property: 'border-style', options: [
                            { value: 'none', name: 'None' },
                            { value: 'solid', name: 'Solid' },
                            { value: 'dotted', name: 'Dotted' },
                            { value: 'dashed', name: 'Dashed' },
                            { value: 'double', name: 'Double' }
                        ]},
                        { type: 'integer', name: 'Border Width', property: 'border-width', units: ['px'] },
                        { type: 'color', name: 'Border Color', property: 'border-color' },
                        { type: 'stack', name: 'Shadow', property: 'box-shadow' }
                    ]
                },
                {
                    name: 'Flex',
                    open: false,
                    properties: [
                        { type: 'select', name: 'Display', property: 'display', options: [
                            { value: 'block', name: 'Block' },
                            { value: 'flex', name: 'Flex' },
                            { value: 'inline-block', name: 'Inline Block' }
                        ]},
                        { type: 'select', name: 'Flex Dir', property: 'flex-direction', options: [
                            { value: 'row', name: 'Row' },
                            { value: 'column', name: 'Column' }
                        ]},
                        { type: 'select', name: 'Justify', property: 'justify-content', options: [
                            { value: 'flex-start', name: 'Start' },
                            { value: 'center', name: 'Center' },
                            { value: 'flex-end', name: 'End' },
                            { value: 'space-between', name: 'Between' }
                        ]},
                        { type: 'select', name: 'Align Items', property: 'align-items', options: [
                            { value: 'flex-start', name: 'Start' },
                            { value: 'center', name: 'Center' },
                            { value: 'flex-end', name: 'End' }
                        ]}
                    ]
                }
            ]
        };
    },

    isSyncing: false,

    init(editor) {
        console.log('[Style Manager] Initializing sync listeners...');

        // 1. Sincronizar propiedades de estilo a atributos MJML
        editor.on('style:property:update', (prop) => {
            if (this.isSyncing) return;
            
            // GrapesJS puede devolver un modelo o un objeto plano
            const propertyId = prop.getId ? prop.getId() : (prop.property || prop.id);
            const value = prop.getValue ? prop.getValue() : (prop.value);
            
            if (!propertyId) return;

            const mjmlMap = {
                'text-align': 'align',
                'background-color': 'background-color',
                'color': 'color',
                'font-size': 'font-size',
                'padding': 'padding',
                'width': 'width',
                'height': 'height'
            };

            if (mjmlMap[propertyId]) {
                this.isSyncing = true;
                const attrName = mjmlMap[propertyId];
                this.applyMjmlAttribute(editor, value, attrName);
                this.isSyncing = false;
            }
        });

        // 2. Especial para alineación (que a veces se resiste)
        editor.on('component:update:style', (component) => {
            if (this.isSyncing) return;
            const style = component.getStyle();
            if (style['text-align']) {
                this.isSyncing = true;
                this.applyMjmlAttribute(editor, style['text-align'], 'align', component);
                this.isSyncing = false;
            }
        });
    },

    isSyncing: false,

    applyMjmlAttribute(editor, value, attrName, target = null) {
        if (this.isSyncing || !value) return;
        
        const component = target || editor.getSelected();
        if (!component) return;

        this.isSyncing = true;
        try {
            const type = component.get('type');
            const attrs = component.getAttributes();
            
            // Si el atributo ya es igual, no hacemos nada (evitar bucles)
            if (attrs[attrName] === value) return;

            // Manejo especial para secciones que usan 'text-align' en lugar de 'align'
            let finalAttr = attrName;
            if (attrName === 'align' && type === 'mj-section') {
                finalAttr = 'text-align';
            }

            console.log(`[Style Sync] Sincronizando ${finalAttr}=${value} para ${type}`);
            component.addAttributes({ [finalAttr]: value });
            
            if (window.updateEmailSize) {
                clearTimeout(window._syncSizeTimeout);
                window._syncSizeTimeout = setTimeout(window.updateEmailSize, 300);
            }
        } finally {
            this.isSyncing = false;
        }
    },
};

window.STYLE_MANAGER = STYLE_MANAGER;
