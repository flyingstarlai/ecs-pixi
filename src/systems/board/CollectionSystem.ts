import { System } from "../../core/System.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { Animation, AnimName } from "../../components/Animation.ts";
import { HeroTag, DonutTag } from "../../components/Tags.ts";
import { Tile } from "../../components/Tile.ts";
import { StarBag } from "../../components/StarBag.ts";
import { BoardRenderSystem } from "../render/BoardRenderSystem.ts";
import { EntityRenderSystem } from "../render/EntityRenderSystem.ts";

export class CollectionSystem extends System {
  execute(): void {
    const render = this.world.getSystem(EntityRenderSystem)!;
    // Gather star‐entities to remove so we don’t mutate during iteration
    const toRemove: number[] = [];

    for (const [, grid, anim, bag] of this.query((q) =>
      q.with(GridPosition).with(Animation).with(StarBag).with(HeroTag),
    )) {
      if (anim.name === AnimName.jump && anim.playing) {
        if (anim.frame >= 5 && anim.frame <= 6) {
          for (const [te, tile] of this.query((q) => q.with(Tile))) {
            if (
              tile.kind === "collectible" &&
              tile.col === grid.col &&
              tile.row === grid.row
            ) {
              // 1) collect
              bag.count += 1;
              tile.kind = "path";
              this.world
                .getSystem(BoardRenderSystem)!
                .updateTile(te.id, "path");

              // 2) mark the matching DonutTag entity for removal
              for (const [de, dGrid] of this.query((q) =>
                q.with(GridPosition).with(DonutTag),
              )) {
                if (dGrid.col === grid.col && dGrid.row === grid.row) {
                  toRemove.push(de.id);
                }
              }
            }
          }
        }
      }
    }

    // Now do the removals in a separate pass:
    for (const id of toRemove) {
      render.removeSprite(id);
      this.world.removeEntity(
        // you can pass either the entity or its ID depending on your API:
        this.world.entities.find((e) => e.id === id)!,
      );
    }
  }
}
