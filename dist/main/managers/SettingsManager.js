"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsManager = void 0;
// ============================================================
// Mochi – Settings Manager (Main Process)
// ============================================================
const electron_store_1 = __importDefault(require("electron-store"));
const constants_1 = require("../../shared/constants");
const schema = {
    settings: { type: 'object' },
};
class SettingsManager {
    store;
    constructor() {
        this.store = new electron_store_1.default({
            name: 'mochi-settings',
            defaults: { settings: constants_1.DEFAULT_SETTINGS },
        });
    }
    getSettings() {
        const stored = this.store.get('settings');
        // Merge with defaults to handle new keys added in updates
        return { ...constants_1.DEFAULT_SETTINGS, ...stored };
    }
    updateSettings(partial) {
        const current = this.getSettings();
        const updated = { ...current, ...partial };
        // Validate ranges
        updated.soundVolume = Math.max(0, Math.min(1, updated.soundVolume));
        updated.petScale = Math.max(0.5, Math.min(2.0, updated.petScale));
        this.store.set('settings', updated);
        return updated;
    }
    resetSettings() {
        const reset = { ...constants_1.DEFAULT_SETTINGS, onboardingComplete: true };
        this.store.set('settings', reset);
        return reset;
    }
}
exports.SettingsManager = SettingsManager;
//# sourceMappingURL=SettingsManager.js.map