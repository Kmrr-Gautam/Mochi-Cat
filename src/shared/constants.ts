// ============================================================
// Mochi – Shared Constants
// ============================================================
import type { AppSettings, PetData, PersonalityConfig, EmotionState, VitalStats, AppearanceConfig } from './types';

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  furColor: '#FFF8F0',
  patchColor: '#E8834A',
  eyeColor: '#4A9FE8',
  size: 2.0,
  accessories: [],
};

export const DEFAULT_EMOTIONS: EmotionState = {
  happiness: 75,
  curiosity: 60,
  trust: 50,
  excitement: 40,
  fear: 10,
  annoyance: 0,
  affection: 50,
  sleepiness: 20,
  sadness: 0,
};

export const DEFAULT_VITALS: VitalStats = {
  energy: 80,
  playfulness: 70,
  comfort: 75,
  treatInterest: 60,
};

export const DEFAULT_PERSONALITY: PersonalityConfig = {
  preset: 'playful',
  wanderFrequency: 1.0,
  playFrequency: 1.0,
  sleepFrequency: 1.0,
  cursorInterest: 1.0,
  affectionLevel: 1.0,
  zoomiesFrequency: 1.0,
  explorationRange: 1.0,
  shyness: 0.3,
};

export const PERSONALITY_PRESETS: Record<string, PersonalityConfig> = {
  cuddly: {
    preset: 'cuddly',
    wanderFrequency: 0.5,
    playFrequency: 0.7,
    sleepFrequency: 1.2,
    cursorInterest: 0.8,
    affectionLevel: 1.8,
    zoomiesFrequency: 0.3,
    explorationRange: 0.5,
    shyness: 0.2,
  },
  playful: {
    preset: 'playful',
    wanderFrequency: 1.2,
    playFrequency: 1.8,
    sleepFrequency: 0.7,
    cursorInterest: 1.6,
    affectionLevel: 1.0,
    zoomiesFrequency: 1.4,
    explorationRange: 1.2,
    shyness: 0.1,
  },
  curious: {
    preset: 'curious',
    wanderFrequency: 1.5,
    playFrequency: 1.0,
    sleepFrequency: 0.7,
    cursorInterest: 1.4,
    affectionLevel: 0.8,
    zoomiesFrequency: 0.8,
    explorationRange: 1.8,
    shyness: 0.3,
  },
  sleepy: {
    preset: 'sleepy',
    wanderFrequency: 0.4,
    playFrequency: 0.5,
    sleepFrequency: 2.0,
    cursorInterest: 0.5,
    affectionLevel: 1.0,
    zoomiesFrequency: 0.2,
    explorationRange: 0.4,
    shyness: 0.2,
  },
  chaotic: {
    preset: 'chaotic',
    wanderFrequency: 1.8,
    playFrequency: 1.5,
    sleepFrequency: 0.5,
    cursorInterest: 1.5,
    affectionLevel: 0.7,
    zoomiesFrequency: 2.0,
    explorationRange: 1.8,
    shyness: 0.05,
  },
  shy: {
    preset: 'shy',
    wanderFrequency: 0.7,
    playFrequency: 0.8,
    sleepFrequency: 1.0,
    cursorInterest: 0.6,
    affectionLevel: 0.9,
    zoomiesFrequency: 0.5,
    explorationRange: 0.6,
    shyness: 0.9,
  },
  independent: {
    preset: 'independent',
    wanderFrequency: 1.4,
    playFrequency: 0.9,
    sleepFrequency: 1.0,
    cursorInterest: 0.5,
    affectionLevel: 0.5,
    zoomiesFrequency: 0.9,
    explorationRange: 1.6,
    shyness: 0.5,
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  alwaysOnTop: true,
  clickThrough: false,
  startWithWindows: false,
  showInTaskbar: false,
  workMode: false,
  focusMode: false,
  cursorTracking: true,
  windowAwareness: true,
  activityFrequency: 'normal',
  virtualCareEnabled: true,
  soundEnabled: false,
  soundVolume: 0.5,
  petScale: 1.0,
  targetFps: 60,
  lowPowerMode: false,
  roughInteractionResponse: true,
  cryingEnabled: true,
  idleDetection: true,
  rareEventFrequency: 'normal',
  onboardingComplete: false,
};

export const PET_BASE_SIZE = { width: 120, height: 120 };

export const ANIMATION_FPS = 12; // sprite animation fps

export const STATE_DATA_VERSION = 1;
