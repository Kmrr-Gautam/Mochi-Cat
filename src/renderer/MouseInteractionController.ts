// ============================================================
// Mochi – Mouse Interaction Controller
// ============================================================
import type { SpriteAnimationController } from './SpriteAnimationController';
import type { EmotionEngine } from './EmotionEngine';
import type { SoundManager } from './SoundManager';
import type { AppSettings, PersonalityConfig } from '../shared/types';

interface CursorSample {
  x: number;
  y: number;
  t: number;
}

export class MouseInteractionController {
  private animCtrl: SpriteAnimationController;
  private emotionEngine: EmotionEngine;
  private soundManager: SoundManager;
  private settings: AppSettings;
  private personality: PersonalityConfig;

  private cursorPos = { x: -9999, y: -9999 };
  private cursorHistory: CursorSample[] = [];
  private lastClickTime = 0;
  private rapidClickCount = 0;
  private roughInteractionTimer = 0;
  private petStreak = 0;
  private lastPetTime = 0;
  private isBeingPetted = false;

  // Interaction tracking
  private sessionPetCount = 0;
  private sessionTreatCount = 0;

  constructor(
    animCtrl: SpriteAnimationController,
    emotionEngine: EmotionEngine,
    soundManager: SoundManager,
    settings: AppSettings,
    personality: PersonalityConfig
  ) {
    this.animCtrl = animCtrl;
    this.emotionEngine = emotionEngine;
    this.soundManager = soundManager;
    this.settings = settings;
    this.personality = personality;

    this.setupMouseListeners();
  }

  applySettings(settings: AppSettings): void {
    this.settings = settings;
  }

  private setupMouseListeners(): void {
    document.addEventListener('mousemove', (e) => {
      if (!this.settings.cursorTracking) return;
      this.cursorPos = { x: e.clientX, y: e.clientY };
      this.cursorHistory.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      if (this.cursorHistory.length > 30) this.cursorHistory.shift();
    });

    document.addEventListener('mousedown', (e) => {
      if (this.isOverPet(e.clientX, e.clientY)) {
        this.onPetClick(e.clientX, e.clientY, e.button);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (e.buttons === 1 && this.isOverPet(e.clientX, e.clientY)) {
        this.onPetStroke(e.clientX, e.clientY, e.movementX, e.movementY);
      }
    });

    document.addEventListener('mouseup', () => {
      this.isBeingPetted = false;
    });
  }

  private isOverPet(x: number, y: number): boolean {
    const bounds = this.animCtrl.bounds;
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  private onPetClick(x: number, y: number, button: number): void {
    const now = Date.now();
    if (now - this.lastClickTime < 400) {
      this.rapidClickCount++;
    } else {
      this.rapidClickCount = 0;
    }
    this.lastClickTime = now;

    // Rapid clicking = rough interaction
    if (this.rapidClickCount >= 3 && this.settings.roughInteractionResponse) {
      this.onRoughInteraction();
      return;
    }

    // Normal click on cat = acknowledge
    this.soundManager.play('meow_happy');
    this.emotionEngine.modify({ happiness: 3, curiosity: 5 });
  }

  private onPetStroke(x: number, y: number, dx: number, dy: number): void {
    const speed = Math.sqrt(dx * dx + dy * dy);
    const now = Date.now();

    // Gentle stroke
    if (speed < 15) {
      this.isBeingPetted = true;
      if (now - this.lastPetTime > 100) {
        this.lastPetTime = now;
        this.petStreak++;
        this.sessionPetCount++;
        this.emotionEngine.onGentlePet();

        if (this.petStreak > 5) {
          this.animCtrl.setAnimation('pet_reaction');
          if (Math.random() < 0.3) {
            this.soundManager.play('purr');
          }
        }
        if (this.petStreak > 15) {
          this.animCtrl.showHeartEmote(true);
          this.soundManager.play('purr');
        }
      }
    } else if (speed > 40) {
      // Fast movement over pet = rough
      this.roughInteractionTimer += 0.1;
      if (this.roughInteractionTimer > 0.5 && this.settings.roughInteractionResponse) {
        this.onRoughInteraction();
        this.roughInteractionTimer = 0;
      }
    }
  }

  private onRoughInteraction(): void {
    this.emotionEngine.onRoughInteraction();
    this.soundManager.play('meow_startled');
    this.animCtrl.setAnimation('startle');
    this.petStreak = 0;
    this.rapidClickCount = 0;
    this.roughInteractionTimer = 0;

    // Will transition to sad if annoyance is high
    if (this.emotionEngine.getState().annoyance > 60 && this.settings.cryingEnabled) {
      setTimeout(() => {
        this.animCtrl.setAnimation('cry');
        this.animCtrl.showTears(true);
      }, 1000);
    }
  }

  update(): void {
    if (!this.settings.cursorTracking) return;

    const { x, y } = this.cursorPos;
    const petX = this.animCtrl.getX();
    const petY = this.animCtrl.getY();

    const dist = Math.sqrt((x - petX) ** 2 + (y - petY) ** 2);

    // Eye tracking toward cursor within reasonable distance
    if (dist < 300) {
      const dx = (x - petX) / 300;
      const dy = (y - petY) / 300;
      this.animCtrl.setEyeGaze(dx * 0.5, dy * 0.3);
      // Head tilt toward cursor
      this.animCtrl.setHeadTilt(dx * 0.15);
    } else {
      // Reset gaze
      this.animCtrl.setEyeGaze(0, 0);
    }

    // Cool down rapid click
    if (this.rapidClickCount > 0 && Date.now() - this.lastClickTime > 1000) {
      this.rapidClickCount = 0;
    }
    // Pet streak decay
    if (!this.isBeingPetted && Date.now() - this.lastPetTime > 2000) {
      this.petStreak = Math.max(0, this.petStreak - 1);
    }
  }

  getCursorPosition(): { x: number; y: number } {
    return this.cursorPos;
  }

  isCursorNearby(): boolean {
    const { x, y } = this.cursorPos;
    const petX = this.animCtrl.getX();
    const petY = this.animCtrl.getY();
    return Math.sqrt((x - petX) ** 2 + (y - petY) ** 2) < 200;
  }

  getCursorVelocity(): { vx: number; vy: number } {
    if (this.cursorHistory.length < 5) return { vx: 0, vy: 0 };
    const recent = this.cursorHistory.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt === 0) return { vx: 0, vy: 0 };
    return {
      vx: (last.x - first.x) / dt,
      vy: (last.y - first.y) / dt,
    };
  }

  getSessionStats(): { petCount: number; treatCount: number } {
    return { petCount: this.sessionPetCount, treatCount: this.sessionTreatCount };
  }

  recordTreat(): void {
    this.sessionTreatCount++;
  }
}
