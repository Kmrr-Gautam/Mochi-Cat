"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesktopOverlayManager = void 0;
// ============================================================
// Mochi – Desktop Overlay Manager
// ============================================================
const electron_1 = require("electron");
class DesktopOverlayManager {
    win;
    settings;
    constructor(win, settings) {
        this.win = win;
        this.settings = settings;
        this.applySettings();
        this.setupDisplayListener();
    }
    applySettings() {
        const s = this.settings.getSettings();
        if (s.clickThrough) {
            this.win.setIgnoreMouseEvents(true, { forward: true });
        }
        else {
            this.win.setIgnoreMouseEvents(false);
        }
        this.win.setAlwaysOnTop(s.alwaysOnTop, 'screen-saver');
        this.coverPrimaryDisplay();
    }
    coverPrimaryDisplay() {
        const primary = electron_1.screen.getPrimaryDisplay();
        const { x, y, width, height } = primary.workArea;
        this.win.setBounds({ x, y, width, height });
    }
    setupDisplayListener() {
        electron_1.screen.on('display-metrics-changed', () => this.coverPrimaryDisplay());
        electron_1.screen.on('display-added', () => this.coverPrimaryDisplay());
        electron_1.screen.on('display-removed', () => this.coverPrimaryDisplay());
    }
    setClickThrough(enabled) {
        if (enabled) {
            this.win.setIgnoreMouseEvents(true, { forward: true });
        }
        else {
            this.win.setIgnoreMouseEvents(false);
        }
    }
}
exports.DesktopOverlayManager = DesktopOverlayManager;
//# sourceMappingURL=DesktopOverlayManager.js.map