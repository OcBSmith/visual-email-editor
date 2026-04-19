// Visual Email Editor - Preview Controls Module (Device Preview & Undo/Redo)

const PREVIEW_CONTROLS = {
    init() {
        this.bindDeviceButtons();
        this.bindUndoRedo();
        this.setInitialState();
    },

    bindDeviceButtons() {
        const deviceDesktop = document.getElementById('deviceDesktop');
        const deviceTablet = document.getElementById('deviceTablet');
        const deviceMobile = document.getElementById('deviceMobile');

        if (deviceDesktop) {
            deviceDesktop.addEventListener('click', () => this.setDevice('Desktop', deviceDesktop));
        }
        if (deviceTablet) {
            deviceTablet.addEventListener('click', () => this.setDevice('Tablet', deviceTablet));
        }
        if (deviceMobile) {
            deviceMobile.addEventListener('click', () => this.setDevice('Mobile', deviceMobile));
        }
    },

    setDevice(device, button) {
        if (!window.editor) return;
        window.editor.setDevice(device);
        document.querySelectorAll('.device-btn').forEach(btn => btn.classList.remove('active'));
        if (button) button.classList.add('active');
        
        if (device === 'Desktop') {
            document.body.classList.add('is-desktop-view');
        } else {
            document.body.classList.remove('is-desktop-view');
        }
    },

    bindUndoRedo() {
        const btnUndo = document.getElementById('btnUndo');
        const btnRedo = document.getElementById('btnRedo');

        if (btnUndo) {
            btnUndo.addEventListener('click', () => {
                if (window.editor) window.editor.UndoManager.undo();
            });
        }
        if (btnRedo) {
            btnRedo.addEventListener('click', () => {
                if (window.editor) window.editor.UndoManager.redo();
            });
        }
    },

    setInitialState() {
        document.body.classList.add('is-desktop-view');
    }
};

window.PREVIEW_CONTROLS = PREVIEW_CONTROLS;