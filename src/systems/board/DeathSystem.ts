import { System } from "../../core/System.ts";
import { HeroTag } from "../../components/Tags.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { Container, Graphics } from "pixi.js";
import { Moving } from "../../components/Moving.ts";
import { EntityRenderSystem } from "../render/EntityRenderSystem.ts";
import { Dead, Dir } from "../../components/Dead.ts";
import { UIGame } from "../../constants/UIGame.ts";
import { BoardRenderSystem } from "../render/BoardRenderSystem.ts";

interface BlipParticle {
  gfx: Graphics;
  angle: number;
  speed: number;
  life: number;
  duration: number;
}

export class DeathSystem extends System {
  private gridCtn!: Container;
  private renderer!: EntityRenderSystem;
  private particles: BlipParticle[] = [];

  async prepare() {
    this.gridCtn = this.world.getSystem(BoardRenderSystem)!.gridCtn;
    this.renderer = this.world.getSystem(EntityRenderSystem)!;
  }

  execute(deltaMs: number): void {
    // 1) Spawn bursts for new DeathTags
    for (const [hero, grid, dead] of this.query((q) =>
      q.with(GridPosition).with(Dead).with(HeroTag),
    )) {
      const moving = hero.readComponent(Moving);
      if (moving) return;

      this.spawnBlip(grid, dead);
      this.renderer.getSpriteForEntity(hero.id).visible = false;

      hero.removeComponent(Dead);
    }

    if (this.particles.length === 0) return;

    // 2) Update all active particles
    const toRemove: BlipParticle[] = [];
    for (const p of this.particles) {
      p.life += deltaMs;
      const t = p.life / p.duration;

      if (t >= 1) {
        p.gfx.destroy();
        toRemove.push(p);
      } else {
        // move
        const dt = deltaMs / 1000;
        p.gfx.x += Math.cos(p.angle) * p.speed * dt;
        p.gfx.y += Math.sin(p.angle) * p.speed * dt;
        // fade & expand
        p.gfx.alpha = 1 - t;
        p.gfx.scale.set(1 + t);
      }
    }

    // 3) Remove finished particles from array
    this.particles = this.particles.filter((p) => !toRemove.includes(p));
  }

  private spawnBlip(grid: GridPosition, dead: Dead): void {
    const { dir } = dead;
    const count = 30;
    let startX = grid.col * UIGame.TILE_SIZE;
    let startY = grid.row * UIGame.TILE_SIZE;

    if (dir === Dir.Up) {
      startX += UIGame.TILE_SIZE / 2;
      startY += UIGame.TILE_SIZE;
    }

    if (dir === Dir.Down) {
      startX += UIGame.TILE_SIZE / 2;
    }

    if (dir === Dir.Left) {
      startX += UIGame.TILE_SIZE;
      startY += UIGame.TILE_SIZE / 2;
    }

    if (dir === Dir.Right) {
      startY += UIGame.TILE_SIZE / 2;
    }

    for (let i = 0; i < count; i++) {
      const size = 5 + Math.random() * 10;
      const gfx = new Graphics().rect(0, 0, size, size).fill(0xff131c);

      gfx.position.set(startX, startY);
      this.gridCtn.addChild(gfx);

      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 120;
      const duration = 400 + Math.random() * 300;

      this.particles.push({ gfx, angle, speed, life: 0, duration });
    }
  }
}
