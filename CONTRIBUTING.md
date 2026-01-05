# Contributing Guide

Thanks for your interest in contributing to Visual Email Editor! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

If you find a bug:

1. **Search** for an existing similar issue
2. If none exists, **open a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Thunderbird version
   - Operating system

### 💡 Suggesting Enhancements

Feature suggestions are welcome:

1. Open an issue with the `enhancement` label
2. Describe the proposed functionality
3. Explain why it would be useful

### 📝 Improving Documentation

- Fix typos
- Add usage examples
- Translate to other languages

### 💻 Contributing Code

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Make your changes
4. Commit with descriptive messages
5. Push to your fork
6. Open a Pull Request

---

## ⚙️ Development Setup

### Requirements

- Thunderbird 115 or higher
- Code editor (VS Code recommended)
- Git

### Installation for Development

1. Clone the repository:
```bash
git clone https://github.com/AntoniRC/visual-email-editor.git
cd visual-email-editor
```

2. Open Thunderbird
3. Go to **Tools** → **Add-ons and Themes**
4. Click ⚙️ → **Debug Add-ons**
5. Click **Load Temporary Add-on**
6. Select the `manifest.json` file from the project

### Testing Changes

After making changes:
1. In the debug tab, click **Reload**
2. The add-on will update with your changes

---

## 📐 Code Style

### JavaScript

- Use `const` and `let`, never `var`
- Prefer `async/await` over `.then()`
- Use descriptive variable names
- Comment complex code

```javascript
// ✅ Good
const savedTemplates = await getTemplates();

// ❌ Bad
var x = await f();
```

### CSS

- Use CSS variables defined in `:root`
- Follow BEM convention for complex classes
- Group properties by category

```css
/* ✅ Good */
.btn-primary {
    /* Layout */
    display: flex;
    align-items: center;
    
    /* Appearance */
    background: var(--primary);
    color: white;
    
    /* Transitions */
    transition: var(--transition-fast);
}
```

### Commits

Use descriptive commit messages:

```
✨ feat: add table support in the editor
🐛 fix: resolve error when loading empty templates
📝 docs: update installation guide
🎨 style: improve spacing in blocks panel
♻️ refactor: simplify HTML export function
```

---

## 🔄 Pull Request Process

1. **Ensure** your code works correctly
2. **Update documentation** if needed
3. **Describe the changes** in the PR:
   - What problem does it solve?
   - How does it solve it?
   - Are there any side effects?

4. **Wait for review** - A maintainer will review your PR
5. **Make changes** if requested

### PR Checklist

- [ ] Code follows the project style
- [ ] I have tested the changes in Thunderbird
- [ ] I have updated documentation if needed
- [ ] The PR has a clear description

---

## 📞 Questions?

If you have questions, open an issue with the `question` label or contact the maintainer.

Thanks for contributing! 🙌
