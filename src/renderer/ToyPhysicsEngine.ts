// ============================================================
// Mochi – Toy Physics Engine
// ============================================================
import * as PIXI from 'pixi.js';
import type { ToyId, ToyInstance, Position } from '../shared/types';
import type { DesktopBoundsManager } from './DesktopBoundsManager';

const TOY_COLORS: Record<ToyId, number> = {
  yarn_ball: 0xE86B6B,
  bouncing_ball: 0x6BE86B,
  feather_wand: 0xA86BE8,
  plush_mouse: 0xC8A87A,
  paper_ball: 0xE8E8BB,
  laser_dot: 0xFF2222,
  string: 0xE8C86B,
  cardboard_box: 0xC8A050,
  cushion: 0x88C8E8,
  fish_plush: 0xFF8844,
};

interface ToySprite {
  instance: ToyInstance;
  gfx: PIXI.Graphics;
}

export class ToyPhysicsEngine {
  private app: PIXI.Application;
  private boundsManager: DesktopBoundsManager;
  private toys: ToySprite[] = [];
  private toyContainer: PIXI.Container;

  private readonly GRAVITY = 600;
  private readonly FRICTION = 0.95;
  private readonly BOUNCE = 0.55;

  constructor(app: PIXI.Application, boundsManager: DesktopBoundsManager) {
    this.app = app;
    this.boundsManager = boundsManager;
    this.toyContainer = new PIXI.Container();
    // Insert below cat layer
    this.app.stage.addChildAt(this.toyContainer, 0);
  }

  spawnToy(typeId: ToyId, position: Position): void {
    const instance: ToyInstance = {
      id: `toy_${Date.now()}_${Math.random()}`,
      typeId,
      position: { ...position },
      velocity: {
        x: (Math.random() - 0.5) * 200,
        y: -100 - Math.random() * 100,
      },
      rotation: 0,
      angularVelocity: (Math.random() - 0.5) * 5,
      isActive: true,
    };

    const gfx = this.createToyGraphic(typeId);
    gfx.x = position.x;
    gfx.y = position.y;
    this.toyContainer.addChild(gfx);

    this.toys.push({ instance, gfx });
  }

  private createToyGraphic(typeId: ToyId): PIXI.Graphics {
    const g = new PIXI.Graphics();
    const color = TOY_COLORS[typeId] ?? 0xAAAAAA;

    switch (typeId) {
      case 'yarn_ball':
      case 'bouncing_ball':
      case 'paper_ball': {
        g.beginFill(color);
        g.drawCircle(0, 0, 12);
        g.endFill();
        // Yarn lines
        if (typeId === 'yarn_ball') {
          g.lineStyle(1, 0xFFFFFF, 0.4);
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI;
            g.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
            g.lineTo(Math.cos(angle + 0.5) * 8, Math.sin(angle + 0.5) * 8);
          }
          g.lineStyle(0);
        }
        break;
      }
      case 'plush_mouse':
      case 'fish_plush': {
        g.beginFill(color);
        g.drawEllipse(0, 0, 14, 8);
        g.endFill();
        // Ear/tail
        g.beginFill(color);
        if (typeId === 'plush_mouse') {
          g.drawCircle(10, -6, 5);
        } else {
          g.moveTo(-14, 0);
          g.lineTo(-22, -6);
          g.lineTo(-22, 6);
          g.closePath();
        }
        g.endFill();
        break;
      }
      case 'feather_wand': {
        g.lineStyle(2, 0x885500);
        g.moveTo(0, 30);
        g.lineTo(0, -10);
        g.lineStyle(0);
        g.beginFill(color);
        g.drawEllipse(2, -16, 5, 10);
        g.drawEllipse(-2, -14, 4, 8);
        g.endFill();
        break;
      }
      case 'laser_dot': {
        g.beginFill(color, 0.9);
        g.drawCircle(0, 0, 5);
        g.endFill();
        g.beginFill(0xFF6666, 0.5);
        g.drawCircle(0, 0, 9);
        g.endFill();
        break;
      }
      case 'cardboard_box': {
        g.beginFill(color);
        g.drawRect(-18, -15, 36, 28);
        g.endFill();
        g.lineStyle(1, 0x885500);
        g.drawRect(-18, -15, 36, 28);
        // Flaps
        g.moveTo(-18, -15);
        g.lineTo(-10, -22);
        g.lineTo(0, -17);
        g.lineTo(10, -22);
        g.lineTo(18, -15);
        g.lineStyle(0);
        break;
      }
      case 'cushion': {
        g.beginFill(color);
        g.drawEllipse(0, 0, 20, 14);
        g.endFill();
        g.lineStyle(1, 0x5588CC, 0.5);
        g.drawEllipse(0, 0, 15, 10);
        g.lineStyle(0);
        break;
      }
      case 'string': {
        g.lineStyle(2, color);
        g.moveTo(0, -20);
        g.bezierCurveTo(10, 0, -10, 10, 5, 20);
        g.lineStyle(0);
        break;
      }
    }

    return g;
  }

  update(delta: number): void {
    const dt = delta / 60;
    const floorY = this.boundsManager.maxY;

    for (const toy of this.toys) {
      if (!toy.instance.isActive) continue;

      const inst = toy.instance;

      // Skip gravity for special toys
      if (inst.typeId !== 'laser_dot' && inst.typeId !== 'feather_wand') {
        inst.velocity.y += this.GRAVITY * dt;
      }

      inst.position.x += inst.velocity.x * dt;
      inst.position.y += inst.velocity.y * dt;
      inst.rotation += inst.angularVelocity * dt;

      // Floor collision
      if (inst.position.y >= floorY) {
        inst.position.y = floorY;
        inst.velocity.y *= -this.BOUNCE;
        inst.velocity.x *= this.FRICTION;
        inst.angularVelocity *= 0.8;
        if (Math.abs(inst.velocity.y) < 20) inst.velocity.y = 0;
      }

      // Wall collisions
      if (inst.position.x < this.boundsManager.minX) {
        inst.position.x = this.boundsManager.minX;
        inst.velocity.x *= -this.BOUNCE;
      }
      if (inst.position.x > this.boundsManager.maxX) {
        inst.position.x = this.boundsManager.maxX;
        inst.velocity.x *= -this.BOUNCE;
      }

      // Apply friction
      inst.velocity.x *= 0.998;

      // Update graphic
      toy.gfx.x = inst.position.x;
      toy.gfx.y = inst.position.y;
      toy.gfx.rotation = inst.rotation;
    }

    // Remove toys that have been still for too long (cleanup)
    // (leave toys on desktop until removed)
  }

  getNearestActiveToy(x: number, y: number): ToyInstance | null {
    let nearest: ToyInstance | null = null;
    let minDist = 350; // Only consider toys within 350px

    for (const toy of this.toys) {
      if (!toy.instance.isActive) continue;
      const dx = toy.instance.position.x - x;
      const dy = toy.instance.position.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = toy.instance;
      }
    }

    return nearest;
  }

  batToy(toy: ToyInstance): void {
    toy.velocity.x = (Math.random() - 0.5) * 300;
    toy.velocity.y = -150 - Math.random() * 100;
    toy.angularVelocity = (Math.random() - 0.5) * 8;
  }

  removeAllToys(): void {
    this.toys.forEach((t) => t.gfx.destroy());
    this.toys = [];
  }
}
