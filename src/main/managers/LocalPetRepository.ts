// ============================================================
// Mochi – Local Pet Repository (Main Process)
// ============================================================
import ElectronStore from 'electron-store';
import { PetData } from '../../shared/types';
import {
  DEFAULT_APPEARANCE,
  DEFAULT_EMOTIONS,
  DEFAULT_PERSONALITY,
  DEFAULT_VITALS,
  STATE_DATA_VERSION,
} from '../../shared/constants';
import * as crypto from 'crypto';

function createDefaultPetData(): PetData {
  return {
    petId: crypto.randomUUID ? crypto.randomUUID() : 'mochi-' + Date.now(),
    name: 'Mochi',
    appearance: { ...DEFAULT_APPEARANCE },
    personality: { ...DEFAULT_PERSONALITY },
    emotions: { ...DEFAULT_EMOTIONS },
    vitals: { ...DEFAULT_VITALS },
    favoriteRestPosition: { x: 0.8, y: 0.8 },
    lastSeen: new Date().toISOString(),
    totalPlaytimeMs: 0,
    totalPetCount: 0,
    totalTreatsGiven: 0,
    preferredToys: ['yarn_ball', 'laser_dot'],
    trustLevel: 50,
    version: STATE_DATA_VERSION,
  };
}

export class LocalPetRepository {
  private store: ElectronStore<{ petData: PetData }>;

  constructor() {
    this.store = new ElectronStore<{ petData: PetData }>({
      name: 'mochi-petdata',
      defaults: { petData: createDefaultPetData() },
    });
    this.migrate();
  }

  private migrate(): void {
    const data = this.store.get('petData') as PetData;
    if (!data.version || data.version < STATE_DATA_VERSION) {
      const migrated = { ...createDefaultPetData(), ...data, version: STATE_DATA_VERSION };
      this.store.set('petData', migrated);
    }
  }

  getPetData(): PetData {
    return this.store.get('petData') as PetData;
  }

  updatePetData(partial: Partial<PetData>): PetData {
    const current = this.getPetData();
    const updated: PetData = {
      ...current,
      ...partial,
      lastSeen: new Date().toISOString(),
    };
    // Clamp emotion values
    if (updated.emotions) {
      const e = updated.emotions;
      for (const key of Object.keys(e) as (keyof typeof e)[]) {
        e[key] = Math.max(0, Math.min(100, e[key]));
      }
    }
    this.store.set('petData', updated);
    return updated;
  }

  resetPetData(): PetData {
    const fresh = createDefaultPetData();
    this.store.set('petData', fresh);
    return fresh;
  }

  /** Increment playtime and pet count etc. */
  recordSession(durationMs: number, petCount: number, treatCount: number): void {
    const data = this.getPetData();
    this.updatePetData({
      totalPlaytimeMs: data.totalPlaytimeMs + durationMs,
      totalPetCount: data.totalPetCount + petCount,
      totalTreatsGiven: data.totalTreatsGiven + treatCount,
      trustLevel: Math.min(100, data.trustLevel + petCount * 0.1 + treatCount * 0.5),
    });
  }
}
