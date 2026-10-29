// ============================================================
// Mochi – Shared Types
// ============================================================

export type PetState =
  | 'idle'
  | 'wandering'
  | 'walking'
  | 'running'
  | 'sneaking'
  | 'lookingAround'
  | 'sniffing'
  | 'sitting'
  | 'stretching'
  | 'grooming'
  | 'scratching'
  | 'tailChasing'
  | 'jumping'
  | 'pouncing'
  | 'playing'
  | 'sleeping'
  | 'waking'
  | 'curious'
  | 'affectionate'
  | 'attentionSeeking'
  | 'startled'
  | 'annoyed'
  | 'sad'
  | 'scared'
  | 'zoomies'
  | 'windowClimbing'
  | 'windowHanging'
  | 'toyInteraction'
  | 'eatingTreat'
  | 'hiding'
  | 'watchingCursor'
  | 'restingByWindow';

export type AnimationKey =
  | 'idle'
  | 'idle_blink'
  | 'idle_tail'
  | 'walk_right'
  | 'walk_left'
  | 'run_right'
  | 'run_left'
  | 'sneak_right'
  | 'sneak_left'
  | 'sit'
  | 'sit_look'
  | 'sit_blink'
  | 'sleep_enter'
  | 'sleep_loop'
  | 'sleep_exit'
  | 'stretch'
  | 'groom'
  | 'scratch'
  | 'tail_chase'
  | 'jump_up'
  | 'jump_land'
  | 'pounce_crouch'
  | 'pounce_leap'
  | 'pounce_miss'
  | 'startle'
  | 'happy_bounce'
  | 'affection_rub'
  | 'annoy_flick'
  | 'scared_crouch'
  | 'sad_droop'
  | 'yawn'
  | 'sniff'
  | 'look_left'
  | 'look_right'
  | 'look_up'
  | 'play_bat'
  | 'play_carry'
  | 'climb_up'
  | 'hang'
  | 'climb_down'
  | 'eat'
  | 'zoomies'
  | 'peek'
  | 'wave_paw'
  | 'pet_reaction'
  | 'cry'
  | 'waking';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Position, Size {}

export interface EmotionState {
  happiness: number;    // 0-100
  curiosity: number;    // 0-100
  trust: number;        // 0-100
  excitement: number;   // 0-100
  fear: number;         // 0-100
  annoyance: number;    // 0-100
  affection: number;    // 0-100
  sleepiness: number;   // 0-100
  sadness: number;      // 0-100
}

export interface VitalStats {
  energy: number;       // 0-100
  playfulness: number;  // 0-100
  comfort: number;      // 0-100
  treatInterest: number;// 0-100
}

export type PersonalityPreset =
  | 'cuddly'
  | 'playful'
  | 'curious'
  | 'sleepy'
  | 'chaotic'
  | 'shy'
  | 'independent';

export interface PersonalityConfig {
  preset: PersonalityPreset;
  // Multipliers 0–2; 1 = default
  wanderFrequency: number;
  playFrequency: number;
  sleepFrequency: number;
  cursorInterest: number;
  affectionLevel: number;
  zoomiesFrequency: number;
  explorationRange: number;
  shyness: number;
}

export type FurColor = string; // CSS hex
export type EyeColor = string; // CSS hex

export interface AppearanceConfig {
  furColor: FurColor;
  patchColor: FurColor;
  eyeColor: EyeColor;
  size: number; // 0.5 – 2.0, 1 = default 120px tall
  accessories: AccessoryId[];
}

export type AccessoryId =
  | 'bow'
  | 'bell_collar'
  | 'flower_crown'
  | 'hoodie'
  | 'glasses'
  | 'witch_hat'
  | 'scarf'
  | 'nightcap'
  | 'backpack'
  | 'none';

export type ToyId =
  | 'yarn_ball'
  | 'bouncing_ball'
  | 'feather_wand'
  | 'plush_mouse'
  | 'paper_ball'
  | 'laser_dot'
  | 'string'
  | 'cardboard_box'
  | 'cushion'
  | 'fish_plush';

export interface ToyInstance {
  id: string;
  typeId: ToyId;
  position: Position;
  velocity: Position;
  rotation: number;
  angularVelocity: number;
  isActive: boolean;
}

export interface PetData {
  /** Unique ID for this pet instance */
  petId: string;
  name: string;
  appearance: AppearanceConfig;
  personality: PersonalityConfig;
  emotions: EmotionState;
  vitals: VitalStats;
  /** Preferred rest position (normalized 0-1) */
  favoriteRestPosition: Position;
  /** ISO timestamp */
  lastSeen: string;
  totalPlaytimeMs: number;
  totalPetCount: number;
  totalTreatsGiven: number;
  preferredToys: ToyId[];
  trustLevel: number; // 0-100, cumulative
  version: number;    // data schema version
}

export interface AppSettings {
  // Window
  alwaysOnTop: boolean;
  clickThrough: boolean;
  startWithWindows: boolean;
  showInTaskbar: boolean;
  // Behavior
  workMode: boolean;
  focusMode: boolean;
  cursorTracking: boolean;
  windowAwareness: boolean;
  activityFrequency: 'low' | 'normal' | 'high' | 'chaotic';
  // Care
  virtualCareEnabled: boolean;
  // Sound
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  // Display
  petScale: number;
  targetFps: 30 | 60;
  lowPowerMode: boolean;
  // Interaction
  roughInteractionResponse: boolean;
  cryingEnabled: boolean;
  // Privacy
  idleDetection: boolean;
  // Rare events
  rareEventFrequency: 'low' | 'normal' | 'high';
  // Onboarding
  onboardingComplete: boolean;
}

export interface MonitorInfo {
  id: number;
  bounds: Rect;
  workArea: Rect;
  scaleFactor: number;
  isPrimary: boolean;
}

export interface WindowInfo {
  id: number;
  title: string;
  bounds: Rect;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
}

// IPC message shapes
export interface IpcPetStateUpdate {
  state: PetState;
  position: Position;
  emotion: EmotionState;
}

export interface IpcToySpawn {
  toyId: ToyId;
  position: Position;
}

export interface IpcSettingsUpdate {
  settings: Partial<AppSettings>;
}

export interface IpcPetDataUpdate {
  petData: Partial<PetData>;
}

export type IpcChannel =
  | 'pet:state-update'
  | 'pet:data-update'
  | 'pet:spawn-toy'
  | 'pet:summon-treat'
  | 'pet:pet-action'
  | 'settings:get'
  | 'settings:set'
  | 'settings:changed'
  | 'petdata:get'
  | 'petdata:set'
  | 'petdata:reset'
  | 'system:monitors'
  | 'system:windows'
  | 'system:cursor-pos'
  | 'system:idle-time'
  | 'app:show-settings'
  | 'app:hide-pet'
  | 'app:show-pet'
  | 'app:toggle-click-through'
  | 'app:toggle-sound'
  | 'app:work-mode'
  | 'app:focus-mode'
  | 'app:quit'
  | 'onboarding:complete';
