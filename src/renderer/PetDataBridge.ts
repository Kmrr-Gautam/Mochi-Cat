// ============================================================
// Mochi – Pet Data Bridge (syncs renderer state → main process)
// ============================================================
import type { EmotionEngine } from './EmotionEngine';
import type { PetData } from '../shared/types';
import { IPC } from '../shared/ipc-channels';

export class PetDataBridge {
  private emotionEngine: EmotionEngine;
  private syncTimer = 0;
  private readonly SYNC_INTERVAL = 30; // sync every 30 seconds

  constructor(emotionEngine: EmotionEngine, initialData: PetData) {
    this.emotionEngine = emotionEngine;
  }

  sync(): void {
    this.syncTimer += 1 / 60;
    if (this.syncTimer >= this.SYNC_INTERVAL) {
      this.syncTimer = 0;
      this.pushData();
    }
  }

  private async pushData(): Promise<void> {
    const emotions = this.emotionEngine.getState();
    const vitals = this.emotionEngine.getVitals();
    try {
      await window.mochiAPI.invoke(IPC.PETDATA_SET, { emotions, vitals });
    } catch {
      // Main process unavailable, ignore
    }
  }
}
