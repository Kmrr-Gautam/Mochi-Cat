"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortcutManager = void 0;
// ============================================================
// Mochi – Shortcut Manager
// ============================================================
const electron_1 = require("electron");
const ipc_channels_1 = require("../../shared/ipc-channels");
class ShortcutManager {
    petWindow;
    settings;
    openSettings;
    constructor(petWindow, settings, openSettings) {
        this.petWindow = petWindow;
        this.settings = settings;
        this.openSettings = openSettings;
        this.register();
    }
    register() {
        // Toggle visibility
        this.tryRegister('Ctrl+Shift+M', () => {
            this.petWindow.webContents.send(ipc_channels_1.IPC.APP_HIDE_PET);
        });
        // Toggle click-through
        this.tryRegister('Ctrl+Shift+C', () => {
            this.petWindow.webContents.send(ipc_channels_1.IPC.APP_TOGGLE_CLICK_THROUGH);
        });
        // Open settings
        this.tryRegister('Ctrl+Shift+P', () => {
            this.openSettings();
        });
    }
    tryRegister(accelerator, callback) {
        try {
            electron_1.globalShortcut.register(accelerator, callback);
        }
        catch (e) {
            console.warn(`[ShortcutManager] Could not register ${accelerator}:`, e);
        }
    }
    dispose() {
        electron_1.globalShortcut.unregisterAll();
    }
}
exports.ShortcutManager = ShortcutManager;
//# sourceMappingURL=ShortcutManager.js.map