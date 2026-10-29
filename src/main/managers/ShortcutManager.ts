// ============================================================
// Mochi – Shortcut Manager
// ============================================================
import { globalShortcut, BrowserWindow } from 'electron';
import { SettingsManager } from './SettingsManager';
import { IPC } from '../../shared/ipc-channels';

export class ShortcutManager {
  private petWindow: BrowserWindow;
  private settings: SettingsManager;
  private openSettings: () => void;

  constructor(petWindow: BrowserWindow, settings: SettingsManager, openSettings: () => void) {
    this.petWindow = petWindow;
    this.settings = settings;
    this.openSettings = openSettings;
    this.register();
  }

  private register(): void {
    // Toggle visibility
    this.tryRegister('Ctrl+Shift+M', () => {
      this.petWindow.webContents.send(IPC.APP_HIDE_PET);
    });

    // Toggle click-through
    this.tryRegister('Ctrl+Shift+C', () => {
      this.petWindow.webContents.send(IPC.APP_TOGGLE_CLICK_THROUGH);
    });

    // Open settings
    this.tryRegister('Ctrl+Shift+P', () => {
      this.openSettings();
    });
  }

  private tryRegister(accelerator: string, callback: () => void): void {
    try {
      globalShortcut.register(accelerator, callback);
    } catch (e) {
      console.warn(`[ShortcutManager] Could not register ${accelerator}:`, e);
    }
  }

  dispose(): void {
    globalShortcut.unregisterAll();
  }
}
