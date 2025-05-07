import { System } from "../../core/System.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { HeroTag } from "../../components/Tags.ts";
import { Moving } from "../../components/Moving.ts";
import { Dir, LastDir } from "../../components/LastDir.ts";
import { Animation, AnimName } from "../../components/Animation.ts";
import { UIGame } from "../../constants/UIGame.ts";

export class InputSystem extends System {
  private keys = new Set<string>();

  initialize() {
    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
  }

  execute(): void {
    // (1) grab the single hero; bail out if none
    const heroTuple = [
      ...this.query((q) => q.with(GridPosition).with(Animation).with(HeroTag)),
    ][0];
    if (!heroTuple) return;

    const [hero, grid, anim] = heroTuple;

    // (2) ignore input while a Moving tween is attached
    if (hero.has(Moving)) return;

    // (3) translate keypad → delta
    const { dx, dy } = this.readDirection();
    if (!dx && !dy) return; // no input

    const lastDir = hero.writeComponent(LastDir);
    if (dx === 1) lastDir.dir = Dir.Right;
    else if (dx === -1) lastDir.dir = Dir.Left;
    else if (dy === -1) lastDir.dir = Dir.Up;
    else if (dy === 1) lastDir.dir = Dir.Down;

    const dstCol = grid.col + dx;
    const dstRow = grid.row + dy;

    // (4) basic bounds check
    if (
      dstCol < 0 ||
      dstCol >= UIGame.GRID_COLS ||
      dstRow < 0 ||
      dstRow >= UIGame.GRID_ROWS
    )
      return;

    // TODO: obstacle check by reading Tile component here

    // (5) attach tween; HeroMovementSystem will advance it
    hero.addComponent(Moving, new Moving(grid.col, grid.row, dstCol, dstRow));
    anim.name = AnimName.walk;
    anim.playing = true;
    anim.frame = 0;
  }

  /* ---------- helper ------------------------------------------------ */

  private readDirection(): { dx: number; dy: number } {
    let dx = 0,
      dy = 0;
    if (this.keys.has("ArrowUp") || this.keys.has("KeyW")) dy = -1;
    else if (this.keys.has("ArrowDown") || this.keys.has("KeyS")) dy = 1;
    else if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) dx = -1;
    else if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) dx = 1;
    return { dx, dy };
  }
}
