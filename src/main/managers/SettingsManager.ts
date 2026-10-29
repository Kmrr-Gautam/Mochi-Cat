// ============================================================
// Mochi – Settings Manager (Main Process)
// ============================================================
import ElectronStore from 'electron-store';
import { AppSettings } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';

const schema = {
  settings: { type: 'object' },
} as const;

export class SettingsManager {
  private store: ElectronStore<{ settings: AppSettings }>;

  constructor() {
    this.store = new ElectronStore<{ settings: AppSettings }>({
      name: 'mochi-settings',
      defaults: { settings: DEFAULT_SETTINGS },
    });
  }

  getSettings(): AppSettings {
    const stored = this.store.get('settings') as AppSettings;
    // Merge with defaults to handle new keys added in updates
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  updateSettings(partial: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    // Validate ranges
    updated.soundVolume = Math.max(0, Math.min(1, updated.soundVolume));
    updated.petScale = Math.max(0.5, Math.min(2.0, updated.petScale));
    this.store.set('settings', updated);
    return updated;
  }

  resetSettings(): AppSettings {
    const reset = { ...DEFAULT_SETTINGS, onboardingComplete: true };
    this.store.set('settings', reset);
    return reset;
  }
}
