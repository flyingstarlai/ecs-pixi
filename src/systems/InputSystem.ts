import { System } from "../core/System";
import { Velocity } from "../components/Velocity";

export class InputSystem extends System {
  private keys = new Set<string>();

  override initialize() {
    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
  }

  override execute(): void {
    // All entities with Velocity get the same simple WASD control
    for (const [, vel] of this.query((q) => q.with(Velocity))) {
      vel.vx =
        (this.keys.has("ArrowRight") ? 1 : 0) -
        (this.keys.has("ArrowLeft") ? 1 : 0);
      vel.vy =
        (this.keys.has("ArrowDown") ? 1 : 0) -
        (this.keys.has("ArrowUp") ? 1 : 0);
    }
  }
}
