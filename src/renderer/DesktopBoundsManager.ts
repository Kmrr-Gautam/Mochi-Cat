// ============================================================
// Mochi – Desktop Bounds Manager
// ============================================================
import * as PIXI from 'pixi.js';

export class DesktopBoundsManager {
  private app: PIXI.Application;
  minX = 60;
  maxX = 0;
  minY = 80;
  maxY = 0;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.refresh();
  }

  refresh(): void {
    this.maxX = this.app.screen.width - 60;
    this.maxY = this.app.screen.height - 10;
  }

  clampX(x: number): number {
    return Math.max(this.minX, Math.min(this.maxX, x));
  }

  clampY(y: number): number {
    return Math.max(this.minY, Math.min(this.maxY, y));
  }

  safeX(x: number): number {
    return this.clampX(x);
  }

  safeY(y: number): number {
    return this.clampY(y);
  }

  randomSafeX(): number {
    return this.minX + Math.random() * (this.maxX - this.minX);
  }

  randomSafeY(): number {
    // Bias toward bottom 30% of screen (desktop pet usually walks on bottom)
    const floor = this.maxY * 0.7;
    return floor + Math.random() * (this.maxY - floor);
  }

  isAtEdge(x: number): boolean {
    return x <= this.minX + 10 || x >= this.maxX - 10;
  }

  getCenterX(): number {
    return (this.minX + this.maxX) / 2;
  }

  getCenterY(): number {
    return this.maxY * 0.85;
  }
}
