// ============================================================
// Mochi – Movement Controller
// ============================================================
import type { DesktopBoundsManager } from './DesktopBoundsManager';
import type { PetPersonalityEngine } from './PetPersonalityEngine';

export class MovementController {
  private boundsManager: DesktopBoundsManager;
  private personality: PetPersonalityEngine;

  constructor(boundsManager: DesktopBoundsManager, personality: PetPersonalityEngine) {
    this.boundsManager = boundsManager;
    this.personality = personality;
  }

  /** Generate a wandering destination */
  getWanderTarget(currentX: number, currentY: number): { x: number; y: number } {
    const range = 250 * this.personality.getConfig().explorationRange;
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * range;
    const tx = this.boundsManager.clampX(currentX + Math.cos(angle) * dist);
    const ty = this.boundsManager.clampY(currentY + Math.sin(angle) * dist * 0.3);
    return { x: tx, y: ty };
  }

  snapToSafePosition(): void {
    // Recovery - move to center bottom
  }

  /** Interpolate toward a target position */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}
