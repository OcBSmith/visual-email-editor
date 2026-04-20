const CUSTOM_BLOCKS = {
    init(editor) {
        const bm = editor.BlockManager;

        // Header / Cabecera
        bm.add('header-logo', {
            label: 'Cabecera + Logo',
            category: 'Composiciones',
            content: `
            <mj-section background-color="#ffffff" padding="20px 0">
                <mj-column>
                    <mj-image width="150px" src="https://via.placeholder.com/300x100/ffffff/333333?text=TU+LOGO" alt="Logo de la empresa"></mj-image>
                    <mj-divider border-color="#e2e8f0" border-width="1px" padding-top="20px"></mj-divider>
                </mj-column>
            </mj-section>
            `,
            attributes: { class: 'fa fa-header' }
        });

        // Hero CTA
        bm.add('hero-cta', {
            label: 'Hero + Botón',
            category: 'Composiciones',
            content: `
            <mj-section background-color="#f8fafc" padding="40px 20px">
              <mj-column>
                <mj-text align="center" font-size="28px" font-weight="bold" color="#1e293b">
                  Título Principal Destacado
                </mj-text>
                <mj-text align="center" font-size="16px" color="#475569" line-height="1.5">
                  Una breve descripción que atraiga la atención del lector y explique el valor de la oferta o contenido presentado de forma directa.
                </mj-text>
                <mj-button background-color="#0ea5e9" color="white" border-radius="6px" href="#" padding-top="20px">
                  Llamada a la Acción
                </mj-button>
              </mj-column>
            </mj-section>
            `,
            attributes: { class: 'fa fa-bullhorn' }
        });

        // Articulo Img Izquierda
        bm.add('article-left-img', {
            label: 'Artículo (Img Izq)',
            category: 'Composiciones',
            content: `
            <mj-section padding="20px" background-color="#ffffff">
                <mj-column width="40%">
                    <mj-image src="https://via.placeholder.com/300x200/e2e8f0/94a3b8?text=Imagen" alt="Articulo" border-radius="8px"></mj-image>
                </mj-column>
                <mj-column width="60%">
                    <mj-text font-size="20px" font-weight="bold" color="#1e293b" padding-bottom="10px">Título del Artículo</mj-text>
                    <mj-text font-size="15px" color="#64748b" line-height="1.5">Descripción breve del contenido del artículo. Aquí puedes explicar los puntos clave y mantener al usuario interesado.</mj-text>
                    <mj-button align="left" background-color="transparent" color="#0ea5e9" border="1px solid #0ea5e9" border-radius="4px" font-size="14px">Leer más</mj-button>
                </mj-column>
            </mj-section>
            `,
            attributes: { class: 'fa fa-list-alt' }
        });

        // E-Commerce Producto
        bm.add('ecommerce-product', {
            label: 'Ficha Producto',
            category: 'E-Commerce',
            content: `
            <mj-section padding="20px">
                <mj-column background-color="#ffffff" border="1px solid #e2e8f0" border-radius="8px" padding="0">
                    <mj-image src="https://via.placeholder.com/400x300/f1f5f9/64748b?text=Producto" padding="0"></mj-image>
                    <mj-text align="center" font-size="18px" font-weight="600" padding-top="20px" color="#334155">Zapatillas Deportivas</mj-text>
                    <mj-text align="center" font-size="24px" font-weight="bold" color="#10b981" padding-top="5px">99.99 €</mj-text>
                    <mj-text align="center" font-size="14px" color="#94a3b8" padding-top="0px">Envío gratis incl.</mj-text>
                    <mj-button background-color="#10b981" color="white" width="80%" margin-bottom="20px">Añadir al Carrito</mj-button>
                </mj-column>
            </mj-section>
            `,
            attributes: { class: 'fa fa-shopping-bag' }
        });
        
        // 3 Columnas Características
        bm.add('features-3col', {
            label: '3 Características',
            category: 'Composiciones',
            content: `
            <mj-section background-color="#ffffff" padding="30px 10px">
                <mj-column>
                    <mj-image width="60px" src="https://via.placeholder.com/120/eff6ff/3b82f6?text=1" border-radius="30px"></mj-image>
                    <mj-text align="center" font-size="16px" font-weight="bold" padding-bottom="5px">Fácil</mj-text>
                    <mj-text align="center" font-size="14px" color="#64748b" line-height="1.5">Muy sencillo de utilizar en el día a día.</mj-text>
                </mj-column>
                <mj-column>
                    <mj-image width="60px" src="https://via.placeholder.com/120/eff6ff/3b82f6?text=2" border-radius="30px"></mj-image>
                    <mj-text align="center" font-size="16px" font-weight="bold" padding-bottom="5px">Rápido</mj-text>
                    <mj-text align="center" font-size="14px" color="#64748b" line-height="1.5">Implementación veloz sin esperas.</mj-text>
                </mj-column>
                <mj-column>
                    <mj-image width="60px" src="https://via.placeholder.com/120/eff6ff/3b82f6?text=3" border-radius="30px"></mj-image>
                    <mj-text align="center" font-size="16px" font-weight="bold" padding-bottom="5px">Seguro</mj-text>
                    <mj-text align="center" font-size="14px" color="#64748b" line-height="1.5">Máxima protección y estándares altos.</mj-text>
                </mj-column>
            </mj-section>
            `,
            attributes: { class: 'fa fa-columns' }
        });

        // Banner Promocional
        bm.add('promo-code', {
            label: 'Cupón Descuento',
            category: 'E-Commerce',
            content: `
            <mj-section background-color="#fef2f2" padding="30px 20px">
                <mj-column border="2px dashed #ef4444" padding="20px">
                    <mj-text align="center" color="#b91c1c" font-size="24px" font-weight="bold" text-transform="uppercase">20% de Descuento</mj-text>
                    <mj-text align="center" color="#ef4444" font-size="16px">Utiliza el código en tu próxima compra:</mj-text>
                    <mj-button background-color="white" color="#ef4444" border="2px solid #ef4444" font-size="22px" font-weight="bold" border-radius="8px">OFERTA20</mj-button>
                    <mj-text align="center" color="#f87171" font-size="12px" padding-top="15px">Válido hasta el próximo viernes. Aplican términos.</mj-text>
                </mj-column>
            </mj-section>
            `,
            attributes: { class: 'fa fa-ticket' }
        });

        // Footer Corporativo
        bm.add('footer-classic', {
            label: 'Footer Legal/Social',
            category: 'Plantillas',
            content: `
            <mj-section background-color="#1e293b" padding="40px 20px">
                <mj-column>
                    <mj-text align="center" color="#cbd5e1" font-size="16px" font-weight="bold" padding-bottom="15px">
                        Nuestra Compañía
                    </mj-text>
                    <mj-social font-size="15px" icon-size="30px" mode="horizontal" padding-bottom="20px">
                        <mj-social-element name="facebook" href="#" background-color="#3b5998"></mj-social-element>
                        <mj-social-element name="twitter" href="#" background-color="#1da1f2"></mj-social-element>
                        <mj-social-element name="instagram" href="#" background-color="#e1306c"></mj-social-element>
                        <mj-social-element name="linkedin" href="#" background-color="#0077b5"></mj-social-element>
                    </mj-social>
                    <mj-divider border-color="#334155" border-width="1px" padding-bottom="20px"></mj-divider>
                    <mj-text align="center" color="#94a3b8" font-size="12px" line-height="1.5">
                        Has recibido este email porque estás suscrito a nuestra lista de correo.<br/>
                        Enviado desde Calle Principal 123, Ciudad, País.
                    </mj-text>
                    <mj-text align="center" color="#94a3b8" font-size="12px" padding-top="10px">
                        <a href="#" style="color:#38bdf8; text-decoration:none;">Darse de baja</a> | 
                        <a href="#" style="color:#38bdf8; text-decoration:none;">Términos Legales</a>
                    </mj-text>
                </mj-column>
            </mj-section>
            `,
            attributes: { class: 'fa fa-info-circle' }
        });

        // --- BLOQUES BÁSICOS MJML ---

        // Acordeón
        bm.add('mj-accordion', {
            label: 'Acordeón',
            category: 'Básico',
            content: `
            <mj-accordion>
                <mj-accordion-element>
                    <mj-accordion-title>Título de la pregunta</mj-accordion-title>
                    <mj-accordion-text>Esta es la respuesta detallada que el usuario puede leer al desplegar el acordeón en clientes de correo compatibles.</mj-accordion-text>
                </mj-accordion-element>
            </mj-accordion>
            `,
            attributes: { class: 'fa fa-list-ul' }
        });

        // Navbar / Menú
        bm.add('mj-navbar', {
            label: 'Menú Navbar',
            category: 'Básico',
            content: `
            <mj-navbar>
                <mj-navbar-link href="#">Inicio</mj-navbar-link>
                <mj-navbar-link href="#">Blog</mj-navbar-link>
                <mj-navbar-link href="#">Tienda</mj-navbar-link>
                <mj-navbar-link href="#">Contacto</mj-navbar-link>
            </mj-navbar>
            `,
            attributes: { class: 'fa fa-bars' }
        });

        // Redes Sociales
        bm.add('mj-social', {
            label: 'Redes Sociales',
            category: 'Básico',
            content: `
            <mj-social>
                <mj-social-element name="facebook"></mj-social-element>
                <mj-social-element name="twitter"></mj-social-element>
                <mj-social-element name="linkedin"></mj-social-element>
            </mj-social>
            `,
            attributes: { class: 'fa fa-share-alt' }
        });

        // Espaciador
        bm.add('mj-spacer', {
            label: 'Espaciador',
            category: 'Básico',
            content: '<mj-spacer height="20px" />',
            attributes: { class: 'fa fa-arrows-v' }
        });

        // Divisor
        bm.add('mj-divider', {
            label: 'Divisor',
            category: 'Básico',
            content: '<mj-divider border-width="1px" border-style="solid" border-color="lightgrey" />',
            attributes: { class: 'fa fa-minus' }
        });

        console.log('[Custom Blocks] Registrados correctamente');
    }
};

window.CUSTOM_BLOCKS = CUSTOM_BLOCKS;
