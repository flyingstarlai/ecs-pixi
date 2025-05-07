import { Component } from "../../core/Component";
import { System } from "../../core/System.ts";
import { BoardRenderSystem } from "../render/BoardRenderSystem.ts";
import { EntityRenderSystem } from "../render/EntityRenderSystem.ts";
import { HeroTag, MonsterTag } from "../../components/Tags.ts";
import { Animation, AnimName } from "../../components/Animation.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { Tile } from "../../components/Tile.ts";

// one-shot flag so we only clear each attack once
class AttackProcessed implements Component {}

export class AttackSystem extends System {
  execute(): void {
    const gridSys = this.world.getSystem(BoardRenderSystem)!;
    const rend = this.world.getSystem(EntityRenderSystem);

    // 0) Clean up any stale markers when hero is no longer attacking
    for (const [hero, anim] of this.query((q) =>
      q.with(Animation).with(AttackProcessed).with(HeroTag),
    )) {
      if (anim.name !== AnimName.attack) {
        hero.removeComponent(AttackProcessed);
      }
    }

    // 1) Find heroes who just finished their attack clip
    for (const [hero, grid, anim] of this.query((q) =>
      q.with(GridPosition).with(Animation).with(HeroTag),
    )) {
      // only trigger once when clip is done
      if (anim.name !== AnimName.attack || anim.playing) continue;
      if (hero.has(AttackProcessed)) continue;

      // mark it so we don't do it again until next attack
      hero.addComponent(AttackProcessed, new AttackProcessed());

      // compute all 4 neighboring cells
      const neighbors = [
        { col: grid.col + 1, row: grid.row },
        { col: grid.col - 1, row: grid.row },
        { col: grid.col, row: grid.row + 1 },
        { col: grid.col, row: grid.row - 1 },
      ];

      // 2) flip any obstacle → path
      for (const { col, row } of neighbors) {
        for (const [tE, tile] of this.query((q) => q.with(Tile))) {
          if (
            tile.kind === "obstacle" &&
            tile.col === col &&
            tile.row === row
          ) {
            tile.kind = "path";
            gridSys.updateTile(tE.id, "path");
            break;
          }
        }
      }

      // 3) kill any monsters there
      for (const { col, row } of neighbors) {
        for (const [mE, mGrid] of this.query((q) =>
          q.with(GridPosition).with(MonsterTag),
        )) {
          if (mGrid.col === col && mGrid.row === row) {
            // remove its sprite first
            rend?.removeSprite(mE.id);
            // then remove the entity
            this.world.removeEntity(
              this.world.entities.find((e) => e.id === mE.id)!,
            );
            break;
          }
        }
      }
    }
  }
}
