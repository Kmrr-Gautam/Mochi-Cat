// ============================================================
// Mochi – Electron Main Process Entry Point
// ============================================================
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  screen,
  globalShortcut,
  powerMonitor,
  shell,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { SettingsManager } from './managers/SettingsManager';
import { LocalPetRepository } from './managers/LocalPetRepository';
import { SystemTrayManager } from './managers/SystemTrayManager';
import { DesktopOverlayManager } from './managers/DesktopOverlayManager';
import { UpdateManager } from './managers/UpdateManager';
import { ShortcutManager } from './managers/ShortcutManager';
import { registerIpcHandlers } from './ipc/handlers';

// ── Safe transparent window rendering on Windows
app.disableHardwareAcceleration();

let petWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let onboardingWindow: BrowserWindow | null = null;

let settingsManager: SettingsManager;
let petRepository: LocalPetRepository;
let trayManager: SystemTrayManager;
let overlayManager: DesktopOverlayManager;
let updateManager: UpdateManager;
let shortcutManager: ShortcutManager;

// ── Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (settingsWindow) {
      if (settingsWindow.isMinimized()) settingsWindow.restore();
      settingsWindow.focus();
    } else {
      openSettingsWindow();
    }
  });
}

// ── App ready
app.whenReady().then(async () => {
  // Initialize data managers
  settingsManager = new SettingsManager();
  petRepository = new LocalPetRepository();

  const settings = settingsManager.getSettings();
  const petData = petRepository.getPetData();

  // Register IPC handlers
  registerIpcHandlers({ settingsManager, petRepository });

  // Create pet overlay window
  petWindow = createPetWindow();
  overlayManager = new DesktopOverlayManager(petWindow, settingsManager);

  // Create tray
  trayManager = new SystemTrayManager({
    petWindow,
    settingsManager,
    petRepository,
    openSettings: openSettingsWindow,
    onQuit: () => app.quit(),
  });

  // Shortcut manager
  shortcutManager = new ShortcutManager(petWindow, settingsManager, openSettingsWindow);

  // Update manager
  updateManager = new UpdateManager();

  // Handle startup
  if (settings.startWithWindows) {
    app.setLoginItemSettings({ openAtLogin: true });
  }

  // Open Pet Room on launch so user has immediate interactive controls
  openSettingsWindow();

  // Power events
  powerMonitor.on('suspend', () => {
    petWindow?.webContents.send('system:suspend');
  });

  powerMonitor.on('resume', () => {
    petWindow?.webContents.send('system:resume');
  });

  // Display changes
  screen.on('display-added', () => updateMonitors());
  screen.on('display-removed', () => updateMonitors());
  screen.on('display-metrics-changed', () => updateMonitors());

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      petWindow = createPetWindow();
    }
  });
});

// ── Pet overlay window
function createPetWindow(): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
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
export function openSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
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
    settingsWindow = null;
  });
}

// ── Onboarding window
function openOnboardingWindow(): void {
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    onboardingWindow.focus();
    return;
  }

  onboardingWindow = new BrowserWindow({
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

  ipcMain.once('onboarding:complete', (_evt, data) => {
    // Save data from onboarding
    if (data?.petData) petRepository.updatePetData(data.petData);
    if (data?.settings) settingsManager.updateSettings(data.settings);
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
app.on('window-all-closed', () => {
  // On macOS keep app alive; on Windows quit
  if (process.platform !== 'darwin') {
    // Don't quit — we have a tray
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  shortcutManager?.dispose();
});

app.on('before-quit', () => {
  trayManager?.destroy();
});

function updateMonitors(): void {
  const monitors = screen.getAllDisplays().map((d) => ({
    id: d.id,
    bounds: d.bounds,
    workArea: d.workArea,
    scaleFactor: d.scaleFactor,
    isPrimary: d.id === screen.getPrimaryDisplay().id,
  }));
  petWindow?.webContents.send('system:monitors', monitors);
  // Resize overlay to cover primary
  const primary = screen.getPrimaryDisplay();
  petWindow?.setBounds(primary.workArea);
}

export { petWindow, settingsWindow, settingsManager, petRepository };
