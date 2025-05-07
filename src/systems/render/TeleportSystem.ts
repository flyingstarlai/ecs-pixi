import { System } from "../../core/System.ts";
import { Teleport } from "../../components/Teleport.ts";
import { GridPosition } from "../../components/GridPosition.ts";
import { Moving } from "../../components/Moving.ts";
import { Animation, AnimName } from "../../components/Animation.ts";

export class TeleportSystem extends System {
  execute(): void {
    for (const [e, tp] of this.query((q) =>
      q.with(Teleport).with(GridPosition).with(Animation),
    )) {
      const gp = e.writeComponent(GridPosition);
      gp.col = tp.col;
      gp.row = tp.row;

      const anim = e.writeComponent(Animation);
      anim.name = AnimName.idle;
      anim.frame = 0;

      if (e.has(Moving)) e.removeComponent(Moving);
      e.removeComponent(Teleport);
    }
  }
}
