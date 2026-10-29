"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemTrayManager = void 0;
// ============================================================
// Mochi – System Tray Manager
// ============================================================
const electron_1 = require("electron");
const path = __importStar(require("path"));
const ipc_channels_1 = require("../../shared/ipc-channels");
class SystemTrayManager {
    tray = null;
    opts;
    petVisible = true;
    behaviorPaused = false;
    constructor(opts) {
        this.opts = opts;
        this.createTray();
    }
    createTray() {
        try {
            const icon = this.getTrayIcon();
            this.tray = new electron_1.Tray(icon);
            this.tray.setToolTip('Mochi – Desktop Cat');
            this.buildMenu();
        }
        catch (err) {
            console.warn('[SystemTrayManager] Tray creation skipped:', err);
        }
    }
    getTrayIcon() {
        const candidatePaths = [
            path.join(__dirname, '../../assets/icons/tray-icon.png'),
            path.join(__dirname, '../../../assets/icons/tray-icon.png'),
            path.join(process.resourcesPath, 'assets/icons/tray-icon.png'),
            path.join(process.resourcesPath, 'app.asar/assets/icons/tray-icon.png'),
        ];
        for (const p of candidatePaths) {
            try {
                if (require('fs').existsSync(p)) {
                    const img = electron_1.nativeImage.createFromPath(p);
                    if (!img.isEmpty())
                        return img;
                }
            }
            catch { }
        }
        return this.createFallbackIcon();
    }
    createFallbackIcon() {
        const canvas = electron_1.nativeImage.createFromBuffer(Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF,
            0x61, 0x00, 0x00, 0x00, 0x19, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0xFC, 0xCF, 0xC0, 0xC0,
            0xC0, 0x40, 0x1E, 0x30, 0x30, 0x03, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x03, 0x00, 0x0B, 0x9B, 0x02,
            0x4B, 0xE9, 0x97, 0x4A, 0xC9, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60,
            0x82
        ]));
        return canvas;
    }
    buildMenu() {
        if (!this.tray)
            return;
        const settings = this.opts.settingsManager.getSettings();
        const petData = this.opts.petRepository.getPetData();
        const menu = electron_1.Menu.buildFromTemplate([
            {
                label: `🐱 ${petData.name}`,
                enabled: false,
            },
            { type: 'separator' },
            {
                label: this.petVisible ? 'Hide Mochi' : 'Show Mochi',
                accelerator: 'Ctrl+Shift+M',
                click: () => this.togglePetVisibility(),
            },
            {
                label: this.behaviorPaused ? 'Resume Behavior' : 'Pause Behavior',
                click: () => this.toggleBehaviorPause(),
            },
            { type: 'separator' },
            {
                label: settings.clickThrough ? '✓ Click-Through Mode' : 'Click-Through Mode',
                click: () => this.toggleClickThrough(),
            },
            {
                label: settings.soundEnabled ? '✓ Sounds On' : 'Sounds Off',
                click: () => this.toggleSound(),
            },
            { type: 'separator' },
            {
                label: settings.workMode ? '✓ Work Mode' : 'Work Mode',
                click: () => this.toggleWorkMode(),
            },
            {
                label: settings.focusMode ? '✓ Focus Mode' : 'Focus Mode',
                click: () => this.toggleFocusMode(),
            },
            { type: 'separator' },
            {
                label: 'Open Pet Room',
                click: () => this.opts.openSettings(),
            },
            {
                label: 'Summon a Toy 🎾',
                click: () => {
                    this.opts.petWindow.webContents.send(ipc_channels_1.IPC.PET_SPAWN_TOY, {
                        toyId: 'yarn_ball',
                    });
                },
            },
            {
                label: 'Give a Treat 🐟',
                click: () => {
                    this.opts.petWindow.webContents.send(ipc_channels_1.IPC.PET_SUMMON_TREAT);
                },
            },
            { type: 'separator' },
            {
                label: settings.cursorTracking ? '✓ Cursor Tracking' : 'Cursor Tracking',
                click: () => {
                    const s = this.opts.settingsManager.updateSettings({
                        cursorTracking: !settings.cursorTracking,
                    });
                    this.opts.petWindow.webContents.send(ipc_channels_1.IPC.SETTINGS_CHANGED, s);
                    this.buildMenu();
                },
            },
            {
                label: settings.windowAwareness ? '✓ Window Awareness' : 'Window Awareness',
                click: () => {
                    const s = this.opts.settingsManager.updateSettings({
                        windowAwareness: !settings.windowAwareness,
                    });
                    this.opts.petWindow.webContents.send(ipc_channels_1.IPC.SETTINGS_CHANGED, s);
                    this.buildMenu();
                },
            },
            {
                label: settings.startWithWindows ? '✓ Start with Windows' : 'Start with Windows',
                click: () => {
                    const newVal = !settings.startWithWindows;
                    this.opts.settingsManager.updateSettings({ startWithWindows: newVal });
                    const { app } = require('electron');
                    app.setLoginItemSettings({ openAtLogin: newVal });
                    this.buildMenu();
                },
            },
            { type: 'separator' },
            {
                label: 'Recover Mochi (if stuck)',
                click: () => {
                    this.opts.petWindow.webContents.send('pet:recover');
                },
            },
            { type: 'separator' },
            {
                label: 'Exit',
                click: () => this.opts.onQuit(),
            },
        ]);
        this.tray.setContextMenu(menu);
        this.tray.on('double-click', () => {
            this.togglePetVisibility();
        });
    }
    togglePetVisibility() {
        this.petVisible = !this.petVisible;
        if (this.petVisible) {
            this.opts.petWindow.webContents.send(ipc_channels_1.IPC.APP_SHOW_PET);
        }
        else {
            this.opts.petWindow.webContents.send(ipc_channels_1.IPC.APP_HIDE_PET);
        }
        this.buildMenu();
    }
    toggleBehaviorPause() {
        this.behaviorPaused = !this.behaviorPaused;
        this.opts.petWindow.webContents.send('pet:pause', this.behaviorPaused);
        this.buildMenu();
    }
    toggleClickThrough() {
        const settings = this.opts.settingsManager.getSettings();
        const newVal = !settings.clickThrough;
        this.opts.settingsManager.updateSettings({ clickThrough: newVal });
        if (newVal) {
            this.opts.petWindow.setIgnoreMouseEvents(true, { forward: true });
        }
        else {
            this.opts.petWindow.setIgnoreMouseEvents(false);
        }
        this.opts.petWindow.webContents.send(ipc_channels_1.IPC.APP_TOGGLE_CLICK_THROUGH, newVal);
        this.buildMenu();
    }
    toggleSound() {
        const settings = this.opts.settingsManager.getSettings();
        const newVal = !settings.soundEnabled;
        this.opts.settingsManager.updateSettings({ soundEnabled: newVal });
        this.opts.petWindow.webContents.send(ipc_channels_1.IPC.APP_TOGGLE_SOUND, newVal);
        this.buildMenu();
    }
    toggleWorkMode() {
        const settings = this.opts.settingsManager.getSettings();
        const newVal = !settings.workMode;
        this.opts.settingsManager.updateSettings({ workMode: newVal });
        this.opts.petWindow.webContents.send(ipc_channels_1.IPC.APP_WORK_MODE, newVal);
        this.buildMenu();
    }
    toggleFocusMode() {
        const settings = this.opts.settingsManager.getSettings();
        const newVal = !settings.focusMode;
        this.opts.settingsManager.updateSettings({ focusMode: newVal });
        this.opts.petWindow.webContents.send(ipc_channels_1.IPC.APP_FOCUS_MODE, newVal);
        this.buildMenu();
    }
    destroy() {
        this.tray?.destroy();
        this.tray = null;
    }
}
exports.SystemTrayManager = SystemTrayManager;
//# sourceMappingURL=SystemTrayManager.js.map