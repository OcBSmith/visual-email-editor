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
                        { type: 'integer', name: 'Letter Spacing', property: 'letter-spacing' }
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
                        { type: 'color', name: 'Border Color', property: 'border-color' }
                    ]
                }
            ]
        };
    },

    init(editor) {
        console.log('[Style Manager] Initializing sync listeners...');

        // 1. Sincronizar estilo CSS (text-align) al atributo MJML (align)
        editor.on('style:property:update', (prop) => {
            const propertyId = prop.get('property');
            if (propertyId === 'text-align') {
                this.applyAlignment(editor, prop.get('value'), propertyId);
            }
        });

        // 2. Fallback: Atrapar cualquier cambio de estilo
        editor.on('component:update:style', (component) => {
            const style = component.getStyle();
            if (style['text-align']) {
                const alignVal = style['text-align'];
                if (alignVal) {
                    this.applyAlignment(editor, alignVal, 'text-align', component);
                }
            }
        });
    },

    isSyncing: false,

    applyAlignment(editor, value, propertyId, target = null) {
        if (this.isSyncing) return;
        if (!value) return;
        
        const component = target || editor.getSelected();
        if (!component) return;

        this.isSyncing = true;
        try {
            const type = component.get('type');
            const attrs = component.getAttributes();
            
            // === CORTACIRCUITOS PRINCIPAL ===
            // Si el componente ya tiene la alineación correcta en su estructura (MJML),
            // no hacemos NADA para evitar cascadas de eventos.
            let needsUpdate = false;
            
            if (type === 'mj-text' || type === 'mj-button' || type === 'mj-image') {
                if (attrs['align'] !== value) needsUpdate = true;
            } else if (type === 'mj-section') {
                if (attrs['text-align'] !== value) needsUpdate = true;
            } else {
                if (attrs['align'] !== value) needsUpdate = true;
            }

            if (!needsUpdate) return; // Romper el ciclo de ejecución

            console.log(`[ALINEACIÓN V6] Aplicando ${value} a ${component.get('type')}`);

            // 1. Forzar Atributo MJML (Mandatorio)
            if (type === 'mj-text' || type === 'mj-button' || type === 'mj-image') {
                component.addAttributes({ 'align': value });
            } else if (type === 'mj-section') {
                component.addAttributes({ 'text-align': value });
            } else {
                component.addAttributes({ 'align': value });
            }

            // ATENCIÓN: SIN RENDER MANUAL PARA EVITAR BUCLES! GrapesJS se actualiza solo.
            
            if (window.updateEmailSize) {
                // Debounced para no sobrecargar
                clearTimeout(window._alignSizeTimeout);
                window._alignSizeTimeout = setTimeout(window.updateEmailSize, 500);
            }
        } finally {
            this.isSyncing = false;
        }
    }
};

window.STYLE_MANAGER = STYLE_MANAGER;
