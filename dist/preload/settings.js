"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================================
// Mochi – Preload Script for Settings / Onboarding Windows
// ============================================================
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('mochiAPI', {
    invoke: (channel, ...args) => {
        return electron_1.ipcRenderer.invoke(channel, ...args);
    },
    send: (channel, ...args) => {
        electron_1.ipcRenderer.send(channel, ...args);
    },
    on: (channel, listener) => {
        const wrapped = (_evt, ...args) => listener(...args);
        electron_1.ipcRenderer.on(channel, wrapped);
        return () => electron_1.ipcRenderer.removeListener(channel, wrapped);
    },
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
});
//# sourceMappingURL=settings.js.map