# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-10

### ✨ Added

- **Max Width Limit (600px)**
  - All MJML components now have a maximum width of 600px
  - Prevents layout issues in email clients
  - Automatic correction when exceeding limit

- **New Welcome Template**
  - Clean light mode design
  - Professional look with white sections and gray background
  - Colorful buttons (blue, pink, green)

- **Improved Email Compatibility**
  - Added `mj-group` for multi-column sections
  - Columns now stay horizontal in Gmail and all clients
  - WYSIWYG: Editor shows exactly what Thunderbird renders

### 🗑️ Removed

- **ImgBB Integration**
  - Removed external image hosting via ImgBB
  - Images are now embedded directly as base64
  - Simpler workflow, no API key needed for images
  - Better privacy (images not uploaded to third parties)

### 🔧 Fixed

- Image sizing now consistent between editor and Thunderbird
- Email width now matches standard 600px
- Multi-column layouts work correctly in Gmail

---

## [1.0.0] - 2026-01-05

### ✨ Added

- **Drag-and-Drop Visual Editor**
  - Full integration with GrapesJS
  - MJML block panel (sections, columns, text, images, buttons)
  - Style panel to customize components
  - Layers panel to manage structure
  
- **MJML Support**
  - Automatic MJML to HTML compilation
  - Guaranteed compatibility with all email clients
  - 100% responsive emails
  
- **AI Integration (Groq)**
  - Full email generation with natural language description
  - Free models: Llama 3.3, Mixtral, Gemma 2
  - AI Text Editing:
    - Improve copywriting
    - Shorten text
    - Expand content
    - Translate to any language
    - Rewrite with different tone
    - Custom instructions

- **Template System**
  - Save designs as reusable templates
  - Load saved templates
  - Limit of 20 templates with automatic rotation

- **Import/Export**
  - Import existing HTML files
  - Import MJML files
  - Paste HTML code directly
  - View generated HTML code
  - Copy code to clipboard

- **Thunderbird Integration**
  - Toolbar button
  - Insert design into a new email with one click
  - Automatic user signature preservation
  - Code cleaning for compatibility

- **Responsive Preview**
  - Desktop Mode
  - Tablet Mode
  - Mobile Mode

- **User Interface**
  - Modern dark theme
  - Smooth animations
  - Toast notification system
  - Reusable modals
  - Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y)

---

## Roadmap

### [1.1.0] - Planned

- [ ] More MJML blocks (accordion, carousel, navbar)
- [ ] Pre-designed template gallery
- [ ] Export as HTML file
- [ ] Version history per template

### [1.2.0] - Planned

- [ ] Multiple language support (i18n)
- [ ] Integration with image services
- [ ] Collaborative mode (share templates)

---

## How to Update

To update to the latest version:

1. Go to **Tools** → **Add-ons and Themes**
2. Search for "Visual Email Editor"
3. If an update is available, an "Update" button will appear

Or download the latest version from [Releases](https://github.com/AntoniRC/visual-email-editor/releases).
