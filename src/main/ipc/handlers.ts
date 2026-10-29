// ============================================================
// Mochi – IPC Handlers (Main Process)
// ============================================================
import { ipcMain, screen, app, BrowserWindow } from 'electron';
import { SettingsManager } from '../managers/SettingsManager';
import { LocalPetRepository } from '../managers/LocalPetRepository';
import { IPC } from '../../shared/ipc-channels';
import type { AppSettings, PetData } from '../../shared/types';

interface HandlerDeps {
  settingsManager: SettingsManager;
  petRepository: LocalPetRepository;
}

// Validate that a value is a plain object
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function registerIpcHandlers({ settingsManager, petRepository }: HandlerDeps): void {
  // ── Settings
  ipcMain.handle(IPC.SETTINGS_GET, () => {
    return settingsManager.getSettings();
  });

  ipcMain.handle(IPC.SETTINGS_SET, (_evt, partial: unknown) => {
    if (!isPlainObject(partial)) return { error: 'Invalid payload' };
    const updated = settingsManager.updateSettings(partial as Partial<AppSettings>);
    // Broadcast to all windows
    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send(IPC.SETTINGS_CHANGED, updated);
    });
    return updated;
  });

  // ── Pet data
  ipcMain.handle(IPC.PETDATA_GET, () => {
    return petRepository.getPetData();
  });

  ipcMain.handle(IPC.PETDATA_SET, (_evt, partial: unknown) => {
    if (!isPlainObject(partial)) return { error: 'Invalid payload' };
    return petRepository.updatePetData(partial as Partial<PetData>);
  });

  ipcMain.handle(IPC.PETDATA_RESET, () => {
    return petRepository.resetPetData();
  });

  // ── System info
  ipcMain.handle(IPC.SYSTEM_MONITORS, () => {
    return screen.getAllDisplays().map((d) => ({
      id: d.id,
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
      isPrimary: d.id === screen.getPrimaryDisplay().id,
    }));
  });

  ipcMain.handle(IPC.SYSTEM_CURSOR_POS, () => {
    return screen.getCursorScreenPoint();
  });

  ipcMain.handle(IPC.SYSTEM_IDLE_TIME, () => {
    const { powerMonitor } = require('electron');
    return powerMonitor.getSystemIdleTime();
  });
}
