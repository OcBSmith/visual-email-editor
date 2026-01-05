# 🚀 Prepare Repository for GitHub

## Steps to Upload to GitHub

### 1. Create Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Name: `visual-email-editor`
3. Description: `Drag-and-drop visual editor to create responsive HTML emails in Thunderbird with integrated AI`
4. Visibility: **Public** (so others can use it)
5. **DO NOT** check "Add a README file" (we already have it)
6. Click **Create repository**

### 2. Initialize Local Git

Open PowerShell in the project folder and run:

```powershell
# Remove files that should not be uploaded
Remove-Item -Force visual-email-editor.xpi
Remove-Item -Force visual-email-editor-source.zip

# Initialize repository
git init

# Add all files
git add .

# First commit
git commit -m "🎉 Initial release: Visual Email Editor v1.0.0"

# Rename branch to main
git branch -M main

# Connect to GitHub (replace YOUR_USER with your username)
git remote add origin https://github.com/YOUR_USER/visual-email-editor.git

# Push to GitHub
git push -u origin main
```

### 3. Create Release on GitHub

1. Go to your repository → **Releases** → **Create a new release**
2. Tag: `v1.0.0`
3. Title: `Visual Email Editor v1.0.0`
4. Description: Copy the content of CHANGELOG.md
5. Attach the `.xpi` file (create it first with the command from BUILD.md)
6. Click **Publish release**

### 4. Add Topics (Tags)

On the repository page, click ⚙️ next to "About" and add:
- `thunderbird`
- `thunderbird-addon`
- `email`
- `email-editor`
- `mjml`
- `grapesjs`
- `ai`
- `drag-and-drop`

### 5. Add Screenshots

1. Open the editor in Thunderbird
2. Take screenshots
3. Save them in `docs/screenshots/`
4. Push the screenshots

```powershell
git add docs/screenshots/
git commit -m "📸 Add screenshots"
git push
```

---

## Useful Commands

### Create XPI for Release

```powershell
# Exclude unnecessary files
$exclude = @("*.xpi", "*.zip", ".git", "docs", "SETUP_GITHUB.md", ".gitignore")
Compress-Archive -Path * -DestinationPath visual-email-editor-v1.0.0.xpi -Force
```

### View Repository Status

```powershell
git status
```

### View History

```powershell
git log --oneline
```
