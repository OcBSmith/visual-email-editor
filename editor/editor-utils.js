/**
 * Visual Email Editor - Pure Utilities
 * Segregated for Unit Testing and Modularization
 */

function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    if (rgb.startsWith('#')) return rgb;

    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    return rgb;
}

function getErrorHtml(message) {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Error</title></head>
<body style="font-family: Arial; padding: 20px;">
<p>Error: ${message}</p>
</body></html>`;
}

function escapeHtml(text) {
    // Requires DOM
    if (typeof document === 'undefined') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Export for Jest if in Node environment, else leave in global scope for Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { rgbToHex, getErrorHtml, escapeHtml, formatDate, formatBytes };
}
