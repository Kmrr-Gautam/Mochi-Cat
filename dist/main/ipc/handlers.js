"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
// ============================================================
// Mochi – IPC Handlers (Main Process)
// ============================================================
const electron_1 = require("electron");
const ipc_channels_1 = require("../../shared/ipc-channels");
// Validate that a value is a plain object
function isPlainObject(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function registerIpcHandlers({ settingsManager, petRepository }) {
    // ── Settings
    electron_1.ipcMain.handle(ipc_channels_1.IPC.SETTINGS_GET, () => {
        return settingsManager.getSettings();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC.SETTINGS_SET, (_evt, partial) => {
        if (!isPlainObject(partial))
            return { error: 'Invalid payload' };
        const updated = settingsManager.updateSettings(partial);
        // Broadcast to all windows
        electron_1.BrowserWindow.getAllWindows().forEach((w) => {
            w.webContents.send(ipc_channels_1.IPC.SETTINGS_CHANGED, updated);
        });
        return updated;
    });
    // ── Pet data
    electron_1.ipcMain.handle(ipc_channels_1.IPC.PETDATA_GET, () => {
        return petRepository.getPetData();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC.PETDATA_SET, (_evt, partial) => {
        if (!isPlainObject(partial))
            return { error: 'Invalid payload' };
        return petRepository.updatePetData(partial);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC.PETDATA_RESET, () => {
        return petRepository.resetPetData();
    });
    // ── System info
    electron_1.ipcMain.handle(ipc_channels_1.IPC.SYSTEM_MONITORS, () => {
        return electron_1.screen.getAllDisplays().map((d) => ({
            id: d.id,
            bounds: d.bounds,
            workArea: d.workArea,
            scaleFactor: d.scaleFactor,
            isPrimary: d.id === electron_1.screen.getPrimaryDisplay().id,
        }));
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC.SYSTEM_CURSOR_POS, () => {
        return electron_1.screen.getCursorScreenPoint();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC.SYSTEM_IDLE_TIME, () => {
        const { powerMonitor } = require('electron');
        return powerMonitor.getSystemIdleTime();
    });
}
//# sourceMappingURL=handlers.js.map