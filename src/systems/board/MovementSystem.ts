import { System } from "../../core/System.ts";
import { Moving } from "../../components/Moving.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { HeroTag } from "../../components/Tags.ts";
import { HeroEvent } from "../../events/HeroEvent.ts";
import { Animation } from "../../components/Animation.ts";
import { Dead, Dir } from "../../components/Dead.ts";
import { UIGame } from "../../constants/UIGame.ts";

export class MovementSystem extends System {
  execute(deltaMs: number): void {
    const dt = deltaMs / 1000;

    for (const [entity, grid] of this.query((q) =>
      q.with(GridPosition).with(HeroTag),
    )) {
      // Currently tweening?
      const moving = entity.readComponent(Moving);
      const anim = entity.readComponent(Animation);
      if (moving) {
        const dead = entity.readComponent(Dead);
        const threshold = dead
          ? dead.dir === Dir.Down
            ? dead.movingDownThresh
            : dead.movingThresh
          : 1;
        moving.progress = Math.min(
          1,
          moving.progress + dt / (moving.duration * threshold),
        );

        if (moving.progress >= threshold) {
          // Arrived
          grid.col = moving.dstCol;
          grid.row = moving.dstRow;

          entity.removeComponent(Moving);
          if (anim) {
            // anim.name = "idle";
          }
          this.world.emit?.(HeroEvent.EnterTile, {
            col: grid.col,
            row: grid.row,
          });
        }
        continue;
      }

      // Not moving: pick queued direction (from InputSystem)
      const { dx, dy } = this.consumeDirection(); // implement as you wish
      if (!dx && !dy) continue;

      const dstCol = grid.col + dx;
      const dstRow = grid.row + dy;

      // basic bounds / obstacle check
      if (
        dstCol < 0 ||
        dstCol >= UIGame.GRID_COLS ||
        dstRow < 0 ||
        dstRow >= UIGame.GRID_ROWS
      ) {
        console.log("out of bounds");
      }

      // TODO: obstacle tile check using Tile component

      entity.addComponent(
        Moving,
        new Moving(grid.col, grid.row, dstCol, dstRow),
      );
      this.world.emit?.(HeroEvent.StartMove, {
        from: { ...grid },
        to: { dstCol, dstRow },
      });
      this.world.emit?.(HeroEvent.ExitTile, { col: grid.col, row: grid.row });
    }
  }

  private consumeDirection(): { dx: number; dy: number } {
    // Simplest: stash last key in a field set by InputSystem.
    // Here return {dx,dy} stub.
    return { dx: 0, dy: 0 };
  }
}
