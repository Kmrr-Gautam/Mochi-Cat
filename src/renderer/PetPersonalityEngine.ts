// ============================================================
// Mochi – Personality Engine
// ============================================================
import type { PersonalityConfig } from '../shared/types';
import { PERSONALITY_PRESETS } from '../shared/constants';

export class PetPersonalityEngine {
  private config: PersonalityConfig;

  constructor(initial: PersonalityConfig) {
    this.config = { ...initial };
  }

  getConfig(): PersonalityConfig {
    return { ...this.config };
  }

  applyPreset(preset: PersonalityConfig['preset']): void {
    this.config = { ...PERSONALITY_PRESETS[preset] };
  }

  update(partial: Partial<PersonalityConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  /** Weighted chance helper for personality-influenced decisions */
  chance(base: number, multiplierKey: keyof PersonalityConfig): boolean {
    const mult = this.config[multiplierKey] as number;
    return Math.random() < base * mult;
  }
}
