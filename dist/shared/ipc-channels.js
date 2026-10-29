"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC = void 0;
// ============================================================
// Mochi – IPC Channel constants
// ============================================================
exports.IPC = {
    PET_STATE_UPDATE: 'pet:state-update',
    PET_DATA_UPDATE: 'pet:data-update',
    PET_SPAWN_TOY: 'pet:spawn-toy',
    PET_SUMMON_TREAT: 'pet:summon-treat',
    PET_ACTION: 'pet:pet-action',
    SETTINGS_GET: 'settings:get',
    SETTINGS_SET: 'settings:set',
    SETTINGS_CHANGED: 'settings:changed',
    PETDATA_GET: 'petdata:get',
    PETDATA_SET: 'petdata:set',
    PETDATA_RESET: 'petdata:reset',
    SYSTEM_MONITORS: 'system:monitors',
    SYSTEM_WINDOWS: 'system:windows',
    SYSTEM_CURSOR_POS: 'system:cursor-pos',
    SYSTEM_IDLE_TIME: 'system:idle-time',
    APP_SHOW_SETTINGS: 'app:show-settings',
    APP_HIDE_PET: 'app:hide-pet',
    APP_SHOW_PET: 'app:show-pet',
    APP_TOGGLE_CLICK_THROUGH: 'app:toggle-click-through',
    APP_TOGGLE_SOUND: 'app:toggle-sound',
    APP_WORK_MODE: 'app:work-mode',
    APP_FOCUS_MODE: 'app:focus-mode',
    APP_QUIT: 'app:quit',
    ONBOARDING_COMPLETE: 'onboarding:complete',
};
//# sourceMappingURL=ipc-channels.js.map