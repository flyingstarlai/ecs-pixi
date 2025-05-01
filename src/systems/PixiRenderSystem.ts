// src/systems/RenderSystemPixi.ts
import { Application, Assets, Sprite, Texture } from "pixi.js";
import { System } from "../core/System";
import { Position } from "../components/Position";
import { Rotation } from "../components/Rotation";

/**
 * A Pixi v8 renderer that follows the official “bunny” example:
 *   ① new Application → await init
 *   ② await Assets.load()
 *   ③ use app.ticker for the main loop
 */
export class PixiRenderSystem extends System {
  private app!: Application;
  private bunnyTex!: Texture;
  private sprites = new Map<number, Sprite>(); // Entity.id → Sprite

  /* ─── Lifecycle ────────────────────────────────────────────── */

  /** Load Pixi & assets, then hook the ECS update into app.ticker */
  async prepare(): Promise<void> {
    // ❶ create & init Pixi
    this.app = new Application();
    await this.app.init({ background: "#1099bb", resizeTo: window });
    document.getElementById("pixi-container")!.appendChild(this.app.canvas);

    // ❷ load the texture once
    this.bunnyTex = await Assets.load("/assets/bunny.png");

    // ❸ make Pixi drive the whole ECS
    this.app.ticker.add(({ deltaMS }) => {
      this.world.execute(deltaMS); // deltaMS = milliseconds
    });
  }

  /** Spawn sprites for all current entities that need one */
  initialize(): void {
    for (const e of this.query((q) => q.with(Position).with(Rotation))) {
      this.spawnSprite(e.id);
    }
  }

  /** Sync entity state → Pixi display objects */
  execute(): void {
    for (const e of this.query((q) => q.with(Position).with(Rotation))) {
      const { x, y } = e.readComponent(Position)!;
      const { angle } = e.readComponent(Rotation)!;

      let sp = this.sprites.get(e.id);
      if (!sp) sp = this.spawnSprite(e.id); // late-born entity

      sp.position.set(x, y);
      sp.rotation = angle * (Math.PI / 180); // deg → rad
    }
  }

  finalize(): void {
    this.app.destroy(true, { children: true });
  }

  /* ─── Helpers ──────────────────────────────────────────────── */

  private spawnSprite(id: number): Sprite {
    const sp = new Sprite(this.bunnyTex);
    sp.anchor.set(0.5);
    this.app.stage.addChild(sp);
    this.sprites.set(id, sp);
    return sp;
  }
}
