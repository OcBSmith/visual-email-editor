# Visual Email Editor - Source Code

## Build Instructions

This add-on does NOT require compilation. The source code IS the final code.

### Third-Party Libraries

The following third-party libraries are included in pre-built form (as distributed by their maintainers):

1. **GrapesJS** (grapes.min.js, grapes.min.css)
   - Source: https://github.com/GrapesJS/grapesjs
   - Version: Latest stable
   - License: BSD-3-Clause
   - Why minified: Downloaded directly from official CDN/npm distribution

2. **grapesjs-mjml** (grapesjs-mjml.min.js)
   - Source: https://github.com/GrapesJS/mjml
   - Version: Latest stable  
   - License: BSD-3-Clause
   - Why minified: Downloaded directly from official npm distribution

### Source Files (Original, Non-Minified)

All other files are original source code, NOT minified or transpiled:

- `manifest.json` - Add-on manifest
- `background.js` - Background script
- `editor/index.html` - Editor HTML
- `editor/editor.js` - Main editor logic (readable, commented)
- `editor/styles.css` - Editor styles
- `editor/ai-service.js` - AI integration service
- `icons/*.svg` - SVG icons

### Build Process

No build process is required. To create the XPI:

1. **Windows PowerShell:**
```powershell
Compress-Archive -Path * -DestinationPath visual-email-editor.xpi
```

2. **Linux/Mac:**
```bash
zip -r visual-email-editor.xpi *
```

3. **Manual:**
   - Select all files in the add-on folder
   - Create a ZIP archive
   - Rename .zip to .xpi

### System Requirements

- No Node.js required
- No npm required  
- No build tools required
- Any operating system with ZIP capability

### Verification

The XPI file is a direct ZIP of the source files with no transformation applied.
