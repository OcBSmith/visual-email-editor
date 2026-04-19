/**
 * Visual Email Editor - Template Library
 * Extracted from editor.js for better modularity.
 */

window.TEMPLATE_LIBRARY = [
    {
        id: 'welcome',
        name: 'Neo-Minimal Welcome',
        description: 'Clean, professional branding email',
        mjml: `<mjml>
  <mj-head>
    <mj-title>Neo-Minimal Welcome</mj-title>
    <mj-attributes>
      <mj-all font-family="'Inter', Arial, sans-serif" />
      <mj-text font-size="16px" color="#4b5563" line-height="1.5" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <mj-section padding="40px 20px 0">
      <mj-column>
        <mj-image src="https://www.thunderbird.net/media/img/thunderbird/logos/release.png" width="48px" align="center" />
      </mj-column>
    </mj-section>
    <mj-section padding="20px 20px 0">
      <mj-column>
        <mj-text align="center" font-size="48px" font-weight="900" color="#111827" line-height="1.1" padding-top="20px">
          El futuro del email<br/><span style="color: #0a84ff">ya está aquí.</span>
        </mj-text>
        <mj-text align="center" font-size="18px" color="#64748b" padding-top="20px" padding-bottom="30px">
          Bienvenido al editor visual más potente diseñado específicamente para Thunderbird.
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="0 20px 40px">
      <mj-column>
        <mj-image src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&q=80" border-radius="20px" />
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" border-radius="24px" padding="30px">
      <mj-column>
        <mj-text align="center" font-weight="bold" font-size="20px" color="#111827">¿Listo para impresionar?</mj-text>
        <mj-text align="center">Usa nuestras herramientas de IA para optimizar tus asuntos, analizar el spam y generar contenidos personalizados en segundos.</mj-text>
        <mj-button background-color="#0a84ff" color="#ffffff" font-size="16px" font-weight="bold" border-radius="100px" inner-padding="15px 40px" href="#">
          EMPEZAR A CREAR
        </mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="40px 20px 40px">
      <mj-column>
        <mj-text align="center" font-size="12px" color="#94a3b8">
          © 2026 Visual Editor Pro. Hecho con ❤️ para la comunidad Open Source.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
    },
    {
        id: 'flash-sale',
        name: 'Electric Flash Sale',
        description: 'High-impact dark mode promotion',
        mjml: `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="'Inter', sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#050505" width="600px">
    <mj-section padding="60px 0 20px">
      <mj-column>
        <mj-text align="center" color="#0a84ff" font-weight="bold" letter-spacing="2px" font-size="14px">
          OFERTA POR TIEMPO LIMITADO
        </mj-text>
        <mj-text align="center" color="#ffffff" font-size="72px" font-weight="900" padding-top="0">
          -50% ALL
        </mj-text>
        <mj-text align="center" color="#ffffff" font-size="18px" padding-bottom="20px">
          USA EL CÓDIGO: <span style="background: #ffffff; color: #000000; padding: 4px 12px; border-radius: 4px; font-weight: 800; margin-left: 10px;">THUNDER50</span>
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="0 20px">
      <mj-column>
        <mj-image src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" border-radius="24px" />
      </mj-column>
    </mj-section>
    <mj-section padding="40px 20px 60px">
      <mj-column>
        <mj-button background-color="#ffffff" color="#000000" font-size="18px" font-weight="bold" border-radius="50px" inner-padding="20px 40px">
          COMPRAR AHORA
        </mj-button>
        <mj-text align="center" color="#666666" font-size="12px" padding-top="20px">
          *Válido hasta agotar existencias. Solo hoy.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
    },
    {
        id: 'newsletter',
        name: 'Apex Digital Digest',
        description: 'Premium grid-based newsletter',
        mjml: `<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="'Inter', sans-serif" />
      <mj-text font-size="16px" color="#1f2937" line-height="1.6" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f8fafc" width="600px">
    <mj-section padding="50px 20px 20px">
      <mj-column>
        <mj-text font-size="12px" font-weight="bold" color="#6366f1" text-transform="uppercase" letter-spacing="1px">EDICIÓN SEMANAL #42</mj-text>
        <mj-text font-size="36px" font-weight="900" padding-top="0" color="#111827">Apex Digest</mj-text>
        <mj-divider border-width="4px" border-color="#6366f1" width="40px" align="left" padding-bottom="30px" />
      </mj-column>
    </mj-section>
    <mj-section padding="0 20px 40px">
      <mj-column>
        <mj-image src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" border-radius="16px" />
        <mj-text font-size="24px" font-weight="800" padding-top="24px" color="#111827">IA: El futuro del diseño</mj-text>
        <mj-text color="#4b5563">Analizamos cómo las nuevas herramientas generativas están permitiendo a los creadores centrarse en la estrategia.</mj-text>
        <mj-button background-color="#6366f1" align="left" border-radius="8px">Seguir leyendo</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="0 20px 60px">
      <mj-column width="48%">
        <mj-image src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400" border-radius="12px" />
        <mj-text font-size="18px" font-weight="bold" color="#111827">Novedades v4.0</mj-text>
        <mj-text font-size="14px" color="#64748b">Todo sobre nuestro último gran lanzamiento.</mj-text>
      </mj-column>
      <mj-column width="4%"></mj-column>
      <mj-column width="48%">
        <mj-image src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" border-radius="12px" />
        <mj-text font-size="18px" font-weight="bold" color="#111827">Recursos Pro</mj-text>
        <mj-text font-size="14px" color="#64748b">Nuevas plantillas y activos descargables.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
    }
];
