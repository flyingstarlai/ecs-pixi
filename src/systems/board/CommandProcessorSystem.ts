import { System } from "../../core/System.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { Moving } from "../../components/Moving.ts";
import { Animation, AnimName } from "../../components/Animation.ts";
import { CommandType, CommandQueue } from "../../components/CommandQueue.ts";
import { HeroTag } from "../../components/Tags.ts";
import { Tile } from "../../components/Tile.ts";
import { Entity } from "../../core/Entity.ts";
import { Command } from "../../components/Command.ts";
import { Dead, Dir } from "../../components/Dead.ts";
import { UIGame } from "../../constants/UIGame.ts";

export class CommandProcessorSystem extends System {
  execute(): void {
    /* one hero assumed – take the first that matches */
    const tuple = [
      ...this.query((q) =>
        q.with(GridPosition).with(CommandQueue).with(HeroTag),
      ),
    ][0];

    if (!tuple) return;

    const [hero, grid, cmdQueue] = tuple;
    /* wait until current action finishes */
    const anim = hero.readComponent(Animation);
    if (hero.has(Moving)) return; // still tweening
    if (anim && anim.playing && anim.name !== "walk" && anim.name !== "idle")
      return; // jump/attack/dead playing

    if (!hero.has(Command)) return;
    const active = hero.writeComponent(Command);

    /* nothing to do */
    if (active.indexToPlay >= cmdQueue.queue.length || hero.has(Dead)) {
      hero.removeComponent(Command);
      this.playClip(hero, AnimName.idle, 10);
      return;
    }

    active.pending = Math.min(active.indexToPlay, cmdQueue.queue.length - 1);

    /* pop first command */
    const cmd = cmdQueue.queue[active.indexToPlay];

    switch (cmd) {
      /* --------------- movement -------------------------------- */
      case CommandType.MoveRight:
        this.tryMove(hero, grid, 1, 0);
        break;
      case CommandType.MoveLeft:
        this.tryMove(hero, grid, -1, 0);
        break;
      case CommandType.MoveUp:
        this.tryMove(hero, grid, 0, -1);
        break;
      case CommandType.MoveDown:
        this.tryMove(hero, grid, 0, 1);
        break;

      /* --------------- one-shot clips -------------------------- */
      case CommandType.Jump:
        this.collectStart(hero);
        break;
      case CommandType.Attack:
        this.playClip(hero, AnimName.attack, 14);
        break;

      default:
        console.warn("Unknown command", cmd);
    }
    active.indexToPlay++;
  }

  /* ------------------------------------------------------------ */
  private tryMove(hero: Entity, grid: GridPosition, dx: number, dy: number) {
    const dstCol = grid.col + dx;
    const dstRow = grid.row + dy;

    // Out-of-bounds → hero dies

    const outOfBonds =
      dstCol < 0 ||
      dstCol >= UIGame.GRID_COLS ||
      dstRow < 0 ||
      dstRow >= UIGame.GRID_COLS;

    let emptyTile = false;
    let obstacle = false;

    for (const [, tile] of this.query((q) => q.with(Tile))) {
      if (tile.col === dstCol && tile.row === dstRow && tile.kind === "empty") {
        emptyTile = true;
      }
    }

    for (const [, tile] of this.query((q) => q.with(Tile))) {
      if (
        tile.col === dstCol &&
        tile.row === dstRow &&
        tile.kind === "obstacle"
      )
        obstacle = true;
    }

    if (outOfBonds || emptyTile || obstacle) {
      if (hero.has(Moving)) hero.removeComponent(Moving);
      hero.addComponent(
        Moving,
        new Moving(grid.col, grid.row, dstCol, dstRow, 0, 2),
      );
      const dir =
        dx > 0 ? Dir.Right : dx < 0 ? Dir.Left : dy > 0 ? Dir.Down : Dir.Up;
      hero.addComponent(Dead, new Dead(dir));
      this.playClip(hero, AnimName.walk, 10);
      return;
    }

    /* obstacle ? */

    hero.addComponent(
      Moving,
      new Moving(grid.col, grid.row, dstCol, dstRow, 0, 0.8),
    );

    /* set walk clip */
    this.playClip(hero, AnimName.walk, 10);
  }

  private collectStart(hero: Entity) {
    this.playClip(hero, AnimName.jump, 12);
  }

  /* ------------------------------------------------------------ */
  private playClip(hero: Entity, name: AnimName, fps: number) {
    const anim = hero.writeComponent(Animation);
    anim.name = name;
    anim.fps = fps;
    anim.playing = true;
    anim.frame = 0;
  }
}
