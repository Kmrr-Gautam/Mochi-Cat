"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================
// Mochi – Preload Script for Pet Renderer
// ============================================================
const electron_1 = require("electron");
// Whitelist of channels the renderer can send TO main
const VALID_INVOKE_CHANNELS = [
    'settings:get',
    'settings:set',
    'petdata:get',
    'petdata:set',
    'petdata:reset',
    'system:monitors',
    'system:cursor-pos',
    'system:idle-time',
    'pet:spawn-toy',
    'pet:summon-treat',
    'pet:pet-action',
    'pet:recover',
];
// Whitelist of channels the renderer can LISTEN on
const VALID_ON_CHANNELS = [
    'settings:changed',
    'pet:spawn-toy',
    'pet:summon-treat',
    'pet:pet-action',
    'app:hide-pet',
    'app:show-pet',
    'app:toggle-click-through',
    'app:toggle-sound',
    'app:work-mode',
    'app:focus-mode',
    'system:suspend',
    'system:resume',
    'system:monitors',
    'pet:pause',
    'pet:recover',
];
electron_1.contextBridge.exposeInMainWorld('mochiAPI', {
    invoke: (channel, ...args) => {
        if (!VALID_INVOKE_CHANNELS.includes(channel)) {
            console.warn(`[Preload] Blocked or unknown invoke channel: ${channel}`);
        }
        return electron_1.ipcRenderer.invoke(channel, ...args);
    },
    on: (channel, listener) => {
        if (!VALID_ON_CHANNELS.includes(channel)) {
            console.warn(`[Preload] Blocked or unknown on channel: ${channel}`);
        }
        const wrapped = (_evt, ...args) => listener(...args);
        electron_1.ipcRenderer.on(channel, wrapped);
        return () => electron_1.ipcRenderer.removeListener(channel, wrapped);
    },
    once: (channel, listener) => {
        electron_1.ipcRenderer.once(channel, (_evt, ...args) => listener(...args));
    },
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
});
//# sourceMappingURL=pet.js.map