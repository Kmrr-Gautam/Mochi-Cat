// ============================================================
// Mochi – Sprite Factory
// Draws a cute realistic 2D kitten using PixiJS Graphics API
// ============================================================
import * as PIXI from 'pixi.js';
import type { AppearanceConfig } from '../shared/types';

export class MochiSpriteFactory {
  public baseHeight = 60; // pivot point (feet)
  private appearance: AppearanceConfig;

  constructor(appearance: AppearanceConfig) {
    this.appearance = appearance;
  }

  updateAppearance(appearance: AppearanceConfig): void {
    this.appearance = appearance;
  }

  createCatParts() {
    const fur = parseInt(this.appearance.furColor.replace('#', ''), 16);
    const patch = parseInt(this.appearance.patchColor.replace('#', ''), 16);
    const eye = parseInt(this.appearance.eyeColor.replace('#', ''), 16);
    const shadow = this.darken(fur, 0.15);
    const highlight = this.lighten(fur, 0.1);

    return {
      tail: this.makeTail(fur, patch, shadow),
      backLegs: this.makeBackLegs(fur, shadow),
      body: this.makeBody(fur, patch, shadow, highlight),
      frontLegs: this.makeFrontLegs(fur, shadow),
      head: this.makeHead(fur, patch, shadow, highlight),
      ears: this.makeEars(fur, patch),
      eyes: this.makeEyes(eye),
      nose: this.makeNose(),
      whiskers: this.makeWhiskers(),
      accessories: this.makeAccessories(),
    };
  }

  private makeBody(fur: number, patch: number, shadow: number, highlight: number): PIXI.Graphics {
    const g = new PIXI.Graphics();
    // Main body – rounded ellipse
    g.beginFill(fur);
    g.drawEllipse(0, -25, 22, 26);
    g.endFill();

    // Orange patch on left side
    g.beginFill(patch, 0.7);
    g.drawEllipse(-8, -20, 10, 14);
    g.endFill();

    // Chest/belly area slightly lighter
    g.beginFill(highlight, 0.5);
    g.drawEllipse(4, -18, 12, 16);
    g.endFill();

    // Shadow underside
    g.beginFill(shadow, 0.3);
    g.drawEllipse(0, -10, 18, 8);
    g.endFill();

    // Fur texture lines (simplified strokes)
    g.lineStyle(0.5, shadow, 0.4);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI;
      g.moveTo(Math.cos(angle) * 18, -25 + Math.sin(angle) * 22);
      g.lineTo(Math.cos(angle) * 14, -25 + Math.sin(angle) * 18);
    }
    g.lineStyle(0);

    return g;
  }

  private makeHead(fur: number, patch: number, shadow: number, highlight: number): PIXI.Graphics {
    const g = new PIXI.Graphics();
    // Head – large rounded circle for kitten proportions
    g.beginFill(fur);
    g.drawCircle(0, 0, 24);
    g.endFill();

    // Orange patch on top-right
    g.beginFill(patch, 0.65);
    g.drawEllipse(8, -8, 12, 10);
    g.endFill();

    // Cheek puffs
    g.beginFill(highlight, 0.6);
    g.drawCircle(-15, 6, 9);
    g.drawCircle(15, 6, 9);
    g.endFill();

    // Blush
    g.beginFill(0xFFB0B0, 0.35);
    g.drawEllipse(-14, 8, 8, 5);
    g.drawEllipse(14, 8, 8, 5);
    g.endFill();

    // Forehead highlight
    g.beginFill(highlight, 0.4);
    g.drawEllipse(-3, -12, 10, 7);
    g.endFill();

    // Shadow below
    g.beginFill(shadow, 0.25);
    g.drawEllipse(0, 16, 18, 6);
    g.endFill();

    // Fur texture
    g.lineStyle(0.4, shadow, 0.3);
    [-12, -5, 5, 12].forEach((x) => {
      g.moveTo(x, -20);
      g.lineTo(x - 1, -14);
    });
    g.lineStyle(0);

    g.y = -52; // position relative to body pivot
    return g;
  }

  private makeEars(fur: number, patch: number): PIXI.Container {
    const c = new PIXI.Container();
    const pink = 0xFFB0C8;

    const makeEar = (side: number) => {
      const g = new PIXI.Graphics();
      // Outer ear
      g.beginFill(fur);
      g.moveTo(0, 0);
      g.lineTo(side * -10, -18);
      g.lineTo(side * 10, -18);
      g.closePath();
      g.endFill();

      // Inner ear pink
      g.beginFill(pink, 0.8);
      g.moveTo(0, -2);
      g.lineTo(side * -6, -15);
      g.lineTo(side * 6, -15);
      g.closePath();
      g.endFill();

      // Patch color tip on right ear
      if (side > 0) {
        g.beginFill(patch, 0.4);
        g.moveTo(4, -10);
        g.lineTo(-2, -18);
        g.lineTo(10, -18);
        g.closePath();
        g.endFill();
      }

      g.x = side * 16;
      return g;
    };

    c.addChild(makeEar(-1)); // left
    c.addChild(makeEar(1));  // right
    c.y = -73;
    return c;
  }

  private makeEyes(eyeColor: number): PIXI.Container {
    const c = new PIXI.Container();
    c.name = 'eyes';

    const makeEye = (side: number): PIXI.Container => {
      const eye = new PIXI.Container();

      // Eye white/sclera
      const sclera = new PIXI.Graphics();
      sclera.beginFill(0xFFFFFF);
      sclera.drawEllipse(0, 0, 8, 7);
      sclera.endFill();

      // Iris
      const iris = new PIXI.Graphics();
      iris.beginFill(eyeColor);
      iris.drawEllipse(0, 0, 5.5, 6);
      iris.endFill();

      // Pupil (vertical slit like a real cat)
      const pupil = new PIXI.Graphics();
      pupil.beginFill(0x111111);
      pupil.drawEllipse(0, 0, 2, 5);
      pupil.endFill();

      // Catchlight / reflection
      const catchlight = new PIXI.Graphics();
      catchlight.beginFill(0xFFFFFF, 0.9);
      catchlight.drawCircle(-1.5, -2, 1.5);
      catchlight.endFill();
      const catchlight2 = new PIXI.Graphics();
      catchlight2.beginFill(0xFFFFFF, 0.5);
      catchlight2.drawCircle(2, 1.5, 0.8);
      catchlight2.endFill();

      // Upper eyelid for blinking
      const eyelid = new PIXI.Graphics();
      eyelid.name = 'eyelid';
      eyelid.beginFill(parseInt(this.appearance.furColor.replace('#', ''), 16));
      eyelid.drawEllipse(0, 0, 9, 8);
      eyelid.endFill();
      eyelid.y = -8;

      eye.addChild(sclera);
      eye.addChild(iris);
      eye.addChild(pupil);
      eye.addChild(catchlight);
      eye.addChild(catchlight2);
      eye.addChild(eyelid);

      eye.x = side * 10;
      return eye;
    };

    const pupils = new PIXI.Container();
    pupils.name = 'pupils';

    const leftEye = makeEye(-1);
    const rightEye = makeEye(1);
    c.addChild(leftEye);
    c.addChild(rightEye);

    // Eyelids container for blink control
    const eyelids = new PIXI.Graphics();
    eyelids.name = 'eyelids';
    eyelids.alpha = 0;
    eyelids.beginFill(parseInt(this.appearance.furColor.replace('#', ''), 16));
    eyelids.drawEllipse(-10, 0, 9, 8);
    eyelids.drawEllipse(10, 0, 9, 8);
    eyelids.endFill();
    c.addChild(eyelids);

    c.y = -50;
    return c;
  }

  private makeNose(): PIXI.Graphics {
    const g = new PIXI.Graphics();
    // Tiny pink triangular nose
    g.beginFill(0xFF9999);
    g.moveTo(0, 0);
    g.lineTo(-3, -3);
    g.lineTo(3, -3);
    g.closePath();
    g.endFill();

    // Mouth lines
    g.lineStyle(0.8, 0xCC7777, 0.8);
    g.moveTo(-1, 1);
    g.lineTo(-4, 4);
    g.moveTo(1, 1);
    g.lineTo(4, 4);
    g.lineStyle(0);

    g.y = -40;
    return g;
  }

  private makeWhiskers(): PIXI.Graphics {
    const g = new PIXI.Graphics();
    g.lineStyle(0.7, 0xFFFFFF, 0.85);

    // Left whiskers
    [[-4, 0], [-3, 2], [-2, 4]].forEach(([y, spread]) => {
      g.moveTo(-8, y!);
      g.lineTo(-28, y! - 2 - spread!);
    });

    // Right whiskers
    [[-4, 0], [-3, 2], [-2, 4]].forEach(([y, spread]) => {
      g.moveTo(8, y!);
      g.lineTo(28, y! - 2 - spread!);
    });

    g.lineStyle(0);
    g.y = -40;
    return g;
  }

  private makeFrontLegs(fur: number, shadow: number): PIXI.Container {
    const c = new PIXI.Container();

    const makeLeg = (x: number) => {
      const g = new PIXI.Graphics();
      // Upper leg
      g.beginFill(fur);
      g.drawRoundedRect(-5, 0, 10, 20, 4);
      g.endFill();
      // Paw
      g.beginFill(fur);
      g.drawEllipse(0, 22, 7, 5);
      g.endFill();
      // Toe lines
      g.lineStyle(0.5, shadow, 0.5);
      [-2, 0, 2].forEach((tx) => {
        g.moveTo(tx, 19);
        g.lineTo(tx - 0.5, 26);
      });
      g.lineStyle(0);
      g.x = x;
      return g;
    };

    c.addChild(makeLeg(-10));
    c.addChild(makeLeg(10));
    c.pivot.set(0, 0);
    c.y = 0;
    return c;
  }

  private makeBackLegs(fur: number, shadow: number): PIXI.Container {
    const c = new PIXI.Container();

    const makeLeg = (x: number) => {
      const g = new PIXI.Graphics();
      g.beginFill(fur);
      g.drawRoundedRect(-6, 0, 12, 24, 5);
      g.endFill();
      g.beginFill(fur);
      g.drawEllipse(0, 26, 9, 5);
      g.endFill();
      g.lineStyle(0.5, shadow, 0.4);
      [-2, 0, 2].forEach((tx) => {
        g.moveTo(tx, 22);
        g.lineTo(tx - 0.5, 30);
      });
      g.lineStyle(0);
      g.x = x;
      return g;
    };

    c.addChild(makeLeg(-12));
    c.addChild(makeLeg(12));
    c.y = -10;
    return c;
  }

  private makeTail(fur: number, patch: number, shadow: number): PIXI.Graphics {
    const g = new PIXI.Graphics();

    // Tail as a bezier curve (simplified as a thick rounded shape)
    g.lineStyle(10, fur, 1, 0.5, true);
    g.moveTo(0, -20);
    g.quadraticCurveTo(40, -30, 30, -55);
    g.lineStyle(0);

    // Fluffy tip
    g.beginFill(fur);
    g.drawCircle(30, -55, 8);
    g.endFill();
    // Orange patch on tail tip
    g.beginFill(patch, 0.5);
    g.drawCircle(26, -52, 5);
    g.endFill();

    g.x = -15;
    g.pivot.set(0, -20);
    return g;
  }

  private makeAccessories(): PIXI.Container {
    const c = new PIXI.Container();
    // Accessories are added dynamically based on AppearanceConfig
    this.appearance.accessories.forEach((accId) => {
      const acc = this.createAccessory(accId);
      if (acc) c.addChild(acc);
    });
    return c;
  }

  private createAccessory(id: string): PIXI.DisplayObject | null {
    switch (id) {
      case 'bow': {
        const bow = new PIXI.Graphics();
        bow.beginFill(0xFF88AA);
        bow.drawEllipse(-8, 0, 6, 4);
        bow.drawEllipse(8, 0, 6, 4);
        bow.endFill();
        bow.beginFill(0xFF5599);
        bow.drawCircle(0, 0, 3);
        bow.endFill();
        bow.y = -88;
        return bow;
      }
      case 'glasses': {
        const glasses = new PIXI.Graphics();
        glasses.lineStyle(1.5, 0x333333);
        glasses.drawCircle(-10, 0, 6);
        glasses.drawCircle(10, 0, 6);
        glasses.moveTo(-4, 0);
        glasses.lineTo(4, 0);
        glasses.moveTo(-16, -2);
        glasses.lineTo(-22, -3);
        glasses.moveTo(16, -2);
        glasses.lineTo(22, -3);
        glasses.lineStyle(0);
        glasses.y = -52;
        return glasses;
      }
      case 'bell_collar': {
        const collar = new PIXI.Graphics();
        collar.lineStyle(3, 0xCC3333);
        collar.drawEllipse(0, 0, 18, 4);
        collar.lineStyle(0);
        collar.beginFill(0xFFDD00);
        collar.drawCircle(0, 3, 3);
        collar.endFill();
        collar.y = -33;
        return collar;
      }
      case 'flower_crown': {
        const crown = new PIXI.Graphics();
        [-16, -8, 0, 8, 16].forEach((x) => {
          crown.beginFill(0xFFDD44);
          crown.drawCircle(x, 0, 4);
          crown.endFill();
          crown.beginFill(0xFF8800);
          crown.drawCircle(x, 0, 2);
          crown.endFill();
        });
        crown.lineStyle(1, 0x44AA44);
        crown.moveTo(-16, 2);
        crown.lineTo(16, 2);
        crown.lineStyle(0);
        crown.y = -78;
        return crown;
      }
      default:
        return null;
    }
  }

  // ── Color utilities
  private darken(hex: number, amount: number): number {
    const r = Math.max(0, ((hex >> 16) & 0xFF) * (1 - amount));
    const g = Math.max(0, ((hex >> 8) & 0xFF) * (1 - amount));
    const b = Math.max(0, (hex & 0xFF) * (1 - amount));
    return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
  }

  private lighten(hex: number, amount: number): number {
    const r = Math.min(255, ((hex >> 16) & 0xFF) * (1 + amount));
    const g = Math.min(255, ((hex >> 8) & 0xFF) * (1 + amount));
    const b = Math.min(255, (hex & 0xFF) * (1 + amount));
    return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
  }
}
