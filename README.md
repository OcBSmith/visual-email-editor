# ✉️ Visual Email Editor for Thunderbird

<div align="center">

![Visual Email Editor](icons/icon-128.svg)

**Drag-and-drop visual editor to create responsive HTML emails directly in Thunderbird**

[![Thunderbird](https://img.shields.io/badge/Thunderbird-115+-0A84FF?style=for-the-badge&logo=thunderbird&logoColor=white)](https://www.thunderbird.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![MJML](https://img.shields.io/badge/MJML-Powered-F45E43?style=for-the-badge)](https://mjml.io/)
[![AI](https://img.shields.io/badge/AI-Groq-00D4AA?style=for-the-badge)](https://groq.com/)

[📥 Install](#-installation) • [✨ Features](#-features) • [🚀 Usage](#-usage) • [🤖 AI Setup](#-ai-configuration) • [📖 Docs](#-documentation)

</div>

---

## 📸 Screenshots

<div align="center">
<table>
<tr>
<td align="center"><strong>Visual Editor</strong></td>
<td align="center"><strong>AI Generation</strong></td>
</tr>
<tr>
<td><img src="docs/screenshots/editor.png" alt="Editor" width="400"/></td>
<td><img src="docs/screenshots/ai-generation.png" alt="AI" width="400"/></td>
</tr>
</table>
</div>

---

## ✨ Features

### 🎨 Drag-and-Drop Visual Editor
Design professional emails by dragging and dropping components. No HTML coding required.

### 📱 100% Responsive Emails
Built on [MJML](https://mjml.io/), the industry standard. Your emails will look perfect on any device and email client.
- **🎨 WYSIWYG Template Editor:** Drag-and-drop MJML components to build professional emails easily.
- **🤖 Hybrid AI Assistance:** 
  - **Cloud:** High-quality results using [Groq API](https://groq.com/).
  - **Local:** Full privacy and offline support with **LM Studio** integration.
- **💬 AI Chat Sidebar (Conversational Design):** Edit your email using natural language. Ask things like *"Change the background to soft blue"* or *"Add a 3-column section"* and the AI will modify the design for you.
- **✉️ Marketing AI Toolkit (Top Toolbar):**
  - **Subject Line Generator:** 5 psychological hooks to improve open rates.
  - **Spam Score Analyzer:** Detect spam triggers and receive deliverability advice.
  - **Preheader Generator:** Perfect preview text (max 90 chars).
- **🌍 Advanced Productivity:**
  - **Translate All:** Localize the entire email (design + content) in one click.
  - **Auto Alt-Text:** Automatically generate accessibility descriptions for all images.
- **💾 Advanced Template System:** 
  - Save and load your designs locally.
  - Automatic overwrite support for existing template names.
  - Interactive library grid with **deletion functionality**.
  - Save AI results directly to your template library.
- **📐 Professional Layout:** Emails are optimized for Thunderbird rendering with dynamic width support (600px to 1200px+).
- **🖼️ Deep Privacy:** Images are embedded directly (base64) or as absolute URLs. No external tracking or hidden dependencies.
- **⚡ Fast Integration:** Insert your design into a Thunderbird compose window with a single click.

### ✏️ AI-Powered Text Editing (Rich Context)
- **Improve**: Optimize copywriting
- **Shorten**: Make text more concise
- **Expand**: Add more details
- **Translate**: Translate specific blocks to any language
- **Rewrite**: Change the tone (formal, casual, urgent...)
- **💡 CTA Suggestions**: Specific AI tool for buttons to generate high-conversion call-to-actions.

---

## 📦 Installation

### From Thunderbird Add-ons (Recommended)

1. Open Thunderbird
2. Go to **Tools** → **Add-ons and Themes**
3. Search for "**Visual Email Editor**"
4. Click **Add to Thunderbird**

### Manual Installation

1. Download the `.xpi` file from [Releases](https://github.com/AntoniRC/visual-email-editor/releases)
2. In Thunderbird: **Tools** → **Add-ons and Themes**
3. Click the gear icon ⚙️ → **Install Add-on From File**
4. Select the downloaded `.xpi` file

---

## 🚀 Usage

### Designing an Email

1. Click the **Visual Email Editor** icon in the toolbar
2. Drag components from the left panel to the canvas
3. Click on any element to edit it
4. Use the right panel to adjust styles and properties
5. Click **"Insert in Email"** to open in Thunderbird

### Preview

- Use the **Desktop/Tablet/Mobile** buttons to see how it will look on different devices
- Click the **Preview** button (👁️) to open in a new window

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save template |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Esc` | Close modal |
| `New Button` | Start from scratch (Empty canvas) |

---

## 🤖 AI Configuration

AI integration is **optional** and uses APIs like Groq or OpenRouter, which offer **free** AI models.

### Cloud Providers (Groq & OpenRouter)

1. Create a free account at [console.groq.com](https://console.groq.com) or [openrouter.ai](https://openrouter.ai).
2. Go to their **API Keys** section and generate a new key.
3. In the editor, click **"Configure AI"** (⚙️).
4. Select your provider, paste your API Key, and select the desired model.

### Local Privacy (LM Studio)
For complete privacy, you can use a local model running in **LM Studio**.

1. Download and install [LM Studio](https://lmstudio.ai/).
2. Load your favorite model (e.g., Llama 3 8B, Phi-3).
3. Start the **Local Server** (default: `http://localhost:1234`).
4. **IMPORTANT**: Enable **CORS** in LM Studio settings to allow the extension to communicate with the server.
5. In the editor, click **"Configure AI"** (⚙️), select **LM Studio**, and verify the URL.

### Recommended Models

| Model | Provider | Description | Speed |
|-------|----------|-------------|-------|
| **Llama 3.3 70B** | Groq / OpenRouter | Best reasoning & logic | ⭐⭐⭐ |
| **Mixtral 8x7B** | Groq / OpenRouter | Long context & creative | ⭐⭐⭐⭐ |
| **Llama 3.1 8B** | Groq / OpenRouter | Quality/speed balance | ⭐⭐⭐⭐⭐ |
| **Google Gemini Flash** | OpenRouter (Free) | Great multilingual support | ⭐⭐⭐⭐⭐ |

---

## 🔒 Privacy & Architecture Integrity

- ✅ Your API Key is stored **locally** in Thunderbird
- ✅ No personal information is collected; we don't send data to our own servers.
- ✅ **The Great Healer**: An internal stabilization engine prevents MJML compiling errors and attribute-css mismatches loops common in typical MJML-GrapesJS integrations.
- ✅ **Architecture Safe-Mode**: Structural MJML layout (rows, columns) is fully locked when processing AI language translations, preventing the LLMs from destroying the template blueprint.

---

## 📖 Documentation

- [Architecture Reference](docs/architecture.md) (Highly Recommended for Contributors)
- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

## 🛠️ Development

### Requirements

- Thunderbird 115 or higher
- Node.js (Only required if you want to run Jest tests via `npm test`)

### Project Structure (v6 Modular)

```
visual-email-editor/
├── manifest.json        # Add-on configuration
├── background.js        # Background script
├── editor/
│   ├── index.html       # Editor interface 
│   ├── editor.js        # Core Orchestrator
│   ├── style-manager.js # CSS/MJML Alignment Sanitizer (Circuit Breaker)
│   ├── import-export.js # "Great Healer" Parser & Compiler logic
│   ├── ai-api.js        # AI LLM Routing Service
│   ├── ai-handlers.js   # AI Modals & UI Events
│   ├── providers/       # Abstraction for multiple LLM providers
│   ├── styles/          # Modular CSS (.css files)
│   └── lib/             # Third-Party Libraries (GrapesJS, MJML)
├── icons/               # Add-on icons
└── docs/                # Architecture and dev documentation
```

### Building the XPI

```powershell
# Windows PowerShell
Compress-Archive -Path * -DestinationPath visual-email-editor.xpi
```

```bash
# Linux/Mac
zip -r visual-email-editor.xpi * -x "*.git*" -x "*.xpi" -x "docs/*"
```

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if a [similar issue](https://github.com/AntoniRC/visual-email-editor/issues) already exists
2. If not, [open a new issue](https://github.com/AntoniRC/visual-email-editor/issues/new)
3. Include steps to reproduce the problem and your Thunderbird version

---

## 🛠️ Development and Testing

The project is moving towards a modular architecture with a focus on code stability.

### Setup
Ensure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### Running Tests
We use [Jest](https://jestjs.io/) to validate core logic in `editor-utils.js`.
```bash
npm test
```

### Documentation
Detailed architectural docs can be found in [`docs/architecture.md`](docs/architecture.md).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [GrapesJS](https://grapesjs.com/) - Visual editor framework
- [MJML](https://mjml.io/) - Responsive email framework
- [Groq](https://groq.com/) - Ultra-fast AI API
- Thunderbird Community

---

<div align="center">

Made with ❤️ for the Thunderbird community

**[⬆ Back to top](#️-visual-email-editor-for-thunderbird)**

</div>
