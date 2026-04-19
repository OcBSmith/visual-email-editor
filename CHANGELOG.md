# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-19

### ✨ Added

- **Hybrid AI Support**
  - **Groq API**: High-speed cloud AI.
  - **LM Studio**: Full support for local AI models running on `localhost`.
  - Dynamic model detection and selection for both providers.

- **Conversational Design (AI Chat Sidebar)**
  - New side panel for natural language design instructions.
  - "Apply to design" logic that modifies MJML code directly from chat.
  - Automatic scrolling and persistence during the session.

- **Marketing AI Toolkit**
  - **Subject Line Generator**: 5 optimized subjects for every email.
  - **Spam Score Analyzer**: Risk detection and deliverability tips.
  - **Preheader Generator**: Preview text optimization.

- **Advanced Productivity Tools**
  - **Translate All**: Full localization of the design (mj-text, mj-button, alt attributes).
  - **Auto Alt-Text**: Context-aware accessibility descriptions for images.

- **Enhanced AI Context (Contextual UI)**
  - ✨ Button in component toolbar for text editing.
  - 💡 Button in button components for CTA text suggestions.

### 🔧 Fixed

- **Content Insertion**: Resolved issue where AI-generated designs were not applying correctly to the editor.
- **Markdown Sanitization**: Automatic removal of markdown code blocks (```mjml) from AI responses.
- **Permissions**: Added missing host permissions for Groq and Localhost in `manifest.json`.

## [1.1.0] - 2026-01-11

### ✨ Added

- **Increased Max Width (640px)**
  - Global width increased from 600px to 640px for a more spacious design
  - All MJML components and export containers adjusted to 640px
  - Perfect alignment with updated user signatures

- **New Design Button**
  - Start from scratch with a single click
  - Confirmation modal to prevent accidental loss of work
  - Clean MJML structure initialized automatically

- **Enhanced Template Management**
  - **Interactive Grid**: New visual library with template cards.
  - **Smart Saving**: Detection of duplicate names for easy overwriting/updating.
  - **Template Deletion**: Dedicated red button to remove unwanted designs.
  - **AI Integration**: Save AI results as templates directly from the generation modal.

- **Improved Bold Style Preservation**
  - Enhanced template styles with `font-weight: bold` and `<strong>` tags
  - Better visibility in Thunderbird's compose window

- **Optimized HTML Extraction**
  - Only `<body>` content and `<style>` tags are extracted
  - Prevents nested `<html>` tags when inserting into Thunderbird
  - Clean, standard-compliant markup

- **New Welcome Template**
  - Clean light mode design
  - Professional look with white sections and gray background
  - Colorful buttons (blue, pink, green)

### 🗑️ Removed

- **ImgBB Integration**
  - Removed external image hosting via ImgBB
  - Images are now embedded directly as base64
  - Better privacy and simpler workflow

### 🔧 Fixed

- Email width now strictly enforced at 640px
- Bold styles correctly maintained in Thunderbird
- Double `<html>` tag issue resolved
- Multi-column layouts horizontal and stable in all clients

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
