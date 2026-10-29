// ============================================================
// Mochi – Sound Manager
// ============================================================
import type { AppSettings } from '../shared/types';

type SoundKey =
  | 'meow_happy'
  | 'meow_sad'
  | 'meow_startled'
  | 'meow_confused'
  | 'purr'
  | 'hiss'
  | 'yawn'
  | 'sniff'
  | 'eat'
  | 'jump'
  | 'run'
  | 'sleep_breathe';

interface SoundEntry {
  audio: HTMLAudioElement | null;
  cooldown: number;
  lastPlayed: number;
  volume: number;
}

export class SoundManager {
  private sounds: Map<SoundKey, SoundEntry> = new Map();
  private settings: AppSettings;
  private audioCtx: AudioContext | null = null;

  constructor(settings: AppSettings) {
    this.settings = settings;
    this.registerSounds();
  }

  private registerSounds(): void {
    // Register all sounds with cooldowns (ms)
    const defs: [SoundKey, number, number][] = [
      ['meow_happy', 2000, 0.6],
      ['meow_sad', 3000, 0.5],
      ['meow_startled', 1500, 0.7],
      ['meow_confused', 2000, 0.5],
      ['purr', 500, 0.4],
      ['hiss', 3000, 0.6],
      ['yawn', 5000, 0.5],
      ['sniff', 1000, 0.3],
      ['eat', 1000, 0.5],
      ['jump', 500, 0.4],
      ['run', 200, 0.2],
      ['sleep_breathe', 3000, 0.2],
    ];

    for (const [key, cooldown, volume] of defs) {
      this.sounds.set(key, {
        audio: this.loadAudio(key),
        cooldown,
        lastPlayed: 0,
        volume,
      });
    }
  }

  private loadAudio(key: SoundKey): HTMLAudioElement | null {
    try {
      const audio = new Audio(`./assets/sounds/${key}.mp3`);
      audio.preload = 'auto';
      return audio;
    } catch {
      return null;
    }
  }

  play(key: SoundKey): void {
    if (!this.settings.soundEnabled) return;
    const entry = this.sounds.get(key);
    if (!entry) return;

    const now = Date.now();
    if (now - entry.lastPlayed < entry.cooldown) return;

    if (entry.audio) {
      try {
        entry.audio.volume = entry.volume * this.settings.soundVolume;
        entry.audio.currentTime = 0;
        entry.audio.play().catch(() => {
          // Silently ignore autoplay restrictions
        });
        entry.lastPlayed = now;
      } catch {
        // ignore
      }
    } else {
      // Synthesize a simple tone as fallback
      this.synthesizeTone(key);
      entry.lastPlayed = now;
    }
  }

  private synthesizeTone(key: SoundKey): void {
    if (!this.settings.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const vol = 0.08 * this.settings.soundVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);

      switch (key) {
        case 'meow_happy':
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
          osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
          break;
        case 'meow_sad':
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.6);
          break;
        case 'purr':
          osc.frequency.setValueAtTime(30, ctx.currentTime);
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
          break;
        default:
          osc.frequency.setValueAtTime(700, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio context not available
    }
  }

  applySettings(settings: AppSettings): void {
    this.settings = settings;
  }

  stopAll(): void {
    for (const entry of this.sounds.values()) {
      entry.audio?.pause();
    }
  }
}
