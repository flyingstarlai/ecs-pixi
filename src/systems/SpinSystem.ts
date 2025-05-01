import { System } from "../core/System";
import { Rotation } from "../components/Rotation";
import { AngularVelocity } from "../components/AngularVelocity";

export class SpinSystem extends System {
  execute(delta: number): void {
    const dt = delta / 1000; // seconds
    for (const [, rot, spin] of this.query((q) =>
      q.with(Rotation).with(AngularVelocity),
    )) {
      rot.angle += spin.av * dt;
    }
  }
}
