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

### 🤖 Integrated Artificial Intelligence
Generate complete emails just by describing what you want. Uses free AI models through [Groq](https://groq.com/):
- **Llama 3.3 70B** (recommended)
- **Llama 3.1 8B Instant**
- **Mixtral 8x7B**
- **Gemma 2 9B**

### ⚡ Seamless Thunderbird Integration
- One click to insert your design into a new email
- Automatically preserves your configured signature
- Works with Thunderbird 115+

### 💾 Template System
- Save your designs as reusable templates
- Load saved templates instantly
- Import existing HTML or MJML files

### ✏️ AI-Powered Text Editing
- **Improve**: Optimize copywriting
- **Shorten**: Make text more concise
- **Expand**: Add more details
- **Translate**: Translate to any language
- **Rewrite**: Change the tone (formal, casual, urgent...)

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
| `Ctrl + Y` | Redo |
| `Esc` | Close modal |

---

## 🤖 AI Configuration

AI integration is **optional** and uses the Groq API, which offers **free** AI models.

### Getting an API Key

1. Create a free account at [console.groq.com](https://console.groq.com)
2. Go to **API Keys** and generate a new key
3. In the editor, click **"Configure AI"** (⚙️)
4. Paste your API Key and select the desired model

### Available Models

| Model | Description | Speed |
|-------|-------------|-------|
| **Llama 3.3 70B** | Best quality | ⭐⭐⭐ |
| **Llama 3.1 8B Instant** | Quality/speed balance | ⭐⭐⭐⭐⭐ |
| **Mixtral 8x7B** | Long context | ⭐⭐⭐⭐ |
| **Gemma 2 9B** | Compact and efficient | ⭐⭐⭐⭐ |

---

## 🔒 Privacy

- ✅ Your API Key is stored **locally** in Thunderbird
- ✅ We don't send data to our own servers
- ✅ AI requests go **directly to Groq**
- ✅ No personal information is collected

---

## 📖 Documentation

- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

---

## 🛠️ Development

### Requirements

- Thunderbird 115 or higher
- No Node.js or build tools required

### Project Structure

```
visual-email-editor/
├── manifest.json        # Add-on configuration
├── background.js        # Background script
├── editor/
│   ├── index.html       # Editor interface
│   ├── editor.js        # Main logic
│   ├── ai-service.js    # Groq integration
│   ├── styles.css       # Styles
│   └── lib/             # Libraries (GrapesJS, MJML)
├── icons/               # Add-on icons
└── docs/                # Additional documentation
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

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

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
