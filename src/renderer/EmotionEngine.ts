// ============================================================
// Mochi – Emotion Engine
// ============================================================
import type { EmotionState, VitalStats } from '../shared/types';

export class EmotionEngine {
  private emotions: EmotionState;
  private vitals: VitalStats;
  private decayTimer = 0;

  constructor(initialEmotions: EmotionState, initialVitals: VitalStats) {
    this.emotions = { ...initialEmotions };
    this.vitals = { ...initialVitals };
  }

  getState(): EmotionState {
    return { ...this.emotions };
  }

  getVitals(): VitalStats {
    return { ...this.vitals };
  }

  modify(partial: Partial<EmotionState>): void {
    for (const key of Object.keys(partial) as (keyof EmotionState)[]) {
      if (partial[key] !== undefined) {
        this.emotions[key] = Math.max(0, Math.min(100, this.emotions[key] + partial[key]!));
      }
    }
  }

  modifyVitals(partial: Partial<VitalStats>): void {
    for (const key of Object.keys(partial) as (keyof VitalStats)[]) {
      if (partial[key] !== undefined) {
        this.vitals[key] = Math.max(0, Math.min(100, this.vitals[key] + partial[key]!));
      }
    }
  }

  // Called every frame
  update(delta: number): void {
    const dt = delta / 60;
    this.decayTimer += dt;

    // Slow natural decay / recovery every 5 seconds
    if (this.decayTimer >= 5) {
      this.decayTimer = 0;
      this.naturalDecay();
    }
  }

  private naturalDecay(): void {
    // Emotions decay toward neutral over time
    this.nudge('fear', 0, 3);
    this.nudge('annoyance', 0, 2);
    this.nudge('sadness', 0, 2);
    this.nudge('excitement', 50, 2);
    this.nudge('happiness', 65, 1);
    this.nudge('curiosity', 55, 1);
    this.nudge('sleepiness', 50, 0.5);
    // Trust and affection decay very slowly toward 50
    this.nudge('trust', 50, 0.1);
    this.nudge('affection', 50, 0.1);

    // Energy slowly recovers when resting
    this.vitals.energy = Math.min(100, this.vitals.energy + 0.5);
    this.vitals.treatInterest = Math.min(100, this.vitals.treatInterest + 0.3);
  }

  private nudge(key: keyof EmotionState, target: number, rate: number): void {
    const current = this.emotions[key];
    if (current > target) {
      this.emotions[key] = Math.max(target, current - rate);
    } else if (current < target) {
      this.emotions[key] = Math.min(target, current + rate);
    }
  }

  /** React to being petted gently */
  onGentlePet(): void {
    this.modify({
      happiness: 8,
      affection: 10,
      trust: 3,
      fear: -10,
      annoyance: -5,
      sadness: -8,
    });
    this.modifyVitals({ comfort: 5 });
  }

  /** React to rough interaction */
  onRoughInteraction(): void {
    this.modify({
      fear: 15,
      annoyance: 20,
      happiness: -10,
      trust: -5,
    });
  }

  /** React to receiving a treat */
  onTreat(): void {
    this.modify({
      happiness: 15,
      excitement: 10,
      trust: 5,
    });
    this.modifyVitals({ treatInterest: -30, comfort: 8 });
  }

  /** React to playing with toy */
  onToyPlay(): void {
    this.modify({
      excitement: 15,
      happiness: 8,
      curiosity: 5,
    });
    this.modifyVitals({ energy: -8, playfulness: -5 });
  }

  /** React to sleeping */
  onSleep(): void {
    this.modify({ sleepiness: -40 });
    this.modifyVitals({ energy: 20 });
  }

  /** Dominant emotion for animation hints */
  getDominantEmotion(): keyof EmotionState {
    const e = this.emotions;
    const entries = Object.entries(e) as [keyof EmotionState, number][];
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }

  syncFromData(emotions: EmotionState, vitals: VitalStats): void {
    this.emotions = { ...emotions };
    this.vitals = { ...vitals };
  }
}
