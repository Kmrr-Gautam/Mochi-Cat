// ============================================================
// Mochi – Pet Renderer (PixiJS entry point)
// ============================================================
import * as PIXI from 'pixi.js';
import { SpriteAnimationController } from './SpriteAnimationController';
import { PetStateMachine } from './PetStateMachine';
import { EmotionEngine } from './EmotionEngine';
import { MovementController } from './MovementController';
import { DesktopBoundsManager } from './DesktopBoundsManager';
import { MouseInteractionController } from './MouseInteractionController';
import { ToyPhysicsEngine } from './ToyPhysicsEngine';
import { PetPersonalityEngine } from './PetPersonalityEngine';
import { SoundManager } from './SoundManager';
import { PetDataBridge } from './PetDataBridge';
import { IPC } from '../shared/ipc-channels';
import type { AppSettings, PetData } from '../shared/types';

declare global {
  interface Window {
    mochiAPI: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      on: (channel: string, listener: (...args: unknown[]) => void) => (() => void) | void;
      once: (channel: string, listener: (...args: unknown[]) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

class MochiApp {
  private app!: PIXI.Application;
  private animCtrl!: SpriteAnimationController;
  private stateMachine!: PetStateMachine;
  private emotionEngine!: EmotionEngine;
  private movementCtrl!: MovementController;
  private boundsManager!: DesktopBoundsManager;
  private mouseCtrl!: MouseInteractionController;
  private toyEngine!: ToyPhysicsEngine;
  private personalityEngine!: PetPersonalityEngine;
  private soundManager!: SoundManager;
  private dataBridge!: PetDataBridge;

  private settings!: AppSettings;
  private petData!: PetData;
  private visible = true;
  private paused = false;
  private sessionStart = Date.now();

  async init(): Promise<void> {
    // Load settings and pet data
    this.settings = (await window.mochiAPI.invoke(IPC.SETTINGS_GET)) as AppSettings;
    this.petData = (await window.mochiAPI.invoke(IPC.PETDATA_GET)) as PetData;

    // Initialize PixiJS
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    (document.getElementById('pet-canvas') as HTMLElement).appendChild(this.app.view as HTMLCanvasElement);

    // Init subsystems
    this.boundsManager = new DesktopBoundsManager(this.app);
    this.soundManager = new SoundManager(this.settings);
    this.emotionEngine = new EmotionEngine(this.petData.emotions, this.petData.vitals);
    this.personalityEngine = new PetPersonalityEngine(this.petData.personality);
    this.animCtrl = new SpriteAnimationController(this.app, this.petData.appearance);
    this.movementCtrl = new MovementController(this.boundsManager, this.personalityEngine);
    this.toyEngine = new ToyPhysicsEngine(this.app, this.boundsManager);
    this.mouseCtrl = new MouseInteractionController(
      this.animCtrl,
      this.emotionEngine,
      this.soundManager,
      this.settings,
      this.petData.personality
    );
    this.stateMachine = new PetStateMachine({
      animCtrl: this.animCtrl,
      emotionEngine: this.emotionEngine,
      movementCtrl: this.movementCtrl,
      mouseCtrl: this.mouseCtrl,
      toyEngine: this.toyEngine,
      soundManager: this.soundManager,
      personalityEngine: this.personalityEngine,
      boundsManager: this.boundsManager,
      settings: this.settings,
    });

    this.dataBridge = new PetDataBridge(this.emotionEngine, this.petData);

    // Start the main loop
    this.app.ticker.add((delta) => this.update(delta));
    this.app.ticker.maxFPS = this.settings.targetFps;

    // Apply initial settings
    this.applySettings(this.settings);

    // Register IPC listeners
    this.registerIPCListeners();

    // Start behavior
    this.stateMachine.start();

    console.log('[MochiApp] Initialized ✓');
  }

  private update(delta: number): void {
    if (this.paused || !this.visible) return;
    this.stateMachine.update(delta);
    this.toyEngine.update(delta);
    this.mouseCtrl.update();
    this.emotionEngine.update(delta);
    this.dataBridge.sync();
  }

  private applySettings(s: AppSettings): void {
    this.settings = s;
    this.app.ticker.maxFPS = s.targetFps;
    this.soundManager.applySettings(s);
    this.stateMachine.applySettings(s);
    this.mouseCtrl.applySettings(s);
    if (s.lowPowerMode) {
      this.app.ticker.maxFPS = 15;
    }
  }

  private registerIPCListeners(): void {
    const api = window.mochiAPI;

    api.on(IPC.SETTINGS_CHANGED, (s) => {
      this.applySettings(s as AppSettings);
    });

    api.on(IPC.APP_HIDE_PET, () => {
      this.visible = false;
      this.app.stage.visible = false;
      this.app.ticker.maxFPS = 5;
    });

    api.on(IPC.APP_SHOW_PET, () => {
      this.visible = true;
      this.app.stage.visible = true;
      this.app.ticker.maxFPS = this.settings.targetFps;
    });

    api.on(IPC.APP_TOGGLE_CLICK_THROUGH, () => {
      // Visual feedback: briefly flash
    });

    api.on(IPC.APP_TOGGLE_SOUND, (enabled) => {
      this.soundManager.applySettings({ ...this.settings, soundEnabled: enabled as boolean });
    });

    api.on(IPC.APP_WORK_MODE, (enabled) => {
      this.stateMachine.setWorkMode(enabled as boolean);
    });

    api.on(IPC.APP_FOCUS_MODE, (enabled) => {
      this.stateMachine.setFocusMode(enabled as boolean);
    });

    api.on(IPC.PET_SPAWN_TOY, (data) => {
      const d = data as { toyId: string };
      this.toyEngine.spawnToy(d.toyId as any, {
        x: Math.random() * (window.innerWidth - 200) + 100,
        y: Math.random() * (window.innerHeight - 200) + 100,
      });
    });

    api.on(IPC.PET_SUMMON_TREAT, () => {
      this.stateMachine.triggerTreat();
    });

    api.on('pet:pause', (paused) => {
      this.paused = paused as boolean;
      if (!this.paused) this.stateMachine.start();
    });

    api.on('pet:recover', () => {
      this.stateMachine.recover();
      this.movementCtrl.snapToSafePosition();
    });

    api.on('system:suspend', () => {
      this.paused = true;
    });

    api.on('system:resume', () => {
      this.paused = false;
    });

    api.on('system:monitors', () => {
      this.boundsManager.refresh();
    });
  }
}

// ── Bootstrap
window.addEventListener('DOMContentLoaded', async () => {
  const mochi = new MochiApp();
  await mochi.init();
});

// Handle resize
window.addEventListener('resize', () => {
  // The BrowserWindow covers the entire work area; renderer should adapt
});
