// src/systems/RenderSystemPixi.ts
import { Application, Sprite } from "pixi.js";
import { System } from "../core/System";
import { Position } from "../components/Position";
import { Rotation } from "../components/Rotation";
import { loadBundle, registerSpriteBundles } from "../assets/Assets.ts";

/**
 * A Pixi v8 renderer that follows the official “bunny” example:
 *   ① new Application → await init
 *   ② await Assets.load()
 *   ③ use app.ticker for the main loop
 */
export class PixiRenderSystem extends System {
  private app!: Application;
  private uiTex!: Awaited<ReturnType<typeof loadBundle<"ui">>>;

  private sprites = new Map<number, Sprite>(); // Entity.id → Sprite

  /* ─── Lifecycle ────────────────────────────────────────────── */

  /** Load Pixi & assets, then hook the ECS update into app.ticker */
  async prepare(): Promise<void> {
    // ❶ create & init Pixi
    this.app = new Application();
    await this.app.init({ background: "#1099bb", resizeTo: window });
    document.getElementById("pixi-container")!.appendChild(this.app.canvas);

    registerSpriteBundles();
    this.uiTex = await loadBundle("ui");

    // ❸ make Pixi drive the whole ECS
    this.app.ticker.add(({ deltaMS }) => {
      this.world.execute(deltaMS); // deltaMS = milliseconds
    });
  }

  /** Spawn sprites for all current entities that need one */
  initialize(): void {
    for (const [entity] of this.query((q) => q.with(Position).with(Rotation))) {
      this.spawnSprite(entity.id);
    }
  }

  /** Sync entity state → Pixi display objects */
  execute(): void {
    for (const [entity, pos, rot] of this.query((q) =>
      q.with(Position).with(Rotation),
    )) {
      /* ---------- FIX: use entity.id, not pos.entityId ---------- */
      const sp = this.sprites.get(entity.id) ?? this.spawnSprite(entity.id);

      sp.position.set(pos.x, pos.y);
      sp.rotation = rot.angle * (Math.PI / 180);
    }
  }

  finalize(): void {
    this.app.destroy(true, { children: true });
  }

  /* ─── Helpers ──────────────────────────────────────────────── */

  private spawnSprite(id: number): Sprite {
    const sp = new Sprite(this.uiTex.monster);
    sp.anchor.set(0.5);
    this.app.stage.addChild(sp);
    this.sprites.set(id, sp);
    return sp;
  }
}
