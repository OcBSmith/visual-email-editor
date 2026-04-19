/**
 * Visual Email Editor - UI Manager
 * Handles side panel resizing and layout interactions.
 */

(function() {
    const resizerLeft = document.getElementById('resizer-left');
    const resizerRight = document.getElementById('resizer-right');
    const panelLeft = document.querySelector('.panel-left');
    const panelRight = document.querySelector('.panel-right');

    function initResizer(resizer, panel, isLeft) {
        if (!resizer || !panel) return;
        
        let startX, startWidth;
        let animationFrame;

        resizer.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startWidth = panel.offsetWidth;
            resizer.classList.add('is-dragging');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            // Add an overlay to the canvas to prevent mouse issues with iframe
            const canvas = document.querySelector('.gjs-cv-canvas');
            if (canvas) {
                const overlay = document.createElement('div');
                overlay.id = 'resize-overlay';
                overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:9999; cursor:col-resize;';
                canvas.appendChild(overlay);
            }

            const onMouseMove = (e) => {
                if (animationFrame) cancelAnimationFrame(animationFrame);

                animationFrame = requestAnimationFrame(() => {
                    const delta = isLeft ? e.clientX - startX : startX - e.clientX;
                    const newWidth = Math.max(200, Math.min(600, startWidth + delta));
                    
                    panel.style.transition = 'none';
                    panel.style.width = `${newWidth}px`;
                    
                    const varName = isLeft ? '--panel-left-width' : '--panel-right-width';
                    document.documentElement.style.setProperty(varName, `${newWidth}px`);
                });
            };

            const onMouseUp = () => {
                if (animationFrame) cancelAnimationFrame(animationFrame);
                
                resizer.classList.remove('is-dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Remove the overlay
                const overlay = document.getElementById('resize-overlay');
                if (overlay) overlay.remove();
                
                panel.style.transition = '';
                
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                
                // Debounce the editor refresh
                setTimeout(() => {
                    if (window.editor && typeof window.editor.refresh === 'function') {
                        window.editor.refresh();
                    }
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    }

    // ===== PANEL TABS =====
    const panelTabs = document.querySelectorAll('.panel-tab');
    const panelSections = document.querySelectorAll('.panel-section');

    function initTabs() {
        panelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.panel;
                panelTabs.forEach(t => t.classList.remove('active'));
                panelSections.forEach(s => s.classList.remove('active'));
                tab.classList.add('active');
                const container = document.getElementById(`${targetPanel}-container`);
                if (container) container.classList.add('active');
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        });
    }

    // ===== MODALS & TOASTS =====
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    const modalClose = document.getElementById('modalClose');
    const toastContainer = document.getElementById('toastContainer');

    window.showModal = function(title, bodyContent, footerButtons = []) {
        if (!modalTitle || !modalBody || !modalFooter) return;
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyContent;
        modalFooter.innerHTML = '';
        footerButtons.forEach(btn => {
            const button = document.createElement('button');
            button.className = btn.class || (btn.primary ? 'btn-primary' : 'btn-secondary');
            button.textContent = btn.text;
            if (btn.id) button.id = btn.id;
            button.addEventListener('click', btn.action);
            modalFooter.appendChild(button);
        });
        modalOverlay.classList.remove('hidden');
    };

    window.hideModal = function() {
        if (modalOverlay) modalOverlay.classList.add('hidden');
    };

    window.showToast = function(message, type = 'success') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';
        toast.innerHTML = `<span>${icon}</span> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    if (modalClose) modalClose.addEventListener('click', window.hideModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) window.hideModal();
        });
    }

    // Initialize only when DOM is fully ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initResizer(resizerLeft, panelLeft, true);
            initResizer(resizerRight, panelRight, false);
            initTabs();
        });
    } else {
        initResizer(resizerLeft, panelLeft, true);
        initResizer(resizerRight, panelRight, false);
        initTabs();
    }
})();
