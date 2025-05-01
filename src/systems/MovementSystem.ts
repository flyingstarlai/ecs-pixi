import { System } from "../core/System";
import { Position } from "../components/Position";
import { Velocity } from "../components/Velocity";

export class MovementSystem extends System {
  override execute(delta: number): void {
    const dt = delta / 1000; // seconds
    for (const [, pos, vel] of this.query((q) =>
      q.with(Position).with(Velocity),
    )) {
      pos.x += vel.vx * 100 * dt;
      pos.y += vel.vy * 100 * dt;
    }
  }
}
