// ============================================================
// Mochi – Sprite Animation Controller
// Renders Mochi using procedurally generated SVG sprites via PixiJS
// ============================================================
import * as PIXI from 'pixi.js';
import type { AppearanceConfig, AnimationKey } from '../shared/types';
import { MochiSpriteFactory } from './MochiSpriteFactory';

export interface AnimationDef {
  key: AnimationKey;
  frameCount: number;
  loop: boolean;
  fps: number;
}

const ANIMATIONS: AnimationDef[] = [
  { key: 'idle', frameCount: 4, loop: true, fps: 6 },
  { key: 'idle_blink', frameCount: 6, loop: false, fps: 12 },
  { key: 'idle_tail', frameCount: 8, loop: true, fps: 8 },
  { key: 'walk_right', frameCount: 8, loop: true, fps: 10 },
  { key: 'walk_left', frameCount: 8, loop: true, fps: 10 },
  { key: 'run_right', frameCount: 8, loop: true, fps: 16 },
  { key: 'run_left', frameCount: 8, loop: true, fps: 16 },
  { key: 'sneak_right', frameCount: 6, loop: true, fps: 8 },
  { key: 'sneak_left', frameCount: 6, loop: true, fps: 8 },
  { key: 'sit', frameCount: 2, loop: true, fps: 4 },
  { key: 'sit_look', frameCount: 4, loop: false, fps: 8 },
  { key: 'sit_blink', frameCount: 4, loop: false, fps: 10 },
  { key: 'sleep_enter', frameCount: 6, loop: false, fps: 8 },
  { key: 'sleep_loop', frameCount: 8, loop: true, fps: 4 },
  { key: 'sleep_exit', frameCount: 8, loop: false, fps: 8 },
  { key: 'stretch', frameCount: 10, loop: false, fps: 8 },
  { key: 'groom', frameCount: 12, loop: false, fps: 10 },
  { key: 'scratch', frameCount: 8, loop: false, fps: 10 },
  { key: 'tail_chase', frameCount: 12, loop: true, fps: 12 },
  { key: 'jump_up', frameCount: 6, loop: false, fps: 12 },
  { key: 'jump_land', frameCount: 4, loop: false, fps: 12 },
  { key: 'pounce_crouch', frameCount: 4, loop: false, fps: 8 },
  { key: 'pounce_leap', frameCount: 6, loop: false, fps: 14 },
  { key: 'pounce_miss', frameCount: 8, loop: false, fps: 12 },
  { key: 'startle', frameCount: 6, loop: false, fps: 16 },
  { key: 'happy_bounce', frameCount: 8, loop: false, fps: 12 },
  { key: 'affection_rub', frameCount: 10, loop: false, fps: 10 },
  { key: 'annoy_flick', frameCount: 6, loop: false, fps: 10 },
  { key: 'scared_crouch', frameCount: 4, loop: false, fps: 10 },
  { key: 'sad_droop', frameCount: 4, loop: false, fps: 6 },
  { key: 'yawn', frameCount: 10, loop: false, fps: 8 },
  { key: 'sniff', frameCount: 6, loop: false, fps: 10 },
  { key: 'look_left', frameCount: 4, loop: false, fps: 10 },
  { key: 'look_right', frameCount: 4, loop: false, fps: 10 },
  { key: 'look_up', frameCount: 4, loop: false, fps: 10 },
  { key: 'play_bat', frameCount: 8, loop: false, fps: 12 },
  { key: 'play_carry', frameCount: 6, loop: true, fps: 8 },
  { key: 'climb_up', frameCount: 8, loop: false, fps: 10 },
  { key: 'hang', frameCount: 6, loop: true, fps: 6 },
  { key: 'climb_down', frameCount: 8, loop: false, fps: 10 },
  { key: 'eat', frameCount: 8, loop: false, fps: 10 },
  { key: 'zoomies', frameCount: 6, loop: true, fps: 18 },
  { key: 'peek', frameCount: 4, loop: true, fps: 8 },
  { key: 'wave_paw', frameCount: 8, loop: false, fps: 10 },
  { key: 'pet_reaction', frameCount: 8, loop: false, fps: 10 },
  { key: 'cry', frameCount: 6, loop: false, fps: 8 },
  { key: 'waking', frameCount: 10, loop: false, fps: 8 },
];

export class SpriteAnimationController {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private catSprite: PIXI.Container;
  private spriteFactory: MochiSpriteFactory;
  private appearance: AppearanceConfig;
  private currentAnim: AnimationKey = 'idle';
  private animTimer = 0;
  private animFrame = 0;
  private animDef!: AnimationDef;
  private onComplete?: () => void;
  private bodyParts!: ReturnType<MochiSpriteFactory['createCatParts']>;
  private eyeBlink = 0;
  private blinkTimer = 0;
  private tailSwayAngle = 0;
  private walkCycle = 0;
  private facingLeft = false;
  private headBobOffset = 0;
  private breathePhase = 0;

  // Emotion overlays
  private emotionContainer: PIXI.Container;
  private tearDrops: PIXI.Graphics[] = [];

  constructor(app: PIXI.Application, appearance: AppearanceConfig) {
    this.app = app;
    this.appearance = appearance;
    this.spriteFactory = new MochiSpriteFactory(appearance);

    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.catSprite = new PIXI.Container();
    this.container.addChild(this.catSprite);

    this.emotionContainer = new PIXI.Container();
    this.container.addChild(this.emotionContainer);

    this.buildCat();
    this.setAnimation('idle');

    // Position in center desktop area by default
    this.container.x = app.screen.width * 0.5;
    this.container.y = app.screen.height * 0.65;
  }

  private buildCat(): void {
    this.catSprite.removeChildren();
    this.bodyParts = this.spriteFactory.createCatParts();

    // Add in z-order: tail, body, back legs, front legs, head, ears, eyes, nose, whiskers
    this.catSprite.addChild(this.bodyParts.tail);
    this.catSprite.addChild(this.bodyParts.backLegs);
    this.catSprite.addChild(this.bodyParts.body);
    this.catSprite.addChild(this.bodyParts.frontLegs);
    this.catSprite.addChild(this.bodyParts.head);
    this.catSprite.addChild(this.bodyParts.ears);
    this.catSprite.addChild(this.bodyParts.eyes);
    this.catSprite.addChild(this.bodyParts.nose);
    this.catSprite.addChild(this.bodyParts.whiskers);
    this.catSprite.addChild(this.bodyParts.accessories);

    const scale = this.appearance.size;
    this.catSprite.scale.set(scale);
    this.catSprite.pivot.set(0, this.spriteFactory.baseHeight);
  }

  get position(): PIXI.Point {
    return new PIXI.Point(this.container.x, this.container.y);
  }

  set position(p: PIXI.Point) {
    this.container.x = p.x;
    this.container.y = p.y;
  }

  setX(x: number): void { this.container.x = x; }
  setY(y: number): void { this.container.y = y; }
  getX(): number { return this.container.x; }
  getY(): number { return this.container.y; }

  setFacing(left: boolean): void {
    this.facingLeft = left;
    this.catSprite.scale.x = left ? -Math.abs(this.catSprite.scale.x) : Math.abs(this.catSprite.scale.x);
  }

  setAnimation(key: AnimationKey, onComplete?: () => void): void {
    if (this.currentAnim === key) {
      this.onComplete = onComplete;
      return;
    }
    this.currentAnim = key;
    this.animFrame = 0;
    this.animTimer = 0;
    this.onComplete = onComplete;
    this.animDef = ANIMATIONS.find((a) => a.key === key) ?? ANIMATIONS[0];
    this.applyAnimationFrame(0);
  }

  getCurrentAnimation(): AnimationKey {
    return this.currentAnim;
  }

  // Called every ticker tick (delta in PIXI ticker units)
  tick(delta: number): void {
    const dt = delta / 60; // convert to seconds
    this.breathePhase += dt * 0.8;
    this.tailSwayAngle += dt * 1.2;
    this.blinkTimer -= dt;
    this.walkCycle += dt;

    if (!this.animDef) {
      this.animDef = ANIMATIONS.find((a) => a.key === this.currentAnim) ?? ANIMATIONS[0];
    }

    // Advance animation frame
    this.animTimer += delta;
    const frameDuration = 60 / this.animDef.fps;
    if (this.animTimer >= frameDuration) {
      this.animTimer -= frameDuration;
      this.animFrame++;
      if (this.animFrame >= this.animDef.frameCount) {
        if (this.animDef.loop) {
          this.animFrame = 0;
        } else {
          this.animFrame = this.animDef.frameCount - 1;
          this.onComplete?.();
          this.onComplete = undefined;
        }
      }
      this.applyAnimationFrame(this.animFrame);
    }

    // Random natural blink
    if (this.blinkTimer <= 0) {
      this.blinkTimer = 3 + Math.random() * 5;
      if (this.currentAnim !== 'sleep_loop') {
        this.triggerBlink();
      }
    }

    // Continuous part animations
    this.animateTail(dt);
    this.animateBreathe(dt);
    this.updateTearDrops(dt);
  }

  private triggerBlink(): void {
    const blink = this.bodyParts.eyes.getChildByName('eyelids') as PIXI.Graphics;
    if (!blink) return;
    blink.alpha = 1;
    // Fade out eyelids after 100ms
    let elapsed = 0;
    const blinkDuration = 0.15;
    const ticker = this.app.ticker.add((d) => {
      elapsed += d / 60;
      if (elapsed > blinkDuration) {
        blink.alpha = 0;
        this.app.ticker.remove(ticker);
      }
    });
  }

  private animateTail(dt: number): void {
    const tail = this.bodyParts.tail;
    // Sway based on current state
    const swayAmt = this.currentAnim === 'annoy_flick' ? 0.4 :
                    this.currentAnim === 'sleep_loop' ? 0.02 :
                    this.currentAnim === 'zoomies' ? 0.6 : 0.12;
    tail.rotation = Math.sin(this.tailSwayAngle * 1.8) * swayAmt;
  }

  private animateBreathe(dt: number): void {
    const bodyScale = 1 + Math.sin(this.breathePhase) * 0.015;
    const isSleeping = this.currentAnim === 'sleep_loop';
    const breatheScale = isSleeping ? 1 + Math.sin(this.breathePhase * 0.5) * 0.03 : bodyScale;
    this.bodyParts.body.scale.y = breatheScale;
  }

  private applyAnimationFrame(frame: number): void {
    const anim = this.currentAnim;
    const t = frame / Math.max(1, (this.animDef?.frameCount ?? 1) - 1);

    switch (anim) {
      case 'idle':
        this.setIdlePose(t);
        break;
      case 'walk_right':
      case 'walk_left':
        this.setWalkPose(t, false);
        break;
      case 'run_right':
      case 'run_left':
        this.setWalkPose(t, true);
        break;
      case 'sneak_right':
      case 'sneak_left':
        this.setSneakPose(t);
        break;
      case 'sit':
      case 'sit_look':
      case 'sit_blink':
        this.setSitPose(t);
        break;
      case 'sleep_enter':
      case 'sleep_loop':
        this.setSleepPose(t);
        break;
      case 'sleep_exit':
      case 'waking':
        this.setWakingPose(t);
        break;
      case 'stretch':
        this.setStretchPose(t);
        break;
      case 'pounce_crouch':
        this.setPounceCrouchPose(t);
        break;
      case 'pounce_leap':
      case 'jump_up':
        this.setLeapPose(t);
        break;
      case 'jump_land':
      case 'pounce_miss':
        this.setLandPose(t);
        break;
      case 'startle':
        this.setStartlePose(t);
        break;
      case 'groom':
        this.setGroomPose(t);
        break;
      case 'sad_droop':
        this.setSadPose(t);
        break;
      case 'happy_bounce':
        this.setHappyBouncePose(t);
        break;
      case 'yawn':
        this.setYawnPose(t);
        break;
      case 'zoomies':
        this.setWalkPose(t, true);
        break;
      default:
        this.setIdlePose(0);
    }
  }

  // ── Pose setters
  private setIdlePose(t: number): void {
    const bob = Math.sin(t * Math.PI * 2) * 1.5;
    this.bodyParts.body.y = bob;
    this.bodyParts.head.y = -52 + bob * 0.5;
    this.bodyParts.frontLegs.y = 18 + bob * 0.3;
    this.setEyeOpen(1.0);
    this.setEarAngle(0);
  }

  private setWalkPose(t: number, isRun: boolean): void {
    const speed = isRun ? 2.5 : 1.5;
    const legSwing = Math.sin(t * Math.PI * 2 * speed) * (isRun ? 18 : 12);
    const bodyBob = Math.abs(Math.sin(t * Math.PI * 2 * speed)) * (isRun ? 3 : 2);

    this.bodyParts.frontLegs.rotation = legSwing * (Math.PI / 180);
    this.bodyParts.backLegs.rotation = -legSwing * (Math.PI / 180);
    this.bodyParts.body.y = bodyBob;
    this.bodyParts.head.y = -52 + bodyBob * 0.4;
    this.setEyeOpen(0.9);
    this.setEarAngle(0);
  }

  private setSneakPose(t: number): void {
    const legSwing = Math.sin(t * Math.PI * 2) * 8;
    this.bodyParts.body.y = 8;
    this.bodyParts.head.y = -44;
    this.bodyParts.frontLegs.rotation = legSwing * (Math.PI / 180);
    this.setEyeOpen(0.8);
    this.setEarAngle(15);
  }

  private setSitPose(t: number): void {
    this.bodyParts.body.y = 0;
    this.bodyParts.head.y = -55;
    this.bodyParts.frontLegs.y = 12;
    this.bodyParts.backLegs.y = 20;
    this.bodyParts.frontLegs.rotation = 0;
    this.bodyParts.backLegs.rotation = 0;
    this.setEyeOpen(1.0);
    this.setEarAngle(0);
  }

  private setSleepPose(t: number): void {
    this.bodyParts.body.rotation = -0.15;
    this.bodyParts.head.y = -30;
    this.bodyParts.head.rotation = 0.2;
    this.bodyParts.frontLegs.rotation = 0.3;
    this.setEyeOpen(0.05);
    this.setEarAngle(-5);
  }

  private setWakingPose(t: number): void {
    const eyeOpen = t;
    this.bodyParts.body.rotation = -0.15 * (1 - t);
    this.bodyParts.head.y = -30 + t * 22;
    this.bodyParts.head.rotation = 0.2 * (1 - t);
    this.setEyeOpen(eyeOpen);
  }

  private setStretchPose(t: number): void {
    const arch = Math.sin(t * Math.PI);
    this.bodyParts.body.scale.x = 1 + arch * 0.25;
    this.bodyParts.body.y = arch * 4;
    this.bodyParts.head.y = -52 - arch * 10;
    this.bodyParts.frontLegs.y = 18 + arch * 6;
    this.setEyeOpen(0.3 + arch * 0.1);
    this.setEarAngle(0);
  }

  private setPounceCrouchPose(t: number): void {
    this.bodyParts.body.y = 8;
    this.bodyParts.head.y = -42;
    this.bodyParts.head.rotation = -0.15;
    this.setEyeOpen(1.0);
    this.setEarAngle(20);
  }

  private setLeapPose(t: number): void {
    const arc = Math.sin(t * Math.PI);
    this.container.y -= arc * 80 * (1 / 60); // applied per-frame in movement controller
    this.bodyParts.frontLegs.rotation = -0.8 * arc;
    this.bodyParts.backLegs.rotation = 0.6 * arc;
    this.setEyeOpen(1.0);
  }

  private setLandPose(t: number): void {
    const squash = Math.max(0, 1 - t * 2) * 0.15;
    this.bodyParts.body.scale.y = 1 - squash;
    this.bodyParts.body.y = squash * 10;
    this.setEyeOpen(0.5 + t * 0.5);
  }

  private setStartlePose(t: number): void {
    const jump = Math.sin(t * Math.PI);
    this.bodyParts.body.y = -jump * 20;
    this.bodyParts.head.y = -52 - jump * 20;
    this.setEyeOpen(1.0);
    this.setEarAngle(-20);
    // Fluff tail
    this.bodyParts.tail.scale.set(1 + jump * 0.3);
  }

  private setGroomPose(t: number): void {
    this.setSitPose(0);
    const pawUp = Math.sin(t * Math.PI * 3) > 0;
    this.bodyParts.frontLegs.rotation = pawUp ? -0.6 : 0;
    this.bodyParts.head.rotation = pawUp ? 0.1 : 0;
  }

  private setSadPose(t: number): void {
    this.bodyParts.head.y = -46;
    this.bodyParts.head.rotation = 0.1;
    this.setEyeOpen(0.5);
    this.setEarAngle(-15);
    this.bodyParts.body.y = 4;
  }

  private setHappyBouncePose(t: number): void {
    const bounce = Math.abs(Math.sin(t * Math.PI * 3));
    this.bodyParts.body.y = -bounce * 15;
    this.bodyParts.head.y = -52 - bounce * 15;
    this.setEyeOpen(0.8);
    this.setEarAngle(10);
  }

  private setYawnPose(t: number): void {
    this.setSitPose(0);
    this.bodyParts.head.rotation = -t * 0.4;
    this.setEyeOpen(1 - t * 0.8);
    // Mouth open effect handled by nose/whisker part
    this.bodyParts.nose.y = -30 + t * 3;
  }

  // ── Helper setters
  private setEyeOpen(amount: number): void {
    const eyes = this.bodyParts.eyes;
    // We control eyelids container opacity
    const eyelids = eyes.getChildByName('eyelids') as PIXI.Graphics | null;
    if (eyelids) {
      eyelids.alpha = 1 - amount;
    }
  }

  private setEarAngle(degrees: number): void {
    const rad = degrees * (Math.PI / 180);
    this.bodyParts.ears.rotation = rad;
  }

  setHeadTilt(radians: number): void {
    this.bodyParts.head.rotation = radians;
  }

  setEyeGaze(dx: number, dy: number): void {
    const pupils = this.bodyParts.eyes.getChildByName('pupils') as PIXI.Container | null;
    if (!pupils) return;
    const maxOffset = 3;
    pupils.x = Math.max(-maxOffset, Math.min(maxOffset, dx * maxOffset));
    pupils.y = Math.max(-maxOffset, Math.min(maxOffset, dy * maxOffset));
  }

  // ── Emotion visual overlays
  showTears(show: boolean): void {
    if (show && this.tearDrops.length === 0) {
      for (let i = 0; i < 2; i++) {
        const tear = new PIXI.Graphics();
        tear.beginFill(0x88CCFF, 0.8);
        tear.drawEllipse(0, 0, 2, 4);
        tear.endFill();
        tear.x = i === 0 ? -8 : 8;
        tear.y = -36;
        this.emotionContainer.addChild(tear);
        this.tearDrops.push(tear);
      }
    } else if (!show) {
      this.tearDrops.forEach((t) => t.destroy());
      this.tearDrops = [];
    }
  }

  showHeartEmote(show: boolean): void {
    // Draw small pink heart above head when affectionate
    const existing = this.emotionContainer.getChildByName('heart');
    if (show && !existing) {
      const heart = new PIXI.Graphics();
      heart.name = 'heart';
      heart.beginFill(0xFF88AA, 0.9);
      heart.moveTo(0, -4);
      heart.bezierCurveTo(-6, -10, -12, -4, 0, 4);
      heart.bezierCurveTo(12, -4, 6, -10, 0, -4);
      heart.endFill();
      heart.x = 0;
      heart.y = -80;
      heart.scale.set(0.8);
      this.emotionContainer.addChild(heart);
    } else if (!show && existing) {
      existing.destroy();
    }
  }

  showZzzEmote(show: boolean): void {
    const existing = this.emotionContainer.getChildByName('zzz');
    if (show && !existing) {
      const text = new PIXI.Text('zzz', { fontSize: 10, fill: 0x8888BB, alpha: 0.7 });
      text.name = 'zzz';
      text.x = 20;
      text.y = -70;
      this.emotionContainer.addChild(text);
    } else if (!show && existing) {
      existing.destroy();
    }
  }

  private updateTearDrops(dt: number): void {
    this.tearDrops.forEach((tear) => {
      tear.y += dt * 30;
      tear.alpha -= dt * 0.5;
      if (tear.alpha <= 0) {
        tear.y = -36;
        tear.alpha = 0.8;
      }
    });
  }

  updateAppearance(appearance: AppearanceConfig): void {
    this.appearance = appearance;
    this.spriteFactory.updateAppearance(appearance);
    this.buildCat();
  }

  get width(): number {
    return this.catSprite.width;
  }

  get height(): number {
    return this.catSprite.height;
  }

  get bounds(): PIXI.Rectangle {
    return this.container.getBounds();
  }
}
