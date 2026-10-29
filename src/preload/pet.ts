// ============================================================
// Mochi – Preload Script for Pet Renderer
// ============================================================
import { contextBridge, ipcRenderer } from 'electron';

// Whitelist of channels the renderer can send TO main
const VALID_INVOKE_CHANNELS: string[] = [
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
const VALID_ON_CHANNELS: string[] = [
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

contextBridge.exposeInMainWorld('mochiAPI', {
  invoke: (channel: string, ...args: unknown[]) => {
    if (!VALID_INVOKE_CHANNELS.includes(channel)) {
      console.warn(`[Preload] Blocked or unknown invoke channel: ${channel}`);
    }
    return ipcRenderer.invoke(channel, ...args);
  },
  on: (channel: string, listener: (...args: unknown[]) => void) => {
    if (!VALID_ON_CHANNELS.includes(channel)) {
      console.warn(`[Preload] Blocked or unknown on channel: ${channel}`);
    }
    const wrapped = (_evt: Electron.IpcRendererEvent, ...args: unknown[]) => listener(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
  once: (channel: string, listener: (...args: unknown[]) => void) => {
    ipcRenderer.once(channel, (_evt, ...args) => listener(...args));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
