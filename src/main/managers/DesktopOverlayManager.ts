// ============================================================
// Mochi – Desktop Overlay Manager
// ============================================================
import { BrowserWindow, screen } from 'electron';
import { SettingsManager } from './SettingsManager';

export class DesktopOverlayManager {
  private win: BrowserWindow;
  private settings: SettingsManager;

  constructor(win: BrowserWindow, settings: SettingsManager) {
    this.win = win;
    this.settings = settings;
    this.applySettings();
    this.setupDisplayListener();
  }

  applySettings(): void {
    const s = this.settings.getSettings();
    if (s.clickThrough) {
      this.win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      this.win.setIgnoreMouseEvents(false);
    }
    this.win.setAlwaysOnTop(s.alwaysOnTop, 'screen-saver');
    this.coverPrimaryDisplay();
  }

  coverPrimaryDisplay(): void {
    const primary = screen.getPrimaryDisplay();
    const { x, y, width, height } = primary.workArea;
    this.win.setBounds({ x, y, width, height });
  }

  private setupDisplayListener(): void {
    screen.on('display-metrics-changed', () => this.coverPrimaryDisplay());
    screen.on('display-added', () => this.coverPrimaryDisplay());
    screen.on('display-removed', () => this.coverPrimaryDisplay());
  }

  setClickThrough(enabled: boolean): void {
    if (enabled) {
      this.win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      this.win.setIgnoreMouseEvents(false);
    }
  }
}
