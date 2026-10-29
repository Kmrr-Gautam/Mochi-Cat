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
exports.petRepository = exports.settingsManager = exports.settingsWindow = exports.petWindow = void 0;
exports.openSettingsWindow = openSettingsWindow;
// ============================================================
// Mochi – Electron Main Process Entry Point
// ============================================================
const electron_1 = require("electron");
const path = __importStar(require("path"));
const SettingsManager_1 = require("./managers/SettingsManager");
const LocalPetRepository_1 = require("./managers/LocalPetRepository");
const SystemTrayManager_1 = require("./managers/SystemTrayManager");
const DesktopOverlayManager_1 = require("./managers/DesktopOverlayManager");
const UpdateManager_1 = require("./managers/UpdateManager");
const ShortcutManager_1 = require("./managers/ShortcutManager");
const handlers_1 = require("./ipc/handlers");
// ── Safe transparent window rendering on Windows
electron_1.app.disableHardwareAcceleration();
let petWindow = null;
exports.petWindow = petWindow;
let settingsWindow = null;
exports.settingsWindow = settingsWindow;
let onboardingWindow = null;
let settingsManager;
let petRepository;
let trayManager;
let overlayManager;
let updateManager;
let shortcutManager;
// ── Single instance lock
const gotLock = electron_1.app.requestSingleInstanceLock();
if (!gotLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        if (settingsWindow) {
            if (settingsWindow.isMinimized())
                settingsWindow.restore();
            settingsWindow.focus();
        }
        else {
            openSettingsWindow();
        }
    });
}
// ── App ready
electron_1.app.whenReady().then(async () => {
    // Initialize data managers
    exports.settingsManager = settingsManager = new SettingsManager_1.SettingsManager();
    exports.petRepository = petRepository = new LocalPetRepository_1.LocalPetRepository();
    const settings = settingsManager.getSettings();
    const petData = petRepository.getPetData();
    // Register IPC handlers
    (0, handlers_1.registerIpcHandlers)({ settingsManager, petRepository });
    // Create pet overlay window
    exports.petWindow = petWindow = createPetWindow();
    overlayManager = new DesktopOverlayManager_1.DesktopOverlayManager(petWindow, settingsManager);
    // Create tray
    trayManager = new SystemTrayManager_1.SystemTrayManager({
        petWindow,
        settingsManager,
        petRepository,
        openSettings: openSettingsWindow,
        onQuit: () => electron_1.app.quit(),
    });
    // Shortcut manager
    shortcutManager = new ShortcutManager_1.ShortcutManager(petWindow, settingsManager, openSettingsWindow);
    // Update manager
    updateManager = new UpdateManager_1.UpdateManager();
    // Handle startup
    if (settings.startWithWindows) {
        electron_1.app.setLoginItemSettings({ openAtLogin: true });
    }
    // Open Pet Room on launch so user has immediate interactive controls
    openSettingsWindow();
    // Power events
    electron_1.powerMonitor.on('suspend', () => {
        petWindow?.webContents.send('system:suspend');
    });
    electron_1.powerMonitor.on('resume', () => {
        petWindow?.webContents.send('system:resume');
    });
    // Display changes
    electron_1.screen.on('display-added', () => updateMonitors());
    electron_1.screen.on('display-removed', () => updateMonitors());
    electron_1.screen.on('display-metrics-changed', () => updateMonitors());
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            exports.petWindow = petWindow = createPetWindow();
        }
    });
});
// ── Pet overlay window
function createPetWindow() {
    const primaryDisplay = electron_1.screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const win = new electron_1.BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        movable: false,
        focusable: false,
        hasShadow: false,
        roundedCorners: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload/pet.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    win.setMenuBarVisibility(false);
    const indexHtml = path.join(__dirname, '../renderer/pet.html');
    win.loadFile(indexHtml);
    win.show();
    setInterval(() => {
        if (petWindow && !petWindow.isDestroyed()) {
            petWindow.moveTop();
        }
    }, 2000);
    return win;
}
// ── Settings window
function openSettingsWindow() {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return;
    }
    exports.settingsWindow = settingsWindow = new electron_1.BrowserWindow({
        width: 960,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        title: 'Mochi – Pet Room',
        frame: true,
        resizable: true,
        center: true,
        skipTaskbar: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload/settings.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    settingsWindow.setMenuBarVisibility(false);
    const settingsHtml = path.join(__dirname, '../renderer/settings.html');
    settingsWindow.loadFile(settingsHtml);
    settingsWindow.show();
    settingsWindow.focus();
    settingsWindow.on('closed', () => {
        exports.settingsWindow = settingsWindow = null;
    });
}
// ── Onboarding window
function openOnboardingWindow() {
    if (onboardingWindow && !onboardingWindow.isDestroyed()) {
        onboardingWindow.focus();
        return;
    }
    onboardingWindow = new electron_1.BrowserWindow({
        width: 740,
        height: 600,
        title: 'Welcome to Mochi!',
        frame: true,
        resizable: true,
        center: true,
        skipTaskbar: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload/settings.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    const onboardHtml = path.join(__dirname, '../renderer/onboarding.html');
    onboardingWindow.loadFile(onboardHtml);
    onboardingWindow.setAlwaysOnTop(true);
    onboardingWindow.show();
    onboardingWindow.focus();
    electron_1.ipcMain.once('onboarding:complete', (_evt, data) => {
        // Save data from onboarding
        if (data?.petData)
            petRepository.updatePetData(data.petData);
        if (data?.settings)
            settingsManager.updateSettings(data.settings);
        settingsManager.updateSettings({ onboardingComplete: true });
        if (onboardingWindow && !onboardingWindow.isDestroyed()) {
            onboardingWindow.close();
        }
        onboardingWindow = null;
    });
    onboardingWindow.on('closed', () => {
        onboardingWindow = null;
    });
}
// ── App lifecycle
electron_1.app.on('window-all-closed', () => {
    // On macOS keep app alive; on Windows quit
    if (process.platform !== 'darwin') {
        // Don't quit — we have a tray
    }
});
electron_1.app.on('will-quit', () => {
    electron_1.globalShortcut.unregisterAll();
    shortcutManager?.dispose();
});
electron_1.app.on('before-quit', () => {
    trayManager?.destroy();
});
function updateMonitors() {
    const monitors = electron_1.screen.getAllDisplays().map((d) => ({
        id: d.id,
        bounds: d.bounds,
        workArea: d.workArea,
        scaleFactor: d.scaleFactor,
        isPrimary: d.id === electron_1.screen.getPrimaryDisplay().id,
    }));
    petWindow?.webContents.send('system:monitors', monitors);
    // Resize overlay to cover primary
    const primary = electron_1.screen.getPrimaryDisplay();
    petWindow?.setBounds(primary.workArea);
}
//# sourceMappingURL=index.js.map