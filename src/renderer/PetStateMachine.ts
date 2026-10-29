// ============================================================
// Mochi – Pet State Machine (Behavior Brain)
// ============================================================
import type { PetState, AnimationKey } from '../shared/types';
import type { AppSettings } from '../shared/types';
import type { SpriteAnimationController } from './SpriteAnimationController';
import type { EmotionEngine } from './EmotionEngine';
import type { MovementController } from './MovementController';
import type { MouseInteractionController } from './MouseInteractionController';
import type { ToyPhysicsEngine } from './ToyPhysicsEngine';
import type { SoundManager } from './SoundManager';
import type { PetPersonalityEngine } from './PetPersonalityEngine';
import type { DesktopBoundsManager } from './DesktopBoundsManager';

interface StateMachineDeps {
  animCtrl: SpriteAnimationController;
  emotionEngine: EmotionEngine;
  movementCtrl: MovementController;
  mouseCtrl: MouseInteractionController;
  toyEngine: ToyPhysicsEngine;
  soundManager: SoundManager;
  personalityEngine: PetPersonalityEngine;
  boundsManager: DesktopBoundsManager;
  settings: AppSettings;
}

interface StateConfig {
  state: PetState;
  animation: AnimationKey;
  minDuration: number;   // seconds
  maxDuration: number;
  interruptible: boolean;
  weight: number;        // base selection weight
}

// All states and their configs
const STATE_CONFIGS: StateConfig[] = [
  { state: 'idle',           animation: 'idle',         minDuration: 2,  maxDuration: 6,  interruptible: true,  weight: 15 },
  { state: 'sitting',        animation: 'sit',          minDuration: 3,  maxDuration: 12, interruptible: true,  weight: 12 },
  { state: 'lookingAround',  animation: 'sit_look',     minDuration: 2,  maxDuration: 5,  interruptible: true,  weight: 8  },
  { state: 'walking',        animation: 'walk_right',   minDuration: 2,  maxDuration: 8,  interruptible: true,  weight: 10 },
  { state: 'wandering',      animation: 'walk_right',   minDuration: 3,  maxDuration: 12, interruptible: true,  weight: 10 },
  { state: 'running',        animation: 'run_right',    minDuration: 1,  maxDuration: 3,  interruptible: true,  weight: 5  },
  { state: 'sneaking',       animation: 'sneak_right',  minDuration: 2,  maxDuration: 4,  interruptible: true,  weight: 4  },
  { state: 'grooming',       animation: 'groom',        minDuration: 3,  maxDuration: 8,  interruptible: true,  weight: 7  },
  { state: 'scratching',     animation: 'scratch',      minDuration: 2,  maxDuration: 4,  interruptible: true,  weight: 5  },
  { state: 'stretching',     animation: 'stretch',      minDuration: 2,  maxDuration: 3,  interruptible: false, weight: 6  },
  { state: 'sleeping',       animation: 'sleep_loop',   minDuration: 15, maxDuration: 60, interruptible: true,  weight: 8  },
  { state: 'sniffing',       animation: 'sniff',        minDuration: 2,  maxDuration: 4,  interruptible: true,  weight: 6  },
  { state: 'tailChasing',    animation: 'tail_chase',   minDuration: 3,  maxDuration: 8,  interruptible: true,  weight: 3  },
  { state: 'curious',        animation: 'sit_look',     minDuration: 2,  maxDuration: 5,  interruptible: true,  weight: 5  },
  { state: 'zoomies',        animation: 'zoomies',      minDuration: 4,  maxDuration: 10, interruptible: false, weight: 2  },
  { state: 'affectionate',   animation: 'affection_rub',minDuration: 3,  maxDuration: 6,  interruptible: true,  weight: 3  },
  { state: 'watchingCursor', animation: 'sit',          minDuration: 2,  maxDuration: 8,  interruptible: true,  weight: 5  },
  { state: 'hiding',         animation: 'sit',          minDuration: 5,  maxDuration: 15, interruptible: true,  weight: 1  },
  { state: 'attentionSeeking',animation:'wave_paw',     minDuration: 3,  maxDuration: 5,  interruptible: true,  weight: 3  },
  { state: 'restingByWindow',animation: 'sit',          minDuration: 5,  maxDuration: 20, interruptible: true,  weight: 4  },
];

const RARE_STATES: PetState[] = [
  'tailChasing', 'zoomies', 'attentionSeeking',
];

export class PetStateMachine {
  private deps: StateMachineDeps;
  private currentState: PetState = 'idle';
  private stateTimer = 0;
  private stateDuration = 3;
  private running = false;
  private workMode = false;
  private focusMode = false;
  private settings: AppSettings;

  // Cooldowns (seconds)
  private cooldowns: Partial<Record<PetState, number>> = {};

  // Movement targets
  private targetX = 0;
  private targetY = 0;
  private moveSpeed = 60; // px/sec

  // Sub-state for wandering
  private wanderPhase: 'move' | 'pause' | 'investigate' = 'pause';
  private wanderPauseTimer = 0;
  private distracted = false;

  // Jump arc
  private jumpY = 0;
  private jumpVy = 0;
  private isJumping = false;

  constructor(deps: StateMachineDeps) {
    this.deps = deps;
    this.settings = deps.settings;
  }

  start(): void {
    this.running = true;
    this.enterState('idle');
  }

  stop(): void {
    this.running = false;
  }

  applySettings(s: AppSettings): void {
    this.settings = s;
    if (s.focusMode) {
      this.setFocusMode(true);
    } else if (s.workMode) {
      this.setWorkMode(true);
    }
  }

  setWorkMode(enabled: boolean): void {
    this.workMode = enabled;
    this.focusMode = false;
    if (enabled && !['sitting', 'sleeping', 'idle'].includes(this.currentState)) {
      this.enterState('sitting');
    }
  }

  setFocusMode(enabled: boolean): void {
    this.focusMode = enabled;
    if (enabled) {
      this.enterState('sleeping');
    }
  }

  triggerTreat(): void {
    this.enterState('eatingTreat');
  }

  recover(): void {
    const { animCtrl, boundsManager } = this.deps;
    animCtrl.setX(boundsManager.safeX(animCtrl.getX()));
    animCtrl.setY(boundsManager.safeY(animCtrl.getY()));
    this.enterState('idle');
  }

  // ── Called every frame
  update(delta: number): void {
    if (!this.running) return;
    const dt = delta / 60;

    // Update cooldowns
    for (const key of Object.keys(this.cooldowns) as PetState[]) {
      this.cooldowns[key] = Math.max(0, (this.cooldowns[key] ?? 0) - dt);
    }

    this.stateTimer += dt;
    this.deps.animCtrl.tick(delta);

    // Update current state behavior
    this.tickCurrentState(dt);

    // Jump arc
    if (this.isJumping) {
      this.jumpVy += 900 * dt;
      this.jumpY += this.jumpVy * dt;
      const { animCtrl } = this.deps;
      animCtrl.setY(animCtrl.getY() + this.jumpVy * dt);
      if (this.jumpY >= 0) {
        this.jumpY = 0;
        this.jumpVy = 0;
        this.isJumping = false;
        animCtrl.setAnimation('jump_land', () => this.enterState('idle'));
      }
    }

    // Decide next state when timer expires
    if (this.stateTimer >= this.stateDuration) {
      if (!this.focusMode) {
        this.decideNextState();
      }
    }
  }

  private tickCurrentState(dt: number): void {
    const { animCtrl, movementCtrl, soundManager, emotionEngine, mouseCtrl } = this.deps;

    switch (this.currentState) {
      case 'walking':
      case 'wandering':
      case 'running':
      case 'sneaking':
      case 'zoomies':
        this.updateMovement(dt);
        break;

      case 'sleeping':
        animCtrl.showZzzEmote(Math.floor(Date.now() / 2000) % 2 === 0);
        break;

      case 'watchingCursor': {
        const cursor = mouseCtrl.getCursorPosition();
        const dx = (cursor.x - animCtrl.getX()) / window.innerWidth;
        const dy = (cursor.y - animCtrl.getY()) / window.innerHeight;
        animCtrl.setHeadTilt(dx * 0.3);
        animCtrl.setEyeGaze(dx, dy);
        break;
      }

      case 'sad':
        if (this.settings.cryingEnabled) {
          animCtrl.showTears(true);
        }
        break;

      case 'affectionate':
        animCtrl.showHeartEmote(true);
        break;

      default:
        break;
    }
  }

  private updateMovement(dt: number): void {
    const { animCtrl, boundsManager } = this.deps;
    const x = animCtrl.getX();
    const y = animCtrl.getY();
    const dx = this.targetX - x;
    const dy = this.targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const speed = this.currentState === 'running' || this.currentState === 'zoomies'
      ? this.moveSpeed * 2.5
      : this.currentState === 'sneaking'
      ? this.moveSpeed * 0.5
      : this.moveSpeed;

    if (dist < 4) {
      // Reached target
      this.wanderPhase = 'pause';
      this.wanderPauseTimer = 0.5 + Math.random() * 2;
      if (!this.distracted && Math.random() < 0.3) {
        this.distracted = true;
        this.enterState(Math.random() < 0.5 ? 'sniffing' : 'lookingAround');
      } else {
        this.distracted = false;
        this.enterState('idle');
      }
      return;
    }

    const vx = (dx / dist) * speed * dt;
    const vy = (dy / dist) * speed * dt;
    const nx = boundsManager.clampX(x + vx);
    const ny = boundsManager.clampY(y + vy);
    animCtrl.setX(nx);
    animCtrl.setY(ny);
    animCtrl.setFacing(dx < 0);

    // Update walk animation direction
    const walkAnim: AnimationKey = this.currentState === 'running' || this.currentState === 'zoomies'
      ? (dx < 0 ? 'run_left' : 'run_right')
      : this.currentState === 'sneaking'
      ? (dx < 0 ? 'sneak_left' : 'sneak_right')
      : (dx < 0 ? 'walk_left' : 'walk_right');

    if (animCtrl.getCurrentAnimation() !== walkAnim) {
      animCtrl.setAnimation(walkAnim);
    }
  }

  private decideNextState(): void {
    if (this.focusMode) {
      this.enterState('sleeping');
      return;
    }

    const { emotionEngine, personalityEngine, mouseCtrl, toyEngine } = this.deps;
    const emotions = emotionEngine.getState();
    const personality = personalityEngine.getConfig();

    // Check mouse proximity for cursor reaction
    const cursorNearby = mouseCtrl.isCursorNearby();
    if (cursorNearby && Math.random() < 0.4 * personality.cursorInterest) {
      this.enterState('watchingCursor');
      return;
    }

    // Check for nearby toy
    const toy = toyEngine.getNearestActiveToy(
      this.deps.animCtrl.getX(),
      this.deps.animCtrl.getY()
    );
    if (toy && Math.random() < 0.5 * personality.playFrequency) {
      this.enterState('toyInteraction');
      return;
    }

    // High sleepiness → sleep
    if (emotions.sleepiness > 70 && Math.random() < 0.6 * personality.sleepFrequency) {
      this.enterState('sleeping');
      return;
    }

    // Work mode: bias toward quiet states
    if (this.workMode) {
      const quietStates: PetState[] = ['idle', 'sitting', 'sleeping', 'grooming'];
      this.enterState(quietStates[Math.floor(Math.random() * quietStates.length)]);
      return;
    }

    // Rare events
    if (Math.random() < this.getRareEventChance()) {
      const rare = RARE_STATES[Math.floor(Math.random() * RARE_STATES.length)];
      if ((this.cooldowns[rare] ?? 0) <= 0) {
        this.enterState(rare);
        this.cooldowns[rare] = 60;
        return;
      }
    }

    // Weighted random selection
    const available = STATE_CONFIGS.filter((s) => {
      if ((this.cooldowns[s.state] ?? 0) > 0) return false;
      if (s.state === this.currentState) return false;
      return true;
    });

    const weighted = available.map((s) => ({
      ...s,
      w: this.getStateWeight(s, emotions, personality),
    }));

    const total = weighted.reduce((sum, s) => sum + s.w, 0);
    let rand = Math.random() * total;
    for (const s of weighted) {
      rand -= s.w;
      if (rand <= 0) {
        this.enterState(s.state);
        return;
      }
    }

    this.enterState('idle');
  }

  private getStateWeight(
    cfg: StateConfig,
    emotions: ReturnType<EmotionEngine['getState']>,
    personality: ReturnType<PetPersonalityEngine['getConfig']>
  ): number {
    let w = cfg.weight;

    switch (cfg.state) {
      case 'sleeping':
        w *= personality.sleepFrequency * (1 + emotions.sleepiness / 100);
        break;
      case 'walking':
      case 'wandering':
        w *= personality.wanderFrequency;
        break;
      case 'grooming':
      case 'stretching':
      case 'scratching':
        w *= 1.0;
        break;
      case 'affectionate':
        w *= personality.affectionLevel * (1 + emotions.affection / 100);
        break;
      case 'curious':
        w *= 1 + emotions.curiosity / 100;
        break;
      case 'running':
        w *= personality.playFrequency * (1 + emotions.excitement / 100);
        break;
      case 'hiding':
        w *= (1 + emotions.fear / 50) * personality.shyness;
        break;
    }

    return Math.max(0, w);
  }

  private getRareEventChance(): number {
    const freq = this.settings.rareEventFrequency;
    return freq === 'high' ? 0.08 : freq === 'low' ? 0.01 : 0.03;
  }

  enterState(state: PetState): void {
    const { animCtrl, soundManager, emotionEngine, boundsManager } = this.deps;

    // Clean up previous state
    this.exitCurrentState();

    this.currentState = state;
    this.stateTimer = 0;

    const cfg = STATE_CONFIGS.find((s) => s.state === state);
    const min = cfg?.minDuration ?? 2;
    const max = cfg?.maxDuration ?? 6;
    this.stateDuration = min + Math.random() * (max - min);

    switch (state) {
      case 'idle':
        animCtrl.setAnimation('idle');
        break;

      case 'sitting':
      case 'restingByWindow':
        animCtrl.setAnimation('sit');
        break;

      case 'lookingAround':
        animCtrl.setAnimation('sit_look', () => this.enterState('sitting'));
        break;

      case 'sleeping': {
        animCtrl.setAnimation('sleep_enter', () => {
          animCtrl.setAnimation('sleep_loop');
        });
        soundManager.play('yawn');
        emotionEngine.modify({ sleepiness: -30 });
        break;
      }

      case 'waking': {
        animCtrl.showZzzEmote(false);
        animCtrl.setAnimation('waking', () => {
          animCtrl.setAnimation('stretch', () => this.enterState('idle'));
        });
        break;
      }

      case 'stretching':
        animCtrl.setAnimation('stretch', () => this.enterState('idle'));
        soundManager.play('yawn');
        break;

      case 'grooming':
        animCtrl.setAnimation('groom', () => this.enterState('sitting'));
        break;

      case 'scratching':
        animCtrl.setAnimation('scratch', () => this.enterState('idle'));
        break;

      case 'sniffing':
        animCtrl.setAnimation('sniff', () => this.enterState('idle'));
        break;

      case 'walking':
      case 'wandering': {
        const tx = boundsManager.randomSafeX();
        const ty = boundsManager.randomSafeY();
        this.setMoveTarget(tx, ty);
        this.moveSpeed = 55 + Math.random() * 20;
        break;
      }

      case 'running': {
        const tx = boundsManager.randomSafeX();
        const ty = boundsManager.safeY(animCtrl.getY());
        this.setMoveTarget(tx, ty);
        this.moveSpeed = 130;
        soundManager.play('run');
        break;
      }

      case 'sneaking': {
        const tx = boundsManager.randomSafeX();
        const ty = animCtrl.getY();
        this.setMoveTarget(tx, ty);
        this.moveSpeed = 30;
        break;
      }

      case 'zoomies': {
        this.moveSpeed = 250;
        const tx = boundsManager.randomSafeX();
        const ty = boundsManager.randomSafeY();
        this.setMoveTarget(tx, ty);
        soundManager.play('run');
        emotionEngine.modify({ excitement: -20, energy: -15 });
        break;
      }

      case 'jumping':
        this.startJump(animCtrl.getX(), animCtrl.getY() - 80);
        break;

      case 'tailChasing':
        animCtrl.setAnimation('tail_chase');
        this.stateDuration = 4 + Math.random() * 4;
        soundManager.play('meow_happy');
        break;

      case 'pouncing': {
        animCtrl.setAnimation('pounce_crouch', () => {
          animCtrl.setAnimation('pounce_leap', () => {
            if (Math.random() < 0.3) {
              animCtrl.setAnimation('pounce_miss', () => this.enterState('idle'));
              soundManager.play('meow_confused');
            } else {
              animCtrl.setAnimation('jump_land', () => this.enterState('idle'));
            }
          });
        });
        break;
      }

      case 'toyInteraction': {
        const nearestToy = this.deps.toyEngine.getNearestActiveToy(
          animCtrl.getX(), animCtrl.getY()
        );
        if (nearestToy) {
          this.setMoveTarget(nearestToy.position.x, nearestToy.position.y);
          this.moveSpeed = 100;
          // When we reach the toy, bat it
          this.stateDuration = 5;
          animCtrl.setAnimation('pounce_crouch');
        } else {
          this.enterState('idle');
        }
        break;
      }

      case 'eatingTreat':
        animCtrl.setAnimation('eat', () => {
          soundManager.play('eat');
          emotionEngine.modify({ happiness: 15, comfort: 10 });
          this.enterState('idle');
        });
        break;

      case 'watchingCursor':
        animCtrl.setAnimation('sit_look');
        break;

      case 'curious':
        animCtrl.setAnimation('sit_look', () => this.enterState('sniffing'));
        soundManager.play('sniff');
        break;

      case 'startled':
        animCtrl.setAnimation('startle', () => this.enterState('scared'));
        soundManager.play('meow_startled');
        emotionEngine.modify({ fear: 20, annoyance: 10 });
        break;

      case 'scared':
        animCtrl.setAnimation('scared_crouch');
        this.moveToSafeEdge();
        this.stateDuration = 3 + Math.random() * 5;
        break;

      case 'annoyed':
        animCtrl.setAnimation('annoy_flick', () => this.enterState('sitting'));
        soundManager.play('hiss');
        emotionEngine.modify({ annoyance: -15 });
        break;

      case 'sad':
        animCtrl.setAnimation('sad_droop');
        soundManager.play('meow_sad');
        this.stateDuration = 5 + Math.random() * 8;
        break;

      case 'affectionate':
        animCtrl.setAnimation('affection_rub', () => {
          animCtrl.showHeartEmote(false);
          this.enterState('idle');
        });
        soundManager.play('purr');
        emotionEngine.modify({ affection: 10, happiness: 10 });
        break;

      case 'attentionSeeking':
        animCtrl.setAnimation('wave_paw', () => this.enterState('idle'));
        soundManager.play('meow_happy');
        break;

      case 'hiding': {
        const hideX = Math.random() < 0.5 ? boundsManager.minX + 10 : boundsManager.maxX - 10;
        this.setMoveTarget(hideX, animCtrl.getY());
        this.moveSpeed = 80;
        break;
      }

      case 'windowClimbing':
        animCtrl.setAnimation('climb_up', () => {
          animCtrl.setAnimation('hang', () => {
            animCtrl.setAnimation('climb_down', () => this.enterState('idle'));
          });
        });
        break;

      case 'windowHanging':
        animCtrl.setAnimation('hang');
        this.stateDuration = 3 + Math.random() * 5;
        break;
    }
  }

  private exitCurrentState(): void {
    const { animCtrl } = this.deps;
    animCtrl.showTears(false);
    animCtrl.showHeartEmote(false);
    animCtrl.showZzzEmote(false);
  }

  private setMoveTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  private startJump(tx: number, ty: number): void {
    this.isJumping = true;
    this.jumpY = 0;
    this.jumpVy = -400;
    this.deps.animCtrl.setAnimation('jump_up');
    this.deps.soundManager.play('jump');
  }

  private moveToSafeEdge(): void {
    const { animCtrl, boundsManager } = this.deps;
    const x = animCtrl.getX();
    const safeX = x < window.innerWidth / 2 ? boundsManager.minX + 20 : boundsManager.maxX - 20;
    this.setMoveTarget(safeX, animCtrl.getY());
    this.moveSpeed = 120;
  }

  getCurrentState(): PetState {
    return this.currentState;
  }
}
